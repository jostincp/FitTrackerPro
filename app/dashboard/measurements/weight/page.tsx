'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Scale, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { WeightMeasurement } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface WeightFormData {
  weight: string;
  notes: string;
}

export default function WeightPage() {
  const [formData, setFormData] = useState<WeightFormData>({
    weight: '',
    notes: ''
  });

  const [weightHistory, setWeightHistory] = useState<WeightMeasurement[]>([
    {
      id: '1',
      user_id: 'mock-user-id',
      weight: 75.5,
      date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',

    },
    {
      id: '2',
      user_id: 'mock-user-id',
      weight: 74.8,
      date: '2024-01-08',
      created_at: '2024-01-08T10:00:00Z',

    },
    {
      id: '3',
      user_id: 'mock-user-id',
      weight: 75.2,
      date: '2024-01-01',
      created_at: '2024-01-01T10:00:00Z',

    }
  ]);

  const handleInputChange = (field: keyof WeightFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weight) {
      toast.error('El peso es obligatorio');
      return;
    }

    const weight = parseFloat(formData.weight);
    if (weight <= 0 || weight > 500) {
      toast.error('Por favor ingresa un peso válido');
      return;
    }

    const newWeight: WeightMeasurement = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      weight,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),

      notes: formData.notes || undefined
    };

    setWeightHistory(prev => [newWeight, ...prev]);
    
    // Limpiar formulario
    setFormData({
      weight: '',
      notes: ''
    });

    toast.success('Peso registrado correctamente');
  };

  const getWeightTrend = () => {
    if (weightHistory.length < 2) return null;
    
    const latest = weightHistory[0].weight;
    const previous = weightHistory[1].weight;
    const difference = latest - previous;
    
    return {
      difference: Math.abs(difference),
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable'
    };
  };

  const weightTrend = getWeightTrend();
  const currentWeight = weightHistory.length > 0 ? weightHistory[0].weight : null;
  const averageWeight = weightHistory.length > 0 
    ? weightHistory.reduce((sum, w) => sum + w.weight, 0) / weightHistory.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/measurements">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro de Peso</h1>
          <p className="text-muted-foreground">
            Monitorea tu peso corporal de forma regular
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peso Actual</p>
                <p className="text-2xl font-bold">
                  {currentWeight ? `${currentWeight} kg` : 'Sin datos'}
                </p>
              </div>
              <Scale className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold">
                  {averageWeight > 0 ? `${averageWeight.toFixed(1)} kg` : 'Sin datos'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Minus className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tendencia</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {weightTrend ? (
                    <>
                      {weightTrend.trend === 'up' && (
                        <>
                          <TrendingUp className="h-5 w-5 text-red-500" />
                          <span className="text-red-500">+{weightTrend.difference.toFixed(1)} kg</span>
                        </>
                      )}
                      {weightTrend.trend === 'down' && (
                        <>
                          <TrendingDown className="h-5 w-5 text-green-500" />
                          <span className="text-green-500">-{weightTrend.difference.toFixed(1)} kg</span>
                        </>
                      )}
                      {weightTrend.trend === 'stable' && (
                        <>
                          <Minus className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-500">Estable</span>
                        </>
                      )}
                    </>
                  ) : (
                    'Sin datos'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de registro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Registrar Peso
            </CardTitle>
            <CardDescription>
              Ingresa tu peso actual para mantener un seguimiento preciso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  placeholder="75.5"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Medición en ayunas, después del entrenamiento..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Registrar Peso
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Historial reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Historial Reciente
            </CardTitle>
            <CardDescription>
              Tus últimos registros de peso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weightHistory.slice(0, 5).map((record, index) => {
                const isLatest = index === 0;
                const previousWeight = index < weightHistory.length - 1 ? weightHistory[index + 1].weight : null;
                const difference = previousWeight ? record.weight - previousWeight : null;
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{record.weight} kg</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isLatest && (
                        <Badge variant="secondary">Actual</Badge>
                      )}
                      {difference !== null && (
                        <Badge 
                          variant="outline" 
                          className={`
                            ${difference > 0 ? 'text-red-600 border-red-200' : ''}
                            ${difference < 0 ? 'text-green-600 border-green-200' : ''}
                            ${difference === 0 ? 'text-gray-600 border-gray-200' : ''}
                          `}
                        >
                          {difference > 0 ? '+' : ''}{difference.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {weightHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay registros de peso aún</p>
                  <p className="text-sm">Comienza registrando tu peso actual</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}