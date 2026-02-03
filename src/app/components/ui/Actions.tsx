import { useState } from "react";
import Swal from "sweetalert2";


type Column = {
  key: string;
  label: string;
};

type Props = {
  columns: Column[];
  data: any[];
};

export default function Actions({ columns, data }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== PDF =====
  const exportPDF = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, data }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Export PDF ไม่สำเร็จ",
        text: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      Swal.fire({
        icon: "success",
        title: "Export PDF สำเร็จ",
        timer: 3000,
      });
      setLoading(false);
      setOpen(false);
    }
  };

  // ===== Export Excel =====
  const exportExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/export/excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ columns, data }),
      });

      if (!res.ok) throw new Error("Excel export failed");

      const blob = await res.blob(); // ⭐ ตัวนี้แหละที่แก้ Excel พัง
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "report.xlsx";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Export Excel ไม่สำเร็จ");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  // ===== Print =====
  const printPage = () => {
    window.print();
  };

  return (
    <div className="h-6 w-6 p-1 flex items-center justify-center">
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-300/50 px-0.5 rounded-sm"
      >
        <i className="fa-solid fa-file-arrow-down text-blue-600"></i>
      </button>

      {open && (
        <ul className="absolute text-blue-600 text-xs font-sans right-3 mt-28 w-26 bg-white p-0.5 rounded-sm shadow-sm border border-blue-300/40 flex flex-col gap-0.5 z-20">
          <li
            onClick={exportPDF}
            className="hover:bg-blue-300/50 rounded-xs cursor-pointer p-1 flex gap-1 items-center"
          >
            <i className="fa-solid fa-file-pdf"></i>
            Export PDF
          </li>

          <li
            onClick={exportExcel}
            className="hover:bg-blue-300/50 rounded-xs cursor-pointer p-1 flex gap-1 items-center"
          >
            <i className="fa-solid fa-file-excel pr-1"></i>
            Export Excel
          </li>

          <li
            onClick={printPage}
            className="hover:bg-blue-300/50 rounded-xs cursor-pointer p-1 flex gap-1 items-center"
          >
            <i className="fa-solid fa-print"></i>
            Print
          </li>
        </ul>
      )}

      {loading && (
        <div className="absolute top-8 text-[10px] text-gray-400">
          exporting...
        </div>
      )}
    </div>
  );
}
