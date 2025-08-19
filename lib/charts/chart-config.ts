import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

// Default chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#ea580c',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
        color: '#6b7280',
      },
    },
    y: {
      grid: {
        color: '#f3f4f6',
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, sans-serif',
        },
        color: '#6b7280',
        padding: 8,
      },
    },
  },
};

// Color palette for charts
export const chartColors = {
  primary: '#ea580c',
  secondary: '#f97316',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#1f2937',
  gradient: {
    primary: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  },
};

// Chart type configurations
export const lineChartOptions = {
  ...defaultChartOptions,
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 3,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      borderWidth: 2,
      backgroundColor: '#ffffff',
    },
  },
};

export const barChartOptions = {
  ...defaultChartOptions,
  elements: {
    bar: {
      borderRadius: 4,
      borderSkipped: false,
    },
  },
};

export const areaChartOptions = {
  ...lineChartOptions,
  plugins: {
    ...lineChartOptions.plugins,
    filler: {
      propagate: false,
    },
  },
};

// Utility functions for chart data formatting
export const formatChartData = {
  weight: (data: Array<{ date: string; weight: number }>) => ({
    labels: data.map(item => new Date(item.date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Peso (kg)',
        data: data.map(item => item.weight),
        borderColor: chartColors.primary,
        backgroundColor: `${chartColors.primary}20`,
        fill: true,
      },
    ],
  }),

  bodyMeasurements: (data: Array<{ date: string; chest?: number; waist?: number; hips?: number }>) => ({
    labels: data.map(item => new Date(item.date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Pecho (cm)',
        data: data.map(item => item.chest || null),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary,
        fill: false,
      },
      {
        label: 'Cintura (cm)',
        data: data.map(item => item.waist || null),
        borderColor: chartColors.secondary,
        backgroundColor: chartColors.secondary,
        fill: false,
      },
      {
        label: 'Caderas (cm)',
        data: data.map(item => item.hips || null),
        borderColor: chartColors.success,
        backgroundColor: chartColors.success,
        fill: false,
      },
    ],
  }),

  workoutVolume: (data: Array<{ date: string; volume: number }>) => ({
    labels: data.map(item => new Date(item.date).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    })),
    datasets: [
      {
        label: 'Volumen (kg)',
        data: data.map(item => item.volume),
        backgroundColor: chartColors.info,
        borderColor: chartColors.info,
        borderWidth: 1,
      },
    ],
  }),

  muscleGroupDistribution: (data: Array<{ name: string; count: number }>) => ({
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Ejercicios por grupo muscular',
        data: data.map(item => item.count),
        backgroundColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.success,
          chartColors.warning,
          chartColors.info,
          chartColors.danger,
        ],
        borderWidth: 0,
      },
    ],
  }),
};