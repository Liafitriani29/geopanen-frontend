import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Leaf,
  Mail,
  Lock,
  Users,
  LogIn,
  LineChart,
  CloudSun,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsername("");
      setPassword("");
      setRole("");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password || !role) {
      alert("Semua field harus diisi!");
      return;
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email: username,
        password: password,
        role: role,
      });

      alert(res.data.message);

      const userRole = res.data.user?.role;

      if (!userRole) {
        alert("Role user tidak ditemukan dari server!");
        return;
      }

      localStorage.clear();
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", userRole);

      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "petani") {
        navigate("/petani");
      } else if (userRole === "penyuluh") {
        navigate("/penyuluh");
      } else {
        alert("Role tidak dikenali!");
      }
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      console.log("ERROR:", err);

      const message =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})
          .flat()
          .join("\n") ||
        "Login gagal! Periksa email, password, dan role.";

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
              Prediksi produksi padi, cuaca, dan evaluasi panen dalam satu
              sistem.
            </h2>

            <p className="text-green-100 text-sm leading-relaxed">
              Masuk sesuai role untuk mengakses dashboard admin, petani, atau
              penyuluh pertanian.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <LineChart className="mb-3" />
              <p className="font-semibold">Prediksi TES</p>
              <p className="text-xs text-green-100 mt-1">
                Menghitung prediksi produksi padi bulanan.
              </p>
            </div>

            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <CloudSun className="mb-3" />
              <p className="font-semibold">Integrasi Cuaca</p>
              <p className="text-xs text-green-100 mt-1">
                Rekomendasi berbasis kondisi cuaca.
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
              Login GeoPanen
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Masuk menggunakan akun yang sudah terdaftar
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
            autoComplete="off"
          >
            <input
              type="text"
              name="fake_login_user"
              autoComplete="username"
              className="hidden"
              tabIndex="-1"
            />
            <input
              type="password"
              name="fake_login_password"
              autoComplete="new-password"
              className="hidden"
              tabIndex="-1"
            />

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="mt-2 flex items-center border rounded-xl px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
                <Mail className="text-gray-400" size={20} />
                <input
                  type="email"
                  name="login_email_custom"
                  placeholder="Masukkan email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  name="login_password_custom"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full p-3 bg-transparent outline-none text-sm"
                />
              </div>

              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-700 font-medium hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Role
              </label>

              <div className="mt-2 flex items-center border rounded-xl px-3 bg-gray-50 focus-within:ring-2 focus-within:ring-green-500">
                <Users className="text-gray-400" size={20} />
                <select
                  name="login_role_custom"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  autoComplete="off"
                  className="w-full p-3 bg-transparent outline-none text-sm"
                >
                  <option value="">Pilih Role</option>
                  <option value="admin">Admin</option>
                  <option value="petani">Petani</option>
                  <option value="penyuluh">Penyuluh Pertanian</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn size={20} />
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-green-600 font-semibold cursor-pointer hover:underline"
              >
                Register
              </span>
            </p>

            <p className="text-xs text-gray-400 mt-3">
              * Gunakan email, password, dan role sesuai database
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}