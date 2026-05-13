import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../components/Sidebar";

function warnaStatus(status) {
  if (status === "Normal") return "#22c55e";
  if (status === "Cukup") return "#facc15";
  if (status === "Perlu Evaluasi") return "#ef4444";
  return "#9ca3af";
}

function warnaTextStatus(status) {
  if (status === "Normal") return "text-green-400";
  if (status === "Cukup") return "text-yellow-400";
  if (status === "Perlu Evaluasi") return "text-red-400";
  return "text-slate-400";
}

function warnaRisiko(risiko) {
  if (risiko === "Rendah") return "#22c55e";
  if (risiko === "Sedang") return "#facc15";
  if (risiko === "Tinggi") return "#ef4444";
  return "#9ca3af";
}

function warnaTextRisiko(risiko) {
  if (risiko === "Rendah") return "text-green-400";
  if (risiko === "Sedang") return "text-yellow-400";
  if (risiko === "Tinggi") return "text-red-400";
  return "text-slate-400";
}

function ukuranMarker(risiko) {
  if (risiko === "Tinggi") return 18;
  if (risiko === "Sedang") return 14;
  if (risiko === "Rendah") return 11;
  return 11;
}

function formatPeriode(periode) {
  if (!periode || periode === "-") return "-";

  const bulanIndonesia = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const bagian = String(periode).split("-");
  const tahun = bagian[0];
  const bulan = Number(bagian[1]);

  if (!tahun || !bulan || bulan < 1 || bulan > 12) {
    return periode;
  }

  return `${bulanIndonesia[bulan - 1]} ${tahun}`;
}

export default function AnalisisPrediksiPenyuluh() {
  const [dataKecamatan, setDataKecamatan] = useState([]);

  const [summary, setSummary] = useState({
    total_wilayah: 0,
    normal: 0,
    cukup: 0,
    perlu_evaluasi: 0,
    risiko_rendah: 0,
    risiko_sedang: 0,
    risiko_tinggi: 0,
  });

  const [dataTes, setDataTes] = useState({
    level_data: "-",
    periode: "-",
    prediksi: "-",
    aktual: "-",
    mape: "-",
    status: "-",
    analisis: "-",
  });

  const [kesimpulanUmum, setKesimpulanUmum] = useState("");
  const [wilayahDipilih, setWilayahDipilih] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [filterRisiko, setFilterRisiko] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [layerAktif, setLayerAktif] = useState("Prioritas Pendampingan");
  const [panelAnalisisTerbuka, setPanelAnalisisTerbuka] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/gis/monitoring")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Gagal mengambil data GIS penyuluh");
        }
        return res.json();
      })
      .then((res) => {
        setDataKecamatan(res.data || []);

        setSummary(
          res.summary || {
            total_wilayah: 0,
            normal: 0,
            cukup: 0,
            perlu_evaluasi: 0,
            risiko_rendah: 0,
            risiko_sedang: 0,
            risiko_tinggi: 0,
          }
        );

        setDataTes(
          res.data_tes || {
            level_data: "-",
            periode: "-",
            prediksi: "-",
            aktual: "-",
            mape: "-",
            status: "-",
            analisis: "-",
          }
        );

        setKesimpulanUmum(res.kesimpulan_umum || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error GIS penyuluh:", err);
        setError(
          "Data pemantauan penyuluh gagal dimuat. Pastikan backend Laravel aktif."
        );
        setLoading(false);
      });
  }, []);

  const dataTampil = useMemo(() => {
    return dataKecamatan.filter((item) => {
      const nama = item.nama || "";

      const cocokKeyword = nama
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const cocokRisiko =
        filterRisiko === "Semua" || item.risiko === filterRisiko;

      const cocokStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      return cocokKeyword && cocokRisiko && cocokStatus;
    });
  }, [dataKecamatan, keyword, filterRisiko, filterStatus]);

  const wilayahAktif = useMemo(() => {
    if (
      wilayahDipilih &&
      dataTampil.some((item) => item.nama === wilayahDipilih.nama)
    ) {
      return wilayahDipilih;
    }

    const risikoTinggi = dataTampil.find((item) => item.risiko === "Tinggi");
    const risikoSedang = dataTampil.find((item) => item.risiko === "Sedang");

    return risikoTinggi || risikoSedang || dataTampil[0] || dataKecamatan[0] || null;
  }, [wilayahDipilih, dataTampil, dataKecamatan]);

  const periodeTampil = formatPeriode(dataTes.periode);

  const wilayahPrioritas = useMemo(() => {
    return [...dataKecamatan].sort((a, b) => {
      const bobot = {
        Tinggi: 3,
        Sedang: 2,
        Rendah: 1,
      };

      return (bobot[b.risiko] || 0) - (bobot[a.risiko] || 0);
    });
  }, [dataKecamatan]);

  const getWarnaMarker = (item) => {
    if (layerAktif === "Analisis TES") {
      return warnaStatus(item.status);
    }

    return warnaRisiko(item.risiko);
  };

  const buatPrioritasTeks = (item) => {
    if (!item) return "-";

    if (item.risiko === "Tinggi") {
      return "Prioritas tinggi. Penyuluh disarankan melakukan monitoring lapangan lebih awal karena wilayah menunjukkan risiko cuaca tinggi.";
    }

    if (item.risiko === "Sedang") {
      return "Prioritas sedang. Penyuluh perlu melakukan pemantauan berkala dan memberi arahan kepada petani.";
    }

    return "Prioritas rendah. Monitoring rutin tetap dilakukan.";
  };

  const renderIsiPopup = (item) => {
    if (layerAktif === "Analisis Cuaca") {
      return (
        <>
          <p>
            <b>Suhu:</b> {item.suhu}
          </p>
          <p>
            <b>Kelembaban:</b> {item.kelembaban}
          </p>
          <p>
            <b>Kondisi:</b> {item.kondisi}
          </p>

          <hr className="my-2" />

          <p>
            <b>Alasan Risiko:</b> {item.alasan_risiko}
          </p>
        </>
      );
    }

    if (layerAktif === "Analisis TES") {
      return (
        <>
          <p>
            <b>Periode:</b> {periodeTampil}
          </p>
          <p>
            <b>Prediksi TES:</b> {item.prediksi}
          </p>
          <p>
            <b>Aktual:</b> {item.aktual}
          </p>
          <p>
            <b>MAPE:</b> {item.mape}
          </p>
          <p>
            <b>Status TES:</b> {item.status}
          </p>
        </>
      );
    }

    if (layerAktif === "Rekomendasi Lapangan") {
      return (
        <>
          <p>
            <b>Risiko:</b> {item.risiko}
          </p>
          <p>
            <b>Status TES:</b> {item.status}
          </p>

          <hr className="my-2" />

          <p>
            <b>Rekomendasi:</b> {item.rekomendasi}
          </p>
        </>
      );
    }

    return (
      <>
        <p>
          <b>Prioritas:</b> {item.risiko}
        </p>
        <p>
          <b>Risiko Wilayah:</b> {item.risiko}
        </p>
        <p>
          <b>Suhu:</b> {item.suhu}
        </p>
        <p>
          <b>Kelembaban:</b> {item.kelembaban}
        </p>
        <p>
          <b>Kondisi:</b> {item.kondisi}
        </p>

        <hr className="my-2" />

        <p>
          <b>Arahan:</b> {buatPrioritasTeks(item)}
        </p>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-emerald-400">
              Memuat GIS Penyuluh...
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Mengambil data TES, cuaca, risiko wilayah, dan rekomendasi
              lapangan.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-white">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center">
          <div className="bg-slate-900 border border-red-700 rounded-2xl p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400">
              Gagal Memuat Data
            </h2>
            <p className="text-slate-300 text-sm mt-2">{error}</p>
            <p className="text-slate-500 text-xs mt-4">
              Cek endpoint http://localhost:8000/api/gis/monitoring.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 h-screen overflow-hidden">
        {/* HEADER */}
        <div className="h-[73px] px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              Pemantauan Wilayah Penyuluh
            </h1>
            <p className="text-sm text-slate-400">
              GIS untuk melihat prioritas pendampingan, risiko wilayah, kondisi
              cuaca, evaluasi TES, dan rekomendasi lapangan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Refresh
            </button>

            <div className="bg-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold">
              Penyuluh
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] h-[calc(100vh-73px)]">
          {/* KIRI */}
          <div className="flex flex-col min-h-0 h-full">
            {/* PETA */}
            <div className="relative flex-1 min-h-[360px]">
              <MapContainer
                center={[-7.6809, 110.832]}
                zoom={11}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
              >
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />

                {dataTampil.map((item, index) => (
                  <CircleMarker
                    key={`${item.nama}-${index}`}
                    center={[item.lat, item.lng]}
                    radius={ukuranMarker(item.risiko)}
                    eventHandlers={{
                      click: () => setWilayahDipilih(item),
                    }}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 2,
                      fillColor: getWarnaMarker(item),
                      fillOpacity: 0.9,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                      {item.nama} - Risiko {item.risiko}
                    </Tooltip>

                    <Popup>
                      <div className="text-sm min-w-[260px] text-slate-800">
                        <h3 className="font-bold text-emerald-700 text-base mb-2">
                          Kecamatan {item.nama}
                        </h3>

                        <p>
                          <b>Layer:</b> {layerAktif}
                        </p>

                        <hr className="my-2" />

                        {renderIsiPopup(item)}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* SEARCH */}
              <div className="absolute top-5 left-5 z-[999] bg-slate-900/95 backdrop-blur rounded-2xl shadow-lg px-5 py-4 w-[360px] border border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-2xl">🌾</span>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Cari kecamatan..."
                    className="bg-transparent outline-none text-white placeholder:text-slate-400 w-full"
                  />
                  <span className="text-slate-300 text-xl">🔍</span>
                </div>
              </div>

              {/* LEGENDA */}
              <div className="absolute top-28 left-5 z-[999] bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 shadow-lg">
                <p className="text-xs text-slate-400 mb-2">Legenda Prioritas</p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Rendah</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
                    <span>Sedang</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500"></span>
                    <span>Tinggi</span>
                  </div>
                </div>
              </div>

              {/* LAYER */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <div className="flex">
                  {[
                    "Prioritas Pendampingan",
                    "Analisis Cuaca",
                    "Analisis TES",
                    "Rekomendasi Lapangan",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => setLayerAktif(item)}
                      className={`px-5 py-3 text-sm font-semibold border-r border-slate-700 last:border-r-0 ${
                        layerAktif === item
                          ? "bg-emerald-600 text-white"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* INFO LAYER */}
              <div className="absolute bottom-24 left-5 z-[999] bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400">Layer aktif</p>
                <p className="font-bold text-emerald-400">{layerAktif}</p>
              </div>
            </div>

            {/* TOMBOL PANEL ANALISIS */}
            <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setPanelAnalisisTerbuka(!panelAnalisisTerbuka)
                }
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-5 py-2 rounded-xl text-sm font-semibold transition"
              >
                {panelAnalisisTerbuka
                  ? "Sembunyikan Analisis ▼"
                  : "Tampilkan Analisis ▲"}
              </button>
            </div>

            {/* PANEL BAWAH */}
            <div
              className={`bg-slate-950 border-t border-slate-800 overflow-y-auto transition-all duration-300 ${
                panelAnalisisTerbuka
                  ? "max-h-[430px] p-4 opacity-100"
                  : "max-h-0 p-0 opacity-0 pointer-events-none"
              }`}
            >
              {/* KESIMPULAN UMUM */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                    🌾
                  </div>

                  <div>
                    <h3 className="font-bold text-white">
                      Kesimpulan Umum Monitoring
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {kesimpulanUmum ||
                        "Kesimpulan umum akan muncul setelah data berhasil dimuat."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* RINGKAS */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="font-bold text-white mb-3">
                    Ringkas Wilayah
                  </h3>

                  <p className="text-xs text-slate-400">Wilayah dipilih</p>
                  <p className="text-lg font-bold text-white">
                    {wilayahAktif?.nama || "-"}
                  </p>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prioritas</span>
                      <span className={warnaTextRisiko(wilayahAktif?.risiko)}>
                        {wilayahAktif?.risiko || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Status TES</span>
                      <span className={warnaTextStatus(wilayahAktif?.status)}>
                        {wilayahAktif?.status || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Periode</span>
                      <span className="text-white">{periodeTampil}</span>
                    </div>
                  </div>
                </div>

                {/* PENJELASAN */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:col-span-2">
                  <h3 className="font-bold text-white mb-3">
                    Penjelasan Prediksi
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Prediksi produksi panen padi Kabupaten Sukoharjo pada bulan{" "}
                    <span className="font-bold text-emerald-400">
                      {periodeTampil}
                    </span>{" "}
                    sebesar{" "}
                    <span className="font-bold text-emerald-400">
                      {dataTes.prediksi}
                    </span>{" "}
                    diperoleh dari metode TES berdasarkan data historis produksi
                    bulanan. Nilai MAPE{" "}
                    <span className="font-bold text-yellow-300">
                      {dataTes.mape}
                    </span>{" "}
                    menunjukkan status model{" "}
                    <span
                      className={`font-bold ${warnaTextStatus(
                        dataTes.status
                      )}`}
                    >
                      {dataTes.status}
                    </span>
                    .
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">
                      Fokus penyuluh
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Penyuluh menggunakan informasi ini untuk menentukan
                      wilayah yang perlu diprioritaskan dalam pendampingan.
                      Risiko wilayah berasal dari cuaca kecamatan, sedangkan
                      status prediksi berasal dari evaluasi TES.
                    </p>
                  </div>
                </div>

                {/* CUACA */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="font-bold text-white mb-3">Cuaca Wilayah</h3>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Suhu</p>
                      <p className="font-bold text-white">
                        {wilayahAktif?.suhu || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Kelembaban</p>
                      <p className="font-bold text-white">
                        {wilayahAktif?.kelembaban || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Kondisi</p>
                      <p className="font-bold text-white">
                        {wilayahAktif?.kondisi || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ARAHAN */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h3 className="font-bold text-white mb-3">
                    Arahan Penyuluh
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {buatPrioritasTeks(wilayahAktif)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL KANAN */}
          <div className="bg-slate-900 border-l border-slate-800 overflow-y-auto pb-6">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Pandangan Penyuluh</h2>
              <p className="text-sm text-slate-400 mt-1">
                {summary.total_wilayah} kecamatan dipantau di Sukoharjo
              </p>
            </div>

            {/* DATA TES */}
            <div className="p-5 border-b border-slate-800">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                <div className="flex justify-between items-start gap-3 mb-4">
                  <div>
                    <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wide">
                      Data Prediksi
                    </p>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {dataTes.level_data}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Periode prediksi: {periodeTampil}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${warnaTextStatus(
                      dataTes.status
                    )}`}
                    style={{
                      backgroundColor: `${warnaStatus(dataTes.status)}30`,
                    }}
                  >
                    {dataTes.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900/80 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">
                      Prediksi Panen {periodeTampil}
                    </p>
                    <p className="font-bold text-white mt-1">
                      {dataTes.prediksi}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">MAPE</p>
                    <p className="font-bold text-white mt-1">
                      {dataTes.mape}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 col-span-2">
                    <p className="text-slate-400 text-xs">Status Model</p>
                    <p
                      className={`font-bold mt-1 ${warnaTextStatus(
                        dataTes.status
                      )}`}
                    >
                      {dataTes.status}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                  Prediksi dihitung pada level Kabupaten Sukoharjo. Penyuluh
                  menggunakan hasil ini bersama risiko cuaca untuk menentukan
                  prioritas pendampingan wilayah.
                </p>
              </div>
            </div>

            {/* WILAYAH DIPILIH */}
            <div className="p-5 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Wilayah Prioritas
              </p>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {wilayahAktif?.nama || "-"}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {wilayahAktif?.kondisi || "-"}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${warnaTextRisiko(
                      wilayahAktif?.risiko
                    )}`}
                    style={{
                      backgroundColor: `${warnaRisiko(
                        wilayahAktif?.risiko
                      )}30`,
                    }}
                  >
                    Prioritas {wilayahAktif?.risiko || "-"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="bg-slate-900 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Suhu</p>
                    <p className="font-bold text-white mt-1">
                      {wilayahAktif?.suhu || "-"}
                    </p>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Kelembaban</p>
                    <p className="font-bold text-white mt-1">
                      {wilayahAktif?.kelembaban || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Alasan Risiko</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {wilayahAktif?.alasan_risiko || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* RINGKASAN RISIKO */}
            <div className="p-5 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Ringkasan Prioritas Wilayah
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Rendah</p>
                  <p className="text-xl font-bold text-green-400">
                    {summary.risiko_rendah}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Sedang</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {summary.risiko_sedang}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Tinggi</p>
                  <p className="text-xl font-bold text-red-400">
                    {summary.risiko_tinggi}
                  </p>
                </div>
              </div>
            </div>

            {/* FILTER */}
            <div className="p-5 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Filter Status Prediksi
              </p>

              <div className="flex gap-2 flex-wrap">
                {["Semua", "Normal", "Cukup", "Perlu Evaluasi"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        filterStatus === status
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="p-5 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Filter Prioritas
              </p>

              <div className="flex gap-2 flex-wrap">
                {["Semua", "Rendah", "Sedang", "Tinggi"].map((risiko) => (
                  <button
                    key={risiko}
                    onClick={() => setFilterRisiko(risiko)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      filterRisiko === risiko
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {risiko}
                  </button>
                ))}
              </div>
            </div>

            {/* ARAHAN */}
            <div className="p-5 border-b border-slate-800">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                <h3 className="font-bold text-emerald-300">
                  Rekomendasi Lapangan
                </h3>

                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  {wilayahAktif?.kesimpulan_monitoring ||
                    wilayahAktif?.rekomendasi ||
                    "Pilih wilayah untuk melihat rekomendasi lapangan."}
                </p>
              </div>
            </div>

            {/* DAFTAR PRIORITAS */}
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-300 mb-3">
                Daftar Prioritas Kecamatan
              </p>

              {dataTampil.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-sm text-slate-400">
                  Data kecamatan tidak ditemukan.
                </div>
              ) : (
                <div className="space-y-3">
                  {wilayahPrioritas
                    .filter((item) =>
                      dataTampil.some((tampil) => tampil.nama === item.nama)
                    )
                    .map((item, index) => (
                      <button
                        type="button"
                        key={`${item.nama}-${index}`}
                        onClick={() => setWilayahDipilih(item)}
                        className={`w-full text-left bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-4 border ${
                          wilayahAktif?.nama === item.nama
                            ? "border-emerald-500"
                            : "border-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: warnaRisiko(item.risiko),
                                }}
                              ></span>
                              <h3 className="font-bold text-white">
                                {item.nama}
                              </h3>
                            </div>

                            <p className="text-xs text-slate-400 mt-1">
                              {item.kondisi} • {item.suhu}
                            </p>
                          </div>

                          <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold ${warnaTextRisiko(
                              item.risiko
                            )}`}
                            style={{
                              backgroundColor: `${warnaRisiko(
                                item.risiko
                              )}30`,
                            }}
                          >
                            {item.risiko}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-3 line-clamp-3">
                          {buatPrioritasTeks(item)}
                        </p>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}