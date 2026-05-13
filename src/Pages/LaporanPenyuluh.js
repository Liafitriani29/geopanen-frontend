import Sidebar from "../components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Percent,
  Target,
  CloudSun,
  CalendarDays,
  Info,
  Filter,
  ClipboardList,
} from "lucide-react";

export default function LaporanPenyuluh() {
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);

  const [ringkasanEvaluasi, setRingkasanEvaluasi] = useState(null);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);

  const [cuaca, setCuaca] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);

  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_PREDIKSI = "http://127.0.0.1:8000/api/tes/prediksi";
  const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";
  const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";

  useEffect(() => {
    getLaporanPenyuluh();
  }, []);

  const getLaporanPenyuluh = async () => {
    try {
      setLoading(true);
      setError("");

      const [resPrediksi, resEvaluasi, resRekomendasi] =
        await Promise.allSettled([
          axios.get(API_PREDIKSI),
          axios.get(API_EVALUASI),
          axios.get(API_REKOMENDASI),
        ]);

      if (resPrediksi.status === "rejected") {
        throw new Error("Gagal mengambil data prediksi TES.");
      }

      const payloadPrediksi = resPrediksi.value.data?.data || {};
      setRingkasanPrediksi(payloadPrediksi.ringkasan || null);
      setPrediksiMendatang(
        Array.isArray(payloadPrediksi.prediksiMendatang)
          ? payloadPrediksi.prediksiMendatang
          : []
      );

      if (resEvaluasi.status === "fulfilled") {
        const payloadEvaluasi = resEvaluasi.value.data?.data || {};
        setRingkasanEvaluasi(payloadEvaluasi.ringkasan || null);
        setEvaluasiAktual(
          Array.isArray(payloadEvaluasi.evaluasi)
            ? payloadEvaluasi.evaluasi
            : []
        );
      } else {
        setRingkasanEvaluasi(null);
        setEvaluasiAktual([]);
      }

      if (resRekomendasi.status === "fulfilled") {
        const payloadRekomendasi = resRekomendasi.value.data?.data || {};
        setCuaca(payloadRekomendasi.cuaca_terbaru || null);
        setRekomendasi(
          Array.isArray(payloadRekomendasi.rekomendasi)
            ? payloadRekomendasi.rekomendasi
            : []
        );
      } else {
        setCuaca(null);
        setRekomendasi([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengambil data laporan penyuluh.");
    } finally {
      setLoading(false);
    }
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

  const formatAngka = (angka) => {
    if (angka === null || angka === undefined || angka === "") return "-";

    const nilai = Number(angka);

    if (Number.isNaN(nilai)) return "-";

    return nilai.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
    if (!nilai || rataRataPrediksi <= 0) return "Belum Dinilai";

    if (nilai >= rataRataPrediksi * 1.2) return "Tinggi";
    if (nilai <= rataRataPrediksi * 0.8) return "Rendah";

    return "Sedang";
  };

  const getRekomendasiDefault = (kategori) => {
    if (kategori === "Tinggi") {
      return "Produksi diperkirakan tinggi. Penyuluh dapat mengarahkan petani untuk menyiapkan panen, penyimpanan, dan distribusi hasil.";
    }

    if (kategori === "Sedang") {
      return "Produksi diperkirakan stabil. Penyuluh dapat menyarankan pemantauan rutin terhadap tanaman, air, dan cuaca.";
    }

    if (kategori === "Rendah") {
     return "Produksi diperkirakan rendah. Penyuluh perlu memberi pendampingan terkait pengairan, kondisi lingkungan, kelembapan, dan faktor cuaca.";
    }

    return "Rekomendasi belum tersedia.";
  };

  const evaluasiMap = useMemo(() => {
    const map = new Map();

    evaluasiAktual.forEach((item) => {
      map.set(`${item.tahun}-${Number(item.bulan)}`, item);
    });

    return map;
  }, [evaluasiAktual]);

  const rekomendasiMap = useMemo(() => {
    const map = new Map();

    rekomendasi.forEach((item) => {
      map.set(`${item.tahun}-${Number(item.bulan)}`, item);
    });

    return map;
  }, [rekomendasi]);

  const dataLaporan = useMemo(() => {
    return prediksiMendatang.map((item) => {
      const key = `${item.tahun}-${Number(item.bulan)}`;
      const evaluasi = evaluasiMap.get(key);
      const rekom = rekomendasiMap.get(key);

      const kategori =
        rekom?.kategori_prediksi ||
        item.kategori ||
        getKategoriPrediksi(Number(item.prediksi));

      return {
        tahun: item.tahun,
        bulan: item.bulan,
        periode: item.periode,
        prediksi: Number(item.prediksi || 0),
        aktual: evaluasi?.aktual ?? null,
        selisih: evaluasi?.selisih ?? null,
        deviasi: evaluasi?.deviasi ?? null,
        ape: evaluasi?.ape ?? null,
        statusEvaluasi: evaluasi?.status || "Belum Dievaluasi",
        kategori,
        rekomendasi:
          rekom?.rekomendasi || item.rekomendasi || getRekomendasiDefault(kategori),
      };
    });
  }, [prediksiMendatang, evaluasiMap, rekomendasiMap, rataRataPrediksi]);

  const dataFiltered = useMemo(() => {
    if (filterStatus === "Semua") return dataLaporan;

    return dataLaporan.filter((item) => item.statusEvaluasi === filterStatus);
  }, [dataLaporan, filterStatus]);

  const jumlahAkurat =
    ringkasanEvaluasi?.jumlahAkurat ??
    evaluasiAktual.filter((item) => item.status === "Akurat").length;

  const jumlahCukup =
    ringkasanEvaluasi?.jumlahCukup ??
    evaluasiAktual.filter((item) => item.status === "Cukup").length;

  const jumlahPerluEvaluasi =
    ringkasanEvaluasi?.jumlahPerluEvaluasi ??
    evaluasiAktual.filter((item) => item.status === "Perlu Evaluasi").length;

  const statusModel = ringkasanEvaluasi?.statusModel || "Belum Dievaluasi";

  const statusModelClass =
    statusModel === "Akurat"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : statusModel === "Cukup"
      ? "bg-yellow-50 text-yellow-700 border-yellow-100"
      : statusModel === "Perlu Perbaikan"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-slate-50 text-slate-700 border-slate-100";

  const getStatusBadge = (status) => {
    if (status === "Akurat") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "Cukup") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    if (status === "Perlu Evaluasi") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
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

  const exportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(14);
    doc.text("Laporan Penyuluh - Prediksi Panen Padi TES", 14, 15);

    doc.setFontSize(10);
    doc.text("Wilayah: Kabupaten Sukoharjo", 14, 23);
    doc.text(`Tanggal Export: ${formatTanggal(new Date())}`, 14, 29);
    doc.text(
      `Data Historis: ${ringkasanPrediksi?.jumlahDataHistoris || 0} Data`,
      14,
      35
    );
    doc.text(
      `MAPE: ${
        ringkasanEvaluasi?.mape !== undefined
          ? `${formatAngka(ringkasanEvaluasi.mape)}%`
          : "-"
      }`,
      14,
      41
    );
    doc.text(
      `Estimasi Akurasi: ${
        ringkasanEvaluasi?.estimasiAkurasi !== undefined
          ? `${formatAngka(ringkasanEvaluasi.estimasiAkurasi)}%`
          : "-"
      }`,
      14,
      47
    );
    doc.text(`Status Model: ${statusModel}`, 14, 53);

    const tableColumn = [
      "No",
      "Periode",
      "Prediksi TES",
      "Aktual",
      "APE",
      "Status",
      "Kategori",
      "Rekomendasi",
    ];

    const tableRows = dataFiltered.map((item, index) => [
      index + 1,
      `${namaBulan(item.bulan)} ${item.tahun}`,
      `${formatAngka(item.prediksi)} Ton`,
      item.aktual !== null && item.aktual !== undefined
        ? `${formatAngka(item.aktual)} Ton`
        : "-",
      item.ape !== null && item.ape !== undefined
        ? `${formatAngka(item.ape)}%`
        : "-",
      item.statusEvaluasi || "-",
      item.kategori || "-",
      item.rekomendasi || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [22, 163, 74],
      },
      columnStyles: {
        7: { cellWidth: 85 },
      },
    });

    doc.save("laporan_penyuluh_prediksi_tes_geopanen.pdf");
  };

  const exportExcel = () => {
    const dataExcel = dataFiltered.map((item, index) => ({
      No: index + 1,
      Periode: `${namaBulan(item.bulan)} ${item.tahun}`,
      "Prediksi TES": `${formatAngka(item.prediksi)} Ton`,
      "Aktual Bulanan":
        item.aktual !== null && item.aktual !== undefined
          ? `${formatAngka(item.aktual)} Ton`
          : "-",
      Selisih:
        item.selisih !== null && item.selisih !== undefined
          ? `${formatAngka(item.selisih)} Ton`
          : "-",
      Deviasi:
        item.deviasi !== null && item.deviasi !== undefined
          ? `${formatAngka(item.deviasi)}%`
          : "-",
      APE:
        item.ape !== null && item.ape !== undefined
          ? `${formatAngka(item.ape)}%`
          : "-",
      "Status Evaluasi": item.statusEvaluasi || "-",
      "Kategori Prediksi": item.kategori || "-",
      Rekomendasi: item.rekomendasi || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan TES");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "laporan_penyuluh_prediksi_tes_geopanen.xlsx");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Laporan Penyuluh
            </h2>
            <p className="text-xs text-slate-500">
              Laporan prediksi TES, evaluasi aktual, cuaca, dan rekomendasi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={getLaporanPenyuluh}
              disabled={loading}
              className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat..." : "Refresh"}
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
            >
              <Download size={16} />
              PDF
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
            >
              <Download size={16} />
              Excel
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Laporan Prediksi Produksi Padi
              </p>

              <h1 className="text-3xl font-bold">
                Laporan Penyuluh Pertanian
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Laporan ini berisi hasil prediksi produksi padi Kabupaten
                Sukoharjo menggunakan TES, evaluasi aktual, status model,
                kondisi cuaca, dan rekomendasi pendampingan.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <p className="text-sm text-green-100">Status Model</p>
              <h3 className="font-bold text-xl mt-1">{statusModel}</h3>
              <p className="text-xs text-green-100 mt-1">
                Berdasarkan evaluasi aktual
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Laporan Penyuluh...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data prediksi, evaluasi, cuaca, dan
                rekomendasi.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-600">
                    Gagal Memuat Laporan
                  </h2>

                  <p className="text-slate-600 mt-2">{error}</p>

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan endpoint{" "}
                    <span className="font-semibold">/api/tes/prediksi</span>,{" "}
                    <span className="font-semibold">
                      /api/tes/evaluasi-aktual
                    </span>
                    , dan{" "}
                    <span className="font-semibold">
                      /api/rekomendasi-prediksi
                    </span>{" "}
                    sudah aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Data Historis"
                  value={`${ringkasanPrediksi?.jumlahDataHistoris || 0} Data`}
                  subtitle="Data produksi bulanan TES"
                  icon={ClipboardList}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Mendatang"
                  value={`${prediksiMendatang.length} Periode`}
                  subtitle="Periode hasil prediksi"
                  icon={TrendingUp}
                  tone="blue"
                />

                <StatCard
                  title="MAPE Aktual"
                  value={
                    ringkasanEvaluasi?.mape !== undefined
                      ? `${formatAngka(ringkasanEvaluasi.mape)}%`
                      : "-"
                  }
                  subtitle="Rata-rata kesalahan"
                  icon={Percent}
                  tone="yellow"
                />

                <StatCard
                  title="Status Model"
                  value={statusModel}
                  subtitle="Kategori performa TES"
                  icon={statusModel === "Akurat" ? CheckCircle2 : AlertTriangle}
                  tone={
                    statusModel === "Akurat"
                      ? "emerald"
                      : statusModel === "Cukup"
                      ? "yellow"
                      : "red"
                  }
                />
              </div>

              {/* INFO MODEL DAN CUACA */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Target size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800 mb-3">
                        Ringkasan Laporan TES
                      </h2>

                      <div className={`border rounded-2xl p-4 ${statusModelClass}`}>
                        <p className="text-sm leading-relaxed">
                          Model TES memiliki nilai MAPE{" "}
                          <span className="font-bold">
                            {ringkasanEvaluasi?.mape !== undefined
                              ? `${formatAngka(ringkasanEvaluasi.mape)}%`
                              : "-"}
                          </span>{" "}
                          dengan estimasi akurasi{" "}
                          <span className="font-bold">
                            {ringkasanEvaluasi?.estimasiAkurasi !== undefined
                              ? `${formatAngka(
                                  ringkasanEvaluasi.estimasiAkurasi
                                )}%`
                              : "-"}
                          </span>
                          . Jumlah evaluasi aktual yang tersedia adalah{" "}
                          <span className="font-bold">
                            {ringkasanEvaluasi?.jumlahDataEvaluasi || 0}
                          </span>{" "}
                          periode.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                        <MiniCard
                          title="Akurat"
                          value={jumlahAkurat}
                          tone="emerald"
                        />
                        <MiniCard
                          title="Cukup"
                          value={jumlahCukup}
                          tone="yellow"
                        />
                        <MiniCard
                          title="Perlu Evaluasi"
                          value={jumlahPerluEvaluasi}
                          tone="red"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-4">
                    Kondisi Cuaca
                  </h2>

                  <div className="space-y-4">
                    <InfoRow
                      label="Kondisi"
                      value={cuaca?.kondisi || "-"}
                    />

                    <InfoRow
                      label="Suhu"
                      value={
                        cuaca?.suhu !== null && cuaca?.suhu !== undefined
                          ? `${formatAngka(cuaca.suhu)}°C`
                          : "-"
                      }
                    />

                    <InfoRow
                      label="Kelembapan"
                      value={
                        cuaca?.kelembaban !== null &&
                        cuaca?.kelembaban !== undefined
                          ? `${formatAngka(cuaca.kelembaban)}%`
                          : "-"
                      }
                    />

                    <InfoRow
                      label="Tanggal"
                      value={formatTanggal(cuaca?.tanggal)}
                    />
                  </div>

                  <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      Catatan Cuaca
                    </p>
                    <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                     {
  cuaca?.catatan_cuaca ||
  "Kelembapan tinggi perlu diperhatikan karena dapat memengaruhi kondisi tanaman dan lingkungan pertanian."
}
                    </p>
                  </div>
                </div>
              </div>

              {/* FILTER */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Data Laporan Prediksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Laporan berisi prediksi TES, aktual bulanan, evaluasi, dan
                      rekomendasi pendampingan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl">
                    <Filter size={16} className="text-slate-400" />

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-sm outline-none bg-transparent"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Akurat">Akurat</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Perlu Evaluasi">Perlu Evaluasi</option>
                      <option value="Belum Dievaluasi">Belum Dievaluasi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Laporan Penyuluh
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan {dataFiltered.length} data laporan.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {dataFiltered.length} Data
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-semibold px-6 py-4">
                          No
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Periode
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Prediksi TES
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Aktual Bulanan
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          APE
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Status
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Rekomendasi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataFiltered.length > 0 ? (
                        dataFiltered.map((item, index) => (
                          <tr
                            key={`${item.tahun}-${item.bulan}-${index}`}
                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="px-6 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                  <CalendarDays size={18} />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {namaBulan(item.bulan)} {item.tahun}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Periode laporan
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-bold text-emerald-700">
                              {formatAngka(item.prediksi)} Ton
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {item.aktual !== null && item.aktual !== undefined
                                ? `${formatAngka(item.aktual)} Ton`
                                : "-"}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {item.ape !== null && item.ape !== undefined
                                ? `${formatAngka(item.ape)}%`
                                : "-"}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                  item.statusEvaluasi
                                )}`}
                              >
                                {item.statusEvaluasi}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                                  item.kategori
                                )}`}
                              >
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-slate-600 max-w-lg leading-relaxed">
                              {item.rekomendasi || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data laporan penyuluh sesuai filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CATATAN */}
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center shrink-0">
                  <Info size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-emerald-800 mb-1">
                    Catatan
                  </h2>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Laporan penyuluh ini tidak lagi berbasis data lahan atau
                    panen per petani. Laporan difokuskan pada hasil prediksi TES
                    tingkat Kabupaten Sukoharjo, evaluasi aktual bulanan,
                    kondisi cuaca, dan rekomendasi pendampingan.
                  </p>
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
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
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

function MiniCard({ title, value, tone }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClass[tone]}`}>
      <p className="text-xs font-medium opacity-80">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}