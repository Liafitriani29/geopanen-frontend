import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  TrendingDown,
  Percent,
  Target,
  Activity,
  CalendarDays,
  Info,
  Filter,
  BarChart3,
} from "lucide-react";

export default function AnalisisEvaluasiPenyuluh() {
  const [ringkasan, setRingkasan] = useState(null);
  const [evaluasi, setEvaluasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lihatSemua, setLihatSemua] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Semua");

  const API_URL = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";

  useEffect(() => {
    getEvaluasiPrediksi();
  }, []);

  const getEvaluasiPrediksi = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_URL);
      const payload = res.data?.data || {};

      setRingkasan(payload.ringkasan || null);
      setEvaluasi(Array.isArray(payload.evaluasi) ? payload.evaluasi : []);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data evaluasi aktual prediksi TES.");
    } finally {
      setLoading(false);
    }
  };

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

    const nilai = Number(angka);

    if (Number.isNaN(nilai)) return "-";

    return nilai.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusModelData = (statusModel) => {
    if (statusModel === "Akurat") {
      return {
        label: "Akurat",
        className: "text-emerald-700",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        box: "bg-emerald-50 border-emerald-100 text-emerald-700",
        catatan:
          "Model TES memiliki tingkat kesalahan rendah dan dapat digunakan sebagai acuan awal untuk pendampingan petani.",
      };
    }

    if (statusModel === "Cukup") {
      return {
        label: "Cukup",
        className: "text-yellow-700",
        badge: "bg-yellow-50 text-yellow-700 border-yellow-100",
        box: "bg-yellow-50 border-yellow-100 text-yellow-700",
        catatan:
          "Model TES masih cukup baik, tetapi penyuluh perlu mencermati periode dengan error sedang.",
      };
    }

    if (statusModel === "Perlu Perbaikan") {
      return {
        label: "Perlu Perbaikan",
        className: "text-red-700",
        badge: "bg-red-50 text-red-700 border-red-100",
        box: "bg-red-50 border-red-100 text-red-700",
        catatan:
          "Model TES perlu ditinjau kembali karena terdapat error tinggi pada periode tertentu.",
      };
    }

    return {
      label: "Belum Dievaluasi",
      className: "text-slate-700",
      badge: "bg-slate-50 text-slate-700 border-slate-100",
      box: "bg-slate-50 border-slate-100 text-slate-700",
      catatan:
        "Belum ada data aktual produksi bulanan yang cocok dengan periode prediksi TES.",
    };
  };

  const getBadgeStatus = (status) => {
    if (status === "Akurat") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "Cukup") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    if (status === "Perlu Evaluasi") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const getArahanEvaluasi = (item) => {
    if (!item) return "-";

    if (item.status === "Akurat") {
      return "Hasil prediksi sudah mendekati data aktual. Penyuluh dapat menggunakan informasi ini sebagai acuan awal.";
    }

    if (item.status === "Cukup") {
      return "Perlu pemantauan tambahan pada periode ini, terutama terkait cuaca dan kondisi produksi wilayah.";
    }

    if (item.status === "Perlu Evaluasi") {
      return "Perlu pengecekan lebih lanjut terhadap data aktual, pola produksi, cuaca, irigasi, dan potensi gangguan tanaman berdasarkan kondisi lapangan.";
    }

    return "Belum ada arahan evaluasi.";
  };

  const dataFiltered = useMemo(() => {
    return evaluasi.filter((item) => {
      return filterStatus === "Semua" || item.status === filterStatus;
    });
  }, [evaluasi, filterStatus]);

  const dataTampil = lihatSemua ? dataFiltered : dataFiltered.slice(0, 6);

  const jumlahAkurat =
    ringkasan?.jumlahAkurat ??
    evaluasi.filter((item) => item.status === "Akurat").length;

  const jumlahCukup =
    ringkasan?.jumlahCukup ??
    evaluasi.filter((item) => item.status === "Cukup").length;

  const jumlahPerluEvaluasi =
    ringkasan?.jumlahPerluEvaluasi ??
    evaluasi.filter((item) => item.status === "Perlu Evaluasi").length;

  const periodePrioritas =
    evaluasi.length > 0
      ? [...evaluasi].sort(
          (a, b) => Number(b.ape || 0) - Number(a.ape || 0)
        )[0]
      : null;

  const statusModel = getStatusModelData(
    ringkasan?.statusModel || "Belum Dievaluasi"
  );

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">
              Analisis Evaluasi TES
            </h2>
            <p className="text-xs text-slate-500">
              Evaluasi akurasi prediksi TES berdasarkan data aktual produksi
              bulanan.
            </p>
          </div>

          <button
            onClick={getEvaluasiPrediksi}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh Evaluasi"}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Evaluasi Aktual Prediksi TES
              </p>

              <h1 className="text-3xl font-bold">
                Analisis Evaluasi Penyuluh
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Halaman ini membantu penyuluh melihat kualitas prediksi produksi
                padi Kabupaten Sukoharjo melalui nilai MAPE, akurasi, deviasi,
                dan status evaluasi setiap periode.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <p className="text-sm text-green-100">Status Model</p>
              <h3 className="font-bold text-xl mt-1">
                {statusModel.label}
              </h3>
              <p className="text-xs text-green-100 mt-1">
                Berdasarkan evaluasi aktual
              </p>
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
                Memuat Analisis Evaluasi...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data evaluasi aktual TES dari backend.
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
                    <span className="font-semibold">
                      /api/tes/evaluasi-aktual
                    </span>{" "}
                    sudah aktif.
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
                  title="Data Evaluasi"
                  value={`${ringkasan?.jumlahDataEvaluasi || evaluasi.length} Periode`}
                  subtitle="Periode yang dibandingkan"
                  icon={ClipboardCheck}
                  tone="blue"
                />

                <StatCard
                  title="MAPE"
                  value={`${formatAngka(ringkasan?.mape)}%`}
                  subtitle="Rata-rata kesalahan"
                  icon={Percent}
                  tone="yellow"
                />

                <StatCard
                  title="Estimasi Akurasi"
                  value={`${formatAngka(ringkasan?.estimasiAkurasi)}%`}
                  subtitle="Berdasarkan nilai MAPE"
                  icon={Target}
                  tone="emerald"
                />

                <StatCard
                  title="Status Model"
                  value={statusModel.label}
                  subtitle="Kategori performa prediksi"
                  icon={
                    statusModel.label === "Akurat"
                      ? CheckCircle2
                      : AlertTriangle
                  }
                  tone={
                    statusModel.label === "Akurat"
                      ? "emerald"
                      : statusModel.label === "Cukup"
                      ? "yellow"
                      : "red"
                  }
                />
              </div>

              {/* JIKA BELUM ADA DATA EVALUASI */}
              {evaluasi.length === 0 && (
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle size={24} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Data Evaluasi Aktual Belum Tersedia
                      </h2>
                      <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                        Belum ada data aktual produksi bulanan yang cocok dengan
                        periode prediksi TES. Admin perlu menambahkan data
                        aktual produksi bulanan terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* KESIMPULAN MODEL */}
              {evaluasi.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Activity size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800 mb-3">
                        Kesimpulan Evaluasi
                      </h2>

                      <div className={`border rounded-2xl p-4 ${statusModel.box}`}>
                        <p className="text-sm leading-relaxed">
                          Nilai MAPE model sebesar{" "}
                          <span className="font-bold">
                            {formatAngka(ringkasan?.mape)}%
                          </span>{" "}
                          dengan estimasi akurasi{" "}
                          <span className="font-bold">
                            {formatAngka(ringkasan?.estimasiAkurasi)}%
                          </span>
                          . Status model saat ini adalah{" "}
                          <span className="font-bold">
                            {statusModel.label}
                          </span>
                          . {statusModel.catatan}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DISTRIBUSI STATUS */}
              {evaluasi.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <InsightCard
                    title="Prediksi Akurat"
                    value={jumlahAkurat}
                    subtitle="Error prediksi ≤ 10%"
                    icon={CheckCircle2}
                    tone="emerald"
                  />

                  <InsightCard
                    title="Prediksi Cukup"
                    value={jumlahCukup}
                    subtitle="Error prediksi 10%–20%"
                    icon={BarChart3}
                    tone="yellow"
                  />

                  <InsightCard
                    title="Perlu Evaluasi"
                    value={jumlahPerluEvaluasi}
                    subtitle="Error prediksi lebih dari 20%"
                    icon={AlertTriangle}
                    tone="red"
                  />
                </div>
              )}

              {/* PRIORITAS */}
              {periodePrioritas && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                  <p className="text-sm text-red-700 font-medium">
                    Periode Prioritas Evaluasi
                  </p>

                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {namaBulan(periodePrioritas.bulan)}{" "}
                    {periodePrioritas.tahun}
                  </h2>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStatus(
                        periodePrioritas.status
                      )}`}
                    >
                      {periodePrioritas.status}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-red-700 border border-red-200">
                      APE {formatAngka(periodePrioritas.ape)}%
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed mt-4">
                    {getArahanEvaluasi(periodePrioritas)}
                  </p>
                </div>
              )}

              {/* FILTER */}
              {evaluasi.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-slate-800">
                        Daftar Evaluasi Prediksi
                      </h2>
                      <p className="text-sm text-slate-500">
                        Perbandingan antara produksi aktual bulanan dan hasil
                        prediksi TES.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl">
                      <Filter size={16} className="text-slate-400" />

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm outline-none bg-transparent"
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
              )}

              {/* TABEL */}
              {evaluasi.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-800">
                        Tabel Evaluasi Aktual TES
                      </h2>
                      <p className="text-sm text-slate-500">
                        Menampilkan {dataTampil.length} dari{" "}
                        {dataFiltered.length} data evaluasi.
                      </p>
                    </div>

                    <button
                      onClick={() => setLihatSemua(!lihatSemua)}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                    >
                      {lihatSemua ? "Tampilkan Ringkas" : "Lihat Semua"}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
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
                          <th className="text-left font-semibold px-6 py-4">
                            Arahan Penyuluh
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {dataTampil.map((item, index) => (
                          <tr
                            key={`${item.tahun}-${item.bulan}-${index}`}
                            className="border-t border-slate-100 hover:bg-slate-50 transition"
                          >
                            <td className="px-6 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                  <CalendarDays size={18} />
                                </div>

                                <div>
                                  <p className="font-semibold text-slate-800">
                                    {namaBulan(item.bulan)} {item.tahun}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    Periode evaluasi
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {formatAngka(item.aktual)} Ton
                            </td>

                            <td className="px-6 py-4 font-semibold text-emerald-700">
                              {formatAngka(item.prediksi)} Ton
                            </td>

                            <td
                              className={`px-6 py-4 font-semibold ${
                                Number(item.selisih) < 0
                                  ? "text-red-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              {formatAngka(item.selisih)} Ton
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {formatAngka(item.ape)}%
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStatus(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-slate-600 max-w-lg leading-relaxed">
                              {getArahanEvaluasi(item)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CATATAN */}
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center shrink-0">
                  <Info size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-emerald-800 mb-1">
                    Catatan
                  </h2>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Evaluasi ini digunakan penyuluh untuk melihat kualitas
                    prediksi TES. Semakin kecil nilai MAPE, semakin baik model.
                   Hasil evaluasi tetap perlu dipadukan dengan observasi lapangan, kondisi cuaca, irigasi, serta potensi gangguan tanaman berdasarkan kondisi lapangan.
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
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
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

function InsightCard({ title, value, subtitle, icon: Icon, tone }) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${
        toneClass[tone] || toneClass.emerald
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
          <p className="text-xs mt-2 opacity-80 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}