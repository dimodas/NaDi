import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../lib/useAuth";

type Varian = "hot" | "ice" | null;

type Product = {
  id: string;
  nama_produk: string;
  harga: number | null;
  kategori: "makanan" | "minuman";
  foto_url: string | null;
  punya_varian_suhu: boolean;
  harga_hot: number | null;
  harga_ice: number | null;
};

type CartItem = {
  product: Product;
  varian: Varian;
  harga: number;
  qty: number;
};

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

const buatKodePesanan = () => {
  const acak = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NDI-${acak}`;
};

const cartKey = (productId: string, varian: Varian) =>
  `${productId}|${varian ?? "default"}`;

const hargaUntuk = (product: Product, varian: Varian) =>
  varian === "hot"
    ? product.harga_hot ?? 0
    : varian === "ice"
    ? product.harga_ice ?? 0
    : product.harga ?? 0;

// Tombol +/- yang dipakai berulang untuk setiap baris pilihan.
const Stepper = ({
  qty,
  label,
  onMinus,
  onPlus,
}: {
  qty: number;
  label: string;
  onMinus: () => void;
  onPlus: () => void;
}) =>
  qty === 0 ? (
    <button
      type="button"
      onClick={onPlus}
      aria-label={`Tambah ${label}`}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fe972f] text-lg text-white"
    >
      +
    </button>
  ) : (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onMinus}
        aria-label={`Kurangi ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7d3ba] text-lg text-[#e66307]"
      >
        −
      </button>
      <span className="w-4 text-center text-sm">{qty}</span>
      <button
        type="button"
        onClick={onPlus}
        aria-label={`Tambah ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e7d3ba] text-lg text-[#e66307]"
      >
        +
      </button>
    </div>
  );

export const ManualOrder = ({
  profile,
  onCreated,
}: {
  profile: Profile;
  onCreated?: () => void;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState<
    "semua" | "makanan" | "minuman"
  >("semua");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [metode, setMetode] = useState<"tunai" | "qris">("tunai");
  const [sudahBayar, setSudahBayar] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [berhasilKode, setBerhasilKode] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, nama_produk, harga, kategori, foto_url, punya_varian_suhu, harga_hot, harga_ice"
        )
        .eq("umkm_id", profile.umkm_id)
        .eq("tersedia", true)
        .order("nama_produk");
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    };
    load();
  }, [profile.umkm_id]);

  const daftarTampil = useMemo(
    () =>
      filterKategori === "semua"
        ? products
        : products.filter((p) => p.kategori === filterKategori),
    [products, filterKategori]
  );

  const itemKeranjang = Object.values(cart);
  const totalHarga = itemKeranjang.reduce((sum, i) => sum + i.qty * i.harga, 0);

  const ubahQty = (product: Product, varian: Varian, delta: number) => {
    const key = cartKey(product.id, varian);
    setCart((prev) => {
      const qtyBaru = (prev[key]?.qty ?? 0) + delta;
      if (qtyBaru <= 0) {
        const salinan = { ...prev };
        delete salinan[key];
        return salinan;
      }
      return {
        ...prev,
        [key]: {
          product,
          varian,
          harga: hargaUntuk(product, varian),
          qty: qtyBaru,
        },
      };
    });
  };

  const qtyDi = (product: Product, varian: Varian) =>
    cart[cartKey(product.id, varian)]?.qty ?? 0;

  const resetForm = () => {
    setCart({});
    setNamaPelanggan("");
    setCatatan("");
    setMetode("tunai");
    setSudahBayar(true);
    setError("");
    setBerhasilKode(null);
  };

  const handleSimpan = async () => {
    if (itemKeranjang.length === 0) {
      setError("Pilih minimal satu produk.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    let orderBaru: { id: string; kode_pesanan: string } | null = null;
    for (let percobaan = 0; percobaan < 3 && !orderBaru; percobaan += 1) {
      const { data, error: orderError } = await supabase
        .from("orders")
        .insert({
          umkm_id: profile.umkm_id,
          kode_pesanan: buatKodePesanan(),
          status: "baru",
          catatan: catatan.trim() || null,
          total: totalHarga,
          sumber: "manual",
          nama_pelanggan: namaPelanggan.trim() || null,
        })
        .select("id, kode_pesanan")
        .single();

      if (!orderError && data) {
        orderBaru = data;
      } else if (orderError && orderError.code !== "23505") {
        setError("Gagal membuat pesanan: " + orderError.message);
        setIsSubmitting(false);
        return;
      }
    }

    if (!orderBaru) {
      setError("Gagal membuat kode pesanan, coba lagi.");
      setIsSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      itemKeranjang.map((item) => ({
        order_id: orderBaru!.id,
        product_id: item.product.id,
        varian: item.varian,
        jumlah: item.qty,
        harga_saat_pesan: item.harga,
      }))
    );

    if (itemsError) {
      setError("Gagal menyimpan rincian pesanan: " + itemsError.message);
      setIsSubmitting(false);
      return;
    }

    const { error: transaksiError } = await supabase.from("transactions").insert({
      order_id: orderBaru.id,
      jumlah_bayar: totalHarga,
      metode: metode === "tunai" ? "Tunai" : "QRIS",
      status_bayar: sudahBayar ? "lunas" : "pending",
      paid_at: sudahBayar ? new Date().toISOString() : null,
    });

    if (transaksiError) {
      setError("Gagal mencatat pembayaran: " + transaksiError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setBerhasilKode(orderBaru.kode_pesanan);
  };

  if (loading) {
    return <p className="text-[#9a8a78]">Memuat produk...</p>;
  }

  if (berhasilKode) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-[#f0d9bd] bg-white p-6 text-center">
        <p className="text-sm text-[#9a8a78]">Pesanan tersimpan</p>
        <p className="my-2 text-2xl font-bold text-[#e66307]">{berhasilKode}</p>
        <p className="mb-5 text-sm text-[#5c5245]">
          Pesanan sudah masuk ke daftar Pesanan dan siap diproses.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full bg-[#fe972f] px-5 py-2 text-sm font-semibold text-white"
          >
            Input pesanan lain
          </button>
          {onCreated && (
            <button
              type="button"
              onClick={onCreated}
              className="rounded-full border border-[#fe972f] px-5 py-2 text-sm font-semibold text-[#fe972f]"
            >
              Lihat di Pesanan
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-4 flex gap-2">
          {(["semua", "makanan", "minuman"] as const).map((opsi) => (
            <button
              key={opsi}
              type="button"
              onClick={() => setFilterKategori(opsi)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
                filterKategori === opsi
                  ? "bg-[#fe972f] text-white"
                  : "border border-[#e7d3ba] text-[#5c5245]"
              }`}
            >
              {opsi}
            </button>
          ))}
        </div>

        {daftarTampil.length === 0 ? (
          <p className="rounded-xl border border-[#f0d9bd] bg-white p-6 text-center text-sm text-[#9a8a78]">
            Belum ada produk tersedia. Tambahkan dulu lewat tab Kelola Produk.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {daftarTampil.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-[#f0d9bd] bg-white p-3"
              >
                <div className="mb-2 flex items-center gap-3">
                  {product.foto_url ? (
                    <img
                      src={product.foto_url}
                      alt={product.nama_produk}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fdeee0] text-xl">
                      🍽️
                    </div>
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#3d332a]">
                    {product.nama_produk}
                  </p>
                </div>

                {product.punya_varian_suhu ? (
                  <div className="space-y-2">
                    {(["hot", "ice"] as const).map((varian) => (
                      <div key={varian} className="flex items-center justify-between">
                        <span className="text-xs text-[#e66307]">
                          {varian === "hot" ? "Hot" : "Ice"} ·{" "}
                          {formatRupiah(hargaUntuk(product, varian))}
                        </span>
                        <Stepper
                          qty={qtyDi(product, varian)}
                          label={`${product.nama_produk} ${varian}`}
                          onMinus={() => ubahQty(product, varian, -1)}
                          onPlus={() => ubahQty(product, varian, 1)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#e66307]">
                      {formatRupiah(hargaUntuk(product, null))}
                    </span>
                    <Stepper
                      qty={qtyDi(product, null)}
                      label={product.nama_produk}
                      onMinus={() => ubahQty(product, null, -1)}
                      onPlus={() => ubahQty(product, null, 1)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-fit rounded-xl border border-[#f0d9bd] bg-white p-5">
        <h2 className="mb-3 text-base font-bold text-[#e66307]">
          Pesanan pelanggan
        </h2>

        {itemKeranjang.length === 0 ? (
          <p className="mb-4 text-sm text-[#9a8a78]">
            Belum ada produk dipilih.
          </p>
        ) : (
          <ul className="mb-3 space-y-1 text-sm text-[#3d332a]">
            {itemKeranjang.map((item) => (
              <li
                key={cartKey(item.product.id, item.varian)}
                className="flex justify-between"
              >
                <span>
                  {item.qty}x {item.product.nama_produk}
                  {item.varian && (
                    <span className="text-xs text-[#9a8a78]">
                      {" "}
                      ({item.varian === "hot" ? "Hot" : "Ice"})
                    </span>
                  )}
                </span>
                <span>{formatRupiah(item.qty * item.harga)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-4 flex justify-between border-t border-[#f0d9bd] pt-3 text-sm font-bold text-[#e66307]">
          <span>Total</span>
          <span>{formatRupiah(totalHarga)}</span>
        </div>

        <label className="mb-3 block text-sm text-[#5c5245]">
          Nama pelanggan (opsional)
          <input
            value={namaPelanggan}
            onChange={(e) => setNamaPelanggan(e.target.value)}
            placeholder="Contoh: Pak Budi"
            className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
          />
        </label>

        <label className="mb-3 block text-sm text-[#5c5245]">
          Catatan (opsional)
          <input
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: tanpa gula"
            className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
          />
        </label>

        <p className="mb-2 text-sm text-[#5c5245]">Metode pembayaran</p>
        <div className="mb-3 flex gap-2">
          {(["tunai", "qris"] as const).map((opsi) => (
            <button
              key={opsi}
              type="button"
              onClick={() => setMetode(opsi)}
              className={`flex-1 rounded-lg border py-2 text-sm font-semibold ${
                metode === opsi
                  ? "border-[#fe972f] bg-[#fe972f] text-white"
                  : "border-[#e7d3ba] text-[#5c5245]"
              }`}
            >
              {opsi === "tunai" ? "Tunai" : "QRIS"}
            </button>
          ))}
        </div>

        <label className="mb-4 flex items-center gap-2 text-sm text-[#5c5245]">
          <input
            type="checkbox"
            checked={sudahBayar}
            onChange={(e) => setSudahBayar(e.target.checked)}
            className="h-4 w-4 appearance-auto accent-[#fe972f]"
          />
          Sudah dibayar (tandai lunas sekarang)
        </label>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleSimpan}
          disabled={isSubmitting || itemKeranjang.length === 0}
          className="w-full rounded-full bg-[#fe972f] py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
        </button>
      </div>
    </div>
  );
};
