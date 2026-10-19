import writeExcelFile from "write-excel-file/browser";
import { buatSheetPembukuan, type EntriExport } from "./pembukuanSheets";

// Membuat file .xlsx lalu langsung mengunduhnya di browser.
export const unduhPembukuanExcel = async (
  entries: EntriExport[],
  periodeLabel: string,
  namaFile: string
) => {
  await writeExcelFile(buatSheetPembukuan(entries, periodeLabel)).toFile(namaFile);
};
