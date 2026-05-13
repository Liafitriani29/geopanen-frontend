import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Users,
  LineChart,
  BarChart3,
  FileText,
  Leaf,
  LogOut,
  Map as MapIcon,
  CloudSun,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "admin";

  const menuByRole = {
    admin: [
      {
        name: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "Data Produksi Bulanan",
        path: "/data-historis-tes",
        icon: Database,
      },
      {
        name: "Analisis Prediksi TES",
        path: "/prediksi",
        icon: LineChart,
      },
      {
        name: "Evaluasi MAPE",
        path: "/deviasi",
        icon: BarChart3,
      },
      {
        name: "Peta GIS Prediksi",
        path: "/admin/peta-gis-prediksi",
        icon: MapIcon,
      },
      {
        name: "Pemantauan Cuaca",
        path: "/cuaca",
        icon: CloudSun,
      },
      {
        name: "Laporan Monitoring",
        path: "/laporan",
        icon: FileText,
      },
      {
        name: "Data Pengguna",
        path: "/pengguna",
        icon: Users,
      },
    ],

    petani: [
      {
        name: "Dashboard",
        path: "/petani",
        icon: LayoutDashboard,
      },
      {
        name: "Hasil Prediksi",
        path: "/petani/hasil-prediksi",
        icon: LineChart,
      },
      {
        name: "Pemantauan Lingkungan",
        path: "/lingkungan",
        icon: CloudSun,
      },
    ],

    penyuluh: [
      {
        name: "Dashboard",
        path: "/penyuluh",
        icon: LayoutDashboard,
      },
      {
        name: "Pemantauan Wilayah",
        path: "/penyuluh/analisis-prediksi",
        icon: MapIcon,
      },
      {
        name: "Laporan Monitoring",
        path: "/penyuluh/laporan",
        icon: FileText,
      },
    ],
  };

  const menu = menuByRole[role] || menuByRole.admin;

  const isActiveMenu = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-[#10251d] text-slate-300 flex flex-col border-r border-emerald-900/30">
      {/* LOGO */}
      <div className="h-20 px-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
          <Leaf className="text-white" size={24} />
        </div>

        <div>
          <h1 className="text-white text-xl font-bold leading-tight">
            Geopanen
          </h1>
          <p className="text-xs text-emerald-300">
            Prediksi & Monitoring Panen
          </p>
        </div>
      </div>

      {/* ROLE INFO */}
      <div className="px-5 py-5">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-slate-400">Login sebagai</p>
          <h2 className="text-sm font-semibold text-white capitalize mt-1">
            {role}
          </h2>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        <p className="px-3 mb-3 text-[11px] uppercase tracking-wider text-slate-500">
          Menu Utama
        </p>

        <ul className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActiveMenu(item.path);

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/10 hover:text-red-100 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}