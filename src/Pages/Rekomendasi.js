import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Lightbulb,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Leaf,
  ClipboardList,
  Gauge,
} from "lucide-react";

export default function Rekomendasi() {
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);
  const [ringkasanEvaluasi, setRingkasanEvaluasi] = useState(null);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_PREDIKSI = "http://127.0.0.1:8000/api/tes/prediksi";
  const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";

  useEffect(() => {
    getDataRekomendasi();
  }, []);

  const getDataRekomendasi = async () => {
    try {
      setLoading(true);
      setError("");

      const [resPrediksi, resEvaluasi] = await Promise.all([
        axios.get(API_PREDIKSI),
        axios.get(API_EVALUASI),
      ]);

      const prediksiPayload = resPrediksi.data?.data || {};
      const evaluasiPayload = resEvaluasi.data?.data || {};

      setRingkasanPrediksi(prediksiPayload.ringkasan || null);

      setPrediksiMendatang(
        Array.isArray(prediksiPayload.prediksiMendatang)
          ? prediksiPayload.prediksiMendatang
          : []
      );

      setRingkasanEvaluasi(evaluasiPayload.ringkasan || null);

      setEvaluasiAktual(
        Array.isArray(evaluasiPayload.evaluasi)
          ? evaluasiPayload.evaluasi
          : []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal memuat rekomendasi. Pastikan backend Laravel sudah berjalan."
      );
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

  const formatPersen = (angka) => {
    if (angka === null || angka === undefined || angka === "") return "-";
    return `${formatAngka(angka)}%`;
  };

  const rataRataPrediksi = useMemo(() => {
    if (prediksiMendatang.length === 0) return 0;

    const total = prediksiMendatang.reduce(
      (sum, item) => sum + Number(item.prediksi || 0),
      0
    );

    return total / prediksiMendatang.length;
  }, [prediksiMendatang]);

  const getKategoriPrediksi = (nilai) => {
    const prediksi = Number(nilai || 0);
    const rata = Number(rataRataPrediksi || 0);

    if (!rata) return "Belum";
    if (prediksi >= rata * 1.15) return "Tinggi";
    if (prediksi <= rata * 0.85) return "Rendah";
    return "Sedang";
  };

  const getKategoriBadge = (kategori) => {
    if (kategori === "Tinggi") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (kategori === "Sedang") {
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    }

    if (kategori === "Rendah") {
      return "bg-red-50 text-red-700 border-red-100";
    }

    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  const periodeEvaluasiSet = useMemo(() => {
    return new Set(
      evaluasiAktual.map(
        (item) => `${Number(item.tahun)}-${Number(item.bulan)}`
      )
    );
  }, [evaluasiAktual]);

  const prediksiBelumDievaluasi = useMemo(() => {
    return prediksiMendatang.filter(
      (item) =>
        !periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [prediksiMendatang, periodeEvaluasiSet]);

  const prediksiPeriodeBerikutnya =
    prediksiBelumDievaluasi[0] || prediksiMendatang[0] || null;

  const kategoriUtama = prediksiPeriodeBerikutnya
    ? getKategoriPrediksi(prediksiPeriodeBerikutnya.prediksi)
    : "-";

  const prediksiTertinggi = useMemo(() => {
    if (prediksiMendatang.length === 0) return null;

    return [...prediksiMendatang].sort(
      (a, b) => Number(b.prediksi || 0) - Number(a.prediksi || 0)
    )[0];
  }, [prediksiMendatang]);

  const prediksiTerendah = useMemo(() => {
    if (prediksiMendatang.length === 0) return null;

    return [...prediksiMendatang].sort(
      (a, b) => Number(a.prediksi || 0) - Number(b.prediksi || 0)
    )[0];
  }, [prediksiMendatang]);

  const statusModel = useMemo(() => {
    const jumlahEvaluasi = Number(ringkasanEvaluasi?.jumlahDataEvaluasi || 0);
    const mape = Number(ringkasanEvaluasi?.mape || 0);

    if (jumlahEvaluasi === 0) return "Belum Dievaluasi";
    if (ringkasanEvaluasi?.statusModel) return ringkasanEvaluasi.statusModel;
    if (mape <= 10) return "Akurat";
    if (mape <= 20) return "Cukup";
    return "Perlu Evaluasi";
  }, [ringkasanEvaluasi]);

  const statusTone = {
    Akurat: "emerald",
    Cukup: "yellow",
    "Perlu Evaluasi": "red",
    "Perlu Perbaikan": "red",
    "Belum Dievaluasi": "blue",
  };

  const jumlahPrediksiTinggi = prediksiMendatang.filter(
    (item) => getKategoriPrediksi(item.prediksi) === "Tinggi"
  ).length;

  const jumlahPrediksiSedang = prediksiMendatang.filter(
    (item) => getKategoriPrediksi(item.prediksi) === "Sedang"
  ).length;

  const jumlahPrediksiRendah = prediksiMendatang.filter(
    (item) => getKategoriPrediksi(item.prediksi) === "Rendah"
  ).length;

  const rekomendasiUtama = useMemo(() => {
    if (!prediksiPeriodeBerikutnya) {
      return "Belum ada data prediksi.";
    }

    if (kategoriUtama === "Tinggi") {
      return "Siapkan pemantauan panen dan pencatatan aktual.";
    }

    if (kategoriUtama === "Sedang") {
      return "Lakukan monitoring rutin.";
    }

    if (kategoriUtama === "Rendah") {
      return "Perlu perhatian pada cuaca, pengairan, dan kondisi lahan.";
    }

    return "Kategori belum tersedia.";
  }, [prediksiPeriodeBerikutnya, kategoriUtama]);

  const rekomendasiModel = useMemo(() => {
    if (
      !ringkasanEvaluasi ||
      Number(ringkasanEvaluasi?.jumlahDataEvaluasi || 0) === 0
    ) {
      return "Belum ada evaluasi aktual.";
    }

    if (statusModel === "Akurat") {
      return "Model akurat. Lanjutkan pembaruan data aktual bulanan.";
    }

    if (statusModel === "Cukup") {
      return "Model cukup baik. Periksa periode dengan error tinggi.";
    }

    return "Model perlu dievaluasi. Cek data historis dan aktual.";
  }, [ringkasanEvaluasi, statusModel]);

  const tabelRekomendasi = prediksiMendatang.map((item) => {
    const kategori = getKategoriPrediksi(item.prediksi);

    let rekomendasi = "Belum tersedia.";

    if (kategori === "Tinggi") {
      rekomendasi = "Siapkan pemantauan panen.";
    } else if (kategori === "Sedang") {
      rekomendasi = "Monitoring rutin.";
    } else if (kategori === "Rendah") {
      rekomendasi = "Perlu perhatian khusus.";
    }

    return {
      ...item,
      kategori,
      rekomendasi,
      sudahDievaluasi: periodeEvaluasiSet.has(
        `${Number(item.tahun)}-${Number(item.bulan)}`
      ),
    };
  });

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        {/* TOPBAR */}
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Rekomendasi Admin</h2>
            <p className="text-xs text-slate-500">
              Rekomendasi berdasarkan prediksi TES dan evaluasi aktual.
            </p>
          </div>

          <button
            onClick={getDataRekomendasi}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        {/* HERO */}
        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Sistem Rekomendasi Berbasis Prediksi
              </p>

              <h1 className="text-3xl font-bold">
                Rekomendasi Pertanian Admin
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl text-sm leading-relaxed">
                Rekomendasi sistem berdasarkan hasil prediksi TES dan evaluasi
                aktual produksi bulanan.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[240px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-100">Dasar Rekomendasi</p>
                  <h3 className="font-bold">Prediksi TES</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="-mt-16 px-8 pb-8 space-y-6">
          {error && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-600">
                    Gagal Memuat Rekomendasi
                  </h2>
                  <p className="text-slate-600 mt-2">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading && !error && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Rekomendasi...
              </h2>

              <p className="text-slate-500 text-sm">
                Mengambil data prediksi dan evaluasi.
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* RINGKASAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Total Rekomendasi"
                  value={`${prediksiMendatang.length} Data`}
                  subtitle="Periode prediksi"
                  icon={ClipboardList}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Tinggi"
                  value={`${jumlahPrediksiTinggi} Periode`}
                  subtitle="Potensi tinggi"
                  icon={TrendingUp}
                  tone="green"
                />

                <StatCard
                  title="Prediksi Sedang"
                  value={`${jumlahPrediksiSedang} Periode`}
                  subtitle="Produksi stabil"
                  icon={BarChart3}
                  tone="yellow"
                />

                <StatCard
                  title="Prediksi Rendah"
                  value={`${jumlahPrediksiRendah} Periode`}
                  subtitle="Perlu perhatian"
                  icon={TrendingDown}
                  tone="red"
                />
              </div>

              {/* REKOMENDASI UTAMA + STATUS MODEL */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Lightbulb size={24} />
                    </div>

                    <div className="w-full">
                      <h2 className="text-xl font-bold text-slate-800">
                        Rekomendasi Utama
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Periode prediksi berikutnya yang belum dievaluasi.
                      </p>

                      <div className="mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <p className="text-sm text-emerald-700">
                          Periode Rekomendasi
                        </p>

                        <h3 className="text-2xl font-bold text-emerald-800 mt-1">
                          {prediksiPeriodeBerikutnya
                            ? `${namaBulan(
                                prediksiPeriodeBerikutnya.bulan
                              )} ${prediksiPeriodeBerikutnya.tahun}`
                            : "-"}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                            {prediksiPeriodeBerikutnya
                              ? `${formatAngka(
                                  prediksiPeriodeBerikutnya.prediksi
                                )} Ton`
                              : "-"}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                              kategoriUtama
                            )}`}
                          >
                            Prediksi {kategoriUtama}
                          </span>
                        </div>

                        <p className="text-sm text-emerald-700 leading-relaxed mt-4">
                          {rekomendasiUtama}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-4">
                    Status Model
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniInfo
                      label="Historis"
                      value={`${ringkasanPrediksi?.jumlahDataHistoris || 0}`}
                    />

                    <MiniInfo
                      label="Evaluasi"
                      value={`${ringkasanEvaluasi?.jumlahDataEvaluasi || 0}`}
                    />

                    <MiniInfo
                      label="MAPE"
                      value={formatPersen(ringkasanEvaluasi?.mape)}
                    />

                    <MiniInfo
                      label="Akurasi"
                      value={formatPersen(ringkasanEvaluasi?.estimasiAkurasi)}
                    />
                  </div>

                  <div className="mt-5">
                    <InsightCard
                      title="Status"
                      value={statusModel}
                      subtitle={rekomendasiModel}
                      icon={Gauge}
                      tone={statusTone[statusModel] || "blue"}
                    />
                  </div>
                </div>
              </div>

              {/* DATA PENDUKUNG */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InsightCard
                  title="Prediksi Tertinggi"
                  value={
                    prediksiTertinggi
                      ? `${formatAngka(prediksiTertinggi.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiTertinggi
                      ? `${namaBulan(prediksiTertinggi.bulan)} ${
                          prediksiTertinggi.tahun
                        }`
                      : "-"
                  }
                  icon={CheckCircle2}
                  tone="emerald"
                />

                <InsightCard
                  title="Rata-rata Prediksi"
                  value={`${formatAngka(rataRataPrediksi)} Ton`}
                  subtitle="Rata-rata seluruh periode"
                  icon={Target}
                  tone="yellow"
                />

                <InsightCard
                  title="Prediksi Terendah"
                  value={
                    prediksiTerendah
                      ? `${formatAngka(prediksiTerendah.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiTerendah
                      ? `${namaBulan(prediksiTerendah.bulan)} ${
                          prediksiTerendah.tahun
                        }`
                      : "-"
                  }
                  icon={AlertTriangle}
                  tone="red"
                />
              </div>

              {/* TABEL */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Daftar Rekomendasi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Ringkasan rekomendasi per periode prediksi.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {tabelRekomendasi.length} Data
                  </span>
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
                          Prediksi TES
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Evaluasi
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tabelRekomendasi.length > 0 ? (
                        tabelRekomendasi.map((item, index) => (
                          <tr
                            key={`${item.tahun}-${item.bulan}-${index}`}
                            className="border-t border-slate-100 hover:bg-slate-50"
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
                                    Periode prediksi
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-bold text-emerald-700">
                              {formatAngka(item.prediksi)} Ton
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                                  item.kategori
                                )}`}
                              >
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                  item.sudahDievaluasi
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-slate-50 text-slate-600 border-slate-100"
                                }`}
                              >
                                {item.sudahDievaluasi ? "Sudah" : "Belum"}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {item.rekomendasi}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data rekomendasi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
    green: "bg-green-100 text-green-700",
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
    blue: "bg-blue-50 text-blue-700 border-blue-100",
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
          <h2 className="text-xl font-bold mt-2">{value}</h2>
          <p className="text-xs mt-1 opacity-80">{subtitle}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <h3 className="font-bold text-slate-800 mt-1">{value}</h3>
    </div>
  );
}