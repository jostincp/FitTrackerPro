'use client';

import { Line } from 'react-chartjs-2';
import { lineChartOptions } from '@/lib/charts/chart-config';
import { ChartData, ChartOptions } from 'chart.js';

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
  className?: string;
}

export function LineChart({ 
  data, 
  options = {}, 
  height = 300, 
  className = '' 
}: LineChartProps) {
  const mergedOptions = {
    ...lineChartOptions,
    ...options,
    plugins: {
      ...lineChartOptions.plugins,
      ...options.plugins,
    },
  };

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <Line data={data} options={mergedOptions} />
    </div>
  );
}