import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  RefreshCw,
  MapPinned,
  Users,
  Ruler,
  Map,
  X,
  Save,
} from "lucide-react";
import axios from "axios";

export default function DataLahan() {
  const [data, setData] = useState([]);
  const [petani, setPetani] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    user_id: "",
    nama: "",
    luas: "",
    kecamatan: "",
    desa: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const API_LAHAN = "http://127.0.0.1:8000/api/lahan";
  const API_PENGGUNA = "http://127.0.0.1:8000/api/pengguna";

  useEffect(() => {
    getData();
    getPetani();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_LAHAN);

      const lahanData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setData(lahanData);
    } catch (err) {
      console.log(err);
      alert("Gagal mengambil data lahan");
    } finally {
      setLoading(false);
    }
  };

  const getPetani = async () => {
    try {
      const res = await axios.get(API_PENGGUNA);

      const penggunaData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      const dataPetani = penggunaData.filter((item) => item.role === "petani");

      setPetani(dataPetani);
    } catch (err) {
      console.log(err);
      alert("Gagal mengambil data petani");
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      id: null,
      user_id: "",
      nama: "",
      luas: "",
      kecamatan: "",
      desa: "",
    });

    setIsEdit(false);
    setShowModal(false);
  };

  const handleOpenTambah = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (
      !form.user_id ||
      !form.nama ||
      !form.luas ||
      !form.kecamatan ||
      !form.desa
    ) {
      alert("Semua field wajib diisi, termasuk pemilik lahan!");
      return;
    }

    const payload = {
      user_id: form.user_id,
      nama: form.nama,
      luas: form.luas,
      kecamatan: form.kecamatan,
      desa: form.desa,
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`${API_LAHAN}/${form.id}`, payload);
        alert("Data lahan berhasil diupdate");
      } else {
        await axios.post(API_LAHAN, payload);
        alert("Data lahan berhasil ditambahkan");
      }

      await getData();
      resetForm();
    } catch (err) {
      console.log(err);
      alert("Gagal menyimpan data lahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      user_id: item.user_id || "",
      nama: item.nama || "",
      luas: item.luas || "",
      kecamatan: item.kecamatan || "",
      desa: item.desa || "",
    });

    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus data lahan ini?")) {
      try {
        setLoading(true);

        await axios.delete(`${API_LAHAN}/${id}`);

        alert("Data lahan berhasil dihapus");
        await getData();
      } catch (err) {
        console.log(err);
        alert("Gagal menghapus data lahan");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredData = useMemo(() => {
    if (!keyword) return data;

    return data.filter((item) => {
      const text = `
        ${item.nama || ""}
        ${item.user?.name || ""}
        ${item.kecamatan || ""}
        ${item.desa || ""}
      `.toLowerCase();

      return text.includes(keyword.toLowerCase());
    });
  }, [data, keyword]);

  const totalLahan = data.length;

  const totalLuas = data.reduce((sum, item) => {
    return sum + (parseFloat(item.luas) || 0);
  }, 0);

  const totalPetani = new Set(
    data
      .map((item) => item.user_id)
      .filter((item) => item !== null && item !== undefined && item !== "")
  ).size;

  const totalKecamatan = new Set(
    data
      .map((item) => item.kecamatan)
      .filter((item) => item !== null && item !== undefined && item !== "")
  ).size;

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 w-[380px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama lahan, pemilik, kecamatan..."
              className="bg-transparent outline-none text-sm w-full text-slate-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={getData}
              className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={handleOpenTambah}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              <PlusCircle size={18} />
              Tambah Lahan
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div>
            <p className="text-green-100 text-sm mb-2">
              Manajemen Data Lahan Pertanian
            </p>

            <h1 className="text-3xl font-bold">Data Lahan</h1>

            <p className="text-green-100 mt-2 max-w-2xl">
              Kelola informasi lahan pertanian, pemilik lahan, luas lahan,
              kecamatan, dan desa sebagai data pendukung sistem prediksi panen.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Lahan"
              value={`${formatNumber(totalLahan)} Lahan`}
              subtitle="Lahan terdaftar"
              icon={MapPinned}
              tone="emerald"
            />

            <StatCard
              title="Total Luas"
              value={`${formatNumber(totalLuas)} Ha`}
              subtitle="Akumulasi luas lahan"
              icon={Ruler}
              tone="green"
            />

            <StatCard
              title="Pemilik Lahan"
              value={`${formatNumber(totalPetani)} Petani`}
              subtitle="Petani yang memiliki lahan"
              icon={Users}
              tone="lime"
            />

            <StatCard
              title="Kecamatan"
              value={`${formatNumber(totalKecamatan)} Wilayah`}
              subtitle="Wilayah lahan tercatat"
              icon={Map}
              tone="blue"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-800">
                  Daftar Lahan Pertanian
                </h2>
                <p className="text-sm text-slate-500">
                  Data lahan dan pemilik lahan petani.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {filteredData.length} Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left font-semibold px-6 py-4">
                      Nama Lahan
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Pemilik
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Luas
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Kecamatan
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Desa
                    </th>
                    <th className="text-center font-semibold px-6 py-4">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <MapPinned size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.nama}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID Lahan: {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {item.user?.name ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {item.user.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Belum ada pemilik
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatNumber(item.luas)} Ha
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.kecamatan}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.desa}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                              title="Edit Lahan"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                              title="Hapus Lahan"
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
                        colSpan="6"
                        className="px-6 py-10 text-center text-slate-500"
                      >
                        Belum ada data lahan yang ditampilkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MODAL FORM */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-6 py-5 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    {isEdit ? "Edit Lahan" : "Tambah Lahan"}
                  </h2>
                  <p className="text-sm text-green-100 mt-1">
                    Lengkapi data lahan pertanian.
                  </p>
                </div>

                <button
                  onClick={resetForm}
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Pemilik Lahan
                  </label>
                  <select
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="">Pilih Petani</option>
                    {petani.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nama Lahan
                  </label>
                  <input
                    type="text"
                    name="nama"
                    placeholder="Contoh: Sawah Utara"
                    value={form.nama}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Luas Lahan
                  </label>
                  <input
                    type="number"
                    name="luas"
                    placeholder="Contoh: 2.5"
                    value={form.luas}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      name="kecamatan"
                      placeholder="Contoh: Baki"
                      value={form.kecamatan}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Desa
                    </label>
                    <input
                      type="text"
                      name="desa"
                      placeholder="Contoh: Nguter"
                      value={form.desa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white transition"
                >
                  Batal
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-60"
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
    emerald: "bg-emerald-100 text-emerald-700",
    green: "bg-green-100 text-green-700",
    lime: "bg-lime-100 text-lime-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
          <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
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