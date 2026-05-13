import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  RefreshCw,
  AlertTriangle,
  Activity,
  Gauge,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Info,
  CalendarDays,
  CheckCircle2,
  Leaf,
  ClipboardList,
  Target,
} from "lucide-react";

export default function Monitoring() {
  const [monitoring, setMonitoring] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [lihatSemua, setLihatSemua] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/monitoring-prediksi";

  useEffect(() => {
    getMonitoringPrediksi();
  }, []);

  const getMonitoringPrediksi = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_URL);
      const payload = res.data?.data || res.data || {};

      setRingkasan(payload.ringkasan || null);
      setStatistik(payload.statistik || null);
      setMonitoring(Array.isArray(payload.monitoring) ? payload.monitoring : []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data monitoring prediksi dari backend.");
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

  const formatPeriode = (item) => {
    if (!item) return "-";

    return `${namaBulan(item.bulan)} ${item.tahun}`;
  };

  const getBadgeKategori = (kategori) => {
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

  const getBadgeStatus = (status) => {
    if (status === "Potensi Panen Tinggi") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "Produksi Stabil") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    if (status === "Perlu Perhatian") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const dataFiltered = useMemo(() => {
    return monitoring.filter((item) => {
      return filterKategori === "Semua" || item.kategori === filterKategori;
    });
  }, [monitoring, filterKategori]);

  const dataTampil = lihatSemua ? dataFiltered : dataFiltered.slice(0, 6);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Monitoring Prediksi</h2>
            <p className="text-xs text-slate-500">
              Pemantauan hasil prediksi TES berdasarkan kategori produksi.
            </p>
          </div>

          <button
            onClick={getMonitoringPrediksi}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Memuat...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Refresh Monitoring
              </>
            )}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Monitoring Hasil Prediksi Panen
              </p>

              <h1 className="text-3xl font-bold">
                Monitoring Prediksi Panen
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Monitoring ini menampilkan hasil prediksi TES yang sudah
                dikategorikan oleh backend menjadi tinggi, sedang, dan rendah
                untuk membantu pemantauan produksi panen.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[240px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-100">Status Monitoring</p>
                  <h3 className="font-bold">
                    {loading ? "Memuat Data" : "Data Tersedia"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {/* ERROR */}
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

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan backend Laravel sudah berjalan dan endpoint{" "}
                    <span className="font-semibold">
                      /api/monitoring-prediksi
                    </span>{" "}
                    sudah aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading && !error && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Monitoring Prediksi...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data monitoring prediksi dari backend.
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* RINGKASAN UTAMA */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Periode Dipantau"
                  value={`${statistik?.jumlahPeriode ?? 0} Periode`}
                  subtitle="Jumlah periode prediksi"
                  icon={Gauge}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Tinggi"
                  value={`${statistik?.jumlahTinggi ?? 0} Periode`}
                  subtitle="Potensi panen tinggi"
                  icon={TrendingUp}
                  tone="green"
                />

                <StatCard
                  title="Produksi Stabil"
                  value={`${statistik?.jumlahSedang ?? 0} Periode`}
                  subtitle="Prediksi kategori sedang"
                  icon={BarChart3}
                  tone="yellow"
                />

                <StatCard
                  title="Perlu Perhatian"
                  value={`${statistik?.jumlahRendah ?? 0} Periode`}
                  subtitle="Prediksi kategori rendah"
                  icon={AlertTriangle}
                  tone="red"
                />
              </div>

              {/* INSIGHT PREDIKSI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InsightCard
                  title="Periode Potensi Tertinggi"
                  value={
                    statistik?.prediksiTertinggi
                      ? `${formatAngka(
                          statistik.prediksiTertinggi.prediksi
                        )} Ton`
                      : "-"
                  }
                  subtitle={formatPeriode(statistik?.prediksiTertinggi)}
                  icon={TrendingUp}
                  tone="emerald"
                />

                <InsightCard
                  title="Rata-rata Prediksi"
                  value={`${formatAngka(statistik?.rataRataPrediksi)} Ton`}
                  subtitle="Rata-rata prediksi periode mendatang"
                  icon={BarChart3}
                  tone="yellow"
                />

                <InsightCard
                  title="Periode Perlu Perhatian"
                  value={
                    statistik?.prediksiTerendah
                      ? `${formatAngka(
                          statistik.prediksiTerendah.prediksi
                        )} Ton`
                      : "-"
                  }
                  subtitle={formatPeriode(statistik?.prediksiTerendah)}
                  icon={TrendingDown}
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
                      Kesimpulan Monitoring
                    </h2>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        Monitoring ini diproses oleh backend berdasarkan hasil
                        prediksi Triple Exponential Smoothing. Nilai MAPE model
                        saat ini sebesar{" "}
                        <span className="font-bold">
                          {formatAngka(ringkasan?.mape)}%
                        </span>{" "}
                        dengan estimasi akurasi{" "}
                        <span className="font-bold">
                          {formatAngka(ringkasan?.estimasiAkurasi)}%
                        </span>
                        . Periode dengan kategori rendah ditandai sebagai perlu
                        perhatian agar dapat menjadi dasar pemantauan lahan,
                        irigasi, hama, dan faktor cuaca.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILTER */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Data Monitoring Prediksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan status monitoring berdasarkan hasil prediksi
                      TES yang sudah diproses oleh backend.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl">
                    <Filter size={16} className="text-slate-400" />

                    <select
                      value={filterKategori}
                      onChange={(e) => setFilterKategori(e.target.value)}
                      className="text-sm outline-none bg-transparent"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Rendah">Rendah</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABEL */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Monitoring Prediksi
                    </h2>

                    <p className="text-sm text-slate-500">
                      Menampilkan {dataTampil.length} dari{" "}
                      {dataFiltered.length} data monitoring.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {dataFiltered.length} Data
                    </span>

                    <button
                      onClick={() => setLihatSemua(!lihatSemua)}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                    >
                      {lihatSemua ? "Tampilkan Ringkas" : "Lihat Semua"}
                    </button>
                  </div>
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
                          Prediksi Panen
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Status Monitoring
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Rekomendasi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataTampil.length > 0 ? (
                        dataTampil.map((item, index) => (
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
                                  <CalendarDays size={18} />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {formatPeriode(item)}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Periode prediksi
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-bold text-emerald-700">
                              {formatAngka(item.prediksi)} Ton
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeKategori(
                                  item.kategori
                                )}`}
                              >
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStatus(
                                  item.status_monitoring
                                )}`}
                              >
                                {item.status_monitoring}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-slate-600 max-w-md">
                              {item.rekomendasi || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data monitoring prediksi.
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
                    Monitoring ini menggunakan hasil prediksi TES yang sudah
                    dikategorikan di backend. Data cuaca dapat digunakan pada
                    tahap rekomendasi berikutnya sebagai faktor pendukung, tetapi
                    tidak masuk ke rumus TES.
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
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
          <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${
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