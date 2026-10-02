import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "../../lib/useAuth";
import { OrderManagement } from "../OrderManagement";
import { ManualOrder } from "../ManualOrder";

type Product = {
  id: string;
  nama_produk: string;
  deskripsi: string | null;
  harga: number;
  tersedia: boolean;
  kategori: "makanan" | "minuman";
  foto_url: string | null;
};

type Report = {
  totalPendapatan: number;
  jumlahPesanan: number;
  produkTerlaris: { nama_produk: string; total_terjual: number }[];
  dailyRevenue: { tanggal: string; total: number }[];
  incomeSources: { sumber: string; total: number }[];
  expenseByCategory: { kategori: string; total: number }[];
  transaksiList: { id: string; kode_pesanan: string; tanggal: string; jumlah: number }[];
};

type LedgerEntry = {
  id: string;
  sourceId: string;
  tanggal: string;
  keterangan: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
  sumber: "transaksi" | "pengeluaran" | "pemasukan_manual";
};

export const OwnerDashboard = ({ profile }: { profile: Profile }) => {
  const [activeTab, setActiveTab] = useState<
    "pesanan" | "manual" | "produk" | "pembukuan" | "laporan" | "pembayaran"
  >("pesanan");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [uploadingQris, setUploadingQris] = useState(false);
  const [qrisMessage, setQrisMessage] = useState("");

  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [filterPeriode, setFilterPeriode] = useState<
    "hari_ini" | "minggu_ini" | "bulan_ini" | "semua" | "custom"
  >("bulan_ini");
  const [dariTanggal, setDariTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [sampaiTanggal, setSampaiTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [tipePembukuan, setTipePembukuan] = useState<"masuk" | "keluar">("keluar");
  const [kategoriPengeluaran, setKategoriPengeluaran] = useState("Bahan Baku");
  const [kategoriPemasukan, setKategoriPemasukan] = useState("Penjualan di luar NaDi");
  const [jumlahPengeluaran, setJumlahPengeluaran] = useState("");
  const [deskripsiPengeluaran, setDeskripsiPengeluaran] = useState("");
  const [tanggalPengeluaran, setTanggalPengeluaran] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [pengeluaranError, setPengeluaranError] = useState("");
  const [isSubmittingPengeluaran, setIsSubmittingPengeluaran] = useState(false);

  const [namaProduk, setNamaProduk] = useState("");
  const [harga, setHarga] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [kategori, setKategori] = useState<"makanan" | "minuman">("makanan");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, nama_produk, deskripsi, harga, tersedia, kategori, foto_url")
      .eq("umkm_id", profile.umkm_id)
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data as Product[]);
    setLoadingProducts(false);
  };

  const fetchUmkm = async () => {
    const { data } = await supabase
      .from("umkm")
      .select("qris_image_url")
      .eq("id", profile.umkm_id)
      .single();
    setQrisUrl(data?.qris_image_url ?? null);
  };

  useEffect(() => {
    fetchProducts();
    fetchUmkm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.umkm_id]);

  const fetchReport = async () => {
    setLoadingReport(true);

    const [
      { data: transaksi },
      { count: jumlahPesanan },
      { data: itemTerjual },
      { data: pemasukanManual, error: errorPemasukanManual },
      { data: pengeluaran, error: errorPengeluaran },
    ] = await Promise.all([
      supabase
        .from("transactions")
        .select("id, jumlah_bayar, paid_at, orders!inner(umkm_id, kode_pesanan)")
        .eq("orders.umkm_id", profile.umkm_id)
        .eq("status_bayar", "lunas")
        .order("paid_at", { ascending: false }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("umkm_id", profile.umkm_id),
      supabase
        .from("order_items")
        .select("jumlah, products!inner(nama_produk, umkm_id)")
        .eq("products.umkm_id", profile.umkm_id),
      supabase
        .from("pemasukan_manual")
        .select("id, kategori, deskripsi, jumlah, tanggal")
        .eq("umkm_id", profile.umkm_id),
      supabase
        .from("pengeluaran")
        .select("id, kategori, jumlah, tanggal")
        .eq("umkm_id", profile.umkm_id),
    ]);

    if (errorPemasukanManual) {
      console.error("Gagal memuat pemasukan manual untuk laporan:", errorPemasukanManual.message);
    }
    if (errorPengeluaran) {
      console.error("Gagal memuat pengeluaran untuk laporan:", errorPengeluaran.message);
    }

    const transaksiList = (transaksi ?? []).map((t: any) => ({
      id: t.id as string,
      kode_pesanan: t.orders.kode_pesanan as string,
      tanggal: (t.paid_at ?? t.orders.created_at) as string,
      jumlah: Number(t.jumlah_bayar),
    }));

    const totalPendapatanNaDi = transaksiList.reduce((sum, t) => sum + t.jumlah, 0);
    const totalPendapatanManual = (pemasukanManual ?? []).reduce(
      (sum, p) => sum + Number(p.jumlah),
      0
    );
    const totalPendapatan = totalPendapatanNaDi + totalPendapatanManual;

    // Tren pendapatan menggabungkan transaksi NaDi dan pemasukan manual.
    const hariMap = new Map<string, number>();
    for (let i = 13; i >= 0; i -= 1) {
      const tgl = new Date();
      tgl.setDate(tgl.getDate() - i);
      const kunci = tgl.toISOString().slice(0, 10);
      hariMap.set(kunci, 0);
    }
    const semuaPemasukan = [
      ...transaksiList.map((t) => ({ tanggal: t.tanggal, jumlah: t.jumlah })),
      ...(pemasukanManual ?? []).map((p) => ({ tanggal: p.tanggal, jumlah: Number(p.jumlah) })),
    ];
    for (const pemasukan of semuaPemasukan) {
      const kunci = pemasukan.tanggal?.slice(0, 10);
      if (kunci && hariMap.has(kunci)) {
        hariMap.set(kunci, (hariMap.get(kunci) ?? 0) + pemasukan.jumlah);
      }
    }
    const dailyRevenue = Array.from(hariMap.entries()).map(([kunci, total]) => ({
      tanggal: new Date(`${kunci}T12:00:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      }),
      total,
    }));

    // Perbandingan sumber pemasukan: transaksi NaDi dan pemasukan manual per kategori.
    const sumberMap = new Map<string, number>();
    sumberMap.set("Pesanan NaDi", totalPendapatanNaDi);
    for (const p of pemasukanManual ?? []) {
      const kategoriPemasukan = p.kategori || "Pendapatan lainnya";
      sumberMap.set(
        kategoriPemasukan,
        (sumberMap.get(kategoriPemasukan) ?? 0) + Number(p.jumlah)
      );
    }
    const incomeSources = Array.from(sumberMap.entries()).map(([sumber, total]) => ({
      sumber,
      total,
    }));

    // Total pengeluaran dikelompokkan berdasarkan kategori.
    const pengeluaranMap = new Map<string, number>();
    for (const p of pengeluaran ?? []) {
      pengeluaranMap.set(
        p.kategori,
        (pengeluaranMap.get(p.kategori) ?? 0) + Number(p.jumlah)
      );
    }
    const expenseByCategory = Array.from(pengeluaranMap.entries())
      .map(([kategori, total]) => ({ kategori, total }))
      .sort((a, b) => b.total - a.total);

    const terjualMap = new Map<string, number>();
    for (const item of itemTerjual ?? []) {
      const nama = (item as any).products?.nama_produk ?? "Tidak diketahui";
      terjualMap.set(nama, (terjualMap.get(nama) ?? 0) + item.jumlah);
    }
    const produkTerlaris = Array.from(terjualMap.entries())
      .map(([nama_produk, total_terjual]) => ({ nama_produk, total_terjual }))
      .sort((a, b) => b.total_terjual - a.total_terjual)
      .slice(0, 5);

    setReport({
      totalPendapatan,
      jumlahPesanan: jumlahPesanan ?? 0,
      produkTerlaris,
      dailyRevenue,
      incomeSources,
      expenseByCategory,
      transaksiList,
    });
    setLoadingReport(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Hapus transaksi ini? Pesanan terkait tidak ikut terhapus.")) return;
    await supabase.from("transactions").delete().eq("id", id);
    fetchReport();
    fetchLedger();
  };

  useEffect(() => {
    if (activeTab === "laporan") {
      fetchReport();
    }
    if (activeTab === "pembukuan") {
      fetchLedger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchLedger = async () => {
    setLoadingLedger(true);

    const [
      { data: pemasukanPesanan },
      { data: pemasukanManual, error: errorPemasukanManual },
      { data: pengeluaran },
    ] = await Promise.all([
      supabase
        .from("transactions")
        .select("id, jumlah_bayar, paid_at, orders!inner(umkm_id, kode_pesanan, created_at)")
        .eq("orders.umkm_id", profile.umkm_id)
        .eq("status_bayar", "lunas"),
      supabase
        .from("pemasukan_manual")
        .select("id, kategori, deskripsi, jumlah, tanggal")
        .eq("umkm_id", profile.umkm_id),
      supabase
        .from("pengeluaran")
        .select("id, kategori, deskripsi, jumlah, tanggal")
        .eq("umkm_id", profile.umkm_id),
    ]);

    if (errorPemasukanManual) {
      console.error("Gagal memuat pemasukan manual:", errorPemasukanManual.message);
    }

    const entriPesanan: LedgerEntry[] = (pemasukanPesanan ?? []).map((t: any) => ({
      id: `transaksi-${t.id}`,
      sourceId: t.id,
      tanggal: t.paid_at ?? t.orders.created_at,
      keterangan: `Pesanan ${t.orders.kode_pesanan}`,
      jumlah: Number(t.jumlah_bayar),
      tipe: "masuk",
      sumber: "transaksi",
    }));

    const entriMasukManual: LedgerEntry[] = (pemasukanManual ?? []).map((p) => ({
      id: `masuk-manual-${p.id}`,
      sourceId: p.id,
      tanggal: p.tanggal,
      keterangan: p.deskripsi ? `${p.kategori}: ${p.deskripsi}` : p.kategori,
      jumlah: Number(p.jumlah),
      tipe: "masuk",
      sumber: "pemasukan_manual",
    }));

    const entriKeluar: LedgerEntry[] = (pengeluaran ?? []).map((p) => ({
      id: `keluar-${p.id}`,
      sourceId: p.id,
      tanggal: p.tanggal,
      keterangan: p.deskripsi ? `${p.kategori}: ${p.deskripsi}` : p.kategori,
      jumlah: Number(p.jumlah),
      tipe: "keluar",
      sumber: "pengeluaran",
    }));

    const gabungan = [...entriPesanan, ...entriMasukManual, ...entriKeluar].sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
    );

    setLedger(gabungan);
    setLoadingLedger(false);
  };

  const handleAddPembukuan = async (event: FormEvent) => {
    event.preventDefault();
    setPengeluaranError("");

    const jumlahNumber = Number(jumlahPengeluaran);
    if (!jumlahPengeluaran.trim() || Number.isNaN(jumlahNumber) || jumlahNumber <= 0) {
      setPengeluaranError("Jumlah harus diisi dengan angka yang lebih besar dari 0.");
      return;
    }

    setIsSubmittingPengeluaran(true);
    const isPemasukan = tipePembukuan === "masuk";
    const { error } = await supabase
      .from(isPemasukan ? "pemasukan_manual" : "pengeluaran")
      .insert({
        umkm_id: profile.umkm_id,
        kategori: isPemasukan ? kategoriPemasukan : kategoriPengeluaran,
        deskripsi: deskripsiPengeluaran.trim() || null,
        jumlah: jumlahNumber,
        tanggal: tanggalPengeluaran,
      });

    if (error) {
      setPengeluaranError("Gagal menyimpan: " + error.message);
      setIsSubmittingPengeluaran(false);
      return;
    }

    setJumlahPengeluaran("");
    setDeskripsiPengeluaran("");
    setIsSubmittingPengeluaran(false);
    await fetchLedger();
  };

  const handleDeletePengeluaran = async (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    await supabase.from("pengeluaran").delete().eq("id", id);
    fetchLedger();
  };

  const handleDeletePemasukanManual = async (id: string) => {
    if (!confirm("Hapus catatan pemasukan manual ini?")) return;
    const { error } = await supabase.from("pemasukan_manual").delete().eq("id", id);
    if (error) {
      alert("Gagal menghapus pemasukan: " + error.message);
      return;
    }
    await fetchLedger();
  };

  const handleDeleteLedgerEntry = async (entry: LedgerEntry) => {
    if (entry.sumber === "transaksi") {
      await handleDeleteTransaction(entry.sourceId);
    } else if (entry.sumber === "pemasukan_manual") {
      await handleDeletePemasukanManual(entry.sourceId);
    } else {
      await handleDeletePengeluaran(entry.sourceId);
    }
  };

  const handleFotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFotoFile(file);
    setFotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddProduct = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const hargaNumber = Number(harga);
    if (!namaProduk.trim() || !harga.trim() || Number.isNaN(hargaNumber)) {
      setFormError("Nama produk dan harga (angka) wajib diisi.");
      return;
    }

    setIsSubmittingProduct(true);

    let fotoUrl: string | null = null;
    if (fotoFile) {
      const ekstensi = fotoFile.name.split(".").pop() || "jpg";
      const namaFile = `${profile.umkm_id}/${crypto.randomUUID()}.${ekstensi}`;
      const { error: uploadError } = await supabase.storage
        .from("product-photos")
        .upload(namaFile, fotoFile, { contentType: fotoFile.type });

      if (uploadError) {
        setFormError("Gagal mengunggah foto: " + uploadError.message);
        setIsSubmittingProduct(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-photos")
        .getPublicUrl(namaFile);
      fotoUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("products").insert({
      umkm_id: profile.umkm_id,
      nama_produk: namaProduk.trim(),
      harga: hargaNumber,
      deskripsi: deskripsi.trim() || null,
      tersedia: true,
      kategori,
      foto_url: fotoUrl,
    });

    if (error) {
      setFormError("Gagal menambah produk: " + error.message);
      setIsSubmittingProduct(false);
      return;
    }

    setNamaProduk("");
    setHarga("");
    setDeskripsi("");
    setKategori("makanan");
    setFotoFile(null);
    setFotoPreview(null);
    setIsSubmittingProduct(false);
    fetchProducts();
  };

  const handleToggleTersedia = async (product: Product) => {
    await supabase
      .from("products")
      .update({ tersedia: !product.tersedia })
      .eq("id", product.id);
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const handleUploadQris = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingQris(true);
    setQrisMessage("");

    const filePath = `${profile.umkm_id}.png`;
    const { error: uploadError } = await supabase.storage
      .from("qris-codes")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setQrisMessage("Gagal mengunggah: " + uploadError.message);
      setUploadingQris(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("qris-codes")
      .getPublicUrl(filePath);

    const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("umkm")
      .update({ qris_image_url: publicUrl })
      .eq("id", profile.umkm_id);

    if (updateError) {
      setQrisMessage("Gagal menyimpan link foto: " + updateError.message);
    } else {
      setQrisUrl(publicUrl);
      setQrisMessage("Foto QRIS berhasil diperbarui.");
    }
    setUploadingQris(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  const getRangeForPeriode = (): [Date, Date] | null => {
    const now = new Date();

    if (filterPeriode === "semua") return null;

    if (filterPeriode === "hari_ini") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      return [start, end];
    }

    if (filterPeriode === "minggu_ini") {
      const hari = now.getDay();
      const selisihKeSenin = hari === 0 ? -6 : 1 - hari;
      const senin = new Date(now);
      senin.setDate(now.getDate() + selisihKeSenin);
      senin.setHours(0, 0, 0, 0);
      const minggu = new Date(senin);
      minggu.setDate(senin.getDate() + 6);
      minggu.setHours(23, 59, 59, 999);
      return [senin, minggu];
    }

    if (filterPeriode === "bulan_ini") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return [start, end];
    }

    // custom
    if (!dariTanggal || !sampaiTanggal) return null;
    const start = new Date(`${dariTanggal}T00:00:00`);
    const end = new Date(`${sampaiTanggal}T23:59:59`);
    return [start, end];
  };

  const rentangAktif = getRangeForPeriode();
  const ledgerTerfilter = rentangAktif
    ? ledger.filter((entry) => {
        const waktu = new Date(entry.tanggal).getTime();
        return waktu >= rentangAktif[0].getTime() && waktu <= rentangAktif[1].getTime();
      })
    : ledger;

  return (
    <div className="min-h-screen bg-[#fff8f1]">
      <header className="border-b border-[#f0d9bd] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xl font-bold text-[#e66307] [font-family:'Montserrat-Bold',Helvetica]">
              Dashboard Owner
            </p>
            <p className="text-sm text-[#9a8a78]">Halo, {profile.nama}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#fe972f] px-5 py-2 text-sm font-semibold text-[#fe972f] transition-colors hover:bg-[#fe972f] hover:text-white"
          >
            Keluar
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-5 overflow-x-auto whitespace-nowrap px-4 sm:gap-8 sm:px-6">
          {(
            ["pesanan", "manual", "produk", "pembukuan", "laporan", "pembayaran"] as const
          ).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 py-3 text-sm font-semibold capitalize transition-colors ${
                  activeTab === tab
                    ? "border-[#fe972f] text-[#e66307]"
                    : "border-transparent text-[#9a8a78] hover:text-[#e66307]"
                }`}
              >
                {tab === "pesanan"
                  ? "Pesanan"
                  : tab === "manual"
                  ? "Input Manual"
                  : tab === "produk"
                  ? "Kelola Produk"
                  : tab === "pembukuan"
                  ? "Pembukuan"
                  : tab === "laporan"
                  ? "Laporan"
                  : "Pembayaran"}
              </button>
            )
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "pesanan" && <OrderManagement profile={profile} />}

        {activeTab === "manual" && (
          <ManualOrder profile={profile} onCreated={() => setActiveTab("pesanan")} />
        )}

        {activeTab === "produk" && (
          <div className="grid gap-8 md:grid-cols-[320px_1fr]">
            <form
              onSubmit={handleAddProduct}
              className="h-fit rounded-xl border border-[#f0d9bd] bg-white p-5"
            >
              <h2 className="mb-4 text-base font-bold text-[#e66307]">
                Tambah produk baru
              </h2>

              <label className="mb-3 block text-sm text-[#5c5245]">
                Foto produk (opsional)
                <div className="mt-1 flex items-center gap-3">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Pratinjau"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#fdeee0] text-2xl">
                      🍽️
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFotoChange}
                    className="text-xs text-[#5c5245]"
                  />
                </div>
              </label>

              <label className="mb-3 block text-sm text-[#5c5245]">
                Nama produk
                <input
                  value={namaProduk}
                  onChange={(e) => setNamaProduk(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                  placeholder="Kopi Susu Gula Aren"
                />
              </label>
              <label className="mb-3 block text-sm text-[#5c5245]">
                Kategori
                <select
                  value={kategori}
                  onChange={(e) =>
                    setKategori(e.target.value as "makanan" | "minuman")
                  }
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                >
                  <option value="makanan">Makanan</option>
                  <option value="minuman">Minuman</option>
                </select>
              </label>
              <label className="mb-3 block text-sm text-[#5c5245]">
                Harga (Rp)
                <input
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                  placeholder="15000"
                />
              </label>
              <label className="mb-4 block text-sm text-[#5c5245]">
                Deskripsi (opsional)
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                />
              </label>
              {formError && (
                <p className="mb-3 text-sm text-red-600">{formError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmittingProduct}
                className="w-full rounded-lg bg-[#fe972f] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmittingProduct ? "Menyimpan..." : "Tambah produk"}
              </button>
            </form>

            <div className="hidden rounded-xl border border-[#f0d9bd] bg-white sm:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#f0d9bd] text-[#9a8a78]">
                    <th className="px-5 py-3 font-medium">Produk</th>
                    <th className="px-5 py-3 font-medium">Kategori</th>
                    <th className="px-5 py-3 font-medium">Harga</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-[#9a8a78]">
                        Memuat produk...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-[#9a8a78]">
                        Belum ada produk. Tambahkan lewat form di samping.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b border-[#f5e9d8] last:border-0">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {product.foto_url ? (
                              <img
                                src={product.foto_url}
                                alt={product.nama_produk}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fdeee0] text-lg">
                                🍽️
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[#3d332a]">
                                {product.nama_produk}
                              </p>
                              {product.deskripsi && (
                                <p className="text-xs text-[#9a8a78]">
                                  {product.deskripsi}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 capitalize">{product.kategori}</td>
                        <td className="px-5 py-3">{formatRupiah(product.harga)}</td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleTersedia(product)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              product.tersedia
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {product.tersedia ? "Tersedia" : "Habis"}
                          </button>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs font-semibold text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 sm:hidden">
              {loadingProducts ? (
                <p className="rounded-xl border border-[#f0d9bd] bg-white p-5 text-center text-sm text-[#9a8a78]">
                  Memuat produk...
                </p>
              ) : products.length === 0 ? (
                <p className="rounded-xl border border-[#f0d9bd] bg-white p-5 text-center text-sm text-[#9a8a78]">
                  Belum ada produk. Tambahkan lewat form di atas.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-[#f0d9bd] bg-white p-4"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      {product.foto_url ? (
                        <img
                          src={product.foto_url}
                          alt={product.nama_produk}
                          className="h-12 w-12 shrink-0 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#fdeee0] text-xl">
                          🍽️
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#3d332a]">
                          {product.nama_produk}
                        </p>
                        <p className="text-xs capitalize text-[#9a8a78]">
                          {product.kategori} · {formatRupiah(product.harga)}
                        </p>
                        {product.deskripsi && (
                          <p className="text-xs text-[#9a8a78]">{product.deskripsi}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleTersedia(product)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.tersedia
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.tersedia ? "Tersedia" : "Habis"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-xs font-semibold text-red-500"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "pembukuan" && (
          <div className="grid gap-8 md:grid-cols-[320px_1fr]">
            <form
              onSubmit={handleAddPembukuan}
              className="h-fit rounded-xl border border-[#f0d9bd] bg-white p-5"
            >
              <h2 className="mb-4 text-base font-bold text-[#e66307]">
                {tipePembukuan === "masuk" ? "Catat pemasukan" : "Catat pengeluaran"}
              </h2>
              <label className="mb-3 block text-sm text-[#5c5245]">
                Jenis pembukuan
                <select
                  value={tipePembukuan}
                  onChange={(e) => {
                    setTipePembukuan(e.target.value as "masuk" | "keluar");
                    setPengeluaranError("");
                  }}
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                >
                  <option value="keluar">Pengeluaran</option>
                  <option value="masuk">Pemasukan</option>
                </select>
              </label>
              <label className="mb-3 block text-sm text-[#5c5245]">
                Kategori
                <select
                  value={tipePembukuan === "masuk" ? kategoriPemasukan : kategoriPengeluaran}
                  onChange={(e) =>
                    tipePembukuan === "masuk"
                      ? setKategoriPemasukan(e.target.value)
                      : setKategoriPengeluaran(e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                >
                  {tipePembukuan === "masuk" ? (
                    <>
                      <option>Penjualan di luar NaDi</option>
                      <option>Modal Tambahan</option>
                      <option>Pendapatan Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option>Bahan Baku</option>
                      <option>Sewa</option>
                      <option>Gaji</option>
                      <option>Operasional</option>
                      <option>Lainnya</option>
                    </>
                  )}
                </select>
              </label>
              <label className="mb-3 block text-sm text-[#5c5245]">
                Jumlah (Rp)
                <input
                  value={jumlahPengeluaran}
                  onChange={(e) => setJumlahPengeluaran(e.target.value)}
                  inputMode="numeric"
                  placeholder="50000"
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                />
              </label>
              <label className="mb-3 block text-sm text-[#5c5245]">
                Tanggal
                <input
                  type="date"
                  value={tanggalPengeluaran}
                  onChange={(e) => setTanggalPengeluaran(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                />
              </label>
              <label className="mb-4 block text-sm text-[#5c5245]">
                Keterangan (opsional)
                <input
                  value={deskripsiPengeluaran}
                  onChange={(e) => setDeskripsiPengeluaran(e.target.value)}
                  placeholder="Contoh: Beli kopi 1kg"
                  className="mt-1 w-full rounded-lg border border-[#e7d3ba] px-3 py-2 text-sm outline-none focus:border-[#fe972f]"
                />
              </label>
              {pengeluaranError && (
                <p className="mb-3 text-sm text-red-600">{pengeluaranError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmittingPengeluaran}
                className="w-full rounded-lg bg-[#fe972f] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmittingPengeluaran
                  ? "Menyimpan..."
                  : tipePembukuan === "masuk"
                  ? "Simpan pemasukan"
                  : "Simpan pengeluaran"}
              </button>
            </form>

            <div>
              {loadingLedger ? (
                <p className="text-[#9a8a78]">Memuat pembukuan...</p>
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {(
                      [
                        { key: "hari_ini", label: "Hari Ini" },
                        { key: "minggu_ini", label: "Minggu Ini" },
                        { key: "bulan_ini", label: "Bulan Ini" },
                        { key: "semua", label: "Semua" },
                        { key: "custom", label: "Kustom" },
                      ] as const
                    ).map((opsi) => (
                      <button
                        key={opsi.key}
                        type="button"
                        onClick={() => setFilterPeriode(opsi.key)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                          filterPeriode === opsi.key
                            ? "bg-[#fe972f] text-white"
                            : "border border-[#e7d3ba] text-[#5c5245]"
                        }`}
                      >
                        {opsi.label}
                      </button>
                    ))}
                  </div>

                  {filterPeriode === "custom" && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#5c5245]">
                      <label className="flex items-center gap-2">
                        Dari
                        <input
                          type="date"
                          value={dariTanggal}
                          onChange={(e) => setDariTanggal(e.target.value)}
                          className="rounded-lg border border-[#e7d3ba] px-2 py-1"
                        />
                      </label>
                      <label className="flex items-center gap-2">
                        Sampai
                        <input
                          type="date"
                          value={sampaiTanggal}
                          onChange={(e) => setSampaiTanggal(e.target.value)}
                          className="rounded-lg border border-[#e7d3ba] px-2 py-1"
                        />
                      </label>
                    </div>
                  )}

                  {(() => {
                    const totalMasuk = ledgerTerfilter
                      .filter((e) => e.tipe === "masuk")
                      .reduce((s, e) => s + e.jumlah, 0);
                    const totalKeluar = ledgerTerfilter
                      .filter((e) => e.tipe === "keluar")
                      .reduce((s, e) => s + e.jumlah, 0);
                    const laba = totalMasuk - totalKeluar;
                    return (
                      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#f0d9bd] bg-white p-4">
                          <p className="text-lg font-bold text-green-600">
                            {formatRupiah(totalMasuk)}
                          </p>
                          <p className="text-xs text-[#9a8a78]">Pemasukan</p>
                        </div>
                        <div className="rounded-xl border border-[#f0d9bd] bg-white p-4">
                          <p className="text-lg font-bold text-red-500">
                            {formatRupiah(totalKeluar)}
                          </p>
                          <p className="text-xs text-[#9a8a78]">Pengeluaran</p>
                        </div>
                        <div className="rounded-xl border border-[#f0d9bd] bg-white p-4">
                          <p
                            className={`text-lg font-bold ${
                              laba >= 0 ? "text-[#e66307]" : "text-red-500"
                            }`}
                          >
                            {formatRupiah(laba)}
                          </p>
                          <p className="text-xs text-[#9a8a78]">Laba Bersih</p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="hidden rounded-xl border border-[#f0d9bd] bg-white sm:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#f0d9bd] text-[#9a8a78]">
                          <th className="px-5 py-3 font-medium">Tanggal &amp; Jam</th>
                          <th className="px-5 py-3 font-medium">Keterangan</th>
                          <th className="px-5 py-3 font-medium">Jumlah</th>
                          <th className="px-5 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerTerfilter.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-5 py-6 text-center text-[#9a8a78]">
                              Tidak ada catatan pada periode ini.
                            </td>
                          </tr>
                        ) : (
                          ledgerTerfilter.map((entry) => (
                            <tr key={entry.id} className="border-b border-[#f5e9d8] last:border-0">
                              <td className="px-5 py-3 text-[#5c5245]">
                                {new Date(entry.tanggal).toLocaleString("id-ID", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </td>
                              <td className="px-5 py-3 text-[#3d332a]">
                                {entry.keterangan}
                              </td>
                              <td
                                className={`px-5 py-3 font-semibold ${
                                  entry.tipe === "masuk"
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                              >
                                {entry.tipe === "masuk" ? "+" : "-"}
                                {formatRupiah(entry.jumlah)}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteLedgerEntry(entry)
                                  }
                                  className="text-xs font-semibold text-red-500 hover:underline"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3 sm:hidden">
                    {ledgerTerfilter.length === 0 ? (
                      <p className="rounded-xl border border-[#f0d9bd] bg-white p-5 text-center text-sm text-[#9a8a78]">
                        Tidak ada catatan pada periode ini.
                      </p>
                    ) : (
                      ledgerTerfilter.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-xl border border-[#f0d9bd] bg-white p-4"
                        >
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <p className="text-sm text-[#3d332a]">{entry.keterangan}</p>
                            <p
                              className={`shrink-0 text-sm font-semibold ${
                                entry.tipe === "masuk"
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {entry.tipe === "masuk" ? "+" : "-"}
                              {formatRupiah(entry.jumlah)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-[#9a8a78]">
                              {new Date(entry.tanggal).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                entry.tipe === "keluar"
                                  ? handleDeletePengeluaran(entry.sourceId)
                                  : handleDeleteTransaction(entry.sourceId)
                              }
                              className="text-xs font-semibold text-red-500"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "laporan" && (
          <div>
            {loadingReport || !report ? (
              <p className="text-[#9a8a78]">Memuat laporan...</p>
            ) : (
              <>
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#f0d9bd] bg-white p-5">
                    <p className="text-3xl font-bold text-[#e66307]">
                      {formatRupiah(report.totalPendapatan)}
                    </p>
                    <p className="text-sm text-[#9a8a78]">
                      Total pendapatan (NaDi + pemasukan manual)
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#f0d9bd] bg-white p-5">
                    <p className="text-3xl font-bold text-[#e66307]">
                      {report.jumlahPesanan}
                    </p>
                    <p className="text-sm text-[#9a8a78]">Jumlah pesanan masuk</p>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-[#f0d9bd] bg-white p-5">
                  <h2 className="mb-3 text-base font-bold text-[#e66307]">
                    Tren Pendapatan (14 Hari Terakhir)
                  </h2>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0d9bd" />
                        <XAxis
                          dataKey="tanggal"
                          tick={{ fontSize: 11, fill: "#9a8a78" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#9a8a78" }}
                          tickFormatter={(v) => `${Math.round(v / 1000)}rb`}
                          width={40}
                        />
                        <Tooltip
                          formatter={(value) => formatRupiah(Number(value))}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                        <Bar dataKey="total" fill="#fe972f" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mb-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-[#f0d9bd] bg-white p-5">
                    <h2 className="mb-3 text-base font-bold text-[#e66307]">
                      Pemasukan Berdasarkan Sumber
                    </h2>
                    {report.incomeSources.length === 0 ? (
                      <p className="text-sm text-[#9a8a78]">Belum ada data pemasukan.</p>
                    ) : (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={report.incomeSources} margin={{ bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0d9bd" />
                            <XAxis
                              dataKey="sumber"
                              tick={{ fontSize: 10, fill: "#9a8a78" }}
                              interval={0}
                              angle={-12}
                              textAnchor="end"
                              height={55}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "#9a8a78" }}
                              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`}
                              width={42}
                            />
                            <Tooltip
                              formatter={(value) => formatRupiah(Number(value))}
                              contentStyle={{ fontSize: 12, borderRadius: 8 }}
                            />
                            <Bar dataKey="total" name="Total pemasukan" fill="#16a34a" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#f0d9bd] bg-white p-5">
                    <h2 className="mb-3 text-base font-bold text-[#e66307]">
                      Pengeluaran Berdasarkan Kategori
                    </h2>
                    {report.expenseByCategory.length === 0 ? (
                      <p className="text-sm text-[#9a8a78]">Belum ada data pengeluaran.</p>
                    ) : (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={report.expenseByCategory} layout="vertical" margin={{ left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0d9bd" />
                            <XAxis
                              type="number"
                              tick={{ fontSize: 11, fill: "#9a8a78" }}
                              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}rb`}
                            />
                            <YAxis
                              type="category"
                              dataKey="kategori"
                              tick={{ fontSize: 11, fill: "#9a8a78" }}
                              width={90}
                            />
                            <Tooltip
                              formatter={(value) => formatRupiah(Number(value))}
                              contentStyle={{ fontSize: 12, borderRadius: 8 }}
                            />
                            <Bar dataKey="total" name="Total pengeluaran" fill="#ef4444" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-[#f0d9bd] bg-white p-5">
                  <h2 className="mb-3 text-base font-bold text-[#e66307]">
                    Produk Terlaris
                  </h2>
                  {report.produkTerlaris.length === 0 ? (
                    <p className="text-sm text-[#9a8a78]">
                      Belum ada data penjualan.
                    </p>
                  ) : (
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={report.produkTerlaris}
                          layout="vertical"
                          margin={{ left: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0d9bd" />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: "#9a8a78" }}
                            allowDecimals={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="nama_produk"
                            tick={{ fontSize: 11, fill: "#3d332a" }}
                            width={110}
                          />
                          <Tooltip
                            formatter={(value) => `${Number(value)} terjual`}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <Bar dataKey="total_terjual" fill="#fe972f" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#f0d9bd] bg-white p-5">
                  <h2 className="mb-3 text-base font-bold text-[#e66307]">
                    Riwayat Transaksi
                  </h2>
                  {report.transaksiList.length === 0 ? (
                    <p className="text-sm text-[#9a8a78]">Belum ada transaksi lunas.</p>
                  ) : (
                    <div className="space-y-2">
                      {report.transaksiList.map((t) => (
                        <div
                          key={t.id}
                          className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5e9d8] pb-2 text-sm last:border-0"
                        >
                          <div>
                            <p className="font-medium text-[#3d332a]">
                              {t.kode_pesanan}
                            </p>
                            <p className="text-xs text-[#9a8a78]">
                              {new Date(t.tanggal).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-green-600">
                              {formatRupiah(t.jumlah)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-xs font-semibold text-red-500 hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "pembayaran" && (
          <div className="max-w-md rounded-xl border border-[#f0d9bd] bg-white p-5">
            <h2 className="mb-2 text-base font-bold text-[#e66307]">
              Foto QRIS Toko
            </h2>
            <p className="mb-4 text-sm text-[#9a8a78]">
              Foto ini akan ditampilkan ke customer saat memilih pembayaran QRIS.
            </p>
            {qrisUrl && (
              <img
                src={qrisUrl}
                alt="QRIS toko"
                className="mb-4 h-56 w-56 rounded-lg border border-[#f0d9bd] object-contain"
              />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleUploadQris}
              disabled={uploadingQris}
              className="block w-full text-sm text-[#5c5245]"
            />
            {uploadingQris && (
              <p className="mt-2 text-sm text-[#9a8a78]">Mengunggah...</p>
            )}
            {qrisMessage && (
              <p className="mt-2 text-sm text-[#e66307]">{qrisMessage}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
