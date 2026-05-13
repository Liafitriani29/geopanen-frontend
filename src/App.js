import { BrowserRouter, Routes, Route } from "react-router-dom";

// AUTH
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

// ADMIN
import Dashboard from "./Pages/dashboard";
import DataLahan from "./Pages/DataLahan";
import DataPanen from "./Pages/DataPanen";
import DataHistorisTES from "./Pages/DataHistorisTES";
import Prediksi from "./Pages/Prediksi";
import Deviasi from "./Pages/Deviasi";
import Monitoring from "./Pages/Monitoring";
import Laporan from "./Pages/Laporan";
import DataPengguna from "./Pages/DataPengguna";
import IntegrasiCuaca from "./Pages/IntegrasiCuaca";
import Rekomendasi from "./Pages/Rekomendasi";

// PETANI
import PetaniDashboard from "./Pages/PetaniDashboard";
import RiwayatProduksiPetani from "./Pages/RiwayatProduksiPetani";
import KondisiLingkunganPetani from "./Pages/KondisiLingkunganPetani";
import RekomendasiPetani from "./Pages/RekomendasiPetani";
import HasilPrediksiPetani from "./Pages/HasilPrediksiPetani";

// PENYULUH
import PenyuluhDashboard from "./Pages/PenyuluhDashboard";
import MonitoringWilayahPenyuluh from "./Pages/MonitoringWilayahPenyuluh";
import RekomendasiPenyuluh from "./Pages/RekomendasiPenyuluh";
import LaporanPenyuluh from "./Pages/LaporanPenyuluh";
import AnalisisPrediksiPenyuluh from "./Pages/AnalisisPrediksiPenyuluh";
import AnalisisEvaluasiPenyuluh from "./Pages/AnalisisEvaluasiPenyuluh";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Dashboard />} />

        {/* Route lama, boleh tetap ada */}
        <Route path="/lahan" element={<DataLahan />} />
        <Route path="/panen" element={<DataPanen />} />

        <Route path="/data-historis-tes" element={<DataHistorisTES />} />
        <Route path="/prediksi" element={<Prediksi />} />
        <Route path="/deviasi" element={<Deviasi />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/pengguna" element={<DataPengguna />} />

        {/* GIS MONITORING ADMIN */}
        {/* File tetap IntegrasiCuaca.js, tapi isi halamannya GIS */}
        <Route path="/cuaca" element={<IntegrasiCuaca />} />

        <Route path="/rekomendasi" element={<Rekomendasi />} />

        {/* PETANI */}
        <Route path="/petani" element={<PetaniDashboard />} />
        <Route
          path="/petani/hasil-prediksi"
          element={<HasilPrediksiPetani />}
        />
        <Route
          path="/riwayat-produksi"
          element={<RiwayatProduksiPetani />}
        />
        <Route
          path="/lingkungan"
          element={<KondisiLingkunganPetani />}
        />
        <Route
          path="/petani/rekomendasi"
          element={<RekomendasiPetani />}
        />

        {/* PENYULUH */}
        <Route path="/penyuluh" element={<PenyuluhDashboard />} />
        <Route
          path="/penyuluh/monitoring-wilayah"
          element={<MonitoringWilayahPenyuluh />}
        />
        <Route
          path="/penyuluh/rekomendasi"
          element={<RekomendasiPenyuluh />}
        />
        <Route
          path="/penyuluh/laporan"
          element={<LaporanPenyuluh />}
        />
        <Route
          path="/penyuluh/analisis-prediksi"
          element={<AnalisisPrediksiPenyuluh />}
        />
        <Route
          path="/penyuluh/analisis-evaluasi"
          element={<AnalisisEvaluasiPenyuluh />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;