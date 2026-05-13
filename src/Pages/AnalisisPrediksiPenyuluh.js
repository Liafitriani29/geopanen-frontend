import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Activity,
  CalendarDays,
  Leaf,
} from "lucide-react";

export default function AnalisisPrediksiPenyuluh() {
  const [monitoring, setMonitoring] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lihatSemua, setLihatSemua] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/monitoring-prediksi";

  useEffect(() => {
    getAnalisisPrediksi();
  }, []);

  const getAnalisisPrediksi = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_URL);
      const payload = res.data?.data || {};

      setStatistik(payload.statistik || null);
      setMonitoring(Array.isArray(payload.monitoring) ? payload.monitoring : []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data analisis prediksi.");
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

  const getArahanSingkat = (kategori) => {
    if (kategori === "Tinggi") {
      return "Potensi panen tinggi. Penyuluh dapat membantu petani menyiapkan panen, penyimpanan, dan distribusi hasil.";
    }

    if (kategori === "Sedang") {
      return "Produksi diperkirakan stabil. Tetap lakukan pemantauan rutin terhadap kondisi tanaman dan lingkungan.";
    }

    if (kategori === "Rendah") {
      return "Perlu pendampingan. Perhatikan kondisi lingkungan, irigasi, dan potensi gangguan tanaman berdasarkan kondisi lapangan.";
    }

    return "Perlu pengecekan lanjutan.";
  };

  const chartData = monitoring.map((item) => ({
    periode: `${namaBulan(item.bulan)} ${item.tahun}`,
    prediksi: Number(item.prediksi || 0),
  }));

  const dataTampil = lihatSemua ? monitoring : monitoring.slice(0, 6);

  const prediksiTerdekat = monitoring.length > 0 ? monitoring[0] : null;
  const prediksiTertinggi = statistik?.prediksiTertinggi || null;
  const prediksiTerendah = statistik?.prediksiTerendah || null;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Monitoring Prediksi
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan hasil prediksi panen TES sebagai bahan analisis
              penyuluh.
            </p>
          </div>

          <button
            onClick={getAnalisisPrediksi}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Analisis Prediksi Produksi Padi
              </p>

              <h1 className="text-3xl font-bold">
                Monitoring Prediksi Panen
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Penyuluh dapat melihat hasil prediksi produksi padi periode
                mendatang sebagai dasar awal untuk menentukan prioritas
                pendampingan petani.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-100">Status Data</p>
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
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Monitoring Prediksi...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data prediksi dari backend.
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
                    Gagal Memuat Data
                  </h2>

                  <p className="text-slate-600 mt-2">{error}</p>

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan backend Laravel berjalan dan endpoint{" "}
                    <span className="font-semibold">
                      /api/monitoring-prediksi
                    </span>{" "}
                    sudah aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* RINGKASAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Periode Prediksi"
                  value={`${statistik?.jumlahPeriode || monitoring.length || 0}`}
                  subtitle="Data mendatang"
                  icon={BarChart3}
                  tone="blue"
                />

                <StatCard
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
                  icon={TrendingUp}
                  tone="emerald"
                />

                <StatCard
                  title="Rata-rata Prediksi"
                  value={`${formatAngka(statistik?.rataRataPrediksi)} Ton`}
                  subtitle="Rata-rata periode mendatang"
                  icon={CheckCircle}
                  tone="yellow"
                />

                <StatCard
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

              {/* PREDIKSI TERDEKAT */}
              {prediksiTerdekat && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white text-emerald-700 flex items-center justify-center shrink-0">
                      <CalendarDays size={23} />
                    </div>

                    <div>
                      <p className="text-sm text-emerald-700 font-semibold">
                        Prediksi Terdekat
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900 mt-2">
                        {namaBulan(prediksiTerdekat.bulan)}{" "}
                        {prediksiTerdekat.tahun}
                      </h2>

                      <div className="flex flex-wrap gap-3 mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeKategori(
                            prediksiTerdekat.kategori
                          )}`}
                        >
                          {prediksiTerdekat.kategori}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                          {formatAngka(prediksiTerdekat.prediksi)} Ton
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                        {getArahanSingkat(prediksiTerdekat.kategori)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* GRAFIK */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Grafik Prediksi Panen
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      Diagram batang menunjukkan hasil prediksi panen untuk
                      periode mendatang.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    TES
                  </span>
                </div>

                <div className="h-[330px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 35,
                      }}
                      barCategoryGap={18}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />

                      <XAxis
                        dataKey="periode"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid #d1fae5",
                          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                          fontSize: "13px",
                        }}
                        formatter={(value) => [
                          `${formatAngka(value)} Ton`,
                          "Prediksi TES",
                        ]}
                        labelFormatter={(label) => `Periode: ${label}`}
                      />

                      <Bar
                        dataKey="prediksi"
                        name="Prediksi TES"
                        fill="#059669"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TABEL */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Analisis Prediksi
                    </h2>

                    <p className="text-sm text-slate-500">
                      Menampilkan {dataTampil.length} dari {monitoring.length}{" "}
                      data prediksi.
                    </p>
                  </div>

                  <button
                    onClick={() => setLihatSemua(!lihatSemua)}
                    className="px-4 py-2 text-sm rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                  >
                    {lihatSemua ? "Tampilkan Ringkas" : "Lihat Semua"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="text-left font-semibold px-6 py-4">
                          No
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Periode
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Prediksi
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Arahan Penyuluh
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataTampil.length > 0 ? (
                        dataTampil.map((item, index) => (
                          <tr
                            key={`${item.tahun}-${item.bulan}-${index}`}
                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="px-6 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {namaBulan(item.bulan)} {item.tahun}
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
                                {item.kategori || "-"}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-slate-600 leading-relaxed">
                              {getArahanSingkat(item.kategori)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-10 text-center text-slate-500"
                          >
                            Belum ada data analisis prediksi.
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
                  <Activity size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-emerald-800 mb-1">Catatan</h2>

                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Analisis prediksi ini digunakan penyuluh sebagai gambaran
                    awal untuk menentukan prioritas pendampingan. Keputusan
                    lapangan tetap perlu mempertimbangkan kondisi lahan, cuaca,
                    dan hasil observasi langsung.
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
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 break-words">
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