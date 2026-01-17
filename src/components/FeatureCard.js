'use client'
import { Card } from 'antd';

export default function FeatureCard({ icon, title, description }) {
  return (
    <Card className="text-center h-full border-none shadow-md hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl text-green-600 mb-2">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}
