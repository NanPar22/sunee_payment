import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Column = {
  key: string;
  label: string;
};
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
  qrContent: row.qrContent ?? "",
});

export async function POST(req: Request) {
  const { columns, data }: { columns: Column[]; data: any[] } =
    await req.json();

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  // ===== สร้าง table จาก columns + data =====
  const thead = `
    <tr>
      ${columns.map((c) => `<th>${c.label}</th>`).join("")}
    </tr>
  `;

  const tbody = data
    .map((row) => {
      const formatted = formatRow(row);
      return `
      <tr>
        ${columns.map((c) => `<td>${formatted[c.key] ?? ""}</td>`).join("")}
      </tr>
    `;
    })
    .join("");

  await page.setContent(`
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 1px;
          }
          h1 {
            text-align: center;
            font-size: 20px;
            font-weight: semibold;
            margin-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th, td {
            border: 1px solid #333;
            padding: 2px;
            font-size: 8px;
            text-align: center;
            white-space: nowrap;
          }
          td:last-child, th:last-child {
          white-space: normal;
          word-break: break-all;
          max-width: 160px;
          }
          th {
            background: #f0f0f0;  
          }
        </style>
      </head>
      <body>
        <h1>Report</h1>
        <table>
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
      </body>
    </html>
  `);

  const pdfUint8 = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "5mm",
      bottom: "10mm",
      left: "5mm",
      right: "5mm",
    },
  });

  await browser.close();

  // ✅ จุดสำคัญ: แปลง Uint8Array → Buffer
  const pdfBuffer = Buffer.from(pdfUint8);

  return new NextResponse(pdfBuffer, {  
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="report.pdf"',
    },
  });
}
