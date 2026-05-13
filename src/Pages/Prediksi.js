import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Calculator,
  RefreshCw,
  AlertTriangle,
  Database,
  Percent,
  Target,
  CalendarDays,
  Leaf,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Prediksi() {
  const [ringkasan, setRingkasan] = useState(null);
  const [evaluasi, setEvaluasi] = useState([]);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sudahDihitung, setSudahDihitung] = useState(false);
  const [lihatSemuaHistoris, setLihatSemuaHistoris] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/tes/prediksi";

  const hitungPrediksiTES = async () => {
    try {
      setLoading(true);
      setError("");
      setSudahDihitung(false);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Gagal mengambil hasil prediksi TES dari backend.");
      }

      const result = await response.json();
      const payload = result.data || result;

      setRingkasan(payload.ringkasan || null);
      setEvaluasi(Array.isArray(payload.evaluasi) ? payload.evaluasi : []);
      setPrediksiMendatang(
        Array.isArray(payload.prediksiMendatang)
          ? payload.prediksiMendatang
          : []
      );

      setSudahDihitung(true);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menghitung prediksi.");
    } finally {
      setLoading(false);
    }
  };

  const namaBulan = (bulan) => {
    const list = [
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

    return list[Number(bulan) - 1] || "-";
  };

  const formatAngka = (angka) => {
    if (angka === null || angka === undefined || angka === "") return "-";

    return Number(angka).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const prediksiBulanDepan = prediksiMendatang[0] || null;

  const dataHistoris = lihatSemuaHistoris ? evaluasi : evaluasi.slice(-12);

  const chartData = useMemo(() => {
    const aktualTerakhir = evaluasi.slice(-12).map((item) => ({
      periode: `${namaBulan(item.bulan)} ${item.tahun}`,
      aktual: Number(item.aktual) || 0,
      prediksi: Number(item.prediksi) || 0,
    }));

    const prediksi2025 = prediksiMendatang.map((item) => ({
      periode: `${namaBulan(item.bulan)} ${item.tahun}`,
      aktual: null,
      prediksi: Number(item.prediksi) || 0,
    }));

    return [...aktualTerakhir, ...prediksi2025];
  }, [evaluasi, prediksiMendatang]);

  const rataRataPrediksi =
    prediksiMendatang.length > 0
      ? prediksiMendatang.reduce(
          (total, item) => total + (Number(item.prediksi) || 0),
          0
        ) / prediksiMendatang.length
      : 0;

  const prediksiTertinggi =
    prediksiMendatang.length > 0
      ? prediksiMendatang.reduce((max, item) =>
          Number(item.prediksi) > Number(max.prediksi) ? item : max
        )
      : null;

  const prediksiTerendah =
    prediksiMendatang.length > 0
      ? prediksiMendatang.reduce((min, item) =>
          Number(item.prediksi) < Number(min.prediksi) ? item : min
        )
      : null;

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden bg-[#020617]">
        {/* TOPBAR */}
        <div className="h-16 bg-[#081226] border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">Analisis Prediksi TES</h2>
            <p className="text-xs text-slate-400">
              Perhitungan prediksi produksi padi Sukoharjo dengan metode Triple
              Exponential Smoothing.
            </p>
          </div>

          <button
            onClick={hitungPrediksiTES}
            disabled={loading}
            className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-950/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Menghitung...
              </>
            ) : (
              <>
                <Calculator size={18} />
                Hitung Prediksi
              </>
            )}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] border-b border-slate-800 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-cyan-300 text-sm mb-2">
                Forecasting Produksi Padi
              </p>

              <h1 className="text-3xl font-bold">
                Prediksi Produksi Padi Sukoharjo
              </h1>

              <p className="text-slate-300 mt-2 max-w-3xl text-sm leading-relaxed">
                Sistem menghitung prediksi produksi padi menggunakan metode
                Triple Exponential Smoothing berdasarkan data produksi bulanan
                tahun 2021–2024.
              </p>
            </div>

            <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-400">Status Perhitungan</p>
                  <h3
                    className={`font-bold ${
                      sudahDihitung ? "text-emerald-300" : "text-yellow-300"
                    }`}
                  >
                    {sudahDihitung ? "Sudah Dihitung" : "Belum Dihitung"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
          {!sudahDihitung && !loading && !error && (
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <Calculator size={30} />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Prediksi Belum Dihitung
              </h2>

              <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
                Klik tombol <b>Hitung Prediksi</b> untuk menampilkan ringkasan,
                grafik aktual vs prediksi, hasil prediksi 2025, dan data
                historis produksi.
              </p>

              <button
                onClick={hitungPrediksiTES}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 shadow-lg shadow-cyan-950/30 transition"
              >
                <Calculator size={18} />
                Hitung Prediksi Sekarang
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Sedang Menghitung Prediksi...
              </h2>

              <p className="text-slate-400 text-sm">
                Sistem sedang mengambil data historis dan menjalankan metode
                Triple Exponential Smoothing.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 rounded-2xl border border-red-500/30 shadow-lg shadow-black/20 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-300">
                    Gagal Menghitung Prediksi
                  </h2>

                  <p className="text-red-100/80 mt-2">{error}</p>

                  <p className="text-sm text-slate-400 mt-3">
                    Pastikan backend Laravel sudah berjalan dengan perintah{" "}
                    <span className="font-semibold text-slate-200">
                      php artisan serve
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {sudahDihitung && !loading && !error && (
            <>
              {/* CARD RINGKASAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Data Historis"
                  value={`${ringkasan?.jumlahDataHistoris ?? 48} Data`}
                  subtitle="Data produksi bulanan"
                  icon={Database}
                  tone="emerald"
                />

                <StatCard
                  title="MAPE"
                  value={`${formatAngka(ringkasan?.mape ?? 0)}%`}
                  subtitle="Rata-rata kesalahan prediksi"
                  icon={Percent}
                  tone="yellow"
                />

                <StatCard
                  title="Akurasi"
                  value={`${formatAngka(ringkasan?.estimasiAkurasi ?? 0)}%`}
                  subtitle="Berdasarkan nilai MAPE"
                  icon={Target}
                  tone="cyan"
                />

                <StatCard
                  title="Prediksi Terdekat"
                  value={
                    prediksiBulanDepan
                      ? `${formatAngka(prediksiBulanDepan.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiBulanDepan
                      ? `${namaBulan(prediksiBulanDepan.bulan)} ${
                          prediksiBulanDepan.tahun
                        }`
                      : "Belum tersedia"
                  }
                  icon={CalendarDays}
                  tone="blue"
                />
              </div>

              {/* INSIGHT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  icon={TrendingUp}
                  tone="emerald"
                />

                <InsightCard
                  title="Rata-rata Prediksi"
                  value={`${formatAngka(rataRataPrediksi)} Ton`}
                  subtitle="Rata-rata prediksi tahun 2025"
                  icon={BarChart3}
                  tone="yellow"
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
                  icon={TrendingDown}
                  tone="red"
                />
              </div>

              {/* GRAFIK BATANG */}
              <Card title="Grafik Aktual dan Prediksi TES">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white">
                      Perbandingan Aktual dan Prediksi
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Grafik batang menampilkan perbandingan data aktual
                      terakhir dan prediksi produksi padi mendatang.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                    TES
                  </span>
                </div>

                <div className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 35,
                      }}
                      barGap={6}
                      barCategoryGap={18}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#1e293b"
                      />

                      <XAxis
                        dataKey="periode"
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "14px",
                          border: "1px solid #1e293b",
                          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
                          fontSize: "13px",
                          color: "#e2e8f0",
                        }}
                        labelStyle={{
                          color: "#e2e8f0",
                        }}
                        formatter={(value, name) => [
                          value === null ? "-" : `${formatAngka(value)} Ton`,
                          name,
                        ]}
                        labelFormatter={(label) => `Periode: ${label}`}
                      />

                      <Legend
                        wrapperStyle={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                        }}
                      />

                      <Bar
                        dataKey="aktual"
                        name="Aktual Bulanan"
                        fill="#06b6d4"
                        radius={[8, 8, 0, 0]}
                      />

                      <Bar
                        dataKey="prediksi"
                        name="Prediksi TES"
                        fill="#22c55e"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* PREDIKSI 2025 CARD */}
              <Card title="Hasil Prediksi Produksi Padi 2025">
                {prediksiMendatang.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-6 text-center text-slate-400">
                    Data prediksi mendatang belum tersedia.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {prediksiMendatang.map((item, index) => (
                      <div
                        key={`${item.bulan}-${item.tahun}-${index}`}
                        className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 hover:-translate-y-1 transition shadow-lg shadow-black/10"
                      >
                        <p className="text-sm text-cyan-300 font-semibold">
                          {namaBulan(item.bulan)} {item.tahun}
                        </p>

                        <h3 className="text-xl font-bold text-white mt-2">
                          {formatAngka(item.prediksi)}
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          Ton produksi padi
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* DATA HISTORIS */}
              <Card title="Data Historis Produksi Padi">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">
                    Menampilkan {dataHistoris.length} dari {evaluasi.length}{" "}
                    data historis produksi.
                  </p>

                  <button
                    onClick={() => setLihatSemuaHistoris(!lihatSemuaHistoris)}
                    className="px-4 py-2 rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-sm font-semibold transition"
                  >
                    {lihatSemuaHistoris ? "Tampilkan Ringkas" : "Lihat Semua"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-800 rounded-xl overflow-hidden">
                    <thead className="bg-[#0b1220] text-slate-300">
                      <tr>
                        <th className="px-4 py-3 border border-slate-800 text-left">
                          No
                        </th>
                        <th className="px-4 py-3 border border-slate-800 text-left">
                          Periode
                        </th>
                        <th className="px-4 py-3 border border-slate-800 text-right">
                          Produksi Aktual (ton)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataHistoris.length > 0 ? (
                        dataHistoris.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-slate-800/60 transition"
                          >
                            <td className="px-4 py-3 border border-slate-800 text-slate-400">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 border border-slate-800 text-slate-300">
                              {namaBulan(item.bulan)} {item.tahun}
                            </td>

                            <td className="px-4 py-3 border border-slate-800 text-right font-semibold text-emerald-300">
                              {formatAngka(item.aktual)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 py-8 text-center text-slate-500 border border-slate-800"
                          >
                            Data historis belum tersedia.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
      <div className="px-6 py-4 bg-[#0b1220] border-b border-slate-800 text-white">
        <h2 className="font-bold">{title}</h2>
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
    yellow: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  };

  return (
    <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-xl font-bold text-white mt-2">{value}</h3>
          <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
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
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    yellow:
      "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
    red: "bg-red-500/10 text-red-300 border border-red-500/20",
  };

  return (
    <div
      className={`rounded-2xl p-5 shadow-lg shadow-black/10 ${
        toneClass[tone] || toneClass.emerald
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h2 className="text-xl font-bold mt-2">{value}</h2>
          <p className="text-xs mt-1 opacity-80">{subtitle}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}