import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Target,
  Activity,
  Search,
  Filter,
  ClipboardList,
  CalendarDays,
  Gauge,
  Save,
  Database,
} from "lucide-react";

export default function Deviasi() {
  const [ringkasan, setRingkasan] = useState(null);
  const [evaluasi, setEvaluasi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSimpan, setLoadingSimpan] = useState(false);
  const [error, setError] = useState("");
  const [errorSimpan, setErrorSimpan] = useState("");
  const [pesanSimpan, setPesanSimpan] = useState("");
  const [sudahDimuat, setSudahDimuat] = useState(false);
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [pesanBackend, setPesanBackend] = useState("");

  const [formAktual, setFormAktual] = useState({
    kabupaten: "Sukoharjo",
    tahun: "2025",
    bulan: "1",
    produksi_aktual: "",
  });

  const API_EVALUASI_URL = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";
  const API_AKTUAL_URL = "http://127.0.0.1:8000/api/aktual-produksi-bulanan";

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
    return Number(angka).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getPeriodeOtomatis = () => {
    const tahun = String(formAktual.tahun || "").trim();
    const bulan = String(formAktual.bulan || "").padStart(2, "0");
    if (!tahun || !bulan) return "";
    return `${tahun}-${bulan}-01`;
  };

  const handleChangeFormAktual = (e) => {
    const { name, value } = e.target;
    setFormAktual((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const muatEvaluasiPrediksi = async () => {
    try {
      setLoading(true);
      setError("");
      setSudahDimuat(false);
      setPesanBackend("");

      const response = await fetch(API_EVALUASI_URL);

      if (!response.ok) {
        throw new Error("Gagal mengambil data evaluasi aktual dari backend.");
      }

      const result = await response.json();
      const payload = result.data || {};

      setPesanBackend(result.message || "");
      setRingkasan(payload.ringkasan || null);
      setEvaluasi(Array.isArray(payload.evaluasi) ? payload.evaluasi : []);
      setSudahDimuat(true);
    } catch (err) {
      setError(
        err.message || "Terjadi kesalahan saat mengambil data evaluasi aktual."
      );
    } finally {
      setLoading(false);
    }
  };

  const simpanAktualProduksi = async (e) => {
    e.preventDefault();

    try {
      setLoadingSimpan(true);
      setErrorSimpan("");
      setPesanSimpan("");

      const produksiAktual = Number(
        String(formAktual.produksi_aktual).replace(",", ".")
      );

      if (!formAktual.kabupaten.trim()) {
        throw new Error("Kabupaten wajib diisi.");
      }

      if (!formAktual.tahun || Number(formAktual.tahun) < 2000) {
        throw new Error("Tahun tidak valid.");
      }

      if (
        !formAktual.bulan ||
        Number(formAktual.bulan) < 1 ||
        Number(formAktual.bulan) > 12
      ) {
        throw new Error("Bulan tidak valid.");
      }

      if (!formAktual.produksi_aktual || produksiAktual < 0) {
        throw new Error(
          "Produksi aktual wajib diisi dan tidak boleh negatif."
        );
      }

      const body = {
        kabupaten: formAktual.kabupaten.trim(),
        tahun: Number(formAktual.tahun),
        bulan: Number(formAktual.bulan),
        periode: getPeriodeOtomatis(),
        produksi_aktual: produksiAktual,
      };

      const response = await fetch(API_AKTUAL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan data aktual produksi bulanan."
        );
      }

      setPesanSimpan(
        `Data aktual ${namaBulan(body.bulan)} ${body.tahun} berhasil disimpan.`
      );

      setFormAktual((prev) => ({
        ...prev,
        produksi_aktual: "",
      }));

      await muatEvaluasiPrediksi();
    } catch (err) {
      setErrorSimpan(err.message || "Terjadi kesalahan saat menyimpan data aktual.");
    } finally {
      setLoadingSimpan(false);
    }
  };

  const tahunList = useMemo(() => {
    return ["Semua", ...new Set(evaluasi.map((item) => String(item.tahun)))];
  }, [evaluasi]);

  const evaluasiFiltered = useMemo(() => {
    return evaluasi.filter((item) => {
      const cocokTahun =
        filterTahun === "Semua" || String(item.tahun) === filterTahun;

      const cocokStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      return cocokTahun && cocokStatus;
    });
  }, [evaluasi, filterTahun, filterStatus]);

  const grafikError = evaluasi.slice(-12).map((item) => ({
    periode: `${namaBulan(item.bulan)} ${item.tahun}`,
    error: Number(item.ape) || 0,
  }));

  const statusModel = ringkasan?.statusModel || "Belum Dinilai";
  const totalEvaluasi = ringkasan?.jumlahDataEvaluasi ?? evaluasi.length;

  const totalPerluEvaluasi =
    ringkasan?.jumlahPerluEvaluasi ??
    evaluasi.filter((item) => item.status === "Perlu Evaluasi").length;

  const statusModelTone =
    statusModel === "Perlu Perbaikan"
      ? "red"
      : statusModel === "Cukup"
      ? "yellow"
      : "emerald";

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <main className="flex-1 overflow-hidden bg-[#020617]">
        {/* TOPBAR */}
        <div className="h-16 bg-[#081226] border-b border-slate-800 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-white">Evaluasi MAPE</h2>
            <p className="text-xs text-slate-400">
              Perbandingan data aktual produksi bulanan dengan hasil prediksi
              TES.
            </p>
          </div>

          <button
            onClick={muatEvaluasiPrediksi}
            disabled={loading}
            className="flex items-center gap-2 bg-cyan-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-950/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Memuat...
              </>
            ) : (
              <>
                <Activity size={18} />
                Muat Evaluasi
              </>
            )}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-[#07111f] via-[#0f2d2e] to-[#123522] border-b border-slate-800 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-cyan-300 text-sm mb-2">
                Evaluasi Aktual Prediksi TES
              </p>

              <h1 className="text-3xl font-bold">
                Evaluasi Prediksi Panen
              </h1>

              <p className="text-slate-300 mt-2 max-w-3xl text-sm leading-relaxed">
                Halaman ini digunakan untuk memasukkan data aktual produksi
                bulanan, kemudian membandingkannya dengan hasil prediksi TES
                menggunakan nilai APE dan MAPE.
              </p>
            </div>

            <div className="bg-white/5 border border-cyan-500/20 rounded-2xl p-4 min-w-[240px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center">
                  <Gauge size={22} />
                </div>

                <div>
                  <p className="text-sm text-slate-400">Status Evaluasi</p>
                  <h3
                    className={`font-bold ${
                      sudahDimuat ? "text-emerald-300" : "text-yellow-300"
                    }`}
                  >
                    {sudahDimuat ? "Sudah Dimuat" : "Belum Dimuat"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6 h-[calc(100vh-64px)] overflow-y-auto">
          {/* INPUT DATA AKTUAL */}
          <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Database size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">
                  Input Data Aktual Produksi Bulanan
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Masukkan total produksi aktual wilayah per bulan, bukan hasil
                  panen satu lahan.
                </p>
              </div>
            </div>

            <form
              onSubmit={simpanAktualProduksi}
              className="grid grid-cols-1 md:grid-cols-5 gap-4"
            >
              <InputText
                label="Kabupaten"
                name="kabupaten"
                value={formAktual.kabupaten}
                onChange={handleChangeFormAktual}
                placeholder="Sukoharjo"
              />

              <InputText
                label="Tahun"
                type="number"
                name="tahun"
                value={formAktual.tahun}
                onChange={handleChangeFormAktual}
                placeholder="2025"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Bulan
                </label>
                <select
                  name="bulan"
                  value={formAktual.bulan}
                  onChange={handleChangeFormAktual}
                  className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                >
                  {Array.from({ length: 12 }, (_, index) => {
                    const bulan = index + 1;
                    return (
                      <option key={bulan} value={bulan}>
                        {namaBulan(bulan)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <InputText
                label="Produksi Aktual"
                type="number"
                name="produksi_aktual"
                value={formAktual.produksi_aktual}
                onChange={handleChangeFormAktual}
                placeholder="Contoh: 110000"
                helper="Satuan ton, mengikuti data historis TES."
              />

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loadingSimpan}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-cyan-700 transition shadow-lg shadow-cyan-950/30 disabled:opacity-60"
                >
                  {loadingSimpan ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Simpan Aktual
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-xs text-slate-400">
                Periode otomatis:{" "}
                <span className="font-semibold text-cyan-300">
                  {getPeriodeOtomatis() || "-"}
                </span>
              </p>

              <p className="text-xs text-slate-500">
                Contoh: Prediksi Mar 2025 dibandingkan dengan aktual produksi
                Mar 2025.
              </p>
            </div>

            {pesanSimpan && (
              <div className="mt-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 rounded-xl px-4 py-3 text-sm">
                {pesanSimpan}
              </div>
            )}

            {errorSimpan && (
              <div className="mt-4 border border-red-500/30 bg-red-500/10 text-red-300 rounded-xl px-4 py-3 text-sm">
                {errorSimpan}
              </div>
            )}
          </div>

          {!sudahDimuat && !loading && !error && (
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center mx-auto mb-5">
                <ClipboardList size={30} />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Evaluasi Belum Dimuat
              </h2>

              <p className="text-slate-400 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
                Klik tombol <b>Muat Evaluasi</b> untuk menampilkan perbandingan
                prediksi TES dengan data aktual.
              </p>

              <button
                onClick={muatEvaluasiPrediksi}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 shadow-lg shadow-cyan-950/30 transition"
              >
                <Activity size={18} />
                Muat Evaluasi Sekarang
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-10 text-center">
              <RefreshCw
                size={34}
                className="animate-spin mx-auto text-cyan-300 mb-4"
              />
              <h2 className="text-xl font-bold text-white">
                Memuat Evaluasi Prediksi...
              </h2>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 rounded-2xl border border-red-500/30 shadow-lg shadow-black/20 p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-300">
                    Gagal Memuat Evaluasi
                  </h2>
                  <p className="text-red-100/80 mt-2">{error}</p>
                </div>
              </div>
            </div>
          )}

          {sudahDimuat && !loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="MAPE"
                  value={`${formatAngka(ringkasan?.mape)}%`}
                  subtitle="Rata-rata kesalahan prediksi"
                  icon={Percent}
                  tone="amber"
                />

                <StatCard
                  title="Akurasi"
                  value={`${formatAngka(ringkasan?.estimasiAkurasi)}%`}
                  subtitle="Berdasarkan nilai MAPE"
                  icon={Target}
                  tone="emerald"
                />

                <StatCard
                  title="Status Model"
                  value={statusModel}
                  subtitle="Kategori performa prediksi"
                  icon={CheckCircle2}
                  tone={statusModelTone}
                />

                <StatCard
                  title="Data Evaluasi"
                  value={`${totalEvaluasi} Periode`}
                  subtitle={`${totalPerluEvaluasi} perlu evaluasi`}
                  icon={ClipboardList}
                  tone="red"
                />
              </div>

              {evaluasi.length === 0 && (
                <div className="bg-[#081226] rounded-2xl border border-amber-500/30 shadow-lg shadow-black/20 p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle size={24} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Data Evaluasi Aktual Belum Tersedia
                      </h2>
                      <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                        {pesanBackend ||
                          "Belum ada data aktual produksi bulanan yang cocok dengan periode prediksi TES."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {evaluasi.length > 0 && (
                <>
                  <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                      <div>
                        <h2 className="font-bold text-white">
                          Grafik Tingkat Kesalahan Prediksi
                        </h2>
                        <p className="text-sm text-slate-400">
                          Menampilkan nilai APE setiap periode evaluasi aktual.
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                        APE
                      </span>
                    </div>

                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={grafikError}
                          margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                          barCategoryGap={22}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#1e293b"
                          />

                          <XAxis
                            dataKey="periode"
                            interval={0}
                            angle={-25}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{ fontSize: 12, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderRadius: "14px",
                              border: "1px solid #1e293b",
                              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
                              fontSize: "13px",
                              color: "#e2e8f0",
                            }}
                            labelStyle={{
                              color: "#e2e8f0",
                            }}
                            formatter={(value) => [
                              `${formatAngka(value)}%`,
                              "Tingkat Kesalahan",
                            ]}
                            labelFormatter={(label) => `Periode: ${label}`}
                          />

                          <Bar
                            dataKey="error"
                            name="Tingkat Kesalahan"
                            fill="#06b6d4"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-white">
                          Filter Evaluasi
                        </h2>
                        <p className="text-sm text-slate-400">
                          Gunakan filter untuk melihat evaluasi berdasarkan
                          tahun dan status.
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex items-center gap-2 border border-slate-800 bg-[#020617] px-4 py-2 rounded-xl">
                          <Search size={16} className="text-slate-500" />
                          <select
                            value={filterTahun}
                            onChange={(e) => setFilterTahun(e.target.value)}
                            className="text-sm outline-none bg-transparent text-slate-200"
                          >
                            {tahunList.map((tahun) => (
                              <option key={tahun} value={tahun}>
                                {tahun === "Semua" ? "Semua Tahun" : tahun}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2 border border-slate-800 bg-[#020617] px-4 py-2 rounded-xl">
                          <Filter size={16} className="text-slate-500" />
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="text-sm outline-none bg-transparent text-slate-200"
                          >
                            <option value="Semua">Semua Status</option>
                            <option value="Akurat">Akurat</option>
                            <option value="Cukup">Cukup</option>
                            <option value="Perlu Evaluasi">
                              Perlu Evaluasi
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#081226] rounded-2xl border border-slate-800 shadow-lg shadow-black/20 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-white">
                          Tabel Detail Evaluasi
                        </h2>
                        <p className="text-sm text-slate-400">
                          Menampilkan {evaluasiFiltered.length} dari{" "}
                          {evaluasi.length} data evaluasi.
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                        {evaluasiFiltered.length} Data
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#0b1220] text-slate-400">
                          <tr>
                            <th className="text-left font-semibold px-6 py-4">
                              No
                            </th>
                            <th className="text-left font-semibold px-6 py-4">
                              Periode
                            </th>
                            <th className="text-left font-semibold px-6 py-4">
                              Aktual
                            </th>
                            <th className="text-left font-semibold px-6 py-4">
                              Prediksi
                            </th>
                            <th className="text-left font-semibold px-6 py-4">
                              Selisih
                            </th>
                            <th className="text-left font-semibold px-6 py-4">
                              APE
                            </th>
                            <th className="text-left font-semibold px-6 py-4">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {evaluasiFiltered.length > 0 ? (
                            evaluasiFiltered.map((item, index) => (
                              <tr
                                key={`${item.bulan}-${item.tahun}-${index}`}
                                className="border-t border-slate-800 hover:bg-slate-800/60 transition"
                              >
                                <td className="px-6 py-4 text-slate-400">
                                  {index + 1}
                                </td>

                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center justify-center">
                                      <CalendarDays size={18} />
                                    </div>

                                    <div>
                                      <p className="font-semibold text-white">
                                        {namaBulan(item.bulan)} {item.tahun}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Periode evaluasi
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-6 py-4 text-slate-300">
                                  {formatAngka(item.aktual)} Ton
                                </td>

                                <td className="px-6 py-4 text-slate-300">
                                  {formatAngka(item.prediksi)} Ton
                                </td>

                                <td
                                  className={`px-6 py-4 font-semibold ${
                                    Number(item.selisih) < 0
                                      ? "text-red-400"
                                      : "text-emerald-400"
                                  }`}
                                >
                                  {formatAngka(item.selisih)} Ton
                                </td>

                                <td className="px-6 py-4 font-bold text-yellow-300">
                                  {formatAngka(item.ape)}%
                                </td>

                                <td className="px-6 py-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                      item.status
                                    )}`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-6 py-10 text-center text-slate-500"
                              >
                                Tidak ada data sesuai filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function InputText({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  helper,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-[#020617] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
        placeholder={placeholder}
      />
      {helper && <p className="text-[11px] text-slate-500 mt-1">{helper}</p>}
    </div>
  );
}

function getStatusBadge(status) {
  if (status === "Akurat") {
    return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  }

  if (status === "Cukup") {
    return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
  }

  return "bg-red-500/10 text-red-300 border-red-500/20";
}

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald:
      "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    green: "bg-green-500/10 text-green-300 border border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
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