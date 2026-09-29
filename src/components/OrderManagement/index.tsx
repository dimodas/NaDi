import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../lib/useAuth";

type OrderItemRow = {
  jumlah: number;
  harga_saat_pesan: number;
  products: { nama_produk: string } | null;
};

type TransactionRow = {
  id: string;
  metode: string | null;
  status_bayar: string;
  paid_at: string | null;
};

type OrderRow = {
  id: string;
  kode_pesanan: string;
  status: string;
  catatan: string | null;
  total: number;
  created_at: string;
  sumber: string;
  nama_pelanggan: string | null;
  order_items: OrderItemRow[];
  transactions: TransactionRow[];
};

const STATUS_FLOW = ["baru", "diproses", "siap", "diantar", "selesai"] as const;

const STATUS_LABEL: Record<string, string> = {
  baru: "Pesanan Masuk",
  diproses: "Diproses",
  siap: "Siap",
  diantar: "Diantar",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const NEXT_ACTION_LABEL: Record<string, string> = {
  baru: "Mulai Proses",
  diproses: "Tandai Siap",
  siap: "Sudah Diantar",
  diantar: "Selesaikan",
};

const formatRupiah = (angka: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);

const formatWaktu = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

export const OrderManagement = ({ profile }: { profile: Profile }) => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelesai, setShowSelesai] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, kode_pesanan, status, catatan, total, created_at, sumber, nama_pelanggan,
         order_items ( jumlah, harga_saat_pesan, products ( nama_produk ) ),
         transactions ( id, metode, status_bayar, paid_at )`
      )
      .eq("umkm_id", profile.umkm_id)
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data as unknown as OrderRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel(`orders-umkm-${profile.umkm_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `umkm_id=eq.${profile.umkm_id}`,
        },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.umkm_id]);

  const handleAdvance = async (order: OrderRow) => {
    const index = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
    const next = STATUS_FLOW[index + 1];
    if (!next) return;
    await supabase
      .from("orders")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", order.id);
    fetchOrders();
  };

  const handleCancel = async (order: OrderRow) => {
    if (!confirm(`Batalkan pesanan ${order.kode_pesanan}?`)) return;
    await supabase
      .from("orders")
      .update({ status: "dibatalkan", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    fetchOrders();
  };

  const handleConfirmPayment = async (transactionId: string) => {
    await supabase
      .from("transactions")
      .update({ status_bayar: "lunas", paid_at: new Date().toISOString() })
      .eq("id", transactionId);
    fetchOrders();
  };

  const daftarTampil = orders.filter((o) =>
    showSelesai ? true : o.status !== "selesai" && o.status !== "dibatalkan"
  );

  if (loading) {
    return <p className="text-[#9a8a78]">Memuat pesanan...</p>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#e66307]">Pesanan Masuk</h2>
        <label className="flex items-center gap-2 text-sm text-[#5c5245]">
          <input
            type="checkbox"
            checked={showSelesai}
            onChange={(e) => setShowSelesai(e.target.checked)}
          />
          Tampilkan yang sudah selesai/dibatalkan
        </label>
      </div>

      {daftarTampil.length === 0 ? (
        <p className="rounded-xl border border-[#f0d9bd] bg-white p-6 text-center text-sm text-[#9a8a78]">
          Belum ada pesanan yang perlu diproses.
        </p>
      ) : (
        <div className="space-y-4">
          {daftarTampil.map((order) => {
            const transaksi = order.transactions?.[0];
            const nextLabel = NEXT_ACTION_LABEL[order.status];
            return (
              <div
                key={order.id}
                className="rounded-xl border border-[#f0d9bd] bg-white p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-bold text-[#3d332a]">
                      {order.kode_pesanan}
                      {order.sumber === "manual" && (
                        <span className="ml-2 rounded-full bg-[#eef2ff] px-2 py-0.5 align-middle text-[10px] font-semibold text-[#4f46e5]">
                          Manual
                        </span>
                      )}
                    </p>
                    {order.nama_pelanggan && (
                      <p className="text-xs text-[#5c5245]">
                        a.n. {order.nama_pelanggan}
                      </p>
                    )}
                    <p className="text-xs text-[#9a8a78]">
                      {formatWaktu(order.created_at)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fdeee0] px-3 py-1 text-xs font-semibold text-[#e66307]">
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>

                <ul className="mb-2 space-y-0.5 text-sm text-[#5c5245]">
                  {order.order_items.map((item, i) => (
                    <li key={i}>
                      {item.jumlah}x {item.products?.nama_produk ?? "Produk"}
                    </li>
                  ))}
                </ul>

                {order.catatan && (
                  <p className="mb-2 text-xs italic text-[#9a8a78]">
                    Catatan: {order.catatan}
                  </p>
                )}

                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#e66307]">
                    {formatRupiah(order.total)}
                  </span>
                  <span className="text-xs text-[#9a8a78]">
                    {transaksi?.metode ?? "-"} ·{" "}
                    {transaksi?.status_bayar === "lunas" ? "Lunas" : "Belum bayar"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {transaksi && transaksi.status_bayar !== "lunas" && (
                    <button
                      type="button"
                      onClick={() => handleConfirmPayment(transaksi.id)}
                      className="rounded-full border border-green-600 px-4 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
                    >
                      Konfirmasi Pembayaran
                    </button>
                  )}
                  {nextLabel && (
                    <button
                      type="button"
                      onClick={() => handleAdvance(order)}
                      className="rounded-full bg-[#fe972f] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      {nextLabel}
                    </button>
                  )}
                  {order.status !== "selesai" && order.status !== "dibatalkan" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order)}
                      className="rounded-full border border-red-400 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
