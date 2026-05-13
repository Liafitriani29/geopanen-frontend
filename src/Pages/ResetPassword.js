import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");

  const [email, setEmail] = useState(emailFromUrl || "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!token) {
      setError("Token reset password tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.");
      setLoading(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak sama.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/reset-password", {
        token: token,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      setMessage(response.data.message || "Password berhasil direset.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset password gagal. Token mungkin tidak valid atau sudah kadaluarsa."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-green-100 p-8">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Lock className="text-green-700" size={32} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-green-800 mb-2">
          Reset Password
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Masukkan password baru untuk akun Geopanen kamu.
        </p>

        <form onSubmit={handleResetPassword}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="contoh@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password Baru
          </label>

          <input
            type="password"
            placeholder="Minimal 8 karakter"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Konfirmasi Password
          </label>

          <input
            type="password"
            placeholder="Ulangi password baru"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-5"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Memproses..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 hover:underline font-medium"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}