import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../lib/useAuth";

type OrderItemRow = {
  jumlah: number;
  harga_saat_pesan: number;
  varian: string | null;
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

// Escape teks sebelum dimasukkan ke dokumen invoice.
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });

export const OrderManagement = ({ profile }: { profile: Profile }) => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelesai, setShowSelesai] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, kode_pesanan, status, catatan, total, created_at, sumber, nama_pelanggan,
         order_items ( jumlah, harga_saat_pesan, varian, products ( nama_produk ) ),
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

  // Membuka invoice yang siap dicetak/disimpan sebagai PDF melalui dialog cetak browser.
  const handleDownloadInvoice = (order: OrderRow) => {
    const invoiceWindow = window.open("", "_blank", "width=850,height=700");
    if (!invoiceWindow) {
      alert("Invoice tidak dapat dibuka. Izinkan pop-up untuk situs NaDi, lalu coba lagi.");
      return;
    }

    const transaksi = order.transactions?.[0];
    const itemRows = (order.order_items ?? [])
      .map((item) => {
        const namaProduk = escapeHtml(item.products?.nama_produk ?? "Produk");
        const varian = item.varian
          ? ` <span class="variant">${escapeHtml(item.varian === "hot" ? "Hot" : "Ice")}</span>`
          : "";
        const jumlah = Number(item.jumlah) || 0;
        const harga = Number(item.harga_saat_pesan) || 0;
        return `<tr>
          <td>${namaProduk}${varian}</td>
          <td class="number">${jumlah}</td>
          <td class="number">${escapeHtml(formatRupiah(harga))}</td>
          <td class="number">${escapeHtml(formatRupiah(jumlah * harga))}</td>
        </tr>`;
      })
      .join("");

    const statusBayar = transaksi?.status_bayar === "lunas" ? "Lunas" : "Belum bayar";
    const catatan = order.catatan
      ? `<div class="note"><strong>Catatan:</strong> ${escapeHtml(order.catatan)}</div>`
      : "";

    invoiceWindow.document.open();
    invoiceWindow.document.write(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(order.kode_pesanan)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; color: #3d332a; font-family: Arial, sans-serif; font-size: 13px; }
    .invoice { max-width: 760px; margin: 0 auto; }
    .top { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 22px; border-bottom: 2px solid #fe972f; }
    h1 { margin: 0 0 6px; color: #e66307; font-size: 27px; }
    .muted { color: #796d60; line-height: 1.6; }
    .invoice-label { text-align: right; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 28px; padding: 22px 0; }
    .meta p { margin: 5px 0 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { text-align: left; background: #fff3e7; color: #6c4a2e; }
    th, td { padding: 11px 9px; border-bottom: 1px solid #eadfd4; }
    .number { text-align: right; white-space: nowrap; }
    .variant { display: inline-block; margin-left: 5px; padding: 2px 6px; border-radius: 10px; background: #fdeee0; color: #e66307; font-size: 10px; }
    .total { margin: 20px 0 0 auto; width: min(100%, 320px); }
    .total-row { display: flex; justify-content: space-between; gap: 18px; padding: 7px 0; }
    .grand-total { margin-top: 4px; padding-top: 12px; border-top: 1px solid #eadfd4; color: #e66307; font-size: 18px; font-weight: bold; }
    .note { margin-top: 22px; padding: 12px; background: #fff8f1; border-radius: 6px; }
    .footer { margin-top: 38px; padding-top: 14px; border-top: 1px solid #eadfd4; text-align: center; color: #796d60; font-size: 11px; }
    .print-button { display: block; margin: 0 auto 24px; border: 0; border-radius: 20px; padding: 10px 18px; color: white; background: #fe972f; cursor: pointer; }
    @media print { body { padding: 0; } .print-button { display: none; } }
    @media (max-width: 540px) { body { padding: 16px; } .top { flex-direction: column; } .invoice-label { text-align: left; } .meta { grid-template-columns: 1fr; } th, td { padding: 8px 5px; font-size: 11px; } }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">Unduh / Simpan sebagai PDF</button>
  <main class="invoice">
    <header class="top">
      <div><h1>INVOICE</h1><div class="muted">Niaga Digital (NaDi)<br />Bukti transaksi pesanan</div></div>
      <div class="invoice-label"><strong>${escapeHtml(order.kode_pesanan)}</strong><div class="muted">Tanggal: ${escapeHtml(formatWaktu(order.created_at))}</div><div class="muted">Sumber: ${escapeHtml(order.sumber === "manual" ? "Pesanan manual" : "Pesanan digital")}</div></div>
    </header>
    <section class="meta">
      <div><div class="muted">Ditagihkan kepada</div><p><strong>${escapeHtml(order.nama_pelanggan || "Pelanggan")}</strong></p></div>
      <div><div class="muted">Status pesanan</div><p><strong>${escapeHtml(STATUS_LABEL[order.status] ?? order.status)}</strong></p><div class="muted">Pembayaran: ${escapeHtml(statusBayar)}</div></div>
      <div><div class="muted">Metode pembayaran</div><p><strong>${escapeHtml(transaksi?.metode ?? "-")}</strong></p></div>
    </section>
    <table>
      <thead><tr><th>Produk</th><th class="number">Jumlah</th><th class="number">Harga satuan</th><th class="number">Subtotal</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <section class="total"><div class="total-row grand-total"><span>Total</span><span>${escapeHtml(formatRupiah(Number(order.total) || 0))}</span></div></section>
    ${catatan}
    <footer class="footer">Terima kasih telah bertransaksi.<br />Invoice dibuat melalui NaDi (Niaga Digital).</footer>
  </main>
  <script>window.onload = function () { window.setTimeout(function () { window.print(); }, 250); };</script>
</body>
</html>`);
    invoiceWindow.document.close();
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
                      {item.varian && (
                        <span className="ml-1 rounded-full bg-[#fdeee0] px-2 py-0.5 text-[10px] font-semibold text-[#e66307]">
                          {item.varian === "hot" ? "Hot" : "Ice"}
                        </span>
                      )}
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
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(order)}
                    className="rounded-full border border-[#fe972f] px-4 py-1.5 text-xs font-semibold text-[#e66307] hover:bg-[#fff3e7]"
                  >
                    Unduh Invoice
                  </button>
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
