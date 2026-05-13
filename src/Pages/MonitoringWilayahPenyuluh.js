import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  AlertTriangle,
  RefreshCw,
  Leaf,
  ClipboardList,
  Filter,
  Info,
  CalendarDays,
  FileText,
  Target,
  CloudSun,
  Thermometer,
  Droplets,
  TrendingUp,
  TrendingDown,
  Save,
  Percent,
  ListChecks,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function MonitoringWilayahPenyuluh() {
  const [ringkasanPrediksi, setRingkasanPrediksi] = useState(null);
  const [prediksiMendatang, setPrediksiMendatang] = useState([]);

  const [ringkasanEvaluasi, setRingkasanEvaluasi] = useState(null);
  const [evaluasiAktual, setEvaluasiAktual] = useState([]);

  const [cuaca, setCuaca] = useState(null);
  const [rekomendasi, setRekomendasi] = useState([]);

  const [daftarCatatan, setDaftarCatatan] = useState([]);
  const [catatanPenyuluh, setCatatanPenyuluh] = useState("");
  const [savingCatatan, setSavingCatatan] = useState(false);

  const [filterKategori, setFilterKategori] = useState("Semua");
  const [lihatSemua, setLihatSemua] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_PREDIKSI = "http://127.0.0.1:8000/api/tes/prediksi";
  const API_EVALUASI = "http://127.0.0.1:8000/api/tes/evaluasi-aktual";
  const API_REKOMENDASI = "http://127.0.0.1:8000/api/rekomendasi-prediksi";
  const API_CATATAN = "http://127.0.0.1:8000/api/catatan-penyuluh";

  useEffect(() => {
    getMonitoringPrediksi();
  }, []);

  const getMonitoringPrediksi = async () => {
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
        err.message || "Gagal mengambil data monitoring prediksi penyuluh."
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

  const rataRataPrediksi = useMemo(() => {
    if (prediksiMendatang.length === 0) return 0;

    const total = prediksiMendatang.reduce(
      (sum, item) => sum + Number(item.prediksi || 0),
      0
    );

    return total / prediksiMendatang.length;
  }, [prediksiMendatang]);

  const getKategoriPrediksi = (nilai) => {
    if (!nilai || rataRataPrediksi <= 0) return "Belum Dinilai";

    if (nilai >= rataRataPrediksi * 1.2) return "Tinggi";
    if (nilai <= rataRataPrediksi * 0.8) return "Rendah";

    return "Sedang";
  };

  const getRekomendasiDefault = (kategori) => {
    if (kategori === "Tinggi") {
      return "Produksi diperkirakan tinggi. Penyuluh dapat mengarahkan petani untuk menyiapkan tenaga panen, alat panen, penyimpanan, dan distribusi hasil.";
    }

    if (kategori === "Sedang") {
      return "Produksi diperkirakan stabil. Penyuluh dapat menyarankan pemantauan rutin terhadap kebutuhan air, kondisi tanaman, dan cuaca.";
    }

    if (kategori === "Rendah") {
      return "Produksi diperkirakan rendah. Penyuluh perlu memberi pendampingan terkait pengairan, hama, penyakit tanaman, dan faktor cuaca.";
    }

    return "Rekomendasi akan tersedia setelah data prediksi dan cuaca berhasil dimuat.";
  };

  const periodeEvaluasiSet = useMemo(() => {
    return new Set(
      evaluasiAktual.map(
        (item) => `${Number(item.tahun)}-${Number(item.bulan)}`
      )
    );
  }, [evaluasiAktual]);

  const evaluasiMap = useMemo(() => {
    const map = new Map();

    evaluasiAktual.forEach((item) => {
      map.set(`${Number(item.tahun)}-${Number(item.bulan)}`, item);
    });

    return map;
  }, [evaluasiAktual]);

  const rekomendasiMap = useMemo(() => {
    const map = new Map();

    rekomendasi.forEach((item) => {
      map.set(`${Number(item.tahun)}-${Number(item.bulan)}`, item);
    });

    return map;
  }, [rekomendasi]);

  const dataMonitoringSemua = useMemo(() => {
    return prediksiMendatang.map((item) => {
      const key = `${Number(item.tahun)}-${Number(item.bulan)}`;
      const evaluasi = evaluasiMap.get(key);
      const rekom = rekomendasiMap.get(key);

      const kategori =
        rekom?.kategori_prediksi ||
        item.kategori ||
        getKategoriPrediksi(Number(item.prediksi));

      return {
        tahun: Number(item.tahun),
        bulan: Number(item.bulan),
        periode: item.periode,
        prediksi: Number(item.prediksi || 0),
        kategori,
        aktual: evaluasi?.aktual ?? null,
        deviasi: evaluasi?.deviasi ?? null,
        selisih: evaluasi?.selisih ?? null,
        ape: evaluasi?.ape ?? null,
        statusEvaluasi: evaluasi?.status || "Belum Dievaluasi",
        rekomendasi:
          rekom?.rekomendasi ||
          item.rekomendasi ||
          getRekomendasiDefault(kategori),
      };
    });
  }, [prediksiMendatang, evaluasiMap, rekomendasiMap, rataRataPrediksi]);

  const dataMonitoringBelumDievaluasi = useMemo(() => {
    return dataMonitoringSemua.filter(
      (item) =>
        !periodeEvaluasiSet.has(`${Number(item.tahun)}-${Number(item.bulan)}`)
    );
  }, [dataMonitoringSemua, periodeEvaluasiSet]);

  const dataMonitoring = useMemo(() => {
    return dataMonitoringBelumDievaluasi.length > 0
      ? dataMonitoringBelumDievaluasi
      : dataMonitoringSemua;
  }, [dataMonitoringBelumDievaluasi, dataMonitoringSemua]);

  const dataFiltered = useMemo(() => {
    return dataMonitoring.filter((item) => {
      return filterKategori === "Semua" || item.kategori === filterKategori;
    });
  }, [dataMonitoring, filterKategori]);

  const dataTampil = lihatSemua ? dataFiltered : dataFiltered.slice(0, 6);

  const jumlahTinggi = dataMonitoring.filter(
    (item) => item.kategori === "Tinggi"
  ).length;

  const jumlahSedang = dataMonitoring.filter(
    (item) => item.kategori === "Sedang"
  ).length;

  const jumlahRendah = dataMonitoring.filter(
    (item) => item.kategori === "Rendah"
  ).length;

  const jumlahPerluEvaluasi =
    ringkasanEvaluasi?.jumlahPerluEvaluasi ??
    evaluasiAktual.filter((item) => item.status === "Perlu Evaluasi").length;

  const prediksiBulanDepan = dataMonitoring[0] || null;

  const prediksiTertinggi = useMemo(() => {
    if (dataMonitoring.length === 0) return null;

    return [...dataMonitoring].sort(
      (a, b) => Number(b.prediksi || 0) - Number(a.prediksi || 0)
    )[0];
  }, [dataMonitoring]);

  const prediksiTerendah = useMemo(() => {
    if (dataMonitoring.length === 0) return null;

    return [...dataMonitoring].sort(
      (a, b) => Number(a.prediksi || 0) - Number(b.prediksi || 0)
    )[0];
  }, [dataMonitoring]);

  const statusModel = ringkasanEvaluasi?.statusModel || "Belum Dievaluasi";

  const grafikData = dataMonitoring.slice(0, 12).map((item) => ({
    periode: `${namaBulan(item.bulan)} ${item.tahun}`,
    prediksi: item.prediksi,
    aktual: item.aktual,
  }));

  const rekomendasiPrioritas =
    dataMonitoring.find((item) => item.kategori === "Rendah") ||
    dataMonitoring.find((item) => item.kategori === "Sedang") ||
    dataMonitoring[0] ||
    null;

  const riwayatCatatanTampil = daftarCatatan.slice(0, 5);

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

  return (
    <div className="flex min-h-screen bg-[#f4f7fb]">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-800">Monitoring Prediksi</h2>
            <p className="text-xs text-slate-500">
              Monitoring hasil prediksi TES, evaluasi aktual, cuaca, dan
              rekomendasi pendampingan.
            </p>
          </div>

          <button
            onClick={getMonitoringPrediksi}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Memuat..." : "Refresh Data"}
          </button>
        </div>

        <section className="bg-gradient-to-r from-emerald-700 via-green-600 to-lime-600 px-8 pt-8 pb-24 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm mb-2">
                Monitoring Prediksi Produksi Padi
              </p>

              <h1 className="text-3xl font-bold">
                Monitoring Prediksi Penyuluh
              </h1>

              <p className="text-green-100 mt-2 max-w-3xl">
                Halaman ini digunakan penyuluh untuk memantau prediksi produksi
                padi Kabupaten Sukoharjo, melihat kategori prediksi, evaluasi
                aktual, kondisi cuaca, dan rekomendasi tindak lanjut.
              </p>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-4 min-w-[250px] backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white text-emerald-700 flex items-center justify-center">
                  <Leaf size={22} />
                </div>

                <div>
                  <p className="text-sm text-green-100">Status Monitoring</p>
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
                Memuat Monitoring Prediksi...
              </h2>

              <p className="text-slate-500 text-sm">
                Sistem sedang mengambil data prediksi TES, evaluasi aktual,
                rekomendasi, cuaca, dan catatan penyuluh.
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
                    Gagal Memuat Data
                  </h2>

                  <p className="text-slate-600 mt-2">{error}</p>

                  <p className="text-sm text-slate-500 mt-3">
                    Pastikan backend Laravel berjalan dan endpoint prediksi,
                    evaluasi, rekomendasi, cuaca, serta catatan penyuluh sudah
                    aktif.
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
                  icon={ClipboardList}
                  tone="emerald"
                />

                <StatCard
                  title="Prediksi Belum Evaluasi"
                  value={`${dataMonitoring.length} Periode`}
                  subtitle="Periode berikutnya"
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
                  subtitle={`Status model: ${statusModel}`}
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
                      : "Belum ada prediksi"
                  }
                  icon={TrendingDown}
                  tone="red"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <MiniCard
                  title="Prediksi Tinggi"
                  value={`${jumlahTinggi} Periode`}
                  subtitle="Potensi produksi tinggi"
                  tone="emerald"
                />

                <MiniCard
                  title="Prediksi Sedang"
                  value={`${jumlahSedang} Periode`}
                  subtitle="Produksi relatif stabil"
                  tone="yellow"
                />

                <MiniCard
                  title="Prediksi Rendah"
                  value={`${jumlahRendah} Periode`}
                  subtitle="Perlu pendampingan"
                  tone="red"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="font-bold text-slate-800">
                        Grafik Prediksi Periode Berikutnya
                      </h2>
                      <p className="text-sm text-slate-500">
                        Grafik menampilkan periode prediksi yang belum
                        dievaluasi.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      TES
                    </span>
                  </div>

                  <div className="h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={grafikData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />

                        <XAxis
                          dataKey="periode"
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{ fontSize: 12, fill: "#64748b" }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: "14px",
                            border: "1px solid #d1fae5",
                            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                            fontSize: "13px",
                          }}
                          formatter={(value, name) => [
                            `${formatAngka(value)} Ton`,
                            name,
                          ]}
                        />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="prediksi"
                          name="Prediksi TES"
                          stroke="#65a30d"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />

                        <Line
                          type="monotone"
                          dataKey="aktual"
                          name="Aktual Bulanan"
                          stroke="#059669"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-4">
                    Kondisi Cuaca Pendukung
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
                      label="Data Cuaca"
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
                        Dipilih berdasarkan prediksi rendah/sedang atau periode
                        yang memerlukan perhatian.
                      </p>

                      <div className="mt-4 border border-emerald-100 bg-emerald-50 rounded-2xl p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getKategoriBadge(
                              rekomendasiPrioritas.kategori
                            )}`}
                          >
                            Prediksi {rekomendasiPrioritas.kategori}
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
                          {rekomendasiPrioritas.rekomendasi}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Data Monitoring Prediksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Data yang ditampilkan adalah periode prediksi yang belum
                      dievaluasi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-xl">
                    <Filter size={16} className="text-slate-400" />

                    <select
                      value={filterKategori}
                      onChange={(e) => setFilterKategori(e.target.value)}
                      className="text-sm outline-none bg-transparent"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Rendah">Rendah</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      Tabel Monitoring Prediksi
                    </h2>
                    <p className="text-sm text-slate-500">
                      Menampilkan {dataTampil.length} dari{" "}
                      {dataFiltered.length} data monitoring prediksi.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      {dataFiltered.length} Data
                    </span>

                    <button
                      onClick={() => setLihatSemua(!lihatSemua)}
                      className="px-4 py-2 text-sm rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold transition"
                    >
                      {lihatSemua ? "Tampilkan Ringkas" : "Lihat Semua"}
                    </button>
                  </div>
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
                          Aktual Bulanan
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          APE
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Status Evaluasi
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Kategori
                        </th>
                        <th className="text-left font-semibold px-6 py-4">
                          Rekomendasi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {dataTampil.length > 0 ? (
                        dataTampil.map((item, index) => (
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
                                    Periode prediksi
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-bold text-emerald-700">
                              {formatAngka(item.prediksi)} Ton
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {item.aktual !== null &&
                              item.aktual !== undefined
                                ? `${formatAngka(item.aktual)} Ton`
                                : "-"}
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {item.ape !== null && item.ape !== undefined
                                ? `${formatAngka(item.ape)}%`
                                : "-"}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                  item.statusEvaluasi
                                )}`}
                              >
                                {item.statusEvaluasi}
                              </span>
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

                            <td className="px-6 py-4 text-slate-600 max-w-lg leading-relaxed">
                              {item.rekomendasi || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-10 text-center text-slate-500"
                          >
                            Belum ada data monitoring prediksi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                    Monitoring prediksi ini digunakan penyuluh untuk memantau
                    hasil prediksi produksi padi Kabupaten Sukoharjo,
                    membandingkan prediksi dengan aktual bulanan jika tersedia,
                    serta memberi arahan pendampingan berdasarkan kategori
                    prediksi, deviasi, cuaca, dan rekomendasi sistem.
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

function MiniCard({ title, value, subtitle, tone }) {
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
      <p className="text-sm font-semibold opacity-90">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
      <p className="text-xs mt-2 opacity-80">{subtitle}</p>
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