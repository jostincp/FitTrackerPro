'use client';

import { Doughnut } from 'react-chartjs-2';
import { defaultChartOptions } from '@/lib/charts/chart-config';
import { ChartData, ChartOptions } from 'chart.js';

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
  height?: number;
  className?: string;
}

const doughnutOptions = {
  ...defaultChartOptions,
  cutout: '60%',
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      position: 'bottom' as const,
    },
  },
  scales: undefined, // Remove scales for doughnut charts
};

export function DoughnutChart({ 
  data, 
  options = {}, 
  height = 300, 
  className = '' 
}: DoughnutChartProps) {
  const mergedOptions = {
    ...doughnutOptions,
    ...options,
    plugins: {
      ...doughnutOptions.plugins,
      ...options.plugins,
    },
  };

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <Doughnut data={data} options={mergedOptions} />
    </div>
  );
}