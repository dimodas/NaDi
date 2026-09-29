import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Product = {
  id: string;
  nama_produk: string;
  deskripsi: string | null;
  harga: number;
  kategori: "makanan" | "minuman";
  foto_url: string | null;
};

type CartItem = {
  product: Product;
  qty: number;
};

type OrderRecord = {
  id: string;
  kode_pesanan: string;
  status: string;
  total: number;
  catatan: string | null;
  created_at: string;
};

type TransactionRecord = {
  id: string;
  metode: string | null;
  status_bayar: string;
  paid_at: string | null;
};

type View = "loading" | "not-found" | "menu" | "checkout" | "receipt";

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

const formatWaktu = (iso: string | null) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const buatKodePesanan = () => {
  const acak = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NDI-${acak}`;
};

const STATUS_LABEL: Record<string, string> = {
  baru: "Pesanan diterima",
  diproses: "Sedang diproses",
  siap: "Pesanan siap",
  diantar: "Sedang diantar",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export const CustomerOrderApp = ({ umkmId }: { umkmId: string }) => {
  const [view, setView] = useState<View>("loading");
  const [namaUsaha, setNamaUsaha] = useState("");
  const [qrisImageUrl, setQrisImageUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellerIds, setBestSellerIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"makanan" | "minuman" | "best_seller">(
    "makanan"
  );
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [catatan, setCatatan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "tunai">("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);
  const [orderItemsView, setOrderItemsView] = useState<
    { nama_produk: string; jumlah: number; harga_saat_pesan: number }[]
  >([]);

  // Ambil info UMKM, produk, dan hitung Best Seller.
  useEffect(() => {
    const load = async () => {
      const { data: umkm, error: umkmError } = await supabase
        .from("umkm")
        .select("nama_usaha, qris_image_url")
        .eq("id", umkmId)
        .single();

      if (umkmError || !umkm) {
        setView("not-found");
        return;
      }

      setNamaUsaha(umkm.nama_usaha);
      setQrisImageUrl(umkm.qris_image_url);

      const { data: produkData } = await supabase
        .from("products")
        .select("id, nama_produk, deskripsi, harga, kategori, foto_url")
        .eq("umkm_id", umkmId)
        .eq("tersedia", true)
        .order("nama_produk");

      setProducts(produkData ?? []);

      const { data: itemTerjual } = await supabase
        .from("order_items")
        .select("jumlah, products!inner(id, umkm_id)")
        .eq("products.umkm_id", umkmId);

      const terjualMap = new Map<string, number>();
      for (const item of itemTerjual ?? []) {
        const pid = (item as any).products?.id;
        if (!pid) continue;
        terjualMap.set(pid, (terjualMap.get(pid) ?? 0) + item.jumlah);
      }
      const urutanTerlaris = Array.from(terjualMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)
        .slice(0, 6);
      setBestSellerIds(urutanTerlaris);

      setView("menu");
    };

    load();
  }, [umkmId]);

  const daftarTampil = useMemo(() => {
    if (activeTab === "best_seller") {
      return bestSellerIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
    }
    return products.filter((p) => p.kategori === activeTab);
  }, [activeTab, products, bestSellerIds]);

  const totalItemKeranjang = Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
  const totalHargaKeranjang = Object.values(cart).reduce(
    (sum, i) => sum + i.qty * i.product.harga,
    0
  );

  const tambahKeKeranjang = (product: Product) => {
    setCart((prev) => {
      const existing = prev[product.id];
      return {
        ...prev,
        [product.id]: { product, qty: (existing?.qty ?? 0) + 1 },
      };
    });
  };

  const ubahQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const qtyBaru = existing.qty + delta;
      if (qtyBaru <= 0) {
        const salinan = { ...prev };
        delete salinan[productId];
        return salinan;
      }
      return { ...prev, [productId]: { ...existing, qty: qtyBaru } };
    });
  };

  const subscribeOrder = (orderId: string, transactionId: string) => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new as OrderRecord)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => setTransaction(payload.new as TransactionRecord)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handlePesanSekarang = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    const items = Object.values(cart);
    let percobaan = 0;
    let orderBaru: OrderRecord | null = null;

    while (percobaan < 3 && !orderBaru) {
      percobaan += 1;
      const kode = buatKodePesanan();
      const { data, error } = await supabase
        .from("orders")
        .insert({
          umkm_id: umkmId,
          kode_pesanan: kode,
          status: "baru",
          catatan: catatan.trim() || null,
          total: totalHargaKeranjang,
        })
        .select()
        .single();

      if (!error && data) {
        orderBaru = data as OrderRecord;
      } else if (error && error.code !== "23505") {
        setSubmitError("Gagal membuat pesanan: " + error.message);
        setIsSubmitting(false);
        return;
      }
    }

    if (!orderBaru) {
      setSubmitError("Gagal membuat kode pesanan, coba lagi.");
      setIsSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: orderBaru!.id,
        product_id: item.product.id,
        jumlah: item.qty,
        harga_saat_pesan: item.product.harga,
      }))
    );

    if (itemsError) {
      setSubmitError("Gagal menyimpan rincian pesanan: " + itemsError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: transaksiBaru, error: transaksiError } = await supabase
      .from("transactions")
      .insert({
        order_id: orderBaru.id,
        jumlah_bayar: totalHargaKeranjang,
        metode: paymentMethod === "qris" ? "QRIS" : "Tunai",
        status_bayar: "pending",
      })
      .select()
      .single();

    if (transaksiError || !transaksiBaru) {
      setSubmitError("Gagal mencatat pembayaran.");
      setIsSubmitting(false);
      return;
    }

    setOrderItemsView(
      items.map((item) => ({
        nama_produk: item.product.nama_produk,
        jumlah: item.qty,
        harga_saat_pesan: item.product.harga,
      }))
    );
    setOrder(orderBaru);
    setTransaction(transaksiBaru as TransactionRecord);
    subscribeOrder(orderBaru.id, transaksiBaru.id);

    window.history.replaceState({}, "", `?menu=${umkmId}&order=${orderBaru.kode_pesanan}`);

    setIsSubmitting(false);
    setView("receipt");
  };

  const handlePesanLagi = () => {
    setCart({});
    setCatatan("");
    setOrder(null);
    setTransaction(null);
    window.history.replaceState({}, "", `?menu=${umkmId}`);
    setView("menu");
  };

  if (view === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f1] text-[#9a8a78]">
        Memuat menu...
      </div>
    );
  }

  if (view === "not-found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#fff8f1] px-6 text-center">
        <p className="text-lg font-bold text-[#e66307]">Link tidak ditemukan</p>
        <p className="text-sm text-[#9a8a78]">
          Silakan scan ulang QR code yang tersedia di tempat UMKM.
        </p>
      </div>
    );
  }

  if (view === "checkout") {
    return (
      <div className="min-h-screen bg-[#fff8f1] pb-28">
        <header className="sticky top-0 z-10 mx-auto flex max-w-md items-center gap-3 bg-white px-4 py-4 shadow-sm">
          <button
            type="button"
            onClick={() => setView("menu")}
            className="flex h-9 w-9 items-center justify-center text-lg text-[#e66307]"
            aria-label="Kembali ke menu"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-[#e66307]">Konfirmasi Pesanan</h1>
        </header>

        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-4 rounded-xl border border-[#f0d9bd] bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-[#5c5245]">Pesanan Anda</h2>
            {Object.values(cart).map((item) => (
              <div
                key={item.product.id}
                className="mb-2 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="text-[#3d332a]">{item.product.nama_produk}</p>
                  <p className="text-xs text-[#9a8a78]">
                    {item.qty} x {formatRupiah(item.product.harga)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ubahQty(item.product.id, -1)}
                    aria-label="Kurangi jumlah"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7d3ba] text-lg text-[#e66307]"
                  >
                    −
                  </button>
                  <span className="w-4 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => ubahQty(item.product.id, 1)}
                    aria-label="Tambah jumlah"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7d3ba] text-lg text-[#e66307]"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-[#f0d9bd] pt-3 text-sm font-bold text-[#e66307]">
              <span>Total</span>
              <span>{formatRupiah(totalHargaKeranjang)}</span>
            </div>
          </div>

          <label className="mb-4 block text-sm text-[#5c5245]">
            Catatan tambahan (opsional)
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              placeholder="Contoh: tidak pakai es, gula sedikit"
              className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
            />
          </label>

          <div className="mb-4">
            <p className="mb-2 text-sm font-bold text-[#5c5245]">
              Metode pembayaran
            </p>
            <div className="flex gap-3">
              {(["qris", "tunai"] as const).map((metode) => (
                <button
                  key={metode}
                  type="button"
                  onClick={() => setPaymentMethod(metode)}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold capitalize ${
                    paymentMethod === metode
                      ? "border-[#fe972f] bg-[#fe972f] text-white"
                      : "border-[#e7d3ba] text-[#5c5245]"
                  }`}
                >
                  {metode === "qris" ? "QRIS" : "Bayar langsung"}
                </button>
              ))}
            </div>
            {paymentMethod === "qris" && (
              <p className="mt-2 text-xs text-[#9a8a78]">
                Foto QRIS akan ditampilkan di halaman berikutnya untuk Anda scan.
              </p>
            )}
          </div>

          {submitError && (
            <p className="mb-3 text-sm text-red-600">{submitError}</p>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 flex justify-center border-t border-[#f0d9bd] bg-white p-4">
          <button
            type="button"
            onClick={handlePesanSekarang}
            disabled={isSubmitting || Object.keys(cart).length === 0}
            className="w-full max-w-md rounded-full bg-[#fe972f] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? "Memproses..." : "Pesan Sekarang"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "receipt" && order && transaction) {
    return (
      <div className="min-h-screen bg-[#fff8f1] pb-10">
        <header className="bg-white px-4 py-5 text-center shadow-sm">
          <h1 className="text-lg font-bold text-[#e66307]">Sesuai Mood</h1>
          <p className="mt-1 inline-block rounded-full bg-[#fdeee0] px-3 py-1 text-xs font-semibold text-[#e66307]">
            {STATUS_LABEL[order.status] ?? order.status}
          </p>
        </header>

        <div className="mx-auto max-w-md px-4 py-4">
          <div className="mb-4 rounded-xl border border-[#f0d9bd] bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-[#e66307]">
              Rincian Pesanan
            </h2>
            {orderItemsView.map((item) => (
              <div
                key={item.nama_produk}
                className="mb-1 flex justify-between text-sm text-[#3d332a]"
              >
                <span>
                  {item.jumlah}x {item.nama_produk}
                </span>
                <span>{formatRupiah(item.jumlah * item.harga_saat_pesan)}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-[#f0d9bd] pt-3 text-sm font-bold text-[#e66307]">
              <span>Subtotal Pesanan ({orderItemsView.length} Menu)</span>
              <span>{formatRupiah(order.total)}</span>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-[#f0d9bd] bg-white p-4 text-sm">
            <h2 className="mb-3 text-sm font-bold text-[#e66307]">
              Informasi Pesanan
            </h2>
            <dl className="space-y-1 text-[#5c5245]">
              <div className="flex justify-between">
                <dt>Catatan Tambahan</dt>
                <dd className="text-right">{order.catatan || "-"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>No. Pesanan</dt>
                <dd className="font-semibold text-[#3d332a]">
                  {order.kode_pesanan}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Waktu Pemesanan</dt>
                <dd>{formatWaktu(order.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Waktu Pembayaran</dt>
                <dd>{formatWaktu(transaction.paid_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Pembayaran</dt>
                <dd>
                  {transaction.metode}
                  {" - "}
                  {transaction.status_bayar === "lunas" ? "Lunas" : "Menunggu konfirmasi"}
                </dd>
              </div>
            </dl>
          </div>

          {paymentMethod === "qris" &&
            transaction.status_bayar !== "lunas" &&
            qrisImageUrl && (
              <div className="mb-4 rounded-xl border border-[#f0d9bd] bg-white p-4 text-center">
                <p className="mb-2 text-sm font-bold text-[#e66307]">
                  Scan QRIS untuk membayar
                </p>
                <img
                  src={qrisImageUrl}
                  alt="Kode QRIS"
                  className="mx-auto h-56 w-56 object-contain"
                />
                <p className="mt-2 text-xs text-[#9a8a78]">
                  Tunjukkan halaman ini ke kasir setelah pembayaran berhasil.
                </p>
              </div>
            )}

          <button
            type="button"
            onClick={handlePesanLagi}
            className="w-full rounded-full bg-[#fe972f] py-3 text-sm font-bold text-white"
          >
            Pesan Lagi
          </button>
        </div>
      </div>
    );
  }

  // view === "menu"
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ed8e12] to-[#c5500f] pb-28">
      <div className="mx-auto max-w-md">
        <header className="px-5 pt-8 pb-4 text-center text-white">
          <p className="text-sm opacity-90">{namaUsaha}</p>
          <h1 className="text-2xl font-bold">Sesuai Mood</h1>
        </header>

        <div className="mx-4 mb-4 flex rounded-full bg-white/20 p-1">
          {(
            [
              { key: "makanan", label: "Makanan" },
              { key: "minuman", label: "Minuman" },
              { key: "best_seller", label: "Best Seller" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-[#e66307]"
                  : "text-white/90"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <p className="mb-4 px-5 text-lg font-bold text-white">
          {activeTab === "makanan"
            ? "Mau makan apa?"
            : activeTab === "minuman"
            ? "Mau minum apa?"
            : "Cobain ini deh!"}
        </p>

        <div className="grid grid-cols-2 gap-3 px-4">
          {daftarTampil.length === 0 ? (
            <p className="col-span-2 text-center text-sm text-white/90">
              Belum ada produk di kategori ini.
            </p>
          ) : (
            daftarTampil.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl bg-white p-3 shadow-sm"
              >
                {product.foto_url ? (
                  <img
                    src={product.foto_url}
                    alt={product.nama_produk}
                    className="mb-2 h-20 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-2 flex h-20 items-center justify-center rounded-xl bg-[#fdeee0] text-3xl">
                    🍽️
                  </div>
                )}
                <p className="text-sm font-semibold text-[#3d332a]">
                  {product.nama_produk}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-[#e66307]">
                    {formatRupiah(product.harga)}
                  </span>
                  <button
                    type="button"
                    onClick={() => tambahKeKeranjang(product)}
                    aria-label={`Tambah ${product.nama_produk}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fe972f] text-lg text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalItemKeranjang > 0 && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setView("checkout")}
            className="flex w-full max-w-md items-center justify-between rounded-full bg-white px-5 py-3 shadow-lg"
          >
            <span className="text-sm font-bold text-[#e66307]">
              {totalItemKeranjang} item · {formatRupiah(totalHargaKeranjang)}
            </span>
            <span className="text-sm font-bold text-[#e66307]">Lihat Keranjang →</span>
          </button>
        </div>
      )}
    </div>
  );
};
