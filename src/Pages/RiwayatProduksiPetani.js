import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  RefreshCw,
  AlertTriangle,
  Search,
  Leaf,
  Wheat,
  BarChart3,
  TrendingUp,
  CalendarDays,
  Info,
  ClipboardList,
  Activity,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export default function RiwayatProduksiPetani() {
  const [dataPanen, setDataPanen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lihatSemua, setLihatSemua] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/panen";

  useEffect(() => {
    getDataPanen();
  }, []);

  const getDataPanen = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_URL);

      const hasil = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const sorted = [...hasil].sort((a, b) => {
        return new Date(b.tanggal) - new Date(a.tanggal);
      });

      setDataPanen(sorted);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil riwayat produksi dari backend.");
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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

  const getStatusProduksi = (hasil) => {
    const nilai = Number(hasil);

    if (nilai >= 8) {
      return {
        label: "Tinggi",
        className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        boxClass: "bg-emerald-50 border-emerald-100 text-emerald-700",
      };
    }

    if (nilai >= 4) {
      return {
        label: "Sedang",
        className: "bg-yellow-50 text-yellow-700 border-yellow-100",
        boxClass: "bg-yellow-50 border-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Rendah",
      className: "bg-red-50 text-red-700 border-red-100",
      boxClass: "bg-red-50 border-red-100 text-red-700",
    };
  };

  const dataFiltered = useMemo(() => {
    return dataPanen.filter((item) => {
      const keyword = search.toLowerCase();

      const namaLahan = item.lahan?.nama?.toLowerCase() || "";
      const tanggal = item.tanggal?.toLowerCase() || "";
      const keterangan = item.keterangan?.toLowerCase() || "";
      const kecamatan = item.lahan?.kecamatan?.toLowerCase() || "";
      const desa = item.lahan?.desa?.toLowerCase() || "";

      return (
        namaLahan.includes(keyword) ||
        tanggal.includes(keyword) ||
        keterangan.includes(keyword) ||
        kecamatan.includes(keyword) ||
        desa.includes(keyword)
      );
    });
  }, [dataPanen, search]);

  const dataTampil = lihatSemua ? dataFiltered : dataFiltered.slice(0, 6);

  const totalData = dataPanen.length;

  const totalProduksi = dataPanen.reduce((total, item) => {
    return total + (Number(item.hasil) || 0);
  }, 0);

  const rataRataProduksi =
    dataPanen.length > 0 ? totalProduksi / dataPanen.length : 0;

  const produksiTertinggi =
    dataPanen.length > 0
      ? dataPanen.reduce((max, item) =>
          Number(item.hasil) > Number(max.hasil) ? item : max
        )
      : null;

  const produksiTerbaru = dataPanen.length > 0 ? dataPanen[0] : null;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Riwayat Produksi</h2>
            <p className="text-xs text-slate-500">
              Catatan hasil panen berdasarkan data produksi yang tersimpan.
            </p>
          </div>

          <button
            onClick={getDataPanen}
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
                Catatan Produksi Panen Petani
              </p>

              <h1 className="text-3xl font-bold">Riwayat Produksi</h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Halaman ini menampilkan riwayat hasil panen berdasarkan lahan,
                tanggal panen, jumlah produksi, status produksi, dan keterangan
                panen yang tersimpan di sistem.
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
                Memuat Riwayat Produksi...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data panen terbaru dari backend.
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
                    Pastikan backend Laravel sudah berjalan dan endpoint{" "}
                    <span className="font-semibold">/api/panen</span> sudah
                    aktif.
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
                  title="Total Data Panen"
                  value={`${totalData} Data`}
                  subtitle="Jumlah riwayat produksi"
                  icon={ClipboardList}
                  tone="blue"
                />

                <StatCard
                  title="Total Produksi"
                  value={`${formatAngka(totalProduksi)} Ton`}
                  subtitle="Akumulasi hasil panen"
                  icon={Wheat}
                  tone="emerald"
                />

                <StatCard
                  title="Rata-rata Produksi"
                  value={`${formatAngka(rataRataProduksi)} Ton`}
                  subtitle="Rata-rata setiap panen"
                  icon={BarChart3}
                  tone="green"
                />

                <StatCard
                  title="Produksi Tertinggi"
                  value={
                    produksiTertinggi
                      ? `${formatAngka(produksiTertinggi.hasil)} Ton`
                      : "-"
                  }
                  subtitle={produksiTertinggi?.lahan?.nama || "Belum tersedia"}
                  icon={TrendingUp}
                  tone="orange"
                />
              </div>

              {/* PRODUKSI TERBARU */}
              {produksiTerbaru && (
                <div
                  className={`border rounded-2xl p-6 ${
                    getStatusProduksi(produksiTerbaru.hasil).boxClass
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <p className="text-sm font-semibold opacity-90">
                        Produksi Terbaru
                      </p>

                      <h2 className="text-2xl font-bold text-slate-900 mt-2">
                        {produksiTerbaru.lahan?.nama || "-"}
                      </h2>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                          {formatTanggal(produksiTerbaru.tanggal)}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                          {formatAngka(produksiTerbaru.hasil)} Ton
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border bg-white/80 ${
                            getStatusProduksi(produksiTerbaru.hasil).className
                          }`}
                        >
                          {getStatusProduksi(produksiTerbaru.hasil).label}
                        </span>
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed mt-5 max-w-4xl">
                        {produksiTerbaru.keterangan ||
                          "Belum ada keterangan tambahan untuk data panen ini."}
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-2xl p-5 min-w-[220px]">
                      <p className="text-sm text-slate-500">
                        Lokasi Lahan
                      </p>

                      <h3 className="text-lg font-bold text-slate-800 mt-2">
                        {produksiTerbaru.lahan?.kecamatan || "-"}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        {produksiTerbaru.lahan?.desa || "Desa belum tersedia"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FILTER */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Daftar Riwayat Produksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Riwayat hasil panen berdasarkan lahan dan tanggal panen.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-[360px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                    <Search size={18} className="text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari lahan, tanggal, kecamatan..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent outline-none text-sm w-full text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* TABEL */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Riwayat Produksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan {dataTampil.length} dari {dataFiltered.length}{" "}
                      data produksi.
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
                          Lahan
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Tanggal Panen
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Hasil Panen
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Status
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Keterangan
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataTampil.length > 0 ? (
                        dataTampil.map((item, index) => {
                          const status = getStatusProduksi(item.hasil);

                          return (
                            <tr
                              key={item.id || index}
                              className="border-t border-slate-100 hover:bg-slate-50 transition"
                            >
                              <td className="px-6 py-4 text-slate-500">
                                {index + 1}
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <Wheat size={18} />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {item.lahan?.nama || "-"}
                                    </p>

                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                      <MapPin size={12} />
                                      {item.lahan?.kecamatan || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 text-slate-600">
                                <div className="flex items-center gap-2">
                                  <CalendarDays
                                    size={16}
                                    className="text-emerald-600"
                                  />
                                  {formatTanggal(item.tanggal)}
                                </div>
                              </td>

                              <td className="px-6 py-4 font-bold text-emerald-700">
                                {formatAngka(item.hasil)} Ton
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-slate-600 max-w-lg leading-relaxed">
                                {item.keterangan || "-"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada riwayat produksi.
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
                  <h2 className="font-bold text-emerald-800 mb-1">Catatan</h2>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Riwayat produksi digunakan untuk melihat catatan hasil panen
                    yang sudah terjadi. Data ini berbeda dengan Data Historis
                    TES, karena Data Historis TES merupakan data produksi
                    bulanan kabupaten yang digunakan untuk menghitung prediksi.
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
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
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