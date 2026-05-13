import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function warnaStatus(status) {
  if (status === "Normal") return "#22c55e";
  if (status === "Cukup") return "#facc15";
  if (status === "Perlu Evaluasi") return "#ef4444";
  return "#94a3b8";
}

function warnaRisiko(risiko) {
  if (risiko === "Rendah") return "#22c55e";
  if (risiko === "Sedang") return "#facc15";
  if (risiko === "Tinggi") return "#ef4444";
  return "#94a3b8";
}

function warnaTextStatus(status) {
  if (status === "Normal") return "text-green-400";
  if (status === "Cukup") return "text-yellow-400";
  if (status === "Perlu Evaluasi") return "text-red-400";
  return "text-slate-400";
}

function warnaTextRisiko(risiko) {
  if (risiko === "Rendah") return "text-green-400";
  if (risiko === "Sedang") return "text-yellow-400";
  if (risiko === "Tinggi") return "text-red-400";
  return "text-slate-400";
}

function bulanKeAngka(bulan) {
  const daftar = {
    januari: 1,
    jan: 1,
    februari: 2,
    feb: 2,
    maret: 3,
    mar: 3,
    april: 4,
    apr: 4,
    mei: 5,
    may: 5,
    juni: 6,
    jun: 6,
    juli: 7,
    jul: 7,
    agustus: 8,
    agu: 8,
    aug: 8,
    september: 9,
    sep: 9,
    oktober: 10,
    okt: 10,
    oct: 10,
    november: 11,
    nov: 11,
    desember: 12,
    des: 12,
    dec: 12,
  };

  if (!bulan) return null;

  if (!isNaN(Number(bulan))) {
    const angka = Number(bulan);
    return angka >= 1 && angka <= 12 ? angka : null;
  }

  return daftar[String(bulan).toLowerCase()] || null;
}

function formatPeriode(periode) {
  if (!periode || periode === "-") return "-";

  const bulanIndonesia = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const teks = String(periode);

  if (teks.includes("-")) {
    const bagian = teks.split("-");
    const tahun = bagian[0];
    const bulan = Number(bagian[1]);

    if (tahun && bulan >= 1 && bulan <= 12) {
      return `${bulanIndonesia[bulan - 1]} ${tahun}`;
    }
  }

  return teks;
}

function ambilPeriode(item) {
  if (!item) return "-";

  if (item.periode) return item.periode;
  if (item.tanggal) return item.tanggal;
  if (item.tanggal_panen) return item.tanggal_panen;
  if (item.periode_evaluasi) return item.periode_evaluasi;

  if (item.tahun && item.bulan) {
    const bulan = bulanKeAngka(item.bulan);
    if (bulan) {
      return `${item.tahun}-${String(bulan).padStart(2, "0")}-01`;
    }
  }

  return "-";
}

function ambilNilai(item, daftarKey, defaultValue = "-") {
  if (!item) return defaultValue;

  for (const key of daftarKey) {
    if (item[key] !== undefined && item[key] !== null && item[key] !== "") {
      return item[key];
    }
  }

  return defaultValue;
}

function formatTon(nilai) {
  if (nilai === null || nilai === undefined || nilai === "") return "-";

  if (typeof nilai === "string") {
    if (nilai.toLowerCase().includes("ton")) return nilai;
    if (nilai === "-") return "-";
  }

  const angka = Number(String(nilai).replace(/[^\d.-]/g, ""));

  if (!isNaN(angka)) {
    return `${angka.toLocaleString("id-ID")} ton`;
  }

  return String(nilai);
}

function formatPersen(nilai) {
  if (nilai === null || nilai === undefined || nilai === "") return "-";

  if (typeof nilai === "string") {
    if (nilai.includes("%")) return nilai;
    if (nilai === "-") return "-";
  }

  const angka = Number(String(nilai).replace(/[^\d.-]/g, ""));

  if (!isNaN(angka)) {
    return `${angka.toLocaleString("id-ID", {
      maximumFractionDigits: 2,
    })}%`;
  }

  return String(nilai);
}

function safeArray(data) {
  return Array.isArray(data) ? data : [];
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch error:", url, error);
    return null;
  }
}

function namaFileAman(value) {
  return String(value || "periode")
    .replaceAll("/", "-")
    .replaceAll("\\", "-")
    .replaceAll(":", "-")
    .replaceAll(" ", "-");
}

export default function Laporan() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dataTes, setDataTes] = useState({
    level_data: "Kabupaten Sukoharjo",
    periode: "-",
    prediksi: "-",
    aktual: "-",
    mape: "-",
    status: "-",
    analisis: "-",
  });

  const [summary, setSummary] = useState({
    total_wilayah: 0,
    normal: 0,
    cukup: 0,
    perlu_evaluasi: 0,
    risiko_rendah: 0,
    risiko_sedang: 0,
    risiko_tinggi: 0,
  });

  const [kesimpulanUmum, setKesimpulanUmum] = useState("");
  const [dataWilayah, setDataWilayah] = useState([]);
  const [dataPrediksi, setDataPrediksi] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterRisiko, setFilterRisiko] = useState("Semua");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [gisRes, tesRes, laporanRes] = await Promise.all([
        fetchJson("http://localhost:8000/api/gis/monitoring"),
        fetchJson("http://localhost:8000/api/tes/prediksi"),
        fetchJson("http://localhost:8000/api/laporan"),
      ]);

      if (!gisRes && !tesRes && !laporanRes) {
        throw new Error("Semua endpoint laporan gagal diakses.");
      }

      const dataTesBaru =
        gisRes?.data_tes ||
        laporanRes?.data_tes ||
        laporanRes?.summary?.data_tes ||
        {
          level_data: "Kabupaten Sukoharjo",
          periode: "-",
          prediksi: "-",
          aktual: "-",
          mape: "-",
          status: "-",
          analisis: "-",
        };

      setDataTes({
        level_data: dataTesBaru.level_data || "Kabupaten Sukoharjo",
        periode: dataTesBaru.periode || "-",
        prediksi: dataTesBaru.prediksi || "-",
        aktual: dataTesBaru.aktual || "-",
        mape: dataTesBaru.mape || "-",
        status: dataTesBaru.status || "-",
        analisis: dataTesBaru.analisis || "-",
      });

      setSummary(
        gisRes?.summary ||
          laporanRes?.summary || {
            total_wilayah: 0,
            normal: 0,
            cukup: 0,
            perlu_evaluasi: 0,
            risiko_rendah: 0,
            risiko_sedang: 0,
            risiko_tinggi: 0,
          }
      );

      setKesimpulanUmum(
        gisRes?.kesimpulan_umum ||
          laporanRes?.kesimpulan_umum ||
          "Laporan menampilkan hasil prediksi TES, evaluasi MAPE, risiko cuaca wilayah, dan rekomendasi monitoring."
      );

      setDataWilayah(safeArray(gisRes?.data));

      const prediksiList =
        tesRes?.prediksi_mendatang ||
        tesRes?.data?.prediksi_mendatang ||
        tesRes?.prediksi ||
        laporanRes?.prediksi_mendatang ||
        laporanRes?.data?.prediksi_mendatang ||
        laporanRes?.data?.prediksi ||
        laporanRes?.prediksi ||
        [];

      const evaluasiList =
        tesRes?.evaluasi ||
        tesRes?.data?.evaluasi ||
        laporanRes?.evaluasi ||
        laporanRes?.data?.evaluasi ||
        [];

      const mapEvaluasi = {};

      safeArray(evaluasiList).forEach((item) => {
        const periode = ambilPeriode(item);
        mapEvaluasi[periode] = item;
      });

      let hasilPrediksi = safeArray(prediksiList).map((item) => {
        const periode = ambilPeriode(item);
        const evaluasi = mapEvaluasi[periode] || {};

        return {
          periode,
          prediksi: formatTon(
            ambilNilai(item, [
              "prediksi",
              "prediksi_tes",
              "hasil_prediksi",
              "produksi_prediksi",
              "nilai_prediksi",
            ])
          ),
          aktual: formatTon(
            ambilNilai(evaluasi, [
              "aktual",
              "produksi_aktual",
              "hasil_aktual",
              "nilai_aktual",
            ])
          ),
          mape: formatPersen(
            ambilNilai(evaluasi, ["mape", "nilai_mape", "error"])
          ),
          status: ambilNilai(evaluasi, ["status", "status_model"], "Belum Ada"),
          kategori: ambilNilai(item, ["kategori", "status_prediksi"], "-"),
        };
      });

      if (hasilPrediksi.length === 0 && safeArray(evaluasiList).length > 0) {
        hasilPrediksi = safeArray(evaluasiList).map((item) => ({
          periode: ambilPeriode(item),
          prediksi: formatTon(
            ambilNilai(item, [
              "prediksi",
              "prediksi_tes",
              "hasil_prediksi",
              "produksi_prediksi",
            ])
          ),
          aktual: formatTon(
            ambilNilai(item, [
              "aktual",
              "produksi_aktual",
              "hasil_aktual",
              "nilai_aktual",
            ])
          ),
          mape: formatPersen(ambilNilai(item, ["mape", "nilai_mape", "error"])),
          status: ambilNilai(item, ["status", "status_model"], "Belum Ada"),
          kategori: "-",
        }));
      }

      if (hasilPrediksi.length === 0 && dataTesBaru.prediksi) {
        hasilPrediksi = [
          {
            periode: dataTesBaru.periode || "-",
            prediksi: dataTesBaru.prediksi || "-",
            aktual: dataTesBaru.aktual || "-",
            mape: dataTesBaru.mape || "-",
            status: dataTesBaru.status || "-",
            kategori: "-",
          },
        ];
      }

      setDataPrediksi(hasilPrediksi);
      setLoading(false);
    } catch (err) {
      console.error("Error laporan:", err);
      setError("Data laporan gagal dimuat. Pastikan backend Laravel aktif.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const periodeTampil = formatPeriode(dataTes.periode);

  const dataWilayahTampil = useMemo(() => {
    return dataWilayah.filter((item) => {
      const nama = item.nama || "";

      const cocokKeyword = nama
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const cocokStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      const cocokRisiko =
        filterRisiko === "Semua" || item.risiko === filterRisiko;

      return cocokKeyword && cocokStatus && cocokRisiko;
    });
  }, [dataWilayah, keyword, filterStatus, filterRisiko]);

  const buildLaporanRows = () => {
    return dataWilayahTampil.map((item, index) => ({
      No: index + 1,
      Kecamatan: item.nama || "-",
      Tanaman: "Padi",
      "Periode Prediksi": periodeTampil,
      "Prediksi TES": item.prediksi || dataTes.prediksi || "-",
      Aktual: item.aktual || dataTes.aktual || "-",
      MAPE: item.mape || dataTes.mape || "-",
      "Status Model": item.status || dataTes.status || "-",
      Suhu: item.suhu || "-",
      Kelembaban: item.kelembaban || "-",
      "Kondisi Cuaca": item.kondisi || "-",
      Risiko: item.risiko || "-",
      Rekomendasi: item.kesimpulan_monitoring || item.rekomendasi || "-",
    }));
  };

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const ringkasan = [
      ["Laporan Prediksi dan Monitoring Panen Padi"],
      ["Kabupaten", "Sukoharjo"],
      ["Periode Prediksi", periodeTampil],
      ["Prediksi TES", dataTes.prediksi],
      ["Aktual Produksi", dataTes.aktual],
      ["MAPE", dataTes.mape],
      ["Status Model", dataTes.status],
      ["Total Wilayah Dipantau", summary.total_wilayah],
      ["Risiko Rendah", summary.risiko_rendah],
      ["Risiko Sedang", summary.risiko_sedang],
      ["Risiko Tinggi", summary.risiko_tinggi],
      [],
      ["Kesimpulan"],
      [kesimpulanUmum],
      [],
      ["Catatan"],
      [
        "Prediksi dihitung menggunakan metode Triple Exponential Smoothing berdasarkan data historis produksi bulanan.",
      ],
      [
        "MAPE digunakan untuk membandingkan hasil prediksi dengan data aktual.",
      ],
      [
        "Cuaca digunakan untuk menentukan risiko wilayah dan rekomendasi, bukan sebagai input langsung rumus TES.",
      ],
    ];

    const sheetRingkasan = XLSX.utils.aoa_to_sheet(ringkasan);
    sheetRingkasan["!cols"] = [{ wch: 28 }, { wch: 90 }];
    XLSX.utils.book_append_sheet(workbook, sheetRingkasan, "Ringkasan");

    const wilayahRows = buildLaporanRows();

    const sheetWilayah = XLSX.utils.json_to_sheet(
      wilayahRows.length > 0
        ? wilayahRows
        : [
            {
              No: "-",
              Kecamatan: "-",
              Tanaman: "-",
              "Periode Prediksi": "-",
              "Prediksi TES": "-",
              Aktual: "-",
              MAPE: "-",
              "Status Model": "-",
              Suhu: "-",
              Kelembaban: "-",
              "Kondisi Cuaca": "-",
              Risiko: "-",
              Rekomendasi: "-",
            },
          ]
    );

    sheetWilayah["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 12 },
      { wch: 16 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 12 },
      { wch: 80 },
    ];

    XLSX.utils.book_append_sheet(workbook, sheetWilayah, "Monitoring Wilayah");

    const sheetPrediksi = XLSX.utils.json_to_sheet(
      dataPrediksi.length > 0
        ? dataPrediksi.map((item, index) => ({
            No: index + 1,
            Periode: formatPeriode(item.periode),
            "Prediksi TES": item.prediksi,
            Aktual: item.aktual,
            MAPE: item.mape,
            Status: item.status,
            Kategori: item.kategori,
          }))
        : [
            {
              No: "-",
              Periode: "-",
              "Prediksi TES": "-",
              Aktual: "-",
              MAPE: "-",
              Status: "-",
              Kategori: "-",
            },
          ]
    );

    sheetPrediksi["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(workbook, sheetPrediksi, "Prediksi Bulanan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      blob,
      `laporan-geopanen-${namaFileAman(dataTes.periode)}.xlsx`
    );
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Laporan Prediksi dan Monitoring Panen Padi", 14, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Kabupaten Sukoharjo", 14, 22);
    doc.text(`Periode Prediksi: ${periodeTampil}`, 14, 28);

    doc.setFontSize(8);
    doc.text(
      `Dicetak: ${new Date().toLocaleString("id-ID")}`,
      pageWidth - 70,
      15
    );

    autoTable(doc, {
      startY: 35,
      theme: "grid",
      head: [["Ringkasan", "Nilai"]],
      body: [
        ["Prediksi TES", dataTes.prediksi],
        ["Aktual Produksi", dataTes.aktual],
        ["MAPE", dataTes.mape],
        ["Status Model", dataTes.status],
        ["Total Wilayah Dipantau", summary.total_wilayah],
        ["Risiko Rendah", summary.risiko_rendah],
        ["Risiko Sedang", summary.risiko_sedang],
        ["Risiko Tinggi", summary.risiko_tinggi],
      ],
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      theme: "grid",
      head: [
        [
          "No",
          "Kecamatan",
          "Prediksi",
          "Aktual",
          "MAPE",
          "Status",
          "Suhu",
          "Kelembaban",
          "Cuaca",
          "Risiko",
          "Rekomendasi",
        ],
      ],
      body: buildLaporanRows().map((item) => [
        item.No,
        item.Kecamatan,
        item["Prediksi TES"],
        item.Aktual,
        item.MAPE,
        item["Status Model"],
        item.Suhu,
        item.Kelembaban,
        item["Kondisi Cuaca"],
        item.Risiko,
        item.Rekomendasi,
      ]),
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 9 },
        1: { cellWidth: 23 },
        2: { cellWidth: 23 },
        3: { cellWidth: 22 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
        6: { cellWidth: 14 },
        7: { cellWidth: 21 },
        8: { cellWidth: 23 },
        9: { cellWidth: 17 },
        10: { cellWidth: 88 },
      },
      margin: {
        left: 10,
        right: 10,
      },
    });

    const akhirTabelWilayah = doc.lastAutoTable.finalY || 0;

    if (akhirTabelWilayah > 150) {
      doc.addPage();
    }

    autoTable(doc, {
      startY: akhirTabelWilayah > 150 ? 18 : akhirTabelWilayah + 10,
      theme: "grid",
      head: [["No", "Periode", "Prediksi TES", "Aktual", "MAPE", "Status"]],
      body: dataPrediksi.map((item, index) => [
        index + 1,
        formatPeriode(item.periode),
        item.prediksi,
        item.aktual,
        item.mape,
        item.status,
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
      },
      margin: {
        left: 14,
        right: 14,
      },
    });

    const jumlahHalaman = doc.internal.getNumberOfPages();

    for (let i = 1; i <= jumlahHalaman; i += 1) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `GeoPanen - Halaman ${i} dari ${jumlahHalaman}`,
        pageWidth - 60,
        doc.internal.pageSize.getHeight() - 8
      );
    }

    doc.save(`laporan-geopanen-${namaFileAman(dataTes.periode)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-emerald-400">
              Memuat Laporan Monitoring...
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Mengambil data TES, MAPE, cuaca, risiko, dan rekomendasi.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-slate-900 border border-red-700 rounded-2xl p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400">
              Gagal Memuat Laporan
            </h2>
            <p className="text-sm text-slate-300 mt-2">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 h-screen overflow-hidden">
        {/* HEADER */}
        <div className="h-[73px] px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              Laporan Monitoring GeoPanen
            </h1>
            <p className="text-sm text-slate-400">
              Rekap prediksi TES, evaluasi MAPE, cuaca, risiko wilayah, dan
              rekomendasi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPdf}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Export PDF
            </button>

            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Export Excel
            </button>

            <button
              onClick={loadData}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="h-[calc(100vh-73px)] overflow-y-auto">
          {/* TITLE REPORT */}
          <section className="bg-slate-950 border-b border-slate-800 px-6 py-6">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
              <div>
                <p className="text-sm text-emerald-400 font-semibold">
                  Laporan Khusus
                </p>
                <h2 className="text-3xl font-bold mt-2">
                  Laporan Prediksi dan Monitoring Panen Padi
                </h2>
                <p className="text-sm text-slate-400 mt-3 max-w-3xl leading-relaxed">
                  Laporan ini menampilkan hasil prediksi panen padi Kabupaten
                  Sukoharjo menggunakan TES, evaluasi aktual melalui MAPE,
                  kondisi cuaca kecamatan, risiko wilayah, dan rekomendasi
                  monitoring.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-w-[300px]">
                <p className="text-xs text-slate-400">Status Laporan</p>
                <div className="flex justify-between items-center mt-2">
                  <h3 className="text-xl font-bold">Data TES Tersedia</h3>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${warnaTextStatus(
                      dataTes.status
                    )}`}
                    style={{
                      backgroundColor: `${warnaStatus(dataTes.status)}30`,
                    }}
                  >
                    {dataTes.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Periode prediksi: {periodeTampil}
                </p>
              </div>
            </div>
          </section>

          <div className="p-6 space-y-6">
            {/* RINGKASAN UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-sm text-slate-400">Prediksi Panen</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-2">
                  {dataTes.prediksi}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{periodeTampil}</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-sm text-slate-400">Aktual Produksi</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {dataTes.aktual}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Data aktual pembanding
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-sm text-slate-400">MAPE</p>
                <h3 className="text-2xl font-bold text-yellow-300 mt-2">
                  {dataTes.mape}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Rata-rata error evaluasi
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-sm text-slate-400">Status Model</p>
                <h3
                  className={`text-2xl font-bold mt-2 ${warnaTextStatus(
                    dataTes.status
                  )}`}
                >
                  {dataTes.status}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Berdasarkan nilai MAPE
                </p>
              </div>
            </div>

            {/* KESIMPULAN */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-2">
                Kesimpulan Laporan Sistem
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {kesimpulanUmum}
              </p>
            </div>

            {/* REPORT CUSTOM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">
                    Laporan Monitoring Wilayah
                  </h3>
                  <p className="text-sm text-slate-400">
                    Format laporan seperti laporan khusus: kecamatan, prediksi,
                    cuaca, risiko, dan rekomendasi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari kecamatan..."
                    className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none placeholder:text-slate-500"
                  />

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Normal">Normal</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Perlu Evaluasi">Perlu Evaluasi</option>
                  </select>

                  <select
                    value={filterRisiko}
                    onChange={(e) => setFilterRisiko(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none"
                  >
                    <option value="Semua">Semua Risiko</option>
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="px-4 py-4 text-left min-w-[170px]">
                        Wilayah
                      </th>
                      <th className="px-4 py-4 text-left min-w-[120px]">
                        Tanaman
                      </th>
                      <th className="px-4 py-4 text-left min-w-[150px]">
                        Periode
                      </th>
                      <th className="px-4 py-4 text-left min-w-[150px]">
                        Prediksi TES
                      </th>
                      <th className="px-4 py-4 text-left min-w-[140px]">
                        Aktual
                      </th>
                      <th className="px-4 py-4 text-left min-w-[110px]">
                        MAPE
                      </th>
                      <th className="px-4 py-4 text-left min-w-[140px]">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left min-w-[110px]">
                        Suhu
                      </th>
                      <th className="px-4 py-4 text-left min-w-[130px]">
                        Kelembaban
                      </th>
                      <th className="px-4 py-4 text-left min-w-[160px]">
                        Cuaca
                      </th>
                      <th className="px-4 py-4 text-left min-w-[120px]">
                        Risiko
                      </th>
                      <th className="px-4 py-4 text-left min-w-[320px]">
                        Rekomendasi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataWilayahTampil.length === 0 ? (
                      <tr>
                        <td
                          colSpan="12"
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          Data wilayah tidak ditemukan.
                        </td>
                      </tr>
                    ) : (
                      dataWilayahTampil.map((item, index) => (
                        <tr
                          key={`${item.nama}-${index}`}
                          className="border-t border-slate-800 hover:bg-slate-800/60"
                        >
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-bold text-white">
                                {item.nama}
                              </p>
                              <p className="text-xs text-slate-500">
                                Sukoharjo
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4">Padi</td>

                          <td className="px-4 py-4">{periodeTampil}</td>

                          <td className="px-4 py-4 font-semibold text-emerald-300">
                            {item.prediksi || dataTes.prediksi || "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.aktual || dataTes.aktual || "-"}
                          </td>

                          <td className="px-4 py-4 font-semibold text-yellow-300">
                            {item.mape || dataTes.mape || "-"}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${warnaTextStatus(
                                item.status
                              )}`}
                              style={{
                                backgroundColor: `${warnaStatus(
                                  item.status
                                )}30`,
                              }}
                            >
                              {item.status || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-4">{item.suhu || "-"}</td>

                          <td className="px-4 py-4">
                            {item.kelembaban || "-"}
                          </td>

                          <td className="px-4 py-4">{item.kondisi || "-"}</td>

                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${warnaTextRisiko(
                                item.risiko
                              )}`}
                              style={{
                                backgroundColor: `${warnaRisiko(
                                  item.risiko
                                )}30`,
                              }}
                            >
                              {item.risiko || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-slate-300 leading-relaxed">
                            {item.kesimpulan_monitoring ||
                              item.rekomendasi ||
                              "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DETAIL PREDIKSI BULANAN */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">
                      Detail Prediksi Bulanan TES
                    </h3>
                    <p className="text-sm text-slate-400">
                      Rekap hasil prediksi dan evaluasi aktual per periode.
                    </p>
                  </div>

                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                    {dataPrediksi.length} Data
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="px-4 py-4 text-left">No</th>
                      <th className="px-4 py-4 text-left">Periode</th>
                      <th className="px-4 py-4 text-left">Prediksi TES</th>
                      <th className="px-4 py-4 text-left">Aktual</th>
                      <th className="px-4 py-4 text-left">MAPE</th>
                      <th className="px-4 py-4 text-left">Status</th>
                      <th className="px-4 py-4 text-left">Kategori</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dataPrediksi.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          Data prediksi belum tersedia.
                        </td>
                      </tr>
                    ) : (
                      dataPrediksi.map((item, index) => (
                        <tr
                          key={`${item.periode}-${index}`}
                          className="border-t border-slate-800 hover:bg-slate-800/60"
                        >
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="px-4 py-4 font-semibold">
                            {formatPeriode(item.periode)}
                          </td>
                          <td className="px-4 py-4 text-emerald-300 font-semibold">
                            {item.prediksi}
                          </td>
                          <td className="px-4 py-4">{item.aktual}</td>
                          <td className="px-4 py-4 text-yellow-300 font-semibold">
                            {item.mape}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${warnaTextStatus(
                                item.status
                              )}`}
                              style={{
                                backgroundColor: `${warnaStatus(
                                  item.status
                                )}30`,
                              }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">{item.kategori}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CATATAN */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-3">Catatan Laporan</h3>
              <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                <p>
                  1. Prediksi panen dihitung menggunakan metode Triple
                  Exponential Smoothing berdasarkan data historis produksi
                  bulanan.
                </p>
                <p>
                  2. Nilai MAPE digunakan untuk mengevaluasi selisih antara
                  prediksi dan data aktual.
                </p>
                <p>
                  3. Cuaca tidak menjadi input langsung pada rumus TES, tetapi
                  digunakan untuk menentukan risiko wilayah dan rekomendasi
                  monitoring.
                </p>
                <p>
                  4. Laporan ini digunakan admin sebagai rekap sistem prediksi,
                  evaluasi, dan pemantauan wilayah Sukoharjo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}