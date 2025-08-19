'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Calendar, TrendingUp, Target, Activity, Weight, Ruler } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  lineChartOptions,
  barChartOptions,
  formatChartData,
  chartColors,
} from '@/lib/charts/chart-config';
import type { WeightMeasurement, BodyMeasurement, Workout, ProgressStats } from '@/types';

type TimePeriod = '7d' | '30d' | '90d' | '1y';

interface AnalyticsData {
  weightData: WeightMeasurement[];
  bodyMeasurements: BodyMeasurement[];
  workouts: Workout[];
  progressStats: ProgressStats;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');

  // Calculate date range based on selected period
  const getDateRange = (period: TimePeriod) => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', user?.id, selectedPeriod],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      // Fetch weight measurements
      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      // Fetch body measurements
      const { data: bodyMeasurements } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      // Fetch workouts
      const { data: workouts } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:workout_sets(*)
          )
        `)
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
      
      // Calculate progress stats
      const progressStats: ProgressStats = {
        weight_change: 0,
        weight_change_percentage: 0,
        muscle_gain: 0,
        fat_loss: 0,
        strength_improvement: 0,
        consistency_score: 0,
      };
      
      // Calculate weight change
      if (weightData && weightData.length >= 2) {
        const firstWeight = weightData[0].weight;
        const lastWeight = weightData[weightData.length - 1].weight;
        progressStats.weight_change = lastWeight - firstWeight;
        progressStats.weight_change_percentage = ((lastWeight - firstWeight) / firstWeight) * 100;
      }
      
      // Calculate consistency score based on workout frequency
      if (workouts) {
        const totalDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        const workoutDays = workouts.length;
        progressStats.consistency_score = Math.min((workoutDays / (totalDays / 7)) * 25, 100); // Assuming 4 workouts per week is 100%
      }
      
      return {
        weightData: weightData || [],
        bodyMeasurements: bodyMeasurements || [],
        workouts: workouts || [],
        progressStats,
      };
    },
    enabled: !!user?.id,
  });

  // Format data for charts
  const weightChartData = analyticsData?.weightData
    ? formatChartData.weight(analyticsData.weightData.map(w => ({ date: w.date, weight: w.weight })))
    : { labels: [], datasets: [] };

  const bodyMeasurementsChartData = analyticsData?.bodyMeasurements
    ? formatChartData.bodyMeasurements(
        analyticsData.bodyMeasurements.map(bm => ({
          date: bm.date,
          chest: bm.measurements.chest,
          waist: bm.measurements.waist,
          hips: bm.measurements.hips,
        }))
      )
    : { labels: [], datasets: [] };

  const workoutVolumeData = analyticsData?.workouts
    ? {
        labels: analyticsData.workouts.map(w => 
          new Date(w.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            label: 'Duración (min)',
            data: analyticsData.workouts.map(w => w.duration),
            backgroundColor: chartColors.info,
            borderColor: chartColors.info,
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const muscleGroupData = {
    labels: ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'],
    datasets: [
      {
        label: 'Ejercicios por grupo muscular',
        data: [12, 15, 18, 8, 10, 6], // Mock data - would be calculated from actual workouts
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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis de Progreso</h1>
          <p className="text-gray-600">Visualiza tu progreso y estadísticas de entrenamiento</p>
        </div>
        
        {/* Time Period Selector */}
        <div className="mt-4 sm:mt-0">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {[
              { value: '7d', label: '7 días' },
              { value: '30d', label: '30 días' },
              { value: '90d', label: '90 días' },
              { value: '1y', label: '1 año' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as TimePeriod)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Weight className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cambio de Peso</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analyticsData?.progressStats.weight_change ?? 0) > 0 ? '+' : ''}
                {(analyticsData?.progressStats.weight_change ?? 0).toFixed(1)} kg
              </p>
              <p className="text-sm text-gray-500">
                {(analyticsData?.progressStats.weight_change_percentage ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consistencia</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.progressStats.consistency_score.toFixed(0) || '0'}%
              </p>
              <p className="text-sm text-gray-500">Score de constancia</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.workouts.length || 0}
              </p>
              <p className="text-sm text-gray-500">En el período</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duración Promedio</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData?.workouts.length
                  ? Math.round(
                      analyticsData.workouts.reduce((sum, w) => sum + w.duration, 0) /
                        analyticsData.workouts.length
                    )
                  : 0}{' '}
                min
              </p>
              <p className="text-sm text-gray-500">Por entrenamiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progress Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso de Peso</h3>
          <div className="h-64">
            {weightChartData.labels.length > 0 ? (
              <Line data={weightChartData} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay datos de peso disponibles
              </div>
            )}
          </div>
        </div>

        {/* Body Measurements Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medidas Corporales</h3>
          <div className="h-64">
            {bodyMeasurementsChartData.labels.length > 0 ? (
              <Line data={bodyMeasurementsChartData} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay datos de medidas disponibles
              </div>
            )}
          </div>
        </div>

        {/* Workout Volume Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Duración de Entrenamientos</h3>
          <div className="h-64">
            {workoutVolumeData.labels.length > 0 ? (
              <Bar data={workoutVolumeData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No hay datos de entrenamientos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Muscle Group Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Grupo Muscular</h3>
          <div className="h-64">
            <Doughnut 
              data={muscleGroupData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 12,
                        family: 'Inter, sans-serif',
                      },
                    },
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}