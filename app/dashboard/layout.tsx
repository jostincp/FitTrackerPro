import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: {
    template: '%s | FitTracker Pro v2.0',
    default: 'Dashboard | FitTracker Pro v2.0',
  },
  description: 'Panel de control para seguimiento de fitness y progreso personal',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}