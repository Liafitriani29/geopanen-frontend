import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  Leaf,
  FileText,
  Target,
  Info,
  CalendarDays,
  CloudSun,
  Thermometer,
  Droplets,
  TrendingUp,
  CheckCircle2,
  ClipboardList,
  Save,
  Percent,
  Database,
  ListChecks,
} from "lucide-react";

export default function PenyuluhDashboard() {
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);

  const [ringkasanEvaluasi, setRingkasanEvaluasi] = useState(null);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);

  const [cuaca, setCuaca] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);

  const [daftarCatatan, setDaftarCatatan] = useState([]);
  const [catatanPenyuluh, setCatatanPenyuluh] = useState("");
  const [savingCatatan, setSavingCatatan] = useState(false);

  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_PREDIKSI = "http://127.0.0.1:8000/api/tes/prediksi";
  const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";
  const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";
  const API_CATATAN = "http://127.0.0.1:8000/api/catatan-penyuluh";

  useEffect(() => {
    getDashboardPenyuluh();
  }, []);

  const getDashboardPenyuluh = async () => {
    try {
      setLoading(true);
      setError("");

      const [resPrediksi, resEvaluasi, resRekomendasi, resCatatan] =
        await Promise.allSettled([
          axios.get(API_PREDIKSI),
          axios.get(API_EVALUASI),
          axios.get(API_REKOMENDASI),
          axios.get(API_CATATAN),
        ]);

      if (resPrediksi.status === "rejected") {
        throw new Error("Gagal mengambil data prediksi TES.");
      }

      const payloadPrediksi = resPrediksi.value.data?.data || {};
      setRingkasanPrediksi(payloadPrediksi.ringkasan || null);

      setPrediksiMendatang(
        Array.isArray(payloadPrediksi.prediksiMendatang)
          ? payloadPrediksi.prediksiMendatang
          : []
      );

      if (resEvaluasi.status === "fulfilled") {
        const payloadEvaluasi = resEvaluasi.value.data?.data || {};
        setRingkasanEvaluasi(payloadEvaluasi.ringkasan || null);

        setEvaluasiAktual(
          Array.isArray(payloadEvaluasi.evaluasi)
            ? payloadEvaluasi.evaluasi
            : []
        );
      } else {
        setRingkasanEvaluasi(null);
        setEvaluasiAktual([]);
      }

      if (resRekomendasi.status === "fulfilled") {
        const payloadRekomendasi = resRekomendasi.value.data?.data || {};
        setCuaca(payloadRekomendasi.cuaca_terbaru || null);

        setRekomendasi(
          Array.isArray(payloadRekomendasi.rekomendasi)
            ? payloadRekomendasi.rekomendasi
            : []
        );
      } else {
        setCuaca(null);
        setRekomendasi([]);
      }

      if (resCatatan.status === "fulfilled") {
        const payloadCatatan = resCatatan.value.data?.data || [];

        setDaftarCatatan(Array.isArray(payloadCatatan) ? payloadCatatan : []);
      } else {
        setDaftarCatatan([]);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Gagal mengambil data dashboard penyuluh dari backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCatatanPenyuluh = async () => {
    try {
      const res = await axios.get(API_CATATAN);
      const payload = res.data?.data || [];

      setDaftarCatatan(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error(err);
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

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTanggalJam = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const rekomendasiBelumDievaluasi = useMemo(() => {
    return rekomendasi.filter(
      (item) =>
        !periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [rekomendasi, periodeEvaluasiSet]);

  const prediksiBulanDepan =
    prediksiBelumDievaluasi[0] || prediksiMendatang[0] || null;

  const dataPrediksiUntukPenyuluh =
    prediksiBelumDievaluasi.length > 0
      ? prediksiBelumDievaluasi
      : prediksiMendatang;

  const dataRekomendasiUntukPenyuluh =
    rekomendasiBelumDievaluasi.length > 0
      ? rekomendasiBelumDievaluasi
      : rekomendasi;

  const prediksiTertinggi = useMemo(() => {
    if (prediksiMendatang.length === 0) return null;

    return [...prediksiMendatang].sort(
      (a, b) => Number(b.prediksi || 0) - Number(a.prediksi || 0)
    )[0];
  }, [prediksiMendatang]);

  const jumlahPerluEvaluasi =
    ringkasanEvaluasi?.jumlahPerluEvaluasi ??
    evaluasiAktual.filter((item) => item.status === "Perlu Evaluasi").length;

  const statusModel = ringkasanEvaluasi?.statusModel || "Belum Dievaluasi";

  const statusModelClass =
    statusModel === "Akurat"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : statusModel === "Cukup"
      ? "bg-yellow-50 text-yellow-700 border-yellow-100"
      : statusModel === "Perlu Evaluasi" || statusModel === "Perlu Perbaikan"
      ? "bg-red-50 text-red-700 border-red-100"
      : "bg-slate-50 text-slate-700 border-slate-100";

  const StatusIcon =
    statusModel === "Akurat"
      ? CheckCircle2
      : statusModel === "Belum Dievaluasi"
      ? ClipboardList
      : AlertTriangle;

  const evaluasiFiltered = useMemo(() => {
    if (filterStatus === "Semua") return evaluasiAktual;

    return evaluasiAktual.filter((item) => item.status === filterStatus);
  }, [evaluasiAktual, filterStatus]);

  const rekomendasiPrioritas =
    dataRekomendasiUntukPenyuluh.find(
      (item) => item.kategori_prediksi === "Rendah"
    ) ||
    dataRekomendasiUntukPenyuluh.find(
      (item) => item.kategori_prediksi === "Sedang"
    ) ||
    dataRekomendasiUntukPenyuluh[0] ||
    null;

  const prediksiTabel = dataPrediksiUntukPenyuluh.slice(0, 6);

  const riwayatCatatanTampil = daftarCatatan.slice(0, 5);

  const rekomendasiDashboard =
    statusModel === "Akurat"
      ? "Model TES menunjukkan hasil akurat berdasarkan data aktual yang tersedia. Penyuluh dapat menggunakan hasil prediksi sebagai bahan pendampingan petani."
      : statusModel === "Cukup"
      ? "Model masih cukup baik, tetapi penyuluh perlu mencermati periode dengan deviasi sedang."
      : statusModel === "Perlu Evaluasi" || statusModel === "Perlu Perbaikan"
      ? "Terdapat periode dengan error tinggi. Penyuluh perlu meninjau data aktual, cuaca, dan kemungkinan faktor lapangan."
      : "Belum ada evaluasi aktual. Admin perlu menambahkan data aktual produksi bulanan agar model dapat dievaluasi.";

  const handleSimpanCatatan = async () => {
    try {
      if (!catatanPenyuluh.trim()) {
        alert("Catatan penyuluh tidak boleh kosong.");
        return;
      }

      if (!prediksiBulanDepan) {
        alert("Periode prediksi belum tersedia.");
        return;
      }

      setSavingCatatan(true);

      let user = null;

      try {
        const userString = localStorage.getItem("user");
        user = userString ? JSON.parse(userString) : null;
      } catch {
        user = null;
      }

      await axios.post(API_CATATAN, {
        user_id: user?.id || null,
        nama_penyuluh: user?.name || user?.nama || "Penyuluh",
        kabupaten: "Sukoharjo",
        tahun: Number(prediksiBulanDepan.tahun),
        bulan: Number(prediksiBulanDepan.bulan),
        catatan: catatanPenyuluh.trim(),
      });

      alert("Catatan penyuluh berhasil disimpan ke database.");
      setCatatanPenyuluh("");
      await getCatatanPenyuluh();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Gagal menyimpan catatan penyuluh ke database."
      );
    } finally {
      setSavingCatatan(false);
    }
  };

  const getStatusBadge = (status) => {
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

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Dashboard Penyuluh</h2>
            <p className="text-xs text-slate-500">
              Monitoring prediksi TES, evaluasi aktual, cuaca, dan rekomendasi.
            </p>
          </div>

          <button
            onClick={getDashboardPenyuluh}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-200 px-4 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>

        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Monitoring Prediksi Produksi Padi
              </p>

              <h1 className="text-3xl font-bold">
                Dashboard Penyuluh Pertanian
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Halaman ini membantu penyuluh melihat hasil prediksi produksi
                padi Kabupaten Sukoharjo, evaluasi aktual TES, periode yang
                perlu perhatian, kondisi cuaca, dan rekomendasi pendampingan.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-100">Status Dashboard</p>
                  <h3 className="font-bold">
                    {loading ? "Memuat Data" : "Data Tersedia"}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-16 px-8 pb-8 space-y-6">
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                <RefreshCw size={30} className="animate-spin" />
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Memuat Dashboard Penyuluh...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data prediksi, evaluasi, cuaca,
                rekomendasi, dan catatan dari backend.
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-red-600">
                    Gagal Memuat Dashboard
                  </h2>

                  <p className="text-slate-600 mt-2">{error}</p>

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan backend Laravel berjalan dan endpoint prediksi,
                    evaluasi, rekomendasi, serta catatan penyuluh sudah aktif.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Data Historis"
                  value={`${ringkasanPrediksi?.jumlahDataHistoris || 0} Data`}
                  subtitle="Data produksi bulanan TES"
                  icon={Database}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Belum Evaluasi"
                  value={`${dataPrediksiUntukPenyuluh.length} Periode`}
                  subtitle="Periode prediksi berikutnya"
                  icon={TrendingUp}
                  tone="blue"
                />

                <StatCard
                  title="MAPE Aktual"
                  value={
                    ringkasanEvaluasi?.mape !== undefined
                      ? `${formatAngka(ringkasanEvaluasi.mape)}%`
                      : "-"
                  }
                  subtitle="Rata-rata error evaluasi"
                  icon={Percent}
                  tone="yellow"
                />

                <StatCard
                  title="Catatan Penyuluh"
                  value={`${daftarCatatan.length} Catatan`}
                  subtitle="Tersimpan di database"
                  icon={ListChecks}
                  tone="red"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InsightCard
                  title="Prediksi Berikutnya"
                  value={
                    prediksiBulanDepan
                      ? `${formatAngka(prediksiBulanDepan.prediksi)} Ton`
                      : "-"
                  }
                  subtitle={
                    prediksiBulanDepan
                      ? `${namaBulan(prediksiBulanDepan.bulan)} ${
                          prediksiBulanDepan.tahun
                        }`
                      : "Belum ada prediksi"
                  }
                  icon={CalendarDays}
                  tone="emerald"
                />

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
                      : "Belum ada prediksi"
                  }
                  icon={TrendingUp}
                  tone="blue"
                />

                <InsightCard
                  title="Status Model"
                  value={statusModel}
                  subtitle="Berdasarkan evaluasi aktual produksi bulanan."
                  icon={StatusIcon}
                  tone={
                    statusModel === "Akurat"
                      ? "emerald"
                      : statusModel === "Perlu Evaluasi" ||
                        statusModel === "Perlu Perbaikan"
                      ? "red"
                      : "blue"
                  }
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Activity size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800 mb-3">
                        Ringkasan Evaluasi Prediksi
                      </h2>

                      <div
                        className={`border rounded-2xl p-4 ${statusModelClass}`}
                      >
                        <p className="text-sm leading-relaxed">
                          Model TES memiliki MAPE{" "}
                          <span className="font-bold">
                            {ringkasanEvaluasi?.mape !== undefined
                              ? `${formatAngka(ringkasanEvaluasi.mape)}%`
                              : "-"}
                          </span>{" "}
                          dengan estimasi akurasi{" "}
                          <span className="font-bold">
                            {ringkasanEvaluasi?.estimasiAkurasi !== undefined
                              ? `${formatAngka(
                                  ringkasanEvaluasi.estimasiAkurasi
                                )}%`
                              : "-"}
                          </span>
                          . Status model saat ini adalah{" "}
                          <span className="font-bold">{statusModel}</span>.
                        </p>
                      </div>

                      <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                        Penyuluh dapat menggunakan informasi ini untuk melihat
                        periode yang perlu pendampingan lebih lanjut, terutama
                        jika terdapat deviasi tinggi atau prediksi rendah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-4">
                    Kondisi Cuaca
                  </h2>

                  <div className="space-y-4">
                    <InfoRow
                      icon={CloudSun}
                      label="Kondisi"
                      value={cuaca?.kondisi || "-"}
                    />

                    <InfoRow
                      icon={Thermometer}
                      label="Suhu"
                      value={
                        cuaca?.suhu !== null && cuaca?.suhu !== undefined
                          ? `${formatAngka(cuaca.suhu)}°C`
                          : "-"
                      }
                    />

                    <InfoRow
                      icon={Droplets}
                      label="Kelembapan"
                      value={
                        cuaca?.kelembaban !== null &&
                        cuaca?.kelembaban !== undefined
                          ? `${formatAngka(cuaca.kelembaban)}%`
                          : "-"
                      }
                    />

                    <InfoRow
                      icon={CalendarDays}
                      label="Data Cuaca Terakhir"
                      value={formatTanggal(cuaca?.tanggal)}
                    />
                  </div>

                  <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-emerald-700">
                      Catatan Cuaca
                    </p>
                    <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                      {cuaca?.catatan_cuaca ||
                        "Data cuaca digunakan sebagai pendukung rekomendasi penyuluh."}
                    </p>
                  </div>
                </div>
              </div>

              {rekomendasiPrioritas && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
                      <Target size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        Rekomendasi Pendampingan Prioritas
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Rekomendasi dipilih dari periode prediksi yang belum
                        dievaluasi.
                      </p>

                      <div className="mt-4 border border-emerald-100 bg-emerald-50 rounded-2xl p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                              rekomendasiPrioritas.kategori_prediksi
                            )}`}
                          >
                            Prediksi {rekomendasiPrioritas.kategori_prediksi}
                          </span>

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-100">
                            {namaBulan(rekomendasiPrioritas.bulan)}{" "}
                            {rekomendasiPrioritas.tahun}
                          </span>

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-100">
                            {formatAngka(rekomendasiPrioritas.prediksi)} Ton
                          </span>
                        </div>

                        <p className="text-sm text-emerald-700 leading-relaxed font-semibold">
                          {rekomendasiPrioritas.rekomendasi ||
                            rekomendasiDashboard}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Evaluasi Aktual Prediksi TES
                    </h2>

                    <p className="text-sm text-slate-500">
                      Menampilkan perbandingan prediksi TES dengan aktual
                      produksi bulanan yang sudah tersedia.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-slate-200 bg-white px-4 py-2 rounded-xl text-sm outline-none"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Akurat">Akurat</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Perlu Evaluasi">Perlu Evaluasi</option>
                    </select>

                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {evaluasiFiltered.length} Data
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {evaluasiAktual.length > 0 ? (
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
                        </tr>
                      </thead>

                      <tbody>
                        {evaluasiFiltered.map((item, index) => (
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

                            <td className="px-6 py-4 text-slate-700 font-semibold">
                              {formatAngka(item.aktual)} Ton
                            </td>

                            <td className="px-6 py-4 text-emerald-700 font-semibold">
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

                            <td className="px-6 py-4 text-slate-700 font-semibold">
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
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="text-left font-semibold px-6 py-4">
                            Periode
                          </th>
                          <th className="text-left font-semibold px-6 py-4">
                            Prediksi TES
                          </th>
                          <th className="text-left font-semibold px-6 py-4">
                            Keterangan
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {prediksiTabel.length > 0 ? (
                          prediksiTabel.map((item, index) => (
                            <tr
                              key={`${item.tahun}-${item.bulan}-${index}`}
                              className="border-t border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-6 py-4 font-semibold text-slate-800">
                                {namaBulan(item.bulan)} {item.tahun}
                              </td>

                              <td className="px-6 py-4 text-emerald-700 font-semibold">
                                {formatAngka(item.prediksi)} Ton
                              </td>

                              <td className="px-6 py-4 text-slate-500">
                                Belum ada data aktual produksi bulanan untuk
                                evaluasi periode ini.
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="px-6 py-10 text-center text-slate-500"
                            >
                              Belum ada data prediksi.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Catatan Tambahan Penyuluh
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Catatan akan disimpan ke database sesuai periode prediksi
                      berikutnya, yaitu{" "}
                      <span className="font-semibold text-emerald-700">
                        {prediksiBulanDepan
                          ? `${namaBulan(prediksiBulanDepan.bulan)} ${prediksiBulanDepan.tahun}`
                          : "-"}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <textarea
                  value={catatanPenyuluh}
                  onChange={(e) => setCatatanPenyuluh(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl p-4 h-32 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Contoh: Periode dengan prediksi rendah perlu pendampingan terkait pengairan, hama, penyakit tanaman, dan kesiapan petani menghadapi kondisi cuaca."
                />

                <button
                  onClick={handleSimpanCatatan}
                  disabled={savingCatatan}
                  className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 text-sm font-semibold flex items-center gap-2 transition disabled:opacity-60"
                >
                  <Save size={17} />
                  {savingCatatan ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Riwayat Catatan Penyuluh
                    </h2>
                    <p className="text-sm text-slate-500">
                      Catatan yang sudah tersimpan di database.
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    {daftarCatatan.length} Catatan
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
                          Penyuluh
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Catatan
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Waktu Simpan
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {riwayatCatatanTampil.length > 0 ? (
                        riwayatCatatanTampil.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-6 py-4 text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {namaBulan(item.bulan)} {item.tahun}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {item.nama_penyuluh || "Penyuluh"}
                            </td>

                            <td className="px-6 py-4 text-slate-600 max-w-xl leading-relaxed">
                              {item.catatan || "-"}
                            </td>

                            <td className="px-6 py-4 text-slate-500">
                              {formatTanggalJam(item.created_at)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada catatan penyuluh yang tersimpan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center shrink-0">
                  <Info size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-emerald-800 mb-1">Catatan</h2>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Dashboard penyuluh digunakan untuk memantau hasil prediksi
                    produksi padi Kabupaten Sukoharjo, mengevaluasi kesesuaian
                    prediksi dengan data aktual bulanan, serta memberikan arahan
                    kepada petani berdasarkan hasil prediksi, deviasi, dan
                    kondisi cuaca. Catatan penyuluh yang disimpan dapat
                    digunakan kembali pada laporan penyuluh atau laporan admin.
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
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
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
    blue: "bg-blue-50 text-blue-700 border-blue-100",
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
          <h2 className="text-xl font-bold mt-2">{value}</h2>
          <p className="text-xs mt-2 opacity-80 leading-relaxed">{subtitle}</p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Icon size={16} className="text-emerald-600" />
        {label}
      </div>

      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}