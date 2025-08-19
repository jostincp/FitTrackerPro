'use client';

import { Bar } from 'react-chartjs-2';
import { barChartOptions } from '@/lib/charts/chart-config';
import { ChartData, ChartOptions } from 'chart.js';

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  height?: number;
  className?: string;
}

export function BarChart({ 
  data, 
  options = {}, 
  height = 300, 
  className = '' 
}: BarChartProps) {
  const mergedOptions = {
    ...barChartOptions,
    ...options,
    plugins: {
      ...barChartOptions.plugins,
      ...options.plugins,
    },
  };

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <Bar data={data} options={mergedOptions} />
    </div>
  );
}