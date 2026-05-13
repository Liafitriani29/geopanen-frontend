import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

import {
  RefreshCw,
  PlusCircle,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Percent,
  ClipboardList,
  CloudSun,
  Droplets,
  Wind,
  Lightbulb,
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

const API_PREDIKSI = "http://127.0.0.1:8000/api/tes/prediksi";
const API_EVALUASI_AKTUAL = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);
  const [ringkasanEvaluasi, setRingkasanEvaluasi] = useState(null);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);
  const [error, setError] = useState("");

  const [cuaca] = useState({
    lokasi: "Sukoharjo",
    suhu: 28,
    kelembaban: 82,
    kondisi: "Berawan",
    angin: 1.2,
  });

  useEffect(() => {
    const userString = localStorage.getItem("user");

    if (!userString) {
      navigate("/");
      return;
    }

    try {
      const user = JSON.parse(userString);
      if (!user) navigate("/");
    } catch {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    getDashboardData();
  }, []);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resPrediksi, resEvaluasi] = await Promise.all([
        axios.get(API_PREDIKSI),
        axios.get(API_EVALUASI_AKTUAL),
      ]);

      const payloadPrediksi = resPrediksi.data?.data || {};
      const payloadEvaluasi = resEvaluasi.data?.data || {};

      setRingkasanPrediksi(payloadPrediksi.ringkasan || null);

      setPrediksiMendatang(
        Array.isArray(payloadPrediksi.prediksiMendatang)
          ? payloadPrediksi.prediksiMendatang
          : []
      );

      setRingkasanEvaluasi(payloadEvaluasi.ringkasan || null);

      setEvaluasiAktual(
        Array.isArray(payloadEvaluasi.evaluasi)
          ? payloadEvaluasi.evaluasi
          : []
      );
    } catch (err) {
      console.error("Gagal mengambil data dashboard:", err);

      setError(
        err.response?.data?.message ||
          "Gagal memuat dashboard. Pastikan backend Laravel sudah berjalan."
      );
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

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return `${formatNumber(value)}%`;
  };

  const periodeEvaluasiSet = useMemo(() => {
    return new Set(
      evaluasiAktual.map(
        (item) => `${Number(item.tahun)}-${Number(item.bulan)}`
      )
    );
  }, [evaluasiAktual]);

  const prediksiBelumDievaluasi = useMemo(() => {
    return prediksiMendatang.filter(
      (item) =>
        !periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [prediksiMendatang, periodeEvaluasiSet]);

  const prediksiPeriodeBerikutnya =
    prediksiBelumDievaluasi[0] || prediksiMendatang[0] || null;

  const semuaPrediksiSudahDievaluasi =
    prediksiMendatang.length > 0 && prediksiBelumDievaluasi.length === 0;

  const prediksiTertinggi = useMemo(() => {
    if (prediksiMendatang.length === 0) return null;

    return [...prediksiMendatang].sort(
      (a, b) => Number(b.prediksi || 0) - Number(a.prediksi || 0)
    )[0];
  }, [prediksiMendatang]);

  const rataRataPrediksi = useMemo(() => {
    if (prediksiMendatang.length === 0) return 0;

    const total = prediksiMendatang.reduce(
      (sum, item) => sum + Number(item.prediksi || 0),
      0
    );

    return total / prediksiMendatang.length;
  }, [prediksiMendatang]);

  const grafikData = useMemo(() => {
    const aktualMap = new Map();

    evaluasiAktual.forEach((item) => {
      aktualMap.set(`${Number(item.tahun)}-${Number(item.bulan)}`, item);
    });

    return prediksiMendatang.slice(0, 12).map((item) => {
      const aktual = aktualMap.get(
        `${Number(item.tahun)}-${Number(item.bulan)}`
      );

      return {
        periode: `${namaBulan(item.bulan)} ${item.tahun}`,
        prediksi: Number(item.prediksi || 0),
        aktual: aktual ? Number(aktual.aktual || 0) : null,
      };
    });
  }, [prediksiMendatang, evaluasiAktual]);

  const mapeTampil = ringkasanEvaluasi?.mape ?? ringkasanPrediksi?.mape;

  const akurasiTampil =
    ringkasanEvaluasi?.estimasiAkurasi ?? ringkasanPrediksi?.estimasiAkurasi;

  const statusModel =
    ringkasanEvaluasi?.statusModel ||
    (Number(mapeTampil) <= 10
      ? "Akurat"
      : Number(mapeTampil) <= 20
      ? "Cukup"
      : "Perlu Perbaikan");

  const statusClass =
    statusModel === "Akurat"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : statusModel === "Cukup"
      ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
      : statusModel === "Perlu Perbaikan"
      ? "bg-red-500/10 text-red-300 border-red-500/30"
      : "bg-slate-800 text-slate-300 border-slate-700";

  const StatusIcon =
    statusModel === "Akurat"
      ? CheckCircle2
      : statusModel === "Belum Dievaluasi"
      ? ClipboardList
      : AlertTriangle;

  const rekomendasiRuleBased = useMemo(() => {
    const hasil = [];

    if (Number(mapeTampil) <= 10) {
      hasil.push(
        "Model TES tergolong akurat dan layak digunakan sebagai acuan prediksi."
      );
    } else if (Number(mapeTampil) <= 20) {
      hasil.push(
        "Model TES cukup baik, tetapi hasil prediksi tetap perlu dipantau."
      );
    } else {
      hasil.push(
        "Model TES perlu dievaluasi karena nilai MAPE masih cukup tinggi."
      );
    }

    if (cuaca.suhu >= 32) {
      hasil.push("Suhu tinggi, disarankan meningkatkan pengairan lahan.");
    } else {
      hasil.push("Suhu masih normal untuk mendukung pertumbuhan padi.");
    }

    if (cuaca.kelembaban >= 80) {
      hasil.push("Kelembaban tinggi, perlu monitoring penyakit jamur dan hama.");
    } else {
      hasil.push("Kelembaban relatif aman, tetap lakukan pemantauan rutin.");
    }

    if (prediksiTertinggi) {
      hasil.push(
        `Produksi tertinggi diprediksi pada ${namaBulan(
          prediksiTertinggi.bulan
        )} ${prediksiTertinggi.tahun}.`
      );
    }

    return hasil;
  }, [mapeTampil, cuaca, prediksiTertinggi]);

  const tabelEvaluasi = evaluasiAktual.slice(-5).reverse();

  const tabelPrediksi =
    prediksiBelumDievaluasi.length > 0
      ? prediksiBelumDievaluasi.slice(0, 5)
      : prediksiMendatang.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden bg-[#020617]">
        {/* TOPBAR */}
        <div className="h-16 bg-[#081226] border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">Dashboard Admin</h2>
            <p className="text-xs text-slate-400">
              Ringkasan prediksi TES, evaluasi aktual, cuaca, dan rekomendasi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={getDashboardData}
              className="flex items-center gap-2 border border-slate-700 bg-[#0b1220] text-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => navigate("/prediksi")}
              className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-950/30"
            >
              <PlusCircle size={17} />
              Hitung Prediksi
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] border-b border-slate-800 px-8 pt-8 pb-24 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-cyan-300 text-sm mb-2">
                Sistem Prediksi Panen Padi Berbasis TES
              </p>

              <h1 className="text-3xl font-bold">Dashboard Geopanen</h1>

              <p className="text-slate-300 mt-2 max-w-3xl text-sm leading-relaxed">
                Dashboard menampilkan ringkasan data produksi bulanan, hasil
                prediksi Triple Exponential Smoothing, evaluasi aktual, kondisi
                cuaca, dan rekomendasi rule based system.
              </p>
            </div>

            <div className="hidden lg:block bg-white/5 border border-cyan-500/20 rounded-2xl p-4 min-w-[240px] backdrop-blur-sm">
              <p className="text-sm text-slate-400">Status Model</p>
              <h3 className="font-bold text-xl mt-1 text-white">
                {statusModel}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Berdasarkan nilai MAPE
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-red-300">
              {error}
            </div>
          )}

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Data Historis"
              value={`${ringkasanPrediksi?.jumlahDataHistoris || 0} Data`}
              subtitle="Data produksi bulanan TES"
              icon={Database}
              tone="emerald"
            />

            <StatCard
              title="Prediksi Mendatang"
              value={`${prediksiMendatang.length} Periode`}
              subtitle="Prediksi produksi tahun berikutnya"
              icon={TrendingUp}
              tone="cyan"
            />

            <StatCard
              title="MAPE Model"
              value={formatPercent(mapeTampil)}
              subtitle="Rata-rata kesalahan prediksi"
              icon={Percent}
              tone="amber"
            />

            <StatCard
              title="Akurasi"
              value={formatPercent(akurasiTampil)}
              subtitle="Berdasarkan nilai MAPE"
              icon={Target}
              tone="lime"
            />
          </div>

          {/* PREDIKSI RINGKAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InfoCard
              title="Prediksi Periode Berikutnya"
              value={
                prediksiPeriodeBerikutnya
                  ? `${formatNumber(prediksiPeriodeBerikutnya.prediksi)} Ton`
                  : "-"
              }
              subtitle={
                prediksiPeriodeBerikutnya
                  ? `${namaBulan(prediksiPeriodeBerikutnya.bulan)} ${
                      prediksiPeriodeBerikutnya.tahun
                    }${
                      semuaPrediksiSudahDievaluasi
                        ? " - Semua periode sudah dievaluasi"
                        : ""
                    }`
                  : "Belum ada prediksi"
              }
              tone="emerald"
            />

            <InfoCard
              title="Prediksi Tertinggi"
              value={
                prediksiTertinggi
                  ? `${formatNumber(prediksiTertinggi.prediksi)} Ton`
                  : "-"
              }
              subtitle={
                prediksiTertinggi
                  ? `${namaBulan(prediksiTertinggi.bulan)} ${
                      prediksiTertinggi.tahun
                    }`
                  : "Belum ada prediksi"
              }
              tone="cyan"
            />

            <InfoCard
              title="Rata-rata Prediksi"
              value={`${formatNumber(rataRataPrediksi)} Ton`}
              subtitle="Rata-rata prediksi 12 periode"
              tone="yellow"
            />
          </div>

          {/* CHART STATUS CUACA */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-2 bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-bold text-white">
                    Grafik Perbandingan Aktual dan Prediksi TES
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Menampilkan perbandingan produksi aktual dan prediksi TES
                    dalam bentuk grafik batang.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                  TES
                </span>
              </div>

              <div className="h-[330px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={grafikData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    barGap={6}
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
                        value === null ? "-" : `${formatNumber(value)} Ton`,
                        name,
                      ]}
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
            </div>

            {/* STATUS MODEL */}
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
              <h2 className="font-bold text-white mb-4">
                Status Evaluasi Model
              </h2>

              <div className={`${statusClass} border rounded-2xl p-5 mb-5`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center">
                    <StatusIcon size={22} />
                  </div>

                  <div>
                    <p className="text-sm opacity-80">Status Model</p>
                    <h3 className="text-xl font-bold">{statusModel}</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <InfoRow
                  label="Jumlah Evaluasi"
                  value={`${
                    ringkasanEvaluasi?.jumlahDataEvaluasi ||
                    ringkasanPrediksi?.jumlahDataEvaluasi ||
                    0
                  } Periode`}
                />

                <InfoRow label="MAPE" value={formatPercent(mapeTampil)} />

                <InfoRow
                  label="Akurasi"
                  value={formatPercent(akurasiTampil)}
                />
              </div>

              <div className="mt-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                <p className="text-sm text-slate-400 mb-1">Kesimpulan</p>
                <p className="text-cyan-300 font-semibold leading-relaxed text-sm">
                  {Number(mapeTampil) <= 10
                    ? "Model TES akurat dan dapat digunakan sebagai acuan prediksi."
                    : Number(mapeTampil) <= 20
                    ? "Model cukup baik, tetapi tetap perlu pemantauan berkala."
                    : "Model perlu ditinjau kembali berdasarkan data aktual terbaru."}
                </p>
              </div>
            </div>

            {/* CUACA DAN REKOMENDASI */}
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
              <h2 className="font-bold text-white mb-4">
                Cuaca & Rekomendasi
              </h2>

              <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-300">
                      Cuaca {cuaca.lokasi}
                    </p>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {cuaca.suhu}°C
                    </h3>
                    <p className="text-xs text-slate-400">{cuaca.kondisi}</p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#020617] text-sky-300 flex items-center justify-center border border-sky-500/20">
                    <CloudSun size={26} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#020617] rounded-xl p-3 border border-slate-800">
                    <div className="flex items-center gap-2 text-sky-300">
                      <Droplets size={16} />
                      <p className="text-xs">Kelembaban</p>
                    </div>
                    <h4 className="font-bold text-white mt-1">
                      {cuaca.kelembaban}%
                    </h4>
                  </div>

                  <div className="bg-[#020617] rounded-xl p-3 border border-slate-800">
                    <div className="flex items-center gap-2 text-sky-300">
                      <Wind size={16} />
                      <p className="text-xs">Angin</p>
                    </div>
                    <h4 className="font-bold text-white mt-1">
                      {cuaca.angin} m/s
                    </h4>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} className="text-emerald-300" />
                  <p className="font-bold text-emerald-300">
                    Rule Based System
                  </p>
                </div>

                <ul className="space-y-3">
                  {rekomendasiRuleBased.slice(0, 3).map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-slate-300 leading-relaxed flex gap-2"
                    >
                      <span className="text-emerald-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-white">
                  Ringkasan Evaluasi dan Prediksi
                </h2>
                <p className="text-sm text-slate-400">
                  Menampilkan data evaluasi aktual jika tersedia. Jika belum
                  tersedia, sistem menampilkan prediksi mendatang.
                </p>
              </div>

              <button
                onClick={() => navigate("/deviasi")}
                className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Lihat Evaluasi
              </button>
            </div>

            <div className="overflow-x-auto">
              {tabelEvaluasi.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-[#0b1220] text-slate-400">
                    <tr>
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
                      <th className="text-left font-semibold px-6 py-4">
                        APE
                      </th>
                      <th className="text-left font-semibold px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tabelEvaluasi.map((item, index) => (
                      <tr
                        key={`${item.tahun}-${item.bulan}-${index}`}
                        className="border-t border-slate-800 hover:bg-slate-800/60"
                      >
                        <td className="px-6 py-4 font-medium text-white">
                          {namaBulan(item.bulan)} {item.tahun}
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {formatNumber(item.aktual)} Ton
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {formatNumber(item.prediksi)} Ton
                        </td>

                        <td
                          className={`px-6 py-4 font-semibold ${
                            Number(item.selisih) < 0
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {formatNumber(item.selisih)} Ton
                        </td>

                        <td className="px-6 py-4 font-semibold text-yellow-300">
                          {formatNumber(item.ape)}%
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "Akurat"
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                : item.status === "Cukup"
                                ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
                                : "bg-red-500/10 text-red-300 border border-red-500/20"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#0b1220] text-slate-400">
                    <tr>
                      <th className="text-left font-semibold px-6 py-4">
                        Periode
                      </th>
                      <th className="text-left font-semibold px-6 py-4">
                        Prediksi TES
                      </th>
                      <th className="text-left font-semibold px-6 py-4">
                        Keterangan
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tabelPrediksi.length > 0 ? (
                      tabelPrediksi.map((item, index) => (
                        <tr
                          key={`${item.tahun}-${item.bulan}-${index}`}
                          className="border-t border-slate-800 hover:bg-slate-800/60"
                        >
                          <td className="px-6 py-4 font-medium text-white">
                            {namaBulan(item.bulan)} {item.tahun}
                          </td>

                          <td className="px-6 py-4 text-slate-300">
                            {formatNumber(item.prediksi)} Ton
                          </td>

                          <td className="px-6 py-4 text-slate-400">
                            Belum ada data aktual bulanan untuk evaluasi
                            periode ini.
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          Belum ada data prediksi yang ditampilkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
    lime: "bg-lime-500/10 text-lime-300 border border-lime-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
  };

  return (
    <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-2">{value}</h3>
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

function InfoCard({ title, value, subtitle, tone }) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    yellow: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-lg shadow-black/10 ${
        toneClass[tone] || toneClass.emerald
      }`}
    >
      <p className="text-sm font-medium opacity-90">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
      <p className="text-xs mt-1 opacity-80">{subtitle}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}