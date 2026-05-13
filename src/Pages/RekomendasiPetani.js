import { useEffect, useMemo, useState } from "react";
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
  CalendarDays,
  Info,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Bug,
  Sprout,
} from "lucide-react";

export default function RekomendasiPetani() {
  const [cuaca, setCuaca] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [lihatSemua, setLihatSemua] = useState(false);

  const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";
  const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";

  useEffect(() => {
    getRekomendasi();
  }, []);

  const getRekomendasi = async () => {
    try {
      setLoading(true);
      setError("");

      const [resRekomendasi, resEvaluasi] = await Promise.allSettled([
        axios.get(API_REKOMENDASI),
        axios.get(API_EVALUASI),
      ]);

      if (resRekomendasi.status === "rejected") {
        throw new Error("Gagal mengambil data rekomendasi dari backend.");
      }

      const payloadRekomendasi =
        resRekomendasi.value.data?.data || resRekomendasi.value.data || {};

      setCuaca(payloadRekomendasi.cuaca_terbaru || null);

      setRekomendasi(
        Array.isArray(payloadRekomendasi.rekomendasi)
          ? payloadRekomendasi.rekomendasi
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
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengambil data rekomendasi dari backend.");
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
      kategori === "Kelembapan Tinggi" ||
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
      kategori === "Kelembapan Tinggi" ||
      kategori === "Risiko Suhu Tinggi" ||
      kategori === "Risiko Suhu Rendah" ||
      kategori === "Potensi Hujan"
    ) {
      return "bg-red-50 border-red-100 text-red-700";
    }

    return "bg-blue-50 border-blue-100 text-blue-700";
  };

  const periodeEvaluasiSet = useMemo(() => {
    return new Set(
      evaluasiAktual.map(
        (item) => `${Number(item.tahun)}-${Number(item.bulan)}`
      )
    );
  }, [evaluasiAktual]);

  const rekomendasiBelumDievaluasi = useMemo(() => {
    return rekomendasi.filter(
      (item) =>
        !periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [rekomendasi, periodeEvaluasiSet]);

  const dataSumber = useMemo(() => {
    return rekomendasiBelumDievaluasi.length > 0
      ? rekomendasiBelumDievaluasi
      : rekomendasi;
  }, [rekomendasiBelumDievaluasi, rekomendasi]);

  const dataFiltered = useMemo(() => {
    return dataSumber.filter((item) => {
      return (
        filterKategori === "Semua" ||
        item.kategori_prediksi === filterKategori
      );
    });
  }, [dataSumber, filterKategori]);

  const dataTampil = lihatSemua ? dataFiltered : dataFiltered.slice(0, 6);

  const rekomendasiUtama = dataSumber[0] || null;

  const totalTinggi = dataSumber.filter(
    (item) => item.kategori_prediksi === "Tinggi"
  ).length;

  const totalSedang = dataSumber.filter(
    (item) => item.kategori_prediksi === "Sedang"
  ).length;

  const totalRendah = dataSumber.filter(
    (item) => item.kategori_prediksi === "Rendah"
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Rekomendasi Pertanian
            </h2>
            <p className="text-xs text-slate-500">
              Rekomendasi tindakan berdasarkan prediksi produksi padi dan
              kondisi lingkungan terbaru.
            </p>
          </div>

          <button
            onClick={getRekomendasi}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh Rekomendasi"}
          </button>
        </div>

        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Rekomendasi Pendukung Keputusan
              </p>

              <h1 className="text-3xl font-bold">Rekomendasi Pertanian</h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Rekomendasi ini membantu petani memahami tindakan awal
                berdasarkan hasil prediksi TES dan kondisi cuaca realtime.
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

        <section className="-mt-16 px-8 pb-8 space-y-6">
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Rekomendasi...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil hasil prediksi, evaluasi aktual, dan
                data cuaca terbaru.
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
                    Gagal Memuat Rekomendasi
                  </h2>

                  <p className="text-slate-600 mt-2">{error}</p>

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan backend Laravel berjalan dan endpoint{" "}
                    <span className="font-semibold">
                      /api/rekomendasi-prediksi
                    </span>{" "}
                    serta{" "}
                    <span className="font-semibold">
                      /api/tes/evaluasi-aktual
                    </span>{" "}
                    sudah aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Total Rekomendasi"
                  value={`${dataSumber.length} Data`}
                  subtitle="Periode prediksi"
                  icon={ClipboardList}
                  tone="blue"
                />

                <StatCard
                  title="Prediksi Tinggi"
                  value={`${totalTinggi} Periode`}
                  subtitle="Potensi produksi tinggi"
                  icon={TrendingUp}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Sedang"
                  value={`${totalSedang} Periode`}
                  subtitle="Produksi relatif stabil"
                  icon={BarChart3}
                  tone="yellow"
                />

                <StatCard
                  title="Prediksi Rendah"
                  value={`${totalRendah} Periode`}
                  subtitle="Perlu perhatian lingkungan"
                  icon={TrendingDown}
                  tone="red"
                />
              </div>

              <div
                className={`border rounded-2xl p-6 ${getCuacaBox(
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <InfoBox
                    icon={MapPin}
                    label="Lokasi"
                    value={cuaca?.kecamatan || "Sukoharjo"}
                    subtitle={cuaca?.desa || "Wilayah prediksi"}
                  />

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
                    subtitle={
                      cuaca?.tanggal ? formatTanggal(cuaca.tanggal) : "-"
                    }
                  />
                </div>
              </div>

              {rekomendasiUtama && (
                <div
                  className={`border rounded-2xl p-6 ${getBoxKategori(
                    rekomendasiUtama.kategori_prediksi
                  )}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        Rekomendasi Utama
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900 mt-2">
                        {namaBulan(rekomendasiUtama.bulan)}{" "}
                        {rekomendasiUtama.tahun}
                      </h2>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/80 ${getBadgeKategori(
                            rekomendasiUtama.kategori_prediksi
                          )}`}
                        >
                          Prediksi {rekomendasiUtama.kategori_prediksi}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                          {formatAngka(rekomendasiUtama.prediksi)} Ton
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed mt-5 max-w-4xl">
                        {rekomendasiUtama.rekomendasi ||
                          "Rekomendasi belum tersedia."}
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-5 min-w-[230px]">
                      <p className="text-sm text-slate-500">
                        Dasar Rekomendasi
                      </p>

                      <h3 className="text-lg font-bold text-emerald-700 mt-2">
                        TES + Rule Based
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        Prediksi dihitung dari data produksi bulanan. Cuaca
                        realtime dipakai sebagai pendukung rekomendasi kondisi
                        lingkungan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">
                  Rekomendasi Tindakan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ActionGuide
                    title="Prediksi Tinggi"
                    description="Siapkan tenaga panen, alat panen, tempat penyimpanan, dan distribusi hasil panen."
                    icon={CheckCircle2}
                    tone="emerald"
                  />

                  <ActionGuide
                    title="Prediksi Sedang"
                    description="Lakukan pemantauan rutin terhadap kondisi tanaman, kebutuhan air, dan kondisi lingkungan."
                    icon={Sprout}
                    tone="yellow"
                  />

                  <ActionGuide
                    title="Prediksi Rendah"
                    description="Perhatikan kondisi lingkungan, kelembapan, serta potensi gangguan tanaman berdasarkan kondisi cuaca."
                    icon={Bug}
                    tone="red"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Daftar Rekomendasi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan rekomendasi berdasarkan hasil prediksi
                      produksi padi dan kondisi lingkungan terbaru.
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

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Rekomendasi Periode Mendatang
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

                            <td className="px-6 py-4 text-slate-600 max-w-lg leading-relaxed">
                              {item.rekomendasi || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data rekomendasi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center shrink-0">
                  <Info size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-emerald-800 mb-1">Catatan</h2>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Prediksi produksi padi dihitung menggunakan metode Triple
                    Exponential Smoothing berdasarkan data historis produksi
                    bulanan Kabupaten Sukoharjo. Data cuaca realtime digunakan
                    sebagai pendukung rekomendasi kondisi lingkungan dan bukan
                    sebagai input utama perhitungan prediksi.
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

function ActionGuide({ title, description, icon: Icon, tone }) {
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