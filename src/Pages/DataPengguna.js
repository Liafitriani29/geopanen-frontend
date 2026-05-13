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
      return "bg-red-500/10 text-red-300 border-red-500/20";
    }

    if (role === "penyuluh") {
      return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    }

    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
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
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden bg-[#020617]">
        {/* TOPBAR */}
        <div className="h-16 bg-[#081226] border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 w-[420px] bg-[#0b1220] border border-slate-800 rounded-xl px-4 py-2">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama, email, atau role pengguna..."
              className="bg-transparent outline-none text-sm w-full text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={getPengguna}
              className="flex items-center gap-2 border border-slate-800 bg-[#0b1220] text-slate-200 px-4 py-2 rounded-xl text-sm hover:bg-slate-800 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={openTambahForm}
              className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-950/30"
            >
              <PlusCircle size={18} />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] border-b border-slate-800 px-8 pt-8 pb-24 text-white">
          <div>
            <p className="text-cyan-300 text-sm mb-2">
              Manajemen Akun Sistem
            </p>

            <h1 className="text-3xl font-bold">Data Pengguna</h1>

            <p className="text-slate-300 mt-2 max-w-3xl text-sm leading-relaxed">
              Kelola akun petani dan penyuluh pertanian agar setiap pengguna
              dapat mengakses fitur Geopanen sesuai dengan perannya. Akun admin
              utama hanya dibuat satu kali dan tidak ditambahkan dari halaman
              ini.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
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
          <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-bold text-white">Daftar Pengguna</h2>
                <p className="text-sm text-slate-400">
                  Menampilkan {filteredPengguna.length} dari {pengguna.length}{" "}
                  akun pengguna.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                {filteredPengguna.length} Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0b1220] text-slate-400">
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
                          className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                        >
                          <td className="px-6 py-4 text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center">
                                <RoleIcon size={18} />
                              </div>

                              <div>
                                <p className="font-semibold text-white">
                                  {item.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  ID Pengguna: {item.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-300">
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-cyan-300" />
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

                          <td className="px-6 py-4 text-slate-300">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-cyan-300"
                              />
                              {formatTanggal(item.created_at)}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {isAdmin ? (
                              <div className="text-center">
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700">
                                  Admin utama dikunci
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition"
                                  title="Edit Pengguna"
                                >
                                  <Pencil size={17} />
                                </button>

                                <button
                                  onClick={() => handleDelete(item)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4">
            <div className="bg-[#081226] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] px-6 py-5 text-white flex justify-between items-center border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold">
                    {editId ? "Edit Pengguna" : "Tambah Pengguna"}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    Lengkapi data akun petani atau penyuluh pertanian.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <InputText
                    label="Nama"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama pengguna"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">
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
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">
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
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      autoComplete="off"
                      className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                    >
                      <option value="">Pilih Role</option>
                      <option value="petani">Petani</option>
                      <option value="penyuluh">Penyuluh Pertanian</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 py-5 bg-[#0b1220] border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-slate-700 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-60"
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

function InputText({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
      />
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    green: "bg-green-500/10 text-green-300 border border-green-500/20",
    blue: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    red: "bg-red-500/10 text-red-300 border border-red-500/20",
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