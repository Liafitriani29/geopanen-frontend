export default function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-green-600 mt-2">{value}</h2>
    </div>
  );
}