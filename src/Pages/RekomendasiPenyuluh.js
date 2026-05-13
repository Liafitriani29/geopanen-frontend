import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  AlertTriangle,
  CheckCircle2,
  CloudSun,
  ClipboardList,
  RefreshCw,
  Search,
  Filter,
  Leaf,
  Thermometer,
  Droplets,
  CalendarDays,
  Info,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Bug,
  Waves,
  Sprout,
  Percent,
} from "lucide-react";

export default function RekomendasiPenyuluh() {
  const [ringkasan, setRingkasan] = useState(null);
  const [cuaca, setCuaca] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [search, setSearch] = useState("");
  const [lihatSemua, setLihatSemua] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/rekomendasi-prediksi";

  useEffect(() => {
    getRekomendasiPenyuluh();
  }, []);

  const getRekomendasiPenyuluh = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_URL);
      const payload = res.data?.data || res.data || {};

      setRingkasan(payload.ringkasan || null);
      setCuaca(payload.cuaca_terbaru || null);
      setRekomendasi(
        Array.isArray(payload.rekomendasi) ? payload.rekomendasi : []
      );
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data rekomendasi penyuluh dari backend.");
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

  const getBoxKategori = (kategori) => {
    if (kategori === "Tinggi") {
      return "bg-emerald-50 border-emerald-100 text-emerald-700";
    }

    if (kategori === "Sedang") {
      return "bg-yellow-50 border-yellow-100 text-yellow-700";
    }

    if (kategori === "Rendah") {
      return "bg-red-50 border-red-100 text-red-700";
    }

    return "bg-slate-50 border-slate-100 text-slate-700";
  };

  const getCuacaBadge = (kategori) => {
    if (kategori === "Cuaca Mendukung") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (
      kategori === "Kelembaban Tinggi" ||
      kategori === "Risiko Suhu Tinggi" ||
      kategori === "Risiko Suhu Rendah" ||
      kategori === "Potensi Hujan"
    ) {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const getCuacaBox = (kategori) => {
    if (kategori === "Cuaca Mendukung") {
      return "bg-emerald-50 border-emerald-100 text-emerald-700";
    }

    if (
      kategori === "Kelembaban Tinggi" ||
      kategori === "Risiko Suhu Tinggi" ||
      kategori === "Risiko Suhu Rendah" ||
      kategori === "Potensi Hujan"
    ) {
      return "bg-red-50 border-red-100 text-red-700";
    }

    return "bg-blue-50 border-blue-100 text-blue-700";
  };

  const getTindakanSingkat = (item) => {
    if (!item) return "-";

    if (item.kategori_prediksi === "Tinggi") {
      return "Arahkan kesiapan panen, penyimpanan, dan distribusi hasil.";
    }

    if (item.kategori_prediksi === "Sedang") {
      return "Lakukan pemantauan rutin terhadap tanaman, air, dan cuaca.";
    }

    if (item.kategori_prediksi === "Rendah") {
      return "Prioritaskan pendampingan terkait air, cuaca, dan potensi gangguan tanaman berdasarkan kondisi lapangan.";
    }

    return "Lakukan pengecekan lapangan sesuai kondisi wilayah.";
  };

  const getArahanPrioritas = (item) => {
    if (!item) return "Belum ada arahan pendampingan.";

    if (item.kategori_prediksi === "Tinggi") {
      return "Penyuluh dapat mengarahkan petani untuk menyiapkan tenaga panen, alat panen, penyimpanan, serta strategi distribusi hasil karena produksi diperkirakan tinggi.";
    }

    if (item.kategori_prediksi === "Sedang") {
     return "Penyuluh dapat melakukan pemantauan rutin agar kondisi tanaman tetap stabil, terutama pada aspek kebutuhan air, pemupukan, dan kondisi lingkungan.";
    }

    if (item.kategori_prediksi === "Rendah") {
     return "Penyuluh perlu memprioritaskan pendampingan pada periode ini dengan memperhatikan irigasi, cuaca, kelembapan, dan potensi gangguan tanaman.";
    }

    return "Lakukan pengecekan lanjutan sesuai kondisi lapangan.";
  };

  const dataFiltered = useMemo(() => {
    return rekomendasi.filter((item) => {
      const keyword = search.toLowerCase();

      const cocokSearch =
        String(item.tahun || "").includes(keyword) ||
        String(namaBulan(item.bulan) || "").toLowerCase().includes(keyword) ||
        String(item.kategori_prediksi || "").toLowerCase().includes(keyword) ||
        String(item.rekomendasi || "").toLowerCase().includes(keyword);

      const cocokKategori =
        filterKategori === "Semua" ||
        item.kategori_prediksi === filterKategori;

      return cocokSearch && cocokKategori;
    });
  }, [rekomendasi, search, filterKategori]);

  const dataTampil = lihatSemua ? dataFiltered : dataFiltered.slice(0, 6);

  const totalTinggi = rekomendasi.filter(
    (item) => item.kategori_prediksi === "Tinggi"
  ).length;

  const totalSedang = rekomendasi.filter(
    (item) => item.kategori_prediksi === "Sedang"
  ).length;

  const totalRendah = rekomendasi.filter(
    (item) => item.kategori_prediksi === "Rendah"
  ).length;

  const rekomendasiPrioritas =
    rekomendasi.find((item) => item.kategori_prediksi === "Rendah") ||
    rekomendasi.find((item) => item.kategori_prediksi === "Sedang") ||
    rekomendasi[0] ||
    null;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Rekomendasi Penyuluh
            </h2>
            <p className="text-xs text-slate-500">
              Rekomendasi pendampingan berdasarkan prediksi produksi padi dan
              kondisi cuaca.
            </p>
          </div>

          <button
            onClick={getRekomendasiPenyuluh}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh Rekomendasi"}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Pendampingan Berbasis Prediksi TES
              </p>

              <h1 className="text-3xl font-bold">Rekomendasi Penyuluh</h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Halaman ini membantu penyuluh membaca rekomendasi sistem
                berdasarkan hasil prediksi produksi padi Kabupaten Sukoharjo
                dan kondisi cuaca terbaru untuk menentukan arahan pendampingan.
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
          {/* LOADING */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Rekomendasi Penyuluh...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil rekomendasi, prediksi, dan cuaca
                terbaru dari backend.
              </p>
            </div>
          )}

          {/* ERROR */}
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
              {/* SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Total Rekomendasi"
                  value={`${rekomendasi.length} Data`}
                  subtitle="Periode prediksi mendatang"
                  icon={ClipboardList}
                  tone="blue"
                />

                <StatCard
                  title="Prediksi Tinggi"
                  value={`${totalTinggi} Periode`}
                  subtitle="Periode potensi produksi tinggi"
                  icon={TrendingUp}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Sedang"
                  value={`${totalSedang} Periode`}
                  subtitle="Periode produksi relatif stabil"
                  icon={BarChart3}
                  tone="yellow"
                />

                <StatCard
                  title="Prediksi Rendah"
                  value={`${totalRendah} Periode`}
                  subtitle="Periode perlu pendampingan"
                  icon={TrendingDown}
                  tone="red"
                />
              </div>

              {/* CUACA DAN KUALITAS */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div
                  className={`xl:col-span-2 border rounded-2xl p-6 ${getCuacaBox(
                    cuaca?.kategori_cuaca
                  )}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        Kondisi Cuaca Terbaru
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900 mt-2">
                        {cuaca?.kategori_cuaca || "Belum Ada Data Cuaca"}
                      </h2>

                      <p className="text-sm text-slate-700 leading-relaxed mt-4 max-w-4xl">
                        {cuaca?.catatan_cuaca ||
                          "Data cuaca terbaru belum tersedia."}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border bg-white/80 ${getCuacaBadge(
                        cuaca?.kategori_cuaca
                      )}`}
                    >
                      {cuaca?.kategori_cuaca || "Belum Ada Data"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <InfoBox
                      icon={Thermometer}
                      label="Suhu"
                      value={
                        cuaca?.suhu !== null && cuaca?.suhu !== undefined
                          ? `${formatAngka(cuaca.suhu)}°C`
                          : "-"
                      }
                      subtitle="Suhu terbaru"
                    />

                    <InfoBox
                      icon={Droplets}
                      label="Kelembapan"
                      value={
                        cuaca?.kelembaban !== null &&
                        cuaca?.kelembaban !== undefined
                          ? `${formatAngka(cuaca.kelembaban)}%`
                          : "-"
                      }
                      subtitle="Kelembapan udara"
                    />

                    <InfoBox
                      icon={CloudSun}
                      label="Kondisi"
                      value={cuaca?.kondisi || "-"}
                      subtitle="Cuaca saat ini"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800">
                    Kualitas Prediksi
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Ringkasan akurasi model TES.
                  </p>

                  <div className="grid grid-cols-1 gap-3 mt-5">
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 text-sm">
                        <Percent size={17} />
                        MAPE
                      </div>
                      <h3 className="text-2xl font-bold text-amber-700 mt-2">
                        {formatAngka(ringkasan?.mape)}%
                      </h3>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-700 text-sm">
                        <CheckCircle2 size={17} />
                        Estimasi Akurasi
                      </div>
                      <h3 className="text-2xl font-bold text-emerald-700 mt-2">
                        {formatAngka(ringkasan?.estimasiAkurasi)}%
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    MAPE digunakan penyuluh untuk memahami kualitas prediksi.
                    Hasil ini tetap perlu dipadukan dengan observasi lapangan.
                  </p>
                </div>
              </div>

              {/* PRIORITAS */}
              {rekomendasiPrioritas && (
                <div
                  className={`border rounded-2xl p-6 ${getBoxKategori(
                    rekomendasiPrioritas.kategori_prediksi
                  )}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        Prioritas Pendampingan
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900 mt-2">
                        {namaBulan(rekomendasiPrioritas.bulan)}{" "}
                        {rekomendasiPrioritas.tahun}
                      </h2>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/80 ${getBadgeKategori(
                            rekomendasiPrioritas.kategori_prediksi
                          )}`}
                        >
                          Prediksi {rekomendasiPrioritas.kategori_prediksi}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                          {formatAngka(rekomendasiPrioritas.prediksi)} Ton
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed mt-5 max-w-4xl">
                        {rekomendasiPrioritas.rekomendasi ||
                          getArahanPrioritas(rekomendasiPrioritas)}
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-5 min-w-[230px]">
                      <p className="text-sm text-slate-500">
                        Arahan Penyuluh
                      </p>

                      <h3 className="text-lg font-bold text-emerald-700 mt-2">
                        Pendampingan Lapangan
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Gunakan rekomendasi ini sebagai dasar awal untuk
                        memberikan arahan kepada petani.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PANDUAN */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Panduan Pendampingan Penyuluh
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GuideCard
                    title="Prediksi Tinggi"
                    description="Arahkan petani menyiapkan tenaga panen, alat panen, penyimpanan, dan distribusi hasil."
                    icon={CheckCircle2}
                    tone="emerald"
                  />

                  <GuideCard
                    title="Prediksi Sedang"
                    description="Lakukan pendampingan rutin terkait kondisi tanaman, kebutuhan air, dan pemantauan cuaca."
                    icon={Sprout}
                    tone="yellow"
                  />

                  <GuideCard
  title="Prediksi Rendah"
  description="Prioritaskan pengecekan air, kelembapan, cuaca, dan potensi gangguan tanaman pada periode ini."
  icon={Bug}
  tone="red"
/>
                </div>
              </div>

              {/* FILTER */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Daftar Rekomendasi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Ringkasan tindakan pendampingan berdasarkan periode
                      prediksi.
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex items-center gap-2 w-full md:w-[280px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                      <Search size={18} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari periode/kategori..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full text-slate-600"
                      />
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
              </div>

              {/* TABEL */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Rekomendasi Pendampingan
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan {dataTampil.length} dari{" "}
                      {dataFiltered.length} data rekomendasi.
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
                          Prediksi Produksi
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Tindakan Singkat
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Rekomendasi Sistem
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
                                    Periode rekomendasi
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
                                  item.kategori_prediksi
                                )}`}
                              >
                                {item.kategori_prediksi || "-"}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-slate-700 font-semibold">
                              {getTindakanSingkat(item)}
                            </td>

                            <td className="px-6 py-4 text-slate-600 max-w-lg leading-relaxed">
                              {item.rekomendasi ||
                                getArahanPrioritas(item) ||
                                "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data rekomendasi penyuluh.
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
                    Rekomendasi ini digunakan sebagai dasar awal pendampingan.
                  Penyuluh tetap perlu menyesuaikan arahan dengan kondisi
nyata di lapangan, termasuk ketersediaan air, kelembapan,
kondisi tanaman, dan perubahan cuaca.
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
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
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

function InfoBox({ icon: Icon, label, value, subtitle }) {
  return (
    <div className="bg-white/80 border border-white/70 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
        <Icon size={17} className="text-emerald-600" />
        {label}
      </div>

      <h3 className="font-bold text-slate-800 capitalize">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function GuideCard({ title, description, icon: Icon, tone }) {
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
      <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>

      <h3 className="font-bold">{title}</h3>
      <p className="text-sm leading-relaxed mt-3 opacity-90">{description}</p>
    </div>
  );
}