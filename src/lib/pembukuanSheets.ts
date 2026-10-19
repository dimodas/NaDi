import type { SheetData } from "write-excel-file/browser";

export type EntriExport = {
  tanggal: string; // "YYYY-MM-DD" (tanpa jam) atau ISO timestamp (dengan jam)
  keterangan: string;
  jumlah: number;
  tipe: "masuk" | "keluar";
};

const adaJam = (iso: string) => iso.length > 10;

const dua = (n: number) => String(n).padStart(2, "0");

// Excel tidak mengenal zona waktu: library menulis tanggal apa adanya
// berdasarkan UTC. Jadi kita kirim Date yang komponen UTC-nya sama dengan
// jam dinding lokal (WITA), supaya yang tampil di Excel adalah jam yang benar.
const keJamDinding = (iso: string): Date => {
  if (!adaJam(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const t = new Date(iso);
  return new Date(
    Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes())
  );
};

const FORMAT_RUPIAH = "#,##0";
const FORMAT_LABA = "#,##0;[Red]-#,##0";
const WARNA_HEADER = "#fdeee0";

const header = (teks: string, align: "left" | "right" = "left") => ({
  value: teks,
  fontWeight: "bold" as const,
  backgroundColor: WARNA_HEADER,
  align,
});

export const buatSheetPembukuan = (
  entries: EntriExport[],
  periodeLabel: string,
  dicetakPada: Date = new Date()
) => {
  // Jurnal diurutkan dari yang paling lama ke terbaru (urutan buku kas).
  const urut = [...entries].sort(
    (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
  );

  const totalMasuk = urut
    .filter((e) => e.tipe === "masuk")
    .reduce((s, e) => s + e.jumlah, 0);
  const totalKeluar = urut
    .filter((e) => e.tipe === "keluar")
    .reduce((s, e) => s + e.jumlah, 0);
  const laba = totalMasuk - totalKeluar;

  const jurnal: SheetData = [
    [
      header("Tanggal"),
      header("Jam"),
      header("Jenis"),
      header("Keterangan"),
      header("Pemasukan (Rp)", "right"),
      header("Pengeluaran (Rp)", "right"),
    ],
    ...urut.map((e) => {
      const t = keJamDinding(e.tanggal);
      return [
        { value: t, type: Date, format: "dd/mm/yyyy", align: "left" as const },
        {
          value: adaJam(e.tanggal)
            ? `${dua(new Date(e.tanggal).getHours())}.${dua(new Date(e.tanggal).getMinutes())}`
            : "-",
          type: String,
          format: "@",
        },
        e.tipe === "masuk" ? "Pemasukan" : "Pengeluaran",
        e.keterangan,
        e.tipe === "masuk"
          ? { value: e.jumlah, type: Number, format: FORMAT_RUPIAH }
          : null,
        e.tipe === "keluar"
          ? { value: e.jumlah, type: Number, format: FORMAT_RUPIAH }
          : null,
      ];
    }),
    [
      null,
      null,
      null,
      { value: "TOTAL", fontWeight: "bold" as const },
      { value: totalMasuk, type: Number, format: FORMAT_RUPIAH, fontWeight: "bold" as const },
      { value: totalKeluar, type: Number, format: FORMAT_RUPIAH, fontWeight: "bold" as const },
    ],
  ];

  const ringkasan: SheetData = [
    [{ value: "Laporan Pembukuan", fontWeight: "bold" as const, fontSize: 14 }],
    [],
    ["Periode", periodeLabel],
    [
      "Dicetak",
      {
        value: new Date(
          Date.UTC(
            dicetakPada.getFullYear(),
            dicetakPada.getMonth(),
            dicetakPada.getDate(),
            dicetakPada.getHours(),
            dicetakPada.getMinutes()
          )
        ),
        type: Date,
        format: "dd/mm/yyyy hh:mm",
        align: "left" as const,
      },
    ],
    ["Jumlah catatan", { value: urut.length, type: Number, format: "0" }],
    [],
    ["Total Pemasukan (Rp)", { value: totalMasuk, type: Number, format: FORMAT_RUPIAH }],
    ["Total Pengeluaran (Rp)", { value: totalKeluar, type: Number, format: FORMAT_RUPIAH }],
    [
      { value: "Laba Bersih (Rp)", fontWeight: "bold" as const },
      { value: laba, type: Number, format: FORMAT_LABA, fontWeight: "bold" as const },
    ],
  ];

  return [
    {
      data: jurnal,
      sheet: "Jurnal",
      columns: [
        { width: 12 },
        { width: 8 },
        { width: 13 },
        { width: 46 },
        { width: 18 },
        { width: 18 },
      ],
      stickyRowsCount: 1,
    },
    {
      data: ringkasan,
      sheet: "Ringkasan",
      columns: [{ width: 26 }, { width: 28 }],
    },
  ];
};
