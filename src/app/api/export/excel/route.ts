import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const runtime = "nodejs";
const formatRow = (row: any) => ({
  ...row,
  dateTime: row.dateTime
    ? new Date(row.dateTime).toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-",
  qrContent:
    row.qrContent?.length > 40
      ? row.qrContent.substring(0, 40) + "..."
      : (row.qrContent ?? ""),
});

export async function POST(req: Request) {
  try {
    const { columns, data } = await req.json();

    if (!columns || !data) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    worksheet.columns = columns.map((c: any) => ({
      header: c.label,
      key: c.key,
      width: 20,
    }));

    data.forEach((row: any) => worksheet.addRow(formatRow(row)));

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="report.xlsx"',
      },
    });
  } catch (err) {
    console.error("Excel API error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
