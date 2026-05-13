import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Mail,
  Lock,
  Users,
  UserPlus,
  LineChart,
  CloudSun,
  User,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "petani",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "petani",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role) {
      alert("Semua field harus diisi!");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/register", {
        username: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      alert(res.data.message);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "petani",
      });

      navigate("/");
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      console.log("ERROR:", err);

      const message =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})
          .flat()
          .join("\n") ||
        "Register gagal!";

      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef7ee] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border">
        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-green-600 to-emerald-700 p-10 text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Leaf size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold">GeoPanen</h1>
                <p className="text-sm text-green-100">
                  Sistem Prediksi Panen Padi
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold leading-snug mb-4">
              Daftarkan akun untuk mengakses informasi prediksi panen padi.
            </h2>

            <p className="text-green-100 text-sm leading-relaxed">
              Pilih role sesuai kebutuhan agar sistem menampilkan fitur yang
              sesuai, baik sebagai petani maupun penyuluh pertanian.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <LineChart className="mb-3" />
              <p className="font-semibold">Prediksi TES</p>
              <p className="text-xs text-green-100 mt-1">
                Melihat hasil prediksi produksi padi bulanan.
              </p>
            </div>

            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <CloudSun className="mb-3" />
              <p className="font-semibold">Cuaca & Rekomendasi</p>
              <p className="text-xs text-green-100 mt-1">
                Mendukung keputusan berdasarkan kondisi lingkungan.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 md:p-10">
          <div className="md:hidden flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <Leaf className="text-green-600" size={30} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Register GeoPanen
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Buat akun baru sesuai role pengguna
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
            autoComplete="off"
          >
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
              <label className="text-sm font-medium text-gray-700">
                Nama
              </label>

              <div className="mt-2 flex items-center border rounded-xl px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
                <User className="text-gray-400" size={20} />
                <input
                  type="text"
                  name="register_name"
                  placeholder="Masukkan nama"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full p-3 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="mt-2 flex items-center border rounded-xl px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
                <Mail className="text-gray-400" size={20} />
                <input
                  type="email"
                  name="register_email"
                  placeholder="Masukkan email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  autoComplete="new-email"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full p-3 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="mt-2 flex items-center border rounded-xl px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
                <Lock className="text-gray-400" size={20} />
                <input
                  type="password"
                  name="register_password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  autoComplete="new-password"
                  className="w-full p-3 bg-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Role
              </label>

              <div className="mt-2 flex items-center border rounded-xl px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
                <Users className="text-gray-400" size={20} />
                <select
                  name="register_role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                    })
                  }
                  autoComplete="off"
                  className="w-full p-3 bg-transparent outline-none text-sm"
                >
                  <option value="petani">Petani</option>
                  <option value="penyuluh">Penyuluh Pertanian</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <UserPlus size={20} />
              Register
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-green-600 font-semibold cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-3">
              * Gunakan data akun sesuai kebutuhan role pengguna
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}