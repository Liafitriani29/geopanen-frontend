import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ChartPrediksi({ dataPanen = [] }) {
  const data =
    Array.isArray(dataPanen) && dataPanen.length > 0
      ? dataPanen
      : [
          { nama: "Jan", aktual: 4, prediksi: 5 },
          { nama: "Feb", aktual: 5, prediksi: 5.5 },
          { nama: "Mar", aktual: 6, prediksi: 6.2 },
          { nama: "Apr", aktual: 5, prediksi: 6 },
        ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />

          <XAxis
            dataKey="nama"
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fontSize: 12,
              fill: "#64748b",
            }}
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
            formatter={(value, name, props) => {
              const label =
                props.dataKey === "aktual" ? "Aktual" : "Prediksi";

              return [`${value} Ton`, label];
            }}
            labelFormatter={(label) => `Periode: ${label}`}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="aktual"
            name="Aktual"
            stroke="#059669"
            strokeWidth={3}
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: "#ffffff",
              stroke: "#059669",
            }}
            activeDot={{
              r: 6,
            }}
          />

          <Line
            type="monotone"
            dataKey="prediksi"
            name="Prediksi"
            stroke="#84cc16"
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: "#ffffff",
              stroke: "#84cc16",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}