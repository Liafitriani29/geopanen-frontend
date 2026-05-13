import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  RefreshCw,
  Database,
  CalendarRange,
  BarChart3,
  Clock3,
  FileSpreadsheet,
  X,
  Save,
  Info,
  AlertTriangle,
} from "lucide-react";

export default function DataHistorisTES() {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [lihatSemuaData, setLihatSemuaData] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    kabupaten: "Sukoharjo",
    tahun: "",
    bulan: "",
    produksi: "",
  });

  const API_URL = "http://127.0.0.1:8000/api/produksi-bulanan";

  const bulanList = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const getNamaBulan = (bulan) => {
    const item = bulanList.find((b) => b.value === Number(bulan));
    return item ? item.label : "-";
  };

  const parseNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;

    return (
      parseFloat(value.toString().replace(/\./g, "").replace(",", ".")) || 0
    );
  };

  const formatAngka = (angka) => {
    if (angka === null || angka === undefined) return "-";

    return Number(angka).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL);

      const hasil = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const sorted = [...hasil].sort((a, b) => {
        if (Number(b.tahun) !== Number(a.tahun)) {
          return Number(b.tahun) - Number(a.tahun);
        }

        return Number(b.bulan) - Number(a.bulan);
      });

      setData(sorted);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data historis TES");
    } finally {
      setLoading(false);
    }
  };

  const tahunList = useMemo(() => {
    return ["Semua", ...new Set(data.map((item) => String(item.tahun)))];
  }, [data]);

  const dataFiltered = useMemo(() => {
    return data.filter((item) => {
      const cocokTahun =
        filterTahun === "Semua" || String(item.tahun) === filterTahun;

      const keyword = search.toLowerCase();

      const cocokSearch =
        item.kabupaten?.toLowerCase().includes(keyword) ||
        String(item.tahun).includes(keyword) ||
        getNamaBulan(item.bulan).toLowerCase().includes(keyword) ||
        String(item.produksi).includes(keyword);

      return cocokTahun && cocokSearch;
    });
  }, [data, filterTahun, search]);

  const dataTampil = lihatSemuaData
    ? dataFiltered
    : dataFiltered.slice(0, 12);

  const dataTidakSesuai = useMemo(() => {
    return data.filter((item) => Number(item.tahun) > 2024);
  }, [data]);

  const totalData = data.length;

  const tahunAwal =
    data.length > 0 ? Math.min(...data.map((item) => Number(item.tahun))) : "-";

  const tahunAkhir =
    data.length > 0 ? Math.max(...data.map((item) => Number(item.tahun))) : "-";

  const rataRataProduksi =
    data.length > 0
      ? data.reduce((total, item) => total + parseNumber(item.produksi), 0) /
        data.length
      : 0;

  const dataTerbaru =
    data.length > 0
      ? data.reduce((latest, item) => {
          const latestKey = Number(latest.tahun) * 100 + Number(latest.bulan);
          const itemKey = Number(item.tahun) * 100 + Number(item.bulan);
          return itemKey > latestKey ? item : latest;
        })
      : null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      id: null,
      kabupaten: "Sukoharjo",
      tahun: "",
      bulan: "",
      produksi: "",
    });

    setIsEdit(false);
    setShowModal(false);
  };

  const openTambahModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      kabupaten: item.kabupaten || "Sukoharjo",
      tahun: item.tahun || "",
      bulan: item.bulan || "",
      produksi: item.produksi || "",
    });

    setIsEdit(true);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.tahun || !form.bulan || !form.produksi) {
      alert("Tahun, bulan, dan produksi wajib diisi!");
      return;
    }

    if (Number(form.tahun) < 2021) {
      alert("Tahun data historis TES minimal 2021.");
      return;
    }

    if (Number(form.tahun) > 2024) {
      alert(
        "Data Historis TES hanya boleh sampai tahun 2024. Data aktual tahun 2025 harus dimasukkan melalui menu Evaluasi Aktual TES."
      );
      return;
    }

    const payload = {
      kabupaten: form.kabupaten || "Sukoharjo",
      tahun: Number(form.tahun),
      bulan: Number(form.bulan),
      produksi: Number(form.produksi),
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`${API_URL}/${form.id}`, payload);
        alert("Data historis TES berhasil diupdate");
      } else {
        await axios.post(API_URL, payload);
        alert("Data historis TES berhasil ditambahkan");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error(err.response?.data || err);

      const pesan =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Gagal menyimpan data historis TES";

      alert(pesan);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const konfirmasi = window.confirm(
      "Yakin ingin menghapus data historis TES ini?"
    );

    if (!konfirmasi) return;

    try {
      setLoading(true);

      await axios.delete(`${API_URL}/${id}`);

      alert("Data historis TES berhasil dihapus");
      await fetchData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data historis TES");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden bg-[#020617]">
        {/* TOPBAR */}
        <div className="h-16 bg-[#081226] border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 w-[420px] bg-[#0b1220] border border-slate-800 rounded-xl px-4 py-2">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="Cari tahun, bulan, kabupaten, produksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="border border-slate-800 bg-[#0b1220] text-slate-200 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {tahunList.map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun === "Semua" ? "Semua Tahun" : tahun}
                </option>
              ))}
            </select>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 border border-slate-800 bg-[#0b1220] text-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={openTambahModal}
              className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-950/30"
            >
              <PlusCircle size={18} />
              Tambah Data
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] border-b border-slate-800 px-8 pt-8 pb-24 text-white">
          <div>
            <p className="text-cyan-300 text-sm mb-2">
              Data Input Triple Exponential Smoothing
            </p>

            <h1 className="text-3xl font-bold">Data Historis TES</h1>

            <p className="text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Kelola data produksi bulanan periode 2021–2024 sebagai input
              perhitungan prediksi panen menggunakan metode Triple Exponential
              Smoothing. Data aktual tahun 2025 dimasukkan melalui menu Evaluasi
              Aktual TES.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Data"
              value={`${totalData} Data`}
              subtitle="Data produksi bulanan"
              icon={Database}
              tone="emerald"
            />

            <StatCard
              title="Rentang Tahun"
              value={`${tahunAwal}–${tahunAkhir}`}
              subtitle="Periode data historis"
              icon={CalendarRange}
              tone="cyan"
            />

            <StatCard
              title="Rata-rata Produksi"
              value={`${formatAngka(rataRataProduksi)} Ton`}
              subtitle="Rata-rata produksi bulanan"
              icon={BarChart3}
              tone="lime"
            />

            <StatCard
              title="Data Terbaru"
              value={
                dataTerbaru
                  ? `${getNamaBulan(dataTerbaru.bulan)} ${dataTerbaru.tahun}`
                  : "-"
              }
              subtitle="Periode terakhir"
              icon={Clock3}
              tone="blue"
            />
          </div>

          {/* WARNING DATA 2025 */}
          {dataTidakSesuai.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2 className="font-bold text-yellow-300 mb-1">
                  Ada Data Tahun 2025 di Data Historis TES
                </h2>
                <p className="text-sm text-yellow-100/80 leading-relaxed">
                  Ditemukan {dataTidakSesuai.length} data tahun 2025 pada tabel
                  Data Historis TES. Untuk alur pengujian TA, data tahun 2025
                  sebaiknya dipindahkan ke menu Evaluasi Aktual TES, lalu
                  dihapus dari halaman ini. Data Historis TES cukup berisi data
                  tahun 2021–2024.
                </p>
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-bold text-white">
                  Daftar Produksi Bulanan Historis
                </h2>
                <p className="text-sm text-slate-400">
                  Menampilkan {dataTampil.length} dari {dataFiltered.length}{" "}
                  data historis produksi.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                  {dataFiltered.length} Data
                </span>

                <button
                  onClick={() => setLihatSemuaData(!lihatSemuaData)}
                  className="px-4 py-2 text-sm rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-semibold transition"
                >
                  {lihatSemuaData ? "Tampilkan Ringkas" : "Lihat Semua"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0b1220] text-slate-400">
                  <tr>
                    <th className="text-left font-semibold px-6 py-4">No</th>
                    <th className="text-left font-semibold px-6 py-4">
                      Periode
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Kabupaten
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Produksi
                    </th>
                    <th className="text-center font-semibold px-6 py-4">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dataTampil.length > 0 ? (
                    dataTampil.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-t border-slate-800 hover:bg-slate-800/60 transition ${
                          Number(item.tahun) > 2024
                            ? "bg-yellow-500/5"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                                Number(item.tahun) > 2024
                                  ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                                  : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              }`}
                            >
                              <FileSpreadsheet size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-white">
                                {getNamaBulan(item.bulan)} {item.tahun}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.periode || "Periode otomatis"}
                              </p>

                              {Number(item.tahun) > 2024 && (
                                <p className="text-xs text-yellow-300 font-semibold mt-1">
                                  Seharusnya masuk ke Evaluasi Aktual TES
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {item.kabupaten}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-300">
                            {formatAngka(item.produksi)} Ton
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition"
                              title="Edit Data"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition"
                              title="Hapus Data"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Tidak ada data produksi bulanan yang ditampilkan.
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
                Data ini adalah data historis produksi bulanan yang digunakan
                sebagai input metode Triple Exponential Smoothing. Untuk alur
                pengujian sistem, data historis sebaiknya berisi periode
                2021–2024. Data tahun 2025 digunakan sebagai data aktual
                pembanding dan dimasukkan melalui menu Evaluasi Aktual TES,
                bukan melalui halaman ini.
              </p>
            </div>
          </div>
        </section>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-[#081226] border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] px-6 py-5 text-white flex justify-between items-center border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold">
                    {isEdit
                      ? "Edit Data Historis TES"
                      : "Tambah Data Historis TES"}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    Lengkapi data produksi bulanan periode 2021–2024.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Kabupaten
                  </label>
                  <input
                    type="text"
                    name="kabupaten"
                    value={form.kabupaten}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/30 placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    name="tahun"
                    placeholder="Contoh: 2024"
                    min="2021"
                    max="2024"
                    value={form.tahun}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/30 placeholder:text-slate-500"
                  />

                  <p className="text-xs text-slate-500 mt-1">
                    Data Historis TES hanya untuk periode 2021–2024. Data
                    aktual tahun 2025 dimasukkan melalui menu Evaluasi Aktual
                    TES.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Bulan
                  </label>
                  <select
                    name="bulan"
                    value={form.bulan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="">Pilih Bulan</option>
                    {bulanList.map((bulan) => (
                      <option key={bulan.value} value={bulan.value}>
                        {bulan.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">
                    Produksi Bulanan (Ton)
                  </label>
                  <input
                    type="number"
                    name="produksi"
                    placeholder="Contoh: 30000"
                    value={form.produksi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/30 placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="px-6 py-5 bg-[#0b1220] border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-700 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Batal
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-60"
                >
                  <Save size={17} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}
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
    blue: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
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