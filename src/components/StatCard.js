'use client'

export default function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{value}</div>
      <div className="text-lg text-gray-600">{label}</div>
    </div>
  );
}
