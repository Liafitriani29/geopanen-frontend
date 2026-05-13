import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  RefreshCw,
  Wheat,
  CalendarDays,
  Scale,
  MapPinned,
  Users,
  X,
  Save,
} from "lucide-react";
import axios from "axios";

export default function DataPanen() {
  const [data, setData] = useState([]);
  const [lahanList, setLahanList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    lahanId: "",
    tanggal: "",
    hasil: "",
    keterangan: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const API_PANEN = "http://127.0.0.1:8000/api/panen";
  const API_LAHAN = "http://127.0.0.1:8000/api/lahan";

  useEffect(() => {
    fetchPanen();
    fetchLahan();
  }, []);

  const ambilArrayDariResponse = (res) => {
    if (Array.isArray(res.data)) {
      return res.data;
    }

    if (Array.isArray(res.data?.data)) {
      return res.data.data;
    }

    if (Array.isArray(res.data?.data?.data)) {
      return res.data.data.data;
    }

    return [];
  };

  const parseNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;

    return (
      parseFloat(value.toString().replace(/\./g, "").replace(",", ".")) || 0
    );
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fetchPanen = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_PANEN);
      const dataPanen = ambilArrayDariResponse(res);

      setData(dataPanen);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data panen");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLahan = async () => {
    try {
      const res = await axios.get(API_LAHAN);
      const dataLahan = ambilArrayDariResponse(res);

      setLahanList(dataLahan);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data lahan");
      setLahanList([]);
    }
  };

  const handleRefresh = async () => {
    await fetchPanen();
    await fetchLahan();
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openTambahModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.lahanId || !form.tanggal || !form.hasil) {
      alert("Lahan, tanggal, dan hasil panen wajib diisi!");
      return;
    }

    const payload = {
      lahan_id: form.lahanId,
      tanggal: form.tanggal,
      hasil: form.hasil,
      keterangan: form.keterangan,
    };

    try {
      setLoading(true);

      if (isEdit) {
        await axios.put(`${API_PANEN}/${form.id}`, payload);
        alert("Data panen berhasil diupdate");
      } else {
        await axios.post(API_PANEN, payload);
        alert("Data panen berhasil ditambahkan");
      }

      await fetchPanen();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data panen");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      lahanId: item.lahan_id || "",
      tanggal: item.tanggal ? String(item.tanggal).substring(0, 10) : "",
      hasil: item.hasil || "",
      keterangan: item.keterangan || "",
    });

    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus data panen ini?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await axios.delete(`${API_PANEN}/${id}`);

      alert("Data panen berhasil dihapus");
      await fetchPanen();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data panen");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      lahanId: "",
      tanggal: "",
      hasil: "",
      keterangan: "",
    });

    setIsEdit(false);
    setShowModal(false);
  };

  const daftarLahanAman = Array.isArray(lahanList) ? lahanList : [];
  const daftarPanenAman = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    if (!keyword) return daftarPanenAman;

    return daftarPanenAman.filter((item) => {
      const text = `
        ${item.lahan?.nama || ""}
        ${item.lahan?.user?.name || ""}
        ${item.tanggal || ""}
        ${item.hasil || ""}
        ${item.keterangan || ""}
      `.toLowerCase();

      return text.includes(keyword.toLowerCase());
    });
  }, [daftarPanenAman, keyword]);

  const totalDataPanen = daftarPanenAman.length;

  const totalHasilPanen = daftarPanenAman.reduce((sum, item) => {
    return sum + parseNumber(item.hasil);
  }, 0);

  const totalLahanPanen = new Set(
    daftarPanenAman
      .map((item) => item.lahan_id)
      .filter((item) => item !== null && item !== undefined && item !== "")
  ).size;

  const totalPetaniPanen = new Set(
    daftarPanenAman
      .map((item) => item.lahan?.user?.id || item.lahan?.user_id)
      .filter((item) => item !== null && item !== undefined && item !== "")
  ).size;

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
              placeholder="Cari lahan, pemilik, tanggal, atau keterangan..."
              className="bg-transparent outline-none text-sm w-full text-slate-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={openTambahModal}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              <PlusCircle size={18} />
              Tambah Data
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div>
            <p className="text-green-100 text-sm mb-2">
              Manajemen Data Produksi Padi
            </p>

            <h1 className="text-3xl font-bold">Data Panen</h1>

            <p className="text-green-100 mt-2 max-w-2xl">
              Kelola data hasil panen berdasarkan lahan, tanggal panen, jumlah
              produksi, dan keterangan panen sebagai data aktual untuk evaluasi
              prediksi sistem Geopanen.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Data Panen"
              value={`${formatNumber(totalDataPanen)} Data`}
              subtitle="Jumlah catatan panen"
              icon={Wheat}
              tone="emerald"
            />

            <StatCard
              title="Total Hasil Panen"
              value={`${formatNumber(totalHasilPanen)} Ton`}
              subtitle="Akumulasi produksi aktual"
              icon={Scale}
              tone="green"
            />

            <StatCard
              title="Lahan Dipanen"
              value={`${formatNumber(totalLahanPanen)} Lahan`}
              subtitle="Lahan dengan data panen"
              icon={MapPinned}
              tone="lime"
            />

            <StatCard
              title="Petani Terlibat"
              value={`${formatNumber(totalPetaniPanen)} Petani`}
              subtitle="Pemilik lahan panen"
              icon={Users}
              tone="blue"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-800">
                  Daftar Data Panen
                </h2>
                <p className="text-sm text-slate-500">
                  Data hasil panen berdasarkan lahan pertanian.
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
                      Lahan
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Pemilik
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Tanggal
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Hasil Panen
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Keterangan
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
                              <Wheat size={18} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.lahan?.nama || "-"}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID Panen: {item.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {item.lahan?.user?.name ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {item.lahan.user.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
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

                        <td className="px-6 py-4">
                          {item.hasil !== null && item.hasil !== undefined ? (
                            <span className="font-bold text-slate-800">
                              {formatNumber(parseNumber(item.hasil))} Ton
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.keterangan || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                              title="Edit Data Panen"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                              title="Hapus Data Panen"
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
                        Belum ada data panen yang ditampilkan.
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
                    {isEdit ? "Edit Data Panen" : "Tambah Data Panen"}
                  </h2>
                  <p className="text-sm text-green-100 mt-1">
                    Lengkapi data hasil panen padi.
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
                    Pilih Lahan
                  </label>

                  <select
                    name="lahanId"
                    value={form.lahanId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  >
                    <option value="">Pilih Lahan</option>

                    {daftarLahanAman.map((lahan) => (
                      <option key={lahan.id} value={lahan.id}>
                        {lahan.nama}
                        {lahan.user?.name ? ` - ${lahan.user.name}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Tanggal Panen
                  </label>

                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Hasil Panen (Ton)
                  </label>

                  <input
                    type="number"
                    name="hasil"
                    placeholder="Contoh: 5"
                    value={form.hasil}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Keterangan
                  </label>

                  <input
                    type="text"
                    name="keterangan"
                    placeholder="Contoh: Panen pertama"
                    value={form.keterangan}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  />
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