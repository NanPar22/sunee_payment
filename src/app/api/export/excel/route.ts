import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const runtime = "nodejs";

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

    data.forEach((row: any) => worksheet.addRow(row));

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
