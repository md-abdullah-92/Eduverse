'use client';

import React from 'react';
import { playfair, raleway } from '@/utils/font';

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const ChartCard = ({ title, description, children, action }: ChartCardProps) => (
  <section
    className={`bg-white rounded-2xl p-6 shadow-md space-y-5 w-full border border-teal-300 ${raleway.className}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <h3 className={`text-xl font-semibold text-gray-900 ${playfair.className}`}>
          {title}
        </h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="h-80">{children}</div>
  </section>
);

export default ChartCard;
