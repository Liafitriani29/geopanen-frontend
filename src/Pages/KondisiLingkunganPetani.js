import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  RefreshCw,
  AlertTriangle,
  Leaf,
  CloudSun,
  Thermometer,
  Droplets,
  MapPin,
  Waves,
  Bug,
  Sprout,
} from "lucide-react";

export default function KondisiLingkunganPetani() {
  const [cuaca, setCuaca] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";

  useEffect(() => {
    getKondisiLingkungan();
  }, []);

  const getKondisiLingkungan = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_REKOMENDASI);

      const payload = res.data?.data || res.data || {};

      setCuaca(payload.cuaca_terbaru || null);

      setRekomendasi(
        Array.isArray(payload.rekomendasi) ? payload.rekomendasi : []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data kondisi lingkungan dari backend."
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

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getBadgeCuaca = (kategori) => {
    if (kategori === "Cuaca Mendukung") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (
      kategori === "Kelembaban Tinggi" ||
      kategori === "Kelembapan Tinggi" ||
      kategori === "Risiko Suhu Tinggi" ||
      kategori === "Risiko Suhu Rendah" ||
      kategori === "Potensi Hujan"
    ) {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const getBoxCuaca = (kategori) => {
    if (kategori === "Cuaca Mendukung") {
      return "bg-emerald-50 border-emerald-100 text-emerald-700";
    }

    if (
      kategori === "Kelembaban Tinggi" ||
      kategori === "Kelembapan Tinggi" ||
      kategori === "Risiko Suhu Tinggi" ||
      kategori === "Risiko Suhu Rendah" ||
      kategori === "Potensi Hujan"
    ) {
      return "bg-red-50 border-red-100 text-red-700";
    }

    return "bg-blue-50 border-blue-100 text-blue-700";
  };

  const getStatusSuhu = (suhu) => {
    if (suhu === null || suhu === undefined) {
      return {
        label: "Belum Ada Data",
        className: "bg-slate-50 text-slate-700 border-slate-100",
        catatan: "Data suhu belum tersedia.",
      };
    }

    if (Number(suhu) < 20) {
      return {
        label: "Suhu Rendah",
        className: "bg-blue-50 text-blue-700 border-blue-100",
        catatan:
          "Suhu rendah dapat menghambat pertumbuhan tanaman. Petani perlu memantau perkembangan tanaman secara rutin.",
      };
    }

    if (Number(suhu) > 35) {
      return {
        label: "Suhu Tinggi",
        className: "bg-red-50 text-red-700 border-red-100",
        catatan:
          "Suhu tinggi dapat menyebabkan tanaman mengalami stres panas. Pastikan ketersediaan air dan pengairan tetap mencukupi.",
      };
    }

    return {
      label: "Suhu Sesuai",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      catatan:
        "Suhu masih berada pada rentang yang mendukung pertumbuhan tanaman padi.",
    };
  };

  const getStatusKelembaban = (kelembaban) => {
    if (kelembaban === null || kelembaban === undefined) {
      return {
        label: "Belum Ada Data",
        className: "bg-slate-50 text-slate-700 border-slate-100",
        catatan: "Data kelembapan belum tersedia.",
      };
    }

    if (Number(kelembaban) >= 85) {
      return {
        label: "Kelembapan Tinggi",
        className: "bg-red-50 text-red-700 border-red-100",
        catatan:
          "Kelembapan tinggi dapat meningkatkan risiko hama, jamur, dan penyakit tanaman.",
      };
    }

    if (Number(kelembaban) < 50) {
      return {
        label: "Kelembapan Rendah",
        className: "bg-yellow-50 text-yellow-700 border-yellow-100",
        catatan:
          "Kelembapan rendah dapat memengaruhi kondisi tanaman. Perhatikan kebutuhan air dan kondisi tanah.",
      };
    }

    return {
      label: "Kelembapan Sesuai",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
      catatan: "Kelembapan masih berada pada kondisi yang cukup mendukung.",
    };
  };

  const statusSuhu = getStatusSuhu(cuaca?.suhu);
  const statusKelembaban = getStatusKelembaban(cuaca?.kelembaban);

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Kondisi Lingkungan</h2>
            <p className="text-xs text-slate-500">
              Informasi suhu, kelembapan, cuaca, dan risiko lingkungan untuk
              petani.
            </p>
          </div>

          <button
            onClick={getKondisiLingkungan}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh Data"}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Pemantauan Cuaca dan Lingkungan
              </p>

              <h1 className="text-3xl font-bold">Kondisi Lingkungan</h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Halaman ini menampilkan data cuaca terakhir sebagai informasi
                pendukung rekomendasi pertanian.
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
                    {loading
                      ? "Memuat Data"
                      : cuaca
                      ? "Data Tersedia"
                      : "Belum Ada Data"}
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
                Memuat Kondisi Lingkungan...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data cuaca dan rekomendasi terbaru.
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
              {/* RINGKASAN CUACA */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Lokasi"
                  value={cuaca?.kecamatan || "Sukoharjo"}
                  subtitle={cuaca?.desa || "Wilayah prediksi"}
                  icon={MapPin}
                  tone="emerald"
                />

                <StatCard
                  title="Suhu"
                  value={
                    cuaca?.suhu !== null && cuaca?.suhu !== undefined
                      ? `${formatAngka(cuaca.suhu)}°C`
                      : "-"
                  }
                  subtitle={statusSuhu.label}
                  icon={Thermometer}
                  tone="orange"
                />

                <StatCard
                  title="Kelembapan"
                  value={
                    cuaca?.kelembaban !== null &&
                    cuaca?.kelembaban !== undefined
                      ? `${formatAngka(cuaca.kelembaban)}%`
                      : "-"
                  }
                  subtitle={statusKelembaban.label}
                  icon={Droplets}
                  tone="blue"
                />

                <StatCard
                  title="Data Cuaca Terakhir"
                  value={cuaca?.kondisi || "-"}
                  subtitle={cuaca?.tanggal ? formatTanggal(cuaca.tanggal) : "-"}
                  icon={CloudSun}
                  tone="green"
                />
              </div>

              {/* STATUS LINGKUNGAN */}
              <div
                className={`border rounded-2xl p-6 ${getBoxCuaca(
                  cuaca?.kategori_cuaca
                )}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div>
                    <p className="text-sm font-semibold opacity-90">
                      Status Lingkungan Saat Ini
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900 mt-2">
                      {cuaca?.kategori_cuaca || "Belum Ada Data"}
                    </h2>

                    <p className="text-sm text-slate-700 leading-relaxed mt-4 max-w-4xl">
                      {cuaca?.catatan_cuaca ||
                        "Data cuaca terbaru belum tersedia. Silakan lakukan integrasi cuaca terlebih dahulu."}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border bg-white/80 ${getBadgeCuaca(
                      cuaca?.kategori_cuaca
                    )}`}
                  >
                    {cuaca?.kategori_cuaca || "Belum Ada Data"}
                  </span>
                </div>
              </div>

              {/* ANALISIS SUHU DAN KELEMBAPAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnalysisCard
                  title="Analisis Suhu"
                  description="Penilaian sederhana berdasarkan suhu terakhir."
                  status={statusSuhu.label}
                  note={statusSuhu.catatan}
                  icon={Thermometer}
                  className={statusSuhu.className}
                />

                <AnalysisCard
                  title="Analisis Kelembapan"
                  description="Penilaian sederhana berdasarkan kelembapan terakhir."
                  status={statusKelembaban.label}
                  note={statusKelembaban.catatan}
                  icon={Droplets}
                  className={statusKelembaban.className}
                />
              </div>

              {/* SARAN LINGKUNGAN */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Saran Pemantauan Lingkungan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SuggestionCard
                    title="Pemantauan Tanaman"
                    description="Periksa kondisi tanaman secara berkala, terutama jika kondisi cuaca kurang mendukung."
                    icon={Sprout}
                    tone="emerald"
                  />

                  <SuggestionCard
                    title="Kebutuhan Air"
                    description="Pastikan ketersediaan air mencukupi, terutama jika suhu meningkat atau kondisi mulai kering."
                    icon={Waves}
                    tone="blue"
                  />

                  <SuggestionCard
                    title="Hama dan Penyakit"
                    description="Jika kelembapan tinggi, tingkatkan kewaspadaan terhadap hama, jamur, dan penyakit tanaman."
                    icon={Bug}
                    tone="red"
                  />
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
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 capitalize truncate">
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

function AnalysisCard({
  title,
  description,
  status,
  note,
  icon: Icon,
  className,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${className}`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mt-5">{note}</p>
    </div>
  );
}

function SuggestionCard({ title, description, icon: Icon, tone }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${
        toneClass[tone] || toneClass.emerald
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>

      <h3 className="font-bold">{title}</h3>
      <p className="text-sm leading-relaxed mt-3 opacity-90">{description}</p>
    </div>
  );
}