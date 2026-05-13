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
  Info,
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
const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";
const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";

export default function HasilPrediksiPetani() {
  const navigate = useNavigate();

  const [prediksiMendatang, setPrediksiMendatang] = useState([]);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);
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

    getHasilPrediksiPetani();
  }, [navigate]);

  const getHasilPrediksiPetani = async () => {
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

      setPrediksiMendatang(
        Array.isArray(payloadPrediksi.prediksiMendatang)
          ? payloadPrediksi.prediksiMendatang
          : []
      );

      if (resEvaluasi.status === "fulfilled") {
        const payloadEvaluasi = resEvaluasi.value.data?.data || {};

        setEvaluasiAktual(
          Array.isArray(payloadEvaluasi.evaluasi)
            ? payloadEvaluasi.evaluasi
            : []
        );
      } else {
        setEvaluasiAktual([]);
      }

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
          "Gagal mengambil data hasil prediksi dari backend Laravel."
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

  const prediksiBerikutnya =
    prediksiBelumDievaluasi[0] || prediksiMendatang[0] || null;

  const dataPrediksiUntukPetani =
    prediksiBelumDievaluasi.length > 0
      ? prediksiBelumDievaluasi
      : prediksiMendatang;

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

  const getKategoriPrediksi = (nilai) => {
    const prediksi = Number(nilai || 0);
    const rata = Number(rataRataPrediksi || 0);

    if (!rata) return "Belum Dinilai";
    if (prediksi >= rata * 1.15) return "Tinggi";
    if (prediksi <= rata * 0.85) return "Rendah";

    return "Sedang";
  };

  const kategoriBerikutnya = prediksiBerikutnya
    ? getKategoriPrediksi(Number(prediksiBerikutnya.prediksi))
    : "Belum Dinilai";

  const rekomendasiUtama =
    rekomendasiList.find(
      (item) =>
        Number(item.tahun) === Number(prediksiBerikutnya?.tahun) &&
        Number(item.bulan) === Number(prediksiBerikutnya?.bulan)
    ) || null;

  const rekomendasiFallback = () => {
    if (!prediksiBerikutnya) {
      return "Rekomendasi akan tersedia setelah data prediksi berhasil dimuat.";
    }

    if (kategoriBerikutnya === "Tinggi") {
      return "Produksi diprediksi tinggi. Petani dapat mulai mempersiapkan pemantauan panen, alat, tenaga kerja, dan distribusi hasil.";
    }

    if (kategoriBerikutnya === "Sedang") {
      return "Produksi diprediksi stabil. Petani tetap perlu melakukan pemantauan rutin terhadap kondisi tanaman dan lingkungan.";
    }

    if (kategoriBerikutnya === "Rendah") {
      return "Produksi diprediksi rendah. Petani perlu lebih memperhatikan cuaca, irigasi, hama, penyakit tanaman, dan kondisi lahan.";
    }

    return "Rekomendasi belum tersedia.";
  };

  const rekomendasiTeks = rekomendasiUtama?.rekomendasi || rekomendasiFallback();

  const grafikPrediksi = prediksiMendatang.slice(0, 12).map((item) => ({
    periode: `${namaBulan(item.bulan)} ${item.tahun}`,
    prediksi: Number(item.prediksi || 0),
  }));

  const tabelPrediksi = dataPrediksiUntukPetani.slice(0, 12);

  const getKategoriBadge = (kategori) => {
    if (kategori === "Tinggi") {
      return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    }

    if (kategori === "Rendah") {
      return "bg-red-500/10 text-red-300 border-red-500/20";
    }

    if (kategori === "Sedang") {
      return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
    }

    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden bg-[#020617]">
        {/* TOPBAR */}
        <div className="h-16 bg-[#081226] border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">Hasil Prediksi Petani</h2>
            <p className="text-xs text-slate-400">
              Informasi hasil prediksi panen, cuaca, dan rekomendasi sistem.
            </p>
          </div>

          <button
            onClick={getHasilPrediksiPetani}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-800 bg-[#0b1220] text-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-800 transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] border-b border-slate-800 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-cyan-300 text-sm mb-2">
                Informasi Prediksi Panen
              </p>

              <h1 className="text-3xl font-bold">Hasil Prediksi Panen</h1>

              <p className="text-slate-300 mt-2 max-w-3xl text-sm leading-relaxed">
                Petani dapat melihat prediksi produksi padi wilayah, kondisi
                cuaca terbaru, dan rekomendasi tindakan dari sistem.
              </p>
            </div>

            <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-400">Status Data</p>
                  <h3
                    className={`font-bold ${
                      loading ? "text-yellow-300" : "text-emerald-300"
                    }`}
                  >
                    {loading ? "Memuat Data" : "Data Tersedia"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
          {loading && (
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Memuat Hasil Prediksi...
              </h2>

              <p className="text-slate-400 text-sm">
                Sistem sedang mengambil data prediksi, evaluasi, cuaca, dan
                rekomendasi.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-500/10 rounded-2xl border border-red-500/30 shadow-lg shadow-black/20 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-300">
                    Gagal Memuat Hasil Prediksi
                  </h2>

                  <p className="text-red-100/80 mt-2">{error}</p>

                  <p className="text-sm text-slate-400 mt-3">
                    Pastikan backend Laravel sudah berjalan dan endpoint{" "}
                    <span className="font-semibold text-slate-200">
                      /api/tes/prediksi
                    </span>{" "}
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
                  title="Prediksi Berikutnya"
                  value={
                    prediksiBerikutnya
                      ? `${formatAngka(prediksiBerikutnya.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiBerikutnya
                      ? `${namaBulan(prediksiBerikutnya.bulan)} ${
                          prediksiBerikutnya.tahun
                        }`
                      : "Belum ada prediksi"
                  }
                  icon={TrendingUp}
                  tone="emerald"
                />

                <StatCard
                  title="Kategori Prediksi"
                  value={kategoriBerikutnya}
                  subtitle="Tinggi, sedang, atau rendah"
                  icon={Target}
                  tone={
                    kategoriBerikutnya === "Rendah"
                      ? "red"
                      : kategoriBerikutnya === "Sedang"
                      ? "yellow"
                      : "green"
                  }
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
                  icon={BarChart3}
                  tone="blue"
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

              {/* GRAFIK DAN CUACA */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="font-bold text-white">
                        Grafik Prediksi Panen TES
                      </h2>
                      <p className="text-sm text-slate-400">
                        Menampilkan prediksi produksi padi periode mendatang
                        berdasarkan metode TES.
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                        kategoriBerikutnya
                      )}`}
                    >
                      {kategoriBerikutnya}
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
                          cursor={{ fill: "rgba(6, 182, 212, 0.08)" }}
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
                          formatter={(value) => [
                            `${formatAngka(value)} Ton`,
                            "Prediksi TES",
                          ]}
                          labelFormatter={(label) => `Periode: ${label}`}
                        />

                        <Bar
                          dataKey="prediksi"
                          name="Prediksi TES"
                          fill="#06b6d4"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
                  <h2 className="font-bold text-white mb-4">
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

                  <div className="mt-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-cyan-300">
                      Catatan Cuaca
                    </p>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                      {cuaca?.catatan_cuaca ||
                        "Catatan cuaca belum tersedia."}
                    </p>
                  </div>
                </div>
              </div>

              {/* REKOMENDASI */}
              <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb size={24} />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Rekomendasi Utama
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Rekomendasi ditampilkan untuk periode prediksi berikutnya
                      yang belum dievaluasi.
                    </p>

                    <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                      <p className="font-semibold text-emerald-300 leading-relaxed">
                        {rekomendasiTeks}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AKSI CEPAT */}
              <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-white">Aksi Cepat</h2>
                    <p className="text-sm text-slate-400">
                      Petani hanya melihat informasi prediksi, cuaca, dan
                      rekomendasi.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QuickAction
                    title="Dashboard"
                    description="Kembali ke dashboard"
                    icon={BarChart3}
                    tone="emerald"
                    onClick={() => navigate("/petani")}
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
                    onClick={() => navigate("/petani/rekomendasi")}
                  />
                </div>
              </div>

              {/* TABEL PREDIKSI */}
              <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-white">
                      Daftar Hasil Prediksi
                    </h2>
                    <p className="text-sm text-slate-400">
                      Daftar prediksi yang dapat dilihat oleh petani.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                    {dataPrediksiUntukPetani.length} Periode
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0b1220] text-slate-400">
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
                              className="border-t border-slate-800 hover:bg-slate-800/60"
                            >
                              <td className="px-6 py-4 font-medium text-white">
                                {namaBulan(item.bulan)} {item.tahun}
                              </td>

                              <td className="px-6 py-4 text-slate-300">
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

                              <td className="px-6 py-4 text-slate-400">
                                Informasi awal untuk perencanaan kegiatan
                                pertanian.
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

              {/* CATATAN */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Info size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-emerald-300 mb-1">Catatan</h2>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Prediksi ini berasal dari data produksi bulanan Kabupaten
                    Sukoharjo. Informasi ini digunakan sebagai gambaran awal,
                    sehingga petani tetap perlu memperhatikan kondisi lahan,
                    cuaca, irigasi, hama, dan kesehatan tanaman secara langsung.
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
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    green: "bg-green-500/10 text-green-300 border border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
    orange:
      "bg-orange-500/10 text-orange-300 border border-orange-500/20",
    blue: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    red: "bg-red-500/10 text-red-300 border border-red-500/20",
  };

  return (
    <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-white">{value}</h3>
          <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
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
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <div className="flex items-center gap-2 text-slate-400 text-sm">
        <Icon size={16} className="text-cyan-300" />
        {label}
      </div>

      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

function QuickAction({ title, description, icon: Icon, tone, onClick }) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    orange:
      "bg-orange-500/10 text-orange-300 border border-orange-500/20",
    purple:
      "bg-purple-500/10 text-purple-300 border border-purple-500/20",
  };

  return (
    <button
      onClick={onClick}
      className="text-left p-5 border border-slate-800 bg-[#0b1220] rounded-2xl hover:bg-slate-800 hover:-translate-y-1 transition group"
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
          <h3 className="font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <ArrowRight
          size={18}
          className="text-slate-500 group-hover:text-cyan-300"
        />
      </div>
    </button>
  );
}