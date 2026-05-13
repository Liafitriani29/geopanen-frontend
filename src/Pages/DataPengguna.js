import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  RefreshCw,
  Users,
  ShieldCheck,
  Sprout,
  UserCog,
  Mail,
  CalendarDays,
  X,
  Save,
} from "lucide-react";

export default function DataPengguna() {
  const [pengguna, setPengguna] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const initialForm = {
    name: "",
    email: "",
    password: "",
    role: "",
  };

  const [form, setForm] = useState(initialForm);

  const API_URL = "http://127.0.0.1:8000/api/pengguna";

  useEffect(() => {
    getPengguna();
  }, []);

  const getPengguna = async () => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL);

      const dataPengguna = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setPengguna(dataPengguna);
    } catch (err) {
      console.log(err);
      alert("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const openTambahForm = () => {
    setEditId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const isRoleBolehDikelola = (role) => {
    return role === "petani" || role === "penyuluh";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.role) {
      alert("Nama, email, dan role wajib diisi!");
      return;
    }

    if (!isRoleBolehDikelola(form.role)) {
      alert("Role yang boleh ditambahkan hanya Petani atau Penyuluh Pertanian.");
      return;
    }

    if (!editId && !form.password) {
      alert("Password wajib diisi untuk pengguna baru!");
      return;
    }

    try {
      setLoading(true);

      if (editId) {
        const dataUpdate = {
          name: form.name,
          email: form.email,
          role: form.role,
        };

        if (form.password) {
          dataUpdate.password = form.password;
        }

        await axios.put(`${API_URL}/${editId}`, dataUpdate);
        alert("Data pengguna berhasil diupdate");
      } else {
        const dataTambah = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };

        await axios.post(API_URL, dataTambah);
        alert("Data pengguna berhasil ditambahkan");
      }

      resetForm();
      await getPengguna();
    } catch (err) {
      console.log(err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Gagal menyimpan data pengguna");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    if (item.role === "admin") {
      alert("Admin utama tidak dapat diedit dari halaman ini.");
      return;
    }

    setEditId(item.id);
    setShowForm(true);

    setForm({
      name: item.name || "",
      email: item.email || "",
      password: "",
      role: item.role || "",
    });
  };

  const handleDelete = async (item) => {
    if (item.role === "admin") {
      alert("Admin utama tidak dapat dihapus.");
      return;
    }

    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus data pengguna ini?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await axios.delete(`${API_URL}/${item.id}`);

      alert("Data pengguna berhasil dihapus");
      await getPengguna();
    } catch (err) {
      console.log(err);

      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Gagal menghapus data pengguna");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Admin Utama";
    if (role === "petani") return "Petani";
    if (role === "penyuluh") return "Penyuluh Pertanian";
    return role || "-";
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    if (role === "penyuluh") {
      return "bg-blue-50 text-blue-700 border-blue-100";
    }

    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return ShieldCheck;
    if (role === "penyuluh") return UserCog;
    return Sprout;
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filteredPengguna = useMemo(() => {
    if (!keyword) return pengguna;

    return pengguna.filter((item) => {
      const text = `
        ${item.name || ""}
        ${item.email || ""}
        ${getRoleLabel(item.role) || ""}
      `.toLowerCase();

      return text.includes(keyword.toLowerCase());
    });
  }, [pengguna, keyword]);

  const totalPengguna = pengguna.length;
  const totalAdmin = pengguna.filter((item) => item.role === "admin").length;
  const totalPetani = pengguna.filter((item) => item.role === "petani").length;
  const totalPenyuluh = pengguna.filter(
    (item) => item.role === "penyuluh"
  ).length;

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 w-[400px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama, email, atau role pengguna..."
              className="bg-transparent outline-none text-sm w-full text-slate-600"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={getPengguna}
              className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={openTambahForm}
              className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              <PlusCircle size={18} />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div>
            <p className="text-green-100 text-sm mb-2">
              Manajemen Akun Sistem
            </p>

            <h1 className="text-3xl font-bold">Data Pengguna</h1>

            <p className="text-green-100 mt-2 max-w-3xl">
              Kelola akun petani dan penyuluh pertanian agar setiap pengguna
              dapat mengakses fitur Geopanen sesuai dengan perannya. Akun admin
              utama hanya dibuat satu kali dan tidak ditambahkan dari halaman ini.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Total Pengguna"
              value={`${totalPengguna} Akun`}
              subtitle="Semua akun terdaftar"
              icon={Users}
              tone="emerald"
            />

            <StatCard
              title="Admin Utama"
              value={`${totalAdmin} Akun`}
              subtitle="Pengelola utama sistem"
              icon={ShieldCheck}
              tone="red"
            />

            <StatCard
              title="Petani"
              value={`${totalPetani} Akun`}
              subtitle="Pengguna utama sistem"
              icon={Sprout}
              tone="green"
            />

            <StatCard
              title="Penyuluh"
              value={`${totalPenyuluh} Akun`}
              subtitle="Monitoring dan analisis"
              icon={UserCog}
              tone="blue"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-800">Daftar Pengguna</h2>
                <p className="text-sm text-slate-500">
                  Menampilkan {filteredPengguna.length} dari {pengguna.length}{" "}
                  akun pengguna.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                {filteredPengguna.length} Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="text-left font-semibold px-6 py-4">No</th>
                    <th className="text-left font-semibold px-6 py-4">
                      Pengguna
                    </th>
                    <th className="text-left font-semibold px-6 py-4">
                      Email
                    </th>
                    <th className="text-left font-semibold px-6 py-4">Role</th>
                    <th className="text-left font-semibold px-6 py-4">
                      Tanggal Dibuat
                    </th>
                    <th className="text-center font-semibold px-6 py-4">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPengguna.length > 0 ? (
                    filteredPengguna.map((item, index) => {
                      const RoleIcon = getRoleIcon(item.role);
                      const isAdmin = item.role === "admin";

                      return (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100 hover:bg-slate-50 transition"
                        >
                          <td className="px-6 py-4 text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <RoleIcon size={18} />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  ID Pengguna: {item.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-emerald-600" />
                              {item.email}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                                item.role
                              )}`}
                            >
                              {getRoleLabel(item.role)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-emerald-600"
                              />
                              {formatTanggal(item.created_at)}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {isAdmin ? (
                              <div className="text-center">
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                                  Admin utama dikunci
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                                  title="Edit Pengguna"
                                >
                                  <Pencil size={17} />
                                </button>

                                <button
                                  onClick={() => handleDelete(item)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                  title="Hapus Pengguna"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            )}
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
                        Belum ada data pengguna yang ditampilkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MODAL FORM */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-6 py-5 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    {editId ? "Edit Pengguna" : "Tambah Pengguna"}
                  </h2>
                  <p className="text-sm text-green-100 mt-1">
                    Lengkapi data akun petani atau penyuluh pertanian.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dummy input untuk mengurangi autofill browser */}
                  <input
                    type="text"
                    name="fake_user"
                    autoComplete="username"
                    className="hidden"
                    tabIndex="-1"
                  />
                  <input
                    type="password"
                    name="fake_password"
                    autoComplete="new-password"
                    className="hidden"
                    tabIndex="-1"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Nama
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama pengguna"
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email_baru_pengguna"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      placeholder="Masukkan email"
                      autoComplete="new-email"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password_baru_pengguna"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                      placeholder={
                        editId
                          ? "Kosongkan jika tidak ingin mengubah password"
                          : "Masukkan password"
                      }
                      autoComplete="new-password"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="">Pilih Role</option>
                      <option value="petani">Petani</option>
                      <option value="penyuluh">Penyuluh Pertanian</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save size={17} />
                    {loading ? "Menyimpan..." : editId ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
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
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
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