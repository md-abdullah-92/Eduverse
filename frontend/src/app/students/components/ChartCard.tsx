// components/ChartCard.tsx
'use client';

import React from 'react';

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, description, children }: ChartCardProps) => (
  
  <section className="bg-white rounded-2xl p-6 shadow-md space-y-5 w-full border-1 border-teal-300">
    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
    <div className="h-80">{children}</div>
  </section>
  
);

export default ChartCard;
