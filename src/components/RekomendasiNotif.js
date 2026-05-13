import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle, Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RekomendasiNotif() {
  const navigate = useNavigate();

  const [notif, setNotif] = useState([]);
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");
  const userId = user?.id;

  useEffect(() => {
    getNotifRekomendasi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNotifRekomendasi = async () => {
    try {
      setLoading(true);

      let url = "";

      if (role === "petani") {
        url = `http://127.0.0.1:8000/api/petani/rekomendasi?user_id=${userId}`;
      } else if (role === "penyuluh") {
        url = "http://127.0.0.1:8000/api/penyuluh/rekomendasi";
      } else {
        setNotif([]);
        return;
      }

      const res = await axios.get(url);
      const data = res.data.data || [];

      // Ambil hanya yang perlu perhatian
      const dataNotif = data.filter((item) => {
        return (
          item.prioritas === "Tinggi" ||
          item.status_risiko === "Perlu Perhatian" ||
          item.status_monitoring === "Perlu Perhatian" ||
          item.kategori_suhu === "Risiko Suhu Tinggi" ||
          item.kategori_suhu === "Risiko Suhu Rendah"
        );
      });

      setNotif(dataNotif);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLihatRekomendasi = () => {
    if (role === "petani") {
      navigate("/rekomendasi");
    } else if (role === "penyuluh") {
      navigate("/penyuluh/rekomendasi");
    }
  };

  if (loading || notif.length === 0 || !show) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex justify-between items-start">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="text-red-600" size={22} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Bell className="text-red-600" size={16} />
            <h2 className="font-bold text-red-700">
              {notif.length} Rekomendasi Perlu Perhatian
            </h2>
          </div>

          <p className="text-sm text-gray-700 mt-1">
            Beberapa lahan memiliki kondisi suhu berisiko. Silakan cek
            rekomendasi sistem untuk tindak lanjut.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleLihatRekomendasi}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Lihat Rekomendasi
            </button>

            <button
              onClick={() => setShow(false)}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-white"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => setShow(false)} className="text-gray-500">
        <X size={18} />
      </button>
    </div>
  );
}