import Sidebar from "../components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  FileSpreadsheet,
  Target,
  CalendarDays,
  Leaf,
  Info,
  Database,
  Gauge,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function Laporan() {
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);
  const [ringkasanEvaluasi, setRingkasanEvaluasi] = useState(null);
  const [evaluasiTes, setEvaluasiTes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_TES = "http://127.0.0.1:8000/api/tes/prediksi";
  const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";

  useEffect(() => {
    getLaporanTes();
  }, []);

  const getLaporanTes = async () => {
    try {
      setLoading(true);
      setError("");

      const [tesRes, evaluasiRes] = await Promise.all([
        axios.get(API_TES),
        axios.get(API_EVALUASI),
      ]);

      const tesPayload = tesRes.data?.data || {};
      const evaluasiPayload = evaluasiRes.data?.data || {};

      setRingkasanPrediksi(tesPayload.ringkasan || null);
      setPrediksiMendatang(
        Array.isArray(tesPayload.prediksiMendatang)
          ? tesPayload.prediksiMendatang
          : []
      );
      setRingkasanEvaluasi(evaluasiPayload.ringkasan || null);
      setEvaluasiTes(
        Array.isArray(evaluasiPayload.evaluasi)
          ? evaluasiPayload.evaluasi
          : []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data laporan TES. Pastikan backend Laravel sudah berjalan."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAngka = (angka) => {
    if (angka === null || angka === undefined || angka === "") return "-";
    const nilai = Number(angka);
    if (Number.isNaN(nilai)) return "-";

    return nilai.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const namaBulan = (bulan) => {
    const bulanList = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    return bulanList[Number(bulan) - 1] || "-";
  };

  const rataRataPrediksi = useMemo(() => {
    if (prediksiMendatang.length === 0) return 0;

    const total = prediksiMendatang.reduce(
      (sum, item) => sum + Number(item.prediksi || 0),
      0
    );

    return total / prediksiMendatang.length;
  }, [prediksiMendatang]);

  const getKategoriPrediksi = (nilai) => {
    const prediksi = Number(nilai || 0);
    const rata = Number(rataRataPrediksi || 0);

    if (!rata) return "Belum Dikategorikan";
    if (prediksi >= rata * 1.15) return "Tinggi";
    if (prediksi <= rata * 0.85) return "Rendah";
    return "Sedang";
  };

  const getKategoriBadge = (kategori) => {
    if (kategori === "Tinggi") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (kategori === "Sedang") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    if (kategori === "Rendah") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const getStatusModel = () => {
    const status = ringkasanEvaluasi?.statusModel;
    const mape = Number(ringkasanEvaluasi?.mape || 0);

    if (status === "Akurat" || mape <= 10) {
      return {
        label: "Akurat",
        tone: "emerald",
      };
    }

    if (status === "Cukup" || mape <= 20) {
      return {
        label: "Cukup",
        tone: "yellow",
      };
    }

    if (status === "Belum Dievaluasi") {
      return {
        label: "Belum Dievaluasi",
        tone: "blue",
      };
    }

    return {
      label: "Perlu Evaluasi",
      tone: "red",
    };
  };

  const statusModel = getStatusModel();

  const periodeEvaluasiSet = useMemo(() => {
    return new Set(
      evaluasiTes.map((item) => `${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [evaluasiTes]);

  const prediksiBelumDievaluasi = useMemo(() => {
    return prediksiMendatang.filter(
      (item) =>
        !periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [prediksiMendatang, periodeEvaluasiSet]);

  const prediksiPeriodeBerikutnya =
    prediksiBelumDievaluasi[0] || prediksiMendatang[0] || null;

  const prediksiTertinggi = useMemo(() => {
    if (prediksiMendatang.length === 0) return null;

    return [...prediksiMendatang].sort(
      (a, b) => Number(b.prediksi || 0) - Number(a.prediksi || 0)
    )[0];
  }, [prediksiMendatang]);

  const prediksiTerendah = useMemo(() => {
    if (prediksiMendatang.length === 0) return null;

    return [...prediksiMendatang].sort(
      (a, b) => Number(a.prediksi || 0) - Number(b.prediksi || 0)
    )[0];
  }, [prediksiMendatang]);

  const kesimpulan =
    ringkasanEvaluasi?.jumlahDataEvaluasi > 0
      ? `Model TES menggunakan ${
          ringkasanPrediksi?.jumlahDataHistoris || 0
        } data historis produksi bulanan. Berdasarkan ${
          ringkasanEvaluasi?.jumlahDataEvaluasi || 0
        } data aktual yang dievaluasi, diperoleh MAPE ${formatAngka(
          ringkasanEvaluasi?.mape
        )}% dengan estimasi akurasi ${formatAngka(
          ringkasanEvaluasi?.estimasiAkurasi
        )}%. Status model berada pada kategori ${statusModel.label}.`
      : `Model TES menggunakan ${
          ringkasanPrediksi?.jumlahDataHistoris || 0
        } data historis produksi bulanan. Evaluasi aktual belum tersedia, sehingga MAPE dan akurasi belum dapat disimpulkan.`;

  const exportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(14);
    doc.text("Laporan Admin GeoPanen - Prediksi TES", 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Data Historis: ${
        ringkasanPrediksi?.jumlahDataHistoris || 0
      } | Prediksi: ${prediksiMendatang.length} periode | Evaluasi: ${
        ringkasanEvaluasi?.jumlahDataEvaluasi || 0
      } periode`,
      14,
      25
    );

    doc.text(
      `MAPE: ${formatAngka(
        ringkasanEvaluasi?.mape
      )}% | Akurasi: ${formatAngka(
        ringkasanEvaluasi?.estimasiAkurasi
      )}% | Status: ${statusModel.label}`,
      14,
      32
    );

    autoTable(doc, {
      head: [["Komponen", "Nilai"]],
      body: [
        ["Data Historis TES", `${ringkasanPrediksi?.jumlahDataHistoris || 0} data`],
        ["Prediksi Mendatang", `${prediksiMendatang.length} periode`],
        ["Evaluasi Aktual", `${ringkasanEvaluasi?.jumlahDataEvaluasi || 0} periode`],
        ["MAPE", `${formatAngka(ringkasanEvaluasi?.mape)}%`],
        ["Estimasi Akurasi", `${formatAngka(ringkasanEvaluasi?.estimasiAkurasi)}%`],
        ["Status Model", statusModel.label],
      ],
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [5, 150, 105] },
    });

    const prediksiRows = prediksiMendatang.map((item, index) => [
      index + 1,
      `${namaBulan(item.bulan)} ${item.tahun}`,
      `${formatAngka(item.prediksi)} ton`,
      getKategoriPrediksi(item.prediksi),
      periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
        ? "Sudah Dievaluasi"
        : "Belum Dievaluasi",
    ]);

    autoTable(doc, {
      head: [["No", "Periode", "Prediksi TES", "Kategori", "Status Evaluasi"]],
      body: prediksiRows,
      startY: doc.lastAutoTable.finalY + 8,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [5, 150, 105] },
    });

    doc.save("laporan_admin_geopanen_tes.pdf");
  };

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const ringkasanSheet = [
      { Komponen: "Data Historis TES", Nilai: ringkasanPrediksi?.jumlahDataHistoris || 0 },
      { Komponen: "Prediksi Mendatang", Nilai: prediksiMendatang.length },
      { Komponen: "Jumlah Evaluasi Aktual", Nilai: ringkasanEvaluasi?.jumlahDataEvaluasi || 0 },
      { Komponen: "MAPE", Nilai: `${formatAngka(ringkasanEvaluasi?.mape)}%` },
      { Komponen: "Estimasi Akurasi", Nilai: `${formatAngka(ringkasanEvaluasi?.estimasiAkurasi)}%` },
      { Komponen: "Status Model", Nilai: statusModel.label },
    ];

    const prediksiSheet = prediksiMendatang.map((item, index) => ({
      No: index + 1,
      Periode: `${namaBulan(item.bulan)} ${item.tahun}`,
      Tahun: item.tahun,
      Bulan: item.bulan,
      Prediksi: Number(item.prediksi || 0),
      Kategori: getKategoriPrediksi(item.prediksi),
      "Status Evaluasi": periodeEvaluasiSet.has(
        `${Number(item.tahun)}-${Number(item.bulan)}`
      )
        ? "Sudah Dievaluasi"
        : "Belum Dievaluasi",
    }));

    const evaluasiSheet = evaluasiTes.map((item, index) => ({
      No: index + 1,
      Periode: `${namaBulan(item.bulan)} ${item.tahun}`,
      Tahun: item.tahun,
      Bulan: item.bulan,
      Aktual: Number(item.aktual || 0),
      Prediksi: Number(item.prediksi || 0),
      Selisih: Number(item.selisih || 0),
      Deviasi: `${formatAngka(item.deviasi)}%`,
      APE: `${formatAngka(item.ape)}%`,
      Status: item.status || "-",
    }));

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(ringkasanSheet),
      "Ringkasan"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(prediksiSheet),
      "Prediksi TES"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(evaluasiSheet),
      "Evaluasi Aktual TES"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "laporan_admin_geopanen_tes.xlsx");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="min-h-16 bg-white border-b border-slate-100 px-8 py-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800">
              Laporan Admin GeoPanen
            </h2>
            <p className="text-xs text-slate-500">
              Rekap prediksi TES, evaluasi aktual, MAPE, akurasi, dan status
              model.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm"
            >
              <Download size={16} />
              Export PDF
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              <Download size={16} />
              Export Excel
            </button>

            <button
              onClick={getLaporanTes}
              disabled={loading}
              className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Rekapitulasi Sistem Prediksi Panen
              </p>

              <h1 className="text-3xl font-bold">Laporan Prediksi TES</h1>

              <p className="text-green-100 mt-2 max-w-3xl text-sm leading-relaxed">
                Laporan sistem prediksi produksi padi berbasis Triple
                Exponential Smoothing, meliputi hasil prediksi, evaluasi aktual,
                MAPE, akurasi, dan status model.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-100">Status Laporan</p>
                  <h3 className="font-bold">
                    {loading ? "Memuat Data" : "Data TES Tersedia"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <RefreshCw
                size={34}
                className="animate-spin mx-auto text-emerald-600 mb-4"
              />
              <h2 className="text-xl font-bold text-slate-800">
                Memuat Laporan TES...
              </h2>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-600">
                    Gagal Memuat Data
                  </h2>
                  <p className="text-slate-600 mt-2">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* RINGKASAN UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Data Historis TES"
                  value={`${ringkasanPrediksi?.jumlahDataHistoris || 0} Data`}
                  subtitle="Data produksi bulanan"
                  icon={Database}
                  tone="blue"
                />

                <StatCard
                  title="Prediksi Mendatang"
                  value={`${prediksiMendatang.length} Periode`}
                  subtitle="Hasil prediksi TES"
                  icon={TrendingUp}
                  tone="emerald"
                />

                <StatCard
                  title="MAPE Aktual"
                  value={`${formatAngka(ringkasanEvaluasi?.mape)}%`}
                  subtitle="Rata-rata error evaluasi"
                  icon={Percent}
                  tone="orange"
                />

                <StatCard
                  title="Estimasi Akurasi"
                  value={`${formatAngka(
                    ringkasanEvaluasi?.estimasiAkurasi
                  )}%`}
                  subtitle="Berdasarkan data aktual"
                  icon={Target}
                  tone="green"
                />
              </div>

              {/* STATUS DAN PREDIKSI */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <InsightCard
                  title="Status Model"
                  value={statusModel.label}
                  subtitle="Kategori performa TES"
                  icon={Gauge}
                  tone={statusModel.tone}
                />

                <InsightCard
                  title="Prediksi Berikutnya"
                  value={
                    prediksiPeriodeBerikutnya
                      ? `${formatAngka(prediksiPeriodeBerikutnya.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiPeriodeBerikutnya
                      ? `${namaBulan(prediksiPeriodeBerikutnya.bulan)} ${
                          prediksiPeriodeBerikutnya.tahun
                        }`
                      : "Belum tersedia"
                  }
                  icon={CalendarDays}
                  tone="blue"
                />

                <InsightCard
                  title="Prediksi Tertinggi"
                  value={
                    prediksiTertinggi
                      ? `${formatAngka(prediksiTertinggi.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiTertinggi
                      ? `${namaBulan(prediksiTertinggi.bulan)} ${
                          prediksiTertinggi.tahun
                        }`
                      : "Belum tersedia"
                  }
                  icon={CheckCircle}
                  tone="emerald"
                />

                <InsightCard
                  title="Prediksi Terendah"
                  value={
                    prediksiTerendah
                      ? `${formatAngka(prediksiTerendah.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiTerendah
                      ? `${namaBulan(prediksiTerendah.bulan)} ${
                          prediksiTerendah.tahun
                        }`
                      : "Belum tersedia"
                  }
                  icon={AlertTriangle}
                  tone="red"
                />
              </div>

              {/* KESIMPULAN */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Info size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800 mb-3">
                      Kesimpulan Laporan Sistem
                    </h2>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        {kesimpulan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABEL PREDIKSI TES */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Hasil Prediksi TES
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan hasil prediksi produksi padi periode
                      mendatang.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {prediksiMendatang.length} Data
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-semibold px-6 py-4">No</th>
                        <th className="text-left font-semibold px-6 py-4">
                          Periode
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Prediksi TES
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Status Evaluasi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {prediksiMendatang.length > 0 ? (
                        prediksiMendatang.map((item, index) => {
                          const kategori = getKategoriPrediksi(item.prediksi);

                          const sudahDievaluasi = periodeEvaluasiSet.has(
                            `${Number(item.tahun)}-${Number(item.bulan)}`
                          );

                          return (
                            <tr
                              key={`${item.bulan}-${item.tahun}-${index}`}
                              className="border-t border-slate-100 hover:bg-slate-50 transition"
                            >
                              <td className="px-6 py-4 text-slate-500">
                                {index + 1}
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <FileSpreadsheet size={18} />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {namaBulan(item.bulan)} {item.tahun}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      Periode prediksi TES
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 font-bold text-emerald-700">
                                {formatAngka(item.prediksi)} Ton
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                                    kategori
                                  )}`}
                                >
                                  {kategori}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                    sudahDievaluasi
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : "bg-slate-50 text-slate-600 border-slate-100"
                                  }`}
                                >
                                  {sudahDievaluasi
                                    ? "Sudah Dievaluasi"
                                    : "Belum Dievaluasi"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data prediksi TES.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL EVALUASI TES */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Evaluasi Aktual TES
                    </h2>
                    <p className="text-sm text-slate-500">
                      Perbandingan hasil prediksi dengan data aktual produksi
                      bulanan.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {evaluasiTes.length} Data
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-semibold px-6 py-4">No</th>
                        <th className="text-left font-semibold px-6 py-4">
                          Periode
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Aktual
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Prediksi
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Selisih
                        </th>
                        <th className="text-left font-semibold px-6 py-4">APE</th>
                        <th className="text-left font-semibold px-6 py-4">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {evaluasiTes.length > 0 ? (
                        evaluasiTes.map((item, index) => (
                          <tr
                            key={`${item.bulan}-${item.tahun}-${index}`}
                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="px-6 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {namaBulan(item.bulan)} {item.tahun}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {formatAngka(item.aktual)} Ton
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {formatAngka(item.prediksi)} Ton
                            </td>

                            <td
                              className={`px-6 py-4 font-semibold ${
                                Number(item.selisih) < 0
                                  ? "text-red-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              {formatAngka(item.selisih)} Ton
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {formatAngka(item.ape)}%
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  item.status === "Akurat"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : item.status === "Cukup"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                    : "bg-red-50 text-red-700 border-red-100"
                                }`}
                              >
                                {item.status || "-"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data evaluasi aktual TES.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald: "bg-emerald-100 text-emerald-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-xl font-bold text-slate-800 mt-2 break-words">
            {value}
          </h3>
          <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            toneClass[tone] || toneClass.emerald
          }`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${
        toneClass[tone] || toneClass.emerald
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h2 className="text-xl font-bold mt-2">{value}</h2>
          <p className="text-xs mt-1 opacity-80">{subtitle}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}