import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "../components/Sidebar";

const API_URL = "http://127.0.0.1:8000/api/gis/prediksi-kecamatan";

export default function PetaGISPrediksi() {
  const [geoData, setGeoData] = useState(null);
  const [tahun, setTahun] = useState("2024");
  const [layerAktif, setLayerAktif] = useState("prediksi");
  const [loading, setLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const fetchData = async (tahunDipilih) => {
    try {
      setLoading(true);

      // Kosongkan data lama supaya popup/layer lama tidak tertahan
      setGeoData(null);

      const response = await fetch(
        `${API_URL}?tahun=${tahunDipilih}&_=${Date.now()}`
      );

      const result = await response.json();

      if (result?.data) {
        setGeoData(result.data);
      } else {
        setGeoData(null);
        console.error("Format data GIS tidak sesuai:", result);
      }

      // Paksa Leaflet render ulang
      setMapKey((prev) => prev + 1);
    } catch (error) {
      console.error("Gagal mengambil data GIS:", error);
      setGeoData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tahun);
  }, [tahun]);

  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [layerAktif]);

  const formatAngka = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    return Number(value).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getColor = (feature) => {
    const p = feature.properties;

    if (layerAktif === "prediksi") {
      if (p.status_prediksi === "Tinggi") return "#22c55e";
      if (p.status_prediksi === "Sedang") return "#facc15";
      return "#ef4444";
    }

    if (layerAktif === "luas_lahan") {
      const val = p.total_luas_lahan_ha || 0;
      if (val >= 2500) return "#16a34a";
      if (val >= 1500) return "#84cc16";
      if (val >= 800) return "#facc15";
      return "#ef4444";
    }

    if (layerAktif === "luas_panen") {
      const val = p.luas_panen_sawah_ha || 0;
      if (val >= 4000) return "#16a34a";
      if (val >= 2500) return "#84cc16";
      if (val >= 1000) return "#facc15";
      return "#ef4444";
    }

    if (layerAktif === "produksi") {
      const val = p.total_produksi_ton || 0;
      if (val >= 40000) return "#16a34a";
      if (val >= 25000) return "#84cc16";
      if (val >= 15000) return "#facc15";
      return "#ef4444";
    }

    if (layerAktif === "produktivitas") {
      const val = p.produktivitas_sawah_kw_ha || 0;
      if (val >= 70) return "#16a34a";
      if (val >= 60) return "#84cc16";
      if (val >= 50) return "#facc15";
      return "#ef4444";
    }

    return "#22c55e";
  };

  const styleFeature = (feature) => ({
    fillColor: getColor(feature),
    weight: 2,
    opacity: 1,
    color: "#e5e7eb",
    fillOpacity: 0.72,
  });

  const onEachFeature = (feature, layer) => {
    const p = feature.properties;

    layer.bindPopup(`
      <div style="min-width:260px;background:#0f172a;color:#e5e7eb;">
        <h3 style="font-weight:700;font-size:16px;margin-bottom:10px;color:#ffffff;">
          Kecamatan ${p.nama_kecamatan}
        </h3>

        <table style="font-size:13px;width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Tahun Data</td>
            <td style="padding:3px 0;text-align:right;"><b>${p.tahun}</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Luas Lahan</td>
            <td style="padding:3px 0;text-align:right;"><b>${formatAngka(
              p.total_luas_lahan_ha
            )} ha</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Luas Panen Sawah</td>
            <td style="padding:3px 0;text-align:right;"><b>${formatAngka(
              p.luas_panen_sawah_ha
            )} ha</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Produktivitas</td>
            <td style="padding:3px 0;text-align:right;"><b>${formatAngka(
              p.produktivitas_sawah_kw_ha
            )} kw/ha</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Produksi Aktual</td>
            <td style="padding:3px 0;text-align:right;"><b>${formatAngka(
              p.total_produksi_ton
            )} ton</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Bobot Kecamatan</td>
            <td style="padding:3px 0;text-align:right;"><b>${formatAngka(
              (p.bobot_kecamatan || 0) * 100
            )}%</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Prediksi TES</td>
            <td style="padding:3px 0;text-align:right;"><b>${formatAngka(
              p.prediksi_kecamatan_ton
            )} ton</b></td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#94a3b8;">Status</td>
            <td style="padding:3px 0;text-align:right;"><b>${
              p.status_prediksi
            }</b></td>
          </tr>
        </table>
      </div>
    `);
  };

  const getKeteranganLayer = () => {
    if (layerAktif === "prediksi") {
      return "Warna peta berdasarkan hasil prediksi TES per kecamatan.";
    }

    if (layerAktif === "luas_lahan") {
      return "Warna peta berdasarkan total luas lahan sawah per kecamatan.";
    }

    if (layerAktif === "luas_panen") {
      return "Warna peta berdasarkan luas panen padi sawah per kecamatan.";
    }

    if (layerAktif === "produksi") {
      return "Warna peta berdasarkan total produksi padi aktual per kecamatan.";
    }

    if (layerAktif === "produktivitas") {
      return "Warna peta berdasarkan produktivitas padi sawah per kecamatan.";
    }

    return "";
  };

  return (
    <div className="flex min-h-screen bg-[#07130f] text-slate-100">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-[#07130f] via-[#0b1f18] to-[#08111f]">
        <style>
          {`
            .leaflet-popup-content-wrapper {
              background: #0f172a !important;
              color: #e5e7eb !important;
              border-radius: 16px !important;
              border: 1px solid rgba(16, 185, 129, 0.25);
              box-shadow: 0 18px 40px rgba(0,0,0,0.45);
            }

            .leaflet-popup-tip {
              background: #0f172a !important;
            }

            .leaflet-popup-content {
              margin: 14px !important;
            }

            .leaflet-container {
              background: #020617 !important;
            }

            .leaflet-control-layers,
            .leaflet-control-zoom a {
              background: #0f172a !important;
              color: #e5e7eb !important;
              border-color: rgba(148, 163, 184, 0.25) !important;
            }

            .leaflet-control-layers label {
              color: #e5e7eb !important;
            }

            .leaflet-control-attribution {
              background: rgba(15, 23, 42, 0.8) !important;
              color: #cbd5e1 !important;
            }

            .leaflet-control-attribution a {
              color: #34d399 !important;
            }
          `}
        </style>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold">
            Web GIS Geopanen
          </p>
          <h1 className="text-2xl font-bold text-white mt-1">
            Peta GIS Prediksi Panen Padi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualisasi hasil prediksi TES dan data pertanian per kecamatan di
            Kabupaten Sukoharjo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-[#10251d] rounded-2xl shadow-lg shadow-black/20 border border-emerald-900/40 p-4">
            <label className="text-sm font-semibold text-slate-200">
              Tahun Data
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="mt-2 w-full rounded-xl bg-[#07130f] border border-emerald-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="bg-[#10251d] rounded-2xl shadow-lg shadow-black/20 border border-emerald-900/40 p-4">
            <label className="text-sm font-semibold text-slate-200">
              Layer Ditampilkan
            </label>
            <select
              value={layerAktif}
              onChange={(e) => setLayerAktif(e.target.value)}
              className="mt-2 w-full rounded-xl bg-[#07130f] border border-emerald-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="prediksi">Prediksi TES</option>
              <option value="luas_lahan">Luas Lahan Sawah</option>
              <option value="luas_panen">Luas Panen</option>
              <option value="produksi">Produksi Aktual</option>
              <option value="produktivitas">Produktivitas</option>
            </select>
          </div>

          <div className="lg:col-span-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 p-4">
            <h2 className="text-sm font-semibold text-emerald-300">
              Keterangan Layer
            </h2>
            <p className="text-sm text-emerald-100 mt-1">
              {getKeteranganLayer()}
            </p>
          </div>
        </div>

        <div className="bg-[#10251d] rounded-2xl shadow-xl shadow-black/30 border border-emerald-900/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-900/40 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Peta Kecamatan Sukoharjo
              </h2>
              <p className="text-xs text-slate-400">
                Klik wilayah kecamatan untuk melihat detail data.
              </p>
            </div>

            {loading && (
              <span className="text-sm text-emerald-400 font-medium">
                Memuat data...
              </span>
            )}
          </div>

          <div className="h-[620px]">
            <MapContainer
              key={`map-${tahun}-${layerAktif}-${mapKey}`}
              center={[-7.68, 110.83]}
              zoom={11}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Dark Map">
                  <TileLayer
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="OpenStreetMap">
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Esri World Imagery">
                  <TileLayer
                    attribution="Tiles &copy; Esri"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {geoData && (
                <GeoJSON
                  key={`geojson-${tahun}-${layerAktif}-${mapKey}`}
                  data={geoData}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}
            </MapContainer>
          </div>
        </div>

        <div className="mt-5 bg-[#10251d] rounded-2xl shadow-lg shadow-black/20 border border-emerald-900/40 p-4">
          <h2 className="font-semibold text-white mb-3">Legenda Warna</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-green-500"></span>
              <span>Nilai tinggi / sangat baik</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-yellow-400"></span>
              <span>Nilai sedang / cukup</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-500"></span>
              <span>Nilai rendah / perlu perhatian</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}