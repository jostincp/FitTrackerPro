'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import {
  ChartBarIcon,
  ScaleIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Entrenamientos Totales',
    value: '0',
    change: '+0%',
    changeType: 'neutral' as const,
    icon: ChartBarIcon,
  },
  {
    name: 'Peso Actual',
    value: '-- kg',
    change: '--',
    changeType: 'neutral' as const,
    icon: ScaleIcon,
  },
  {
    name: 'Tiempo Total',
    value: '0 min',
    change: '+0 min',
    changeType: 'neutral' as const,
    icon: ClockIcon,
  },
  {
    name: 'Calorías Quemadas',
    value: '0',
    change: '+0',
    changeType: 'neutral' as const,
    icon: FireIcon,
  },
];

const quickActions = [
  {
    name: 'Nuevo Entrenamiento',
    description: 'Registra una nueva sesión de ejercicio',
    href: '/dashboard/workouts/new',
    icon: ChartBarIcon,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    name: 'Registrar Peso',
    description: 'Añade una nueva medición de peso',
    href: '/dashboard/measurements/weight',
    icon: ScaleIcon,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'Ver Rutinas',
    description: 'Explora tus rutinas de ejercicio',
    href: '/dashboard/routines',
    icon: CalendarDaysIcon,
    color: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    name: 'Análisis de Progreso',
    description: 'Revisa tus estadísticas y progreso',
    href: '/dashboard/analytics',
    icon: TrophyIcon,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
];

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // useRequireAuth will redirect
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Bienvenido de vuelta, {userName}!
              </h1>
              <p className="text-gray-600">
                Aquí tienes un resumen de tu progreso fitness
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold">
                        <span
                          className={`${
                            stat.changeType === 'neutral'
                              ? 'text-gray-500'
                              : stat.changeType === 'increase'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-orange-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay actividad reciente
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza registrando tu primer entrenamiento para ver tu actividad aquí.
            </p>
            <div className="mt-6">
              <a
                href="/dashboard/workouts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <ChartBarIcon className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Entrenamiento
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              ¡Bienvenido a FitTracker Pro v2.0!
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Esta es la nueva versión de tu aplicación fitness con tecnología moderna,
                sincronización en la nube y funcionalidades PWA. Si tienes datos de la
                versión anterior, podrás migrarlos próximamente desde la sección de
                configuración.
              </p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <a
                  href="/dashboard/settings"
                  className="bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
                >
                  Ir a Configuración
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}