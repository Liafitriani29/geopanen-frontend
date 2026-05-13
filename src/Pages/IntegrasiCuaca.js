import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const dataKecamatan = [
  {
    nama: "Baki",
    lat: -7.6110368,
    lng: 110.7836652,
    status: "Normal",
    prediksi: "24.500 ton",
    aktual: "23.800 ton",
    mape: "4.42%",
    suhu: "28°C",
    kelembaban: "92%",
    kondisi: "Awan mendung",
    rekomendasi: "Kelembaban tinggi, lakukan pemantauan rutin.",
  },
  {
    nama: "Nguter",
    lat: -7.7463,
    lng: 110.8834,
    status: "Perlu Evaluasi",
    prediksi: "22.100 ton",
    aktual: "19.900 ton",
    mape: "12.3%",
    suhu: "30°C",
    kelembaban: "86%",
    kondisi: "Berawan",
    rekomendasi: "Perlu evaluasi karena selisih prediksi cukup tinggi.",
  },
  {
    nama: "Kartasura",
    lat: -7.5517,
    lng: 110.7378,
    status: "Cukup",
    prediksi: "20.700 ton",
    aktual: "19.500 ton",
    mape: "8.7%",
    suhu: "29°C",
    kelembaban: "80%",
    kondisi: "Cerah berawan",
    rekomendasi: "Kondisi cukup baik, tetap lakukan monitoring rutin.",
  },
  {
    nama: "Grogol",
    lat: -7.6018,
    lng: 110.8186,
    status: "Normal",
    prediksi: "23.400 ton",
    aktual: "22.900 ton",
    mape: "5.1%",
    suhu: "29°C",
    kelembaban: "84%",
    kondisi: "Berawan",
    rekomendasi: "Kondisi aman, monitoring tetap dilakukan.",
  },
  {
    nama: "Mojolaban",
    lat: -7.5759,
    lng: 110.8681,
    status: "Normal",
    prediksi: "25.100 ton",
    aktual: "24.300 ton",
    mape: "6.2%",
    suhu: "28°C",
    kelembaban: "88%",
    kondisi: "Berawan",
    rekomendasi: "Lakukan pemantauan kelembaban tanaman.",
  },
  {
    nama: "Sukoharjo",
    lat: -7.6809,
    lng: 110.832,
    status: "Normal",
    prediksi: "26.300 ton",
    aktual: "25.700 ton",
    mape: "5.8%",
    suhu: "28°C",
    kelembaban: "82%",
    kondisi: "Berawan",
    rekomendasi: "Kondisi wilayah relatif aman.",
  },
  {
    nama: "Polokarto",
    lat: -7.6465,
    lng: 110.9117,
    status: "Cukup",
    prediksi: "21.800 ton",
    aktual: "20.600 ton",
    mape: "9.1%",
    suhu: "29°C",
    kelembaban: "85%",
    kondisi: "Cerah berawan",
    rekomendasi: "Tetap lakukan monitoring kondisi cuaca.",
  },
  {
    nama: "Tawangsari",
    lat: -7.7327,
    lng: 110.7884,
    status: "Normal",
    prediksi: "20.900 ton",
    aktual: "20.300 ton",
    mape: "6.6%",
    suhu: "28°C",
    kelembaban: "83%",
    kondisi: "Berawan",
    rekomendasi: "Kondisi cukup stabil.",
  },
  {
    nama: "Bendosari",
    lat: -7.7056,
    lng: 110.8589,
    status: "Perlu Evaluasi",
    prediksi: "19.700 ton",
    aktual: "17.900 ton",
    mape: "13.4%",
    suhu: "31°C",
    kelembaban: "89%",
    kondisi: "Mendung",
    rekomendasi: "Perlu pengecekan ulang data aktual dan kondisi cuaca.",
  },
  {
    nama: "Bulu",
    lat: -7.7778,
    lng: 110.7994,
    status: "Cukup",
    prediksi: "18.600 ton",
    aktual: "17.800 ton",
    mape: "8.9%",
    suhu: "29°C",
    kelembaban: "81%",
    kondisi: "Cerah berawan",
    rekomendasi: "Monitoring rutin tetap diperlukan.",
  },
  {
    nama: "Weru",
    lat: -7.7711,
    lng: 110.7406,
    status: "Normal",
    prediksi: "19.200 ton",
    aktual: "18.900 ton",
    mape: "4.9%",
    suhu: "28°C",
    kelembaban: "79%",
    kondisi: "Berawan",
    rekomendasi: "Status wilayah aman.",
  },
  {
    nama: "Gatak",
    lat: -7.5902,
    lng: 110.7049,
    status: "Normal",
    prediksi: "18.900 ton",
    aktual: "18.400 ton",
    mape: "5.3%",
    suhu: "28°C",
    kelembaban: "83%",
    kondisi: "Berawan",
    rekomendasi: "Kondisi masih dalam batas normal.",
  },
];

function warnaStatus(status) {
  if (status === "Normal") return "#22c55e";
  if (status === "Cukup") return "#facc15";
  if (status === "Perlu Evaluasi") return "#ef4444";
  return "#9ca3af";
}

export default function IntegrasiCuaca() {
  const [layerAktif, setLayerAktif] = useState("Prediksi TES");

  const totalWilayah = dataKecamatan.length;
  const totalNormal = dataKecamatan.filter(
    (item) => item.status === "Normal"
  ).length;
  const totalCukup = dataKecamatan.filter(
    (item) => item.status === "Cukup"
  ).length;
  const totalEvaluasi = dataKecamatan.filter(
    (item) => item.status === "Perlu Evaluasi"
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">GIS Monitoring Panen Padi</h1>
          <p className="text-sm text-slate-400">
            Peta monitoring wilayah Sukoharjo berbasis prediksi TES, cuaca,
            evaluasi, dan rekomendasi.
          </p>
        </div>

        <div className="bg-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold">
          Admin
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] h-[calc(100vh-73px)]">
        {/* PETA */}
        <div className="relative">
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

            {dataKecamatan.map((item, index) => (
              <CircleMarker
                key={index}
                center={[item.lat, item.lng]}
                radius={13}
                pathOptions={{
                  color: "#ffffff",
                  weight: 2,
                  fillColor: warnaStatus(item.status),
                  fillOpacity: 0.9,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                  {item.nama}
                </Tooltip>

                <Popup>
                  <div className="text-sm min-w-[230px] text-slate-800">
                    <h3 className="font-bold text-emerald-700 text-base mb-2">
                      Kecamatan {item.nama}
                    </h3>

                    <p>
                      <b>Status:</b> {item.status}
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

                    <hr className="my-2" />

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
                      <b>Rekomendasi:</b> {item.rekomendasi}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* SEARCH BOX */}
          <div className="absolute top-5 left-5 z-[999] bg-slate-900/95 backdrop-blur rounded-2xl shadow-lg px-5 py-4 w-[360px] border border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-2xl">🌾</span>
              <input
                type="text"
                placeholder="Lokasi pencarian"
                className="bg-transparent outline-none text-white placeholder:text-slate-400 w-full"
              />
              <span className="text-slate-300 text-xl">🔍</span>
            </div>
          </div>

          {/* TOOL KIRI */}
          <div className="absolute left-5 top-32 z-[999] flex flex-col gap-3">
            <button className="w-12 h-12 bg-slate-900/95 rounded-xl border border-slate-700 shadow text-xl">
              ⛶
            </button>
            <button className="w-12 h-12 bg-slate-900/95 rounded-xl border border-slate-700 shadow text-xl">
              📏
            </button>
          </div>

          {/* LAYER BAWAH */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex">
              {["Prediksi TES", "Cuaca", "Evaluasi", "Rekomendasi"].map(
                (item) => (
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
                )
              )}
            </div>
          </div>

          {/* INFO LAYER AKTIF */}
          <div className="absolute bottom-24 left-5 z-[999] bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-400">Layer aktif</p>
            <p className="font-bold text-emerald-400">{layerAktif}</p>
          </div>
        </div>

        {/* PANEL KANAN */}
        <div className="bg-slate-900 border-l border-slate-800 overflow-y-auto">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-2xl font-bold">Pandangan Sukoharjo</h2>
            <p className="text-sm text-slate-400 mt-1">
              {totalWilayah} kecamatan dipantau
            </p>
          </div>

          <div className="p-5 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-300 mb-3">
              Ringkasan Status Monitoring
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-400">Normal</p>
                <p className="text-xl font-bold text-green-400">
                  {totalNormal}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-400">Cukup</p>
                <p className="text-xl font-bold text-yellow-400">
                  {totalCukup}
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl p-3">
                <p className="text-xs text-slate-400">Evaluasi</p>
                <p className="text-xl font-bold text-red-400">
                  {totalEvaluasi}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 border-b border-slate-800">
            <p className="text-sm font-semibold text-slate-300 mb-3">
              Periksa wilayah yang berisiko
            </p>

            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-2 rounded-lg bg-slate-800 text-sm">
                Semua
              </span>
              <span className="px-3 py-2 rounded-lg bg-green-500/20 text-green-300 text-sm">
                Normal
              </span>
              <span className="px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-300 text-sm">
                Cukup
              </span>
              <span className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm">
                Perlu Evaluasi
              </span>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm font-semibold text-slate-300 mb-3">
              Daftar Kecamatan
            </p>

            <div className="space-y-3">
              {dataKecamatan.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-4 border border-slate-700"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: warnaStatus(item.status),
                          }}
                        ></span>
                        <h3 className="font-bold text-white">{item.nama}</h3>
                      </div>

                      <p className="text-sm text-slate-400 mt-1">
                        Prediksi: {item.prediksi}
                      </p>
                    </div>

                    <span
                      className="text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: `${warnaStatus(item.status)}30`,
                        color: warnaStatus(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="bg-slate-900 rounded-xl p-3">
                      <p className="text-slate-400 text-xs">Cuaca</p>
                      <p className="font-semibold">{item.kondisi}</p>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-3">
                      <p className="text-slate-400 text-xs">MAPE</p>
                      <p className="font-semibold">{item.mape}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    {item.rekomendasi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 px-6 py-2 bg-slate-950">
        Catatan: Data titik kecamatan, prediksi, cuaca, dan evaluasi masih data
        contoh untuk tampilan awal. Selanjutnya dapat disambungkan ke backend
        Laravel dan database Geopanen.
      </p>
    </div>
  );
}