import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  BarChart3,
  CloudSun,
  RefreshCw,
  Thermometer,
  Droplets,
  CalendarDays,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  Leaf,
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
} from "recharts";

const API_PREDIKSI = "http://127.0.0.1:8000/api/tes/prediksi";
const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";

export default function PetaniDashboard() {
  const navigate = useNavigate();

  const [prediksiMendatang, setPrediksiMendatang] = useState([]);
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [cuaca, setCuaca] = useState(null);
  const [rekomendasiList, setRekomendasiList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userString = localStorage.getItem("user");

    if (!userString) {
      navigate("/");
      return;
    }

    getDashboardPetani();
  }, [navigate]);

  const getDashboardPetani = async () => {
    try {
      setLoading(true);
      setError("");

      const [resPrediksi, resRekomendasi] = await Promise.allSettled([
        axios.get(API_PREDIKSI),
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

      if (resRekomendasi.status === "fulfilled") {
        const payloadRekomendasi = resRekomendasi.value.data?.data || {};

        setCuaca(payloadRekomendasi.cuaca_terbaru || null);

        setRekomendasiList(
          Array.isArray(payloadRekomendasi.rekomendasi)
            ? payloadRekomendasi.rekomendasi
            : []
        );
      } else {
        setCuaca(null);
        setRekomendasiList([]);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Gagal mengambil data dashboard petani dari backend Laravel."
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

  const prediksiBulanDepan = prediksiMendatang[0] || null;

  const getKategoriPrediksi = (nilai) => {
    if (!nilai || rataRataPrediksi <= 0) return "Belum Dinilai";

    if (nilai >= rataRataPrediksi * 1.2) return "Tinggi";
    if (nilai <= rataRataPrediksi * 0.8) return "Rendah";

    return "Sedang";
  };

  const kategoriBulanDepan = prediksiBulanDepan
    ? getKategoriPrediksi(Number(prediksiBulanDepan.prediksi))
    : "Belum Dinilai";

  const rekomendasiUtama =
    rekomendasiList.find(
      (item) =>
        Number(item.tahun) === Number(prediksiBulanDepan?.tahun) &&
        Number(item.bulan) === Number(prediksiBulanDepan?.bulan)
    ) ||
    rekomendasiList[0] ||
    null;

  const rekomendasiTeks =
    rekomendasiUtama?.rekomendasi ||
    "Rekomendasi akan tersedia setelah data prediksi dan cuaca berhasil dimuat.";

  const grafikPrediksi = prediksiMendatang.slice(0, 12).map((item) => ({
    periode: `${namaBulan(item.bulan)} ${item.tahun}`,
    prediksi: Number(item.prediksi || 0),
  }));

  const tabelPrediksi = prediksiMendatang.slice(0, 6);

  const getKategoriBadge = (kategori) => {
    if (kategori === "Tinggi") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (kategori === "Rendah") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (kategori === "Sedang") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Dashboard Petani</h2>
            <p className="text-xs text-slate-500">
              Informasi hasil prediksi panen, cuaca, dan rekomendasi sistem.
            </p>
          </div>

          <button
            onClick={getDashboardPetani}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition disabled:opacity-60"
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
                Informasi Prediksi Panen
              </p>

              <h1 className="text-3xl font-bold">Dashboard Petani</h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Petani dapat melihat hasil prediksi panen padi, kondisi cuaca
                terbaru, dan rekomendasi tindakan berdasarkan hasil prediksi
                sistem.
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
                Memuat Dashboard Petani...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data prediksi, cuaca, dan rekomendasi.
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
                    Gagal Memuat Dashboard
                  </h2>

                  <p className="text-slate-600 mt-2">{error}</p>

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan backend Laravel sudah berjalan dan endpoint{" "}
                    <span className="font-semibold">/api/tes/prediksi</span>{" "}
                    sudah aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* STAT CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Prediksi Bulan Depan"
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
                      : "Belum ada prediksi"
                  }
                  icon={TrendingUp}
                  tone="emerald"
                />

                <StatCard
                  title="Kategori Prediksi"
                  value={kategoriBulanDepan}
                  subtitle="Tinggi, sedang, atau rendah"
                  icon={Target}
                  tone={
                    kategoriBulanDepan === "Rendah"
                      ? "red"
                      : kategoriBulanDepan === "Sedang"
                      ? "yellow"
                      : "green"
                  }
                />

                <StatCard
                  title="Suhu"
                  value={
                    cuaca?.suhu !== null && cuaca?.suhu !== undefined
                      ? `${cuaca.suhu}°C`
                      : "-"
                  }
                  subtitle={cuaca?.kategori_cuaca || "Kondisi cuaca"}
                  icon={Thermometer}
                  tone="orange"
                />

                <StatCard
                  title="Kelembapan"
                  value={
                    cuaca?.kelembaban !== null &&
                    cuaca?.kelembaban !== undefined
                      ? `${cuaca.kelembaban}%`
                      : "-"
                  }
                  subtitle="Kelembapan udara"
                  icon={Droplets}
                  tone="blue"
                />
              </div>

              {/* HASIL PREDIKSI DAN CUACA */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="font-bold text-slate-800">
                        Grafik Prediksi Panen TES
                      </h2>
                      <p className="text-sm text-slate-500">
                        Menampilkan prediksi produksi panen padi periode
                        mendatang berdasarkan metode TES.
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                        kategoriBulanDepan
                      )}`}
                    >
                      {kategoriBulanDepan}
                    </span>
                  </div>

                  <div className="h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={grafikPrediksi}
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

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-4">
                    Kondisi Lingkungan
                  </h2>

                  <div className="space-y-4">
                    <InfoRow
                      icon={CalendarDays}
                      label="Tanggal Cuaca"
                      value={formatTanggal(cuaca?.tanggal)}
                    />

                    <InfoRow
                      icon={CloudSun}
                      label="Kondisi"
                      value={cuaca?.kondisi || "-"}
                    />

                    <InfoRow
                      icon={Thermometer}
                      label="Suhu"
                      value={
                        cuaca?.suhu !== null && cuaca?.suhu !== undefined
                          ? `${cuaca.suhu}°C`
                          : "-"
                      }
                    />

                    <InfoRow
                      icon={Droplets}
                      label="Kelembapan"
                      value={
                        cuaca?.kelembaban !== null &&
                        cuaca?.kelembaban !== undefined
                          ? `${cuaca.kelembaban}%`
                          : "-"
                      }
                    />
                  </div>

                  <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      Catatan Cuaca
                    </p>
                    <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                      {cuaca?.catatan_cuaca ||
                        "Catatan cuaca belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>

              {/* REKOMENDASI UTAMA */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Lightbulb size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Rekomendasi Utama
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Rekomendasi dibuat berdasarkan hasil prediksi TES dan
                      kondisi cuaca terbaru.
                    </p>

                    <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <p className="font-semibold text-emerald-700 leading-relaxed">
                        {rekomendasiTeks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AKSI CEPAT */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-slate-800">Aksi Cepat</h2>
                    <p className="text-sm text-slate-500">
                      Petani hanya melihat informasi prediksi, cuaca, dan
                      rekomendasi.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QuickAction
                    title="Hasil Prediksi"
                    description="Lihat daftar prediksi panen"
                    icon={BarChart3}
                    tone="emerald"
                    onClick={() => navigate("/petani/hasil-prediksi")}
                  />

                  <QuickAction
                    title="Kondisi Lingkungan"
                    description="Lihat suhu dan cuaca"
                    icon={CloudSun}
                    tone="orange"
                    onClick={() => navigate("/lingkungan")}
                  />

                  <QuickAction
                    title="Rekomendasi"
                    description="Lihat saran sistem"
                    icon={Lightbulb}
                    tone="purple"
                    onClick={() => navigate("/rekomendasi")}
                  />
                </div>
              </div>

              {/* TABEL PREDIKSI */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Prediksi Panen Mendatang
                    </h2>
                    <p className="text-sm text-slate-500">
                      Daftar prediksi produksi panen yang dapat dilihat petani.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {prediksiMendatang.length} Periode
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
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
                          Keterangan
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tabelPrediksi.length > 0 ? (
                        tabelPrediksi.map((item, index) => {
                          const kategori = getKategoriPrediksi(
                            Number(item.prediksi)
                          );

                          return (
                            <tr
                              key={`${item.tahun}-${item.bulan}-${index}`}
                              className="border-t border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-6 py-4 font-medium text-slate-700">
                                {namaBulan(item.bulan)} {item.tahun}
                              </td>

                              <td className="px-6 py-4 text-slate-600">
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

                              <td className="px-6 py-4 text-slate-500">
                                Hasil prediksi dapat digunakan sebagai informasi
                                awal untuk perencanaan kegiatan pertanian.
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            Belum ada data prediksi yang ditampilkan.
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
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-slate-800">{value}</h3>
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Icon size={16} className="text-emerald-600" />
        {label}
      </div>

      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, tone, onClick }) {
  const toneClass = {
    emerald: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <button
      onClick={onClick}
      className="text-left p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:-translate-y-1 transition group"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
          toneClass[tone] || toneClass.emerald
        }`}
      >
        <Icon size={21} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <ArrowRight
          size={18}
          className="text-slate-400 group-hover:text-emerald-600"
        />
      </div>
    </button>
  );
}