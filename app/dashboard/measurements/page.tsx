'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Scale, Ruler, Activity, TrendingUp, Plus } from 'lucide-react';
import { MeasurementFormData, WeightMeasurement, BodyMeasurement } from '@/types';
import BodyMap from '@/components/BodyMap';

// Tipo combinado para la página de medidas
type CombinedMeasurement = {
  id: string;
  user_id: string;
  weight: number;
  height?: number;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
};
import { toast } from 'sonner';

type ExtendedMeasurementFormData = {
  weight: string;
  height?: string;
  chest: string;
  waist: string;
  hips: string;
  biceps: string;
  thighs: string;
  neck: string;
  bodyFatPercentage?: string;
  muscleMass?: string;
  notes: string;
};

export default function MeasurementsPage() {
  const [formData, setFormData] = useState<ExtendedMeasurementFormData>({
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    neck: '',
    bodyFatPercentage: '',
    muscleMass: '',
    notes: ''
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [measurements, setMeasurements] = useState<CombinedMeasurement[]>([
    {
      id: '1',
      user_id: 'mock-user-id',
      weight: 75.5,
      date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      chest: 95,
      waist: 80,
      hips: 98,
      biceps: 35,
      thighs: 58,
      neck: 38,
      body_fat_percentage: 15.2,
      muscle_mass: 63.8,
      notes: 'Medición después del entrenamiento matutino'
    },
    {
      id: '2',
      user_id: 'mock-user-id',
      weight: 74.8,
      date: '2024-01-08',
      created_at: '2024-01-08T10:00:00Z',
      updated_at: '2024-01-08T10:00:00Z',
      chest: 94,
      waist: 81,
      hips: 97,
      biceps: 34.5,
      thighs: 57.5,
      neck: 37.5,
      body_fat_percentage: 15.8,
      muscle_mass: 63.2,
      notes: 'Primera medición del mes'
    }
  ]);

  const calculateBMI = (weight: number, height: number): number => {
    if (!weight || !height) return 0;
    return Number((weight / Math.pow(height / 100, 2)).toFixed(1));
  };

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Bajo peso', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidad', color: 'text-red-600' };
  };

  const handleInputChange = (field: keyof ExtendedMeasurementFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleZoneClick = (fieldId: string) => {
    setFocusedField(fieldId);
    // Enfocar el campo correspondiente
    const element = document.getElementById(fieldId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFieldFocus = (fieldId: string) => {
    setFocusedField(fieldId);
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.weight) {
      toast.error('El peso es obligatorio');
      return;
    }

    const newMeasurement: CombinedMeasurement = {
      id: Date.now().toString(),
      user_id: 'mock-user-id',
      weight: parseFloat(formData.weight),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      chest: formData.chest ? parseFloat(formData.chest) : undefined,
      waist: formData.waist ? parseFloat(formData.waist) : undefined,
      hips: formData.hips ? parseFloat(formData.hips) : undefined,
      biceps: formData.biceps ? parseFloat(formData.biceps) : undefined,
      thighs: formData.thighs ? parseFloat(formData.thighs) : undefined,
      neck: formData.neck ? parseFloat(formData.neck) : undefined,
      body_fat_percentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
      muscle_mass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
      notes: formData.notes
    };

    setMeasurements(prev => [newMeasurement, ...prev]);
    
    // Limpiar formulario
    setFormData({
      weight: '',
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: '',
      neck: '',
      height: undefined,
      bodyFatPercentage: undefined,
      muscleMass: undefined,
      notes: ''
    });

    toast.success('Medidas registradas correctamente');
  };

  const currentBMI = formData.weight && formData.height 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : 0;
  
  const bmiInfo = getBMICategory(currentBMI);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medidas Corporales</h1>
          <p className="text-muted-foreground">
            Registra y monitorea tu progreso físico
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {measurements.length} registros
        </Badge>
      </div>

      <Tabs defaultValue="registro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registro" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Registro
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Registrar Nuevas Medidas
              </CardTitle>
              <CardDescription>
                Completa los campos que desees registrar. El peso es obligatorio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>
                </div>

                {/* IMC Calculator */}
                {currentBMI > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Índice de Masa Corporal</p>
                          <p className="text-2xl font-bold">{currentBMI}</p>
                        </div>
                        <Badge variant="outline" className={bmiInfo.color}>
                          {bmiInfo.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Medidas corporales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Medidas Corporales (cm)
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mapa corporal */}
                    <div className="order-2 lg:order-1">
                      <BodyMap 
                        onZoneClick={handleZoneClick}
                        highlightedZone={focusedField || undefined}
                        className="sticky top-4"
                      />
                    </div>
                    
                    {/* Campos de medidas */}
                    <div className="order-1 lg:order-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="chest">Pecho</Label>
                          <Input
                            id="chest"
                            type="number"
                            step="0.1"
                            placeholder="95.0"
                            value={formData.chest}
                            onChange={(e) => handleInputChange('chest', e.target.value)}
                            onFocus={() => handleFieldFocus('chest')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waist">Cintura</Label>
                          <Input
                            id="waist"
                            type="number"
                            step="0.1"
                            placeholder="80.0"
                            value={formData.waist}
                            onChange={(e) => handleInputChange('waist', e.target.value)}
                            onFocus={() => handleFieldFocus('waist')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hips">Caderas</Label>
                          <Input
                            id="hips"
                            type="number"
                            step="0.1"
                            placeholder="98.0"
                            value={formData.hips}
                            onChange={(e) => handleInputChange('hips', e.target.value)}
                            onFocus={() => handleFieldFocus('hips')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biceps">Bíceps</Label>
                          <Input
                            id="biceps"
                            type="number"
                            step="0.1"
                            placeholder="35.0"
                            value={formData.biceps}
                            onChange={(e) => handleInputChange('biceps', e.target.value)}
                            onFocus={() => handleFieldFocus('biceps')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thighs">Muslos</Label>
                          <Input
                            id="thighs"
                            type="number"
                            step="0.1"
                            placeholder="58.0"
                            value={formData.thighs}
                            onChange={(e) => handleInputChange('thighs', e.target.value)}
                            onFocus={() => handleFieldFocus('thighs')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="neck">Cuello</Label>
                          <Input
                            id="neck"
                            type="number"
                            step="0.1"
                            placeholder="38.0"
                            value={formData.neck}
                            onChange={(e) => handleInputChange('neck', e.target.value)}
                            onFocus={() => handleFieldFocus('neck')}
                            onBlur={handleFieldBlur}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composición corporal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Composición Corporal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bodyFat">Porcentaje de Grasa (%)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        step="0.1"
                        placeholder="15.2"
                        value={formData.bodyFatPercentage || ''}
                        onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="muscleMass">Masa Muscular (kg)</Label>
                      <Input
                        id="muscleMass"
                        type="number"
                        step="0.1"
                        placeholder="63.8"
                        value={formData.muscleMass || ''}
                        onChange={(e) => handleInputChange('muscleMass', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agrega cualquier observación relevante..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Guardar Medidas
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-6">
          <div className="grid gap-4">
            {measurements.map((measurement) => {
              const measurementBMI = measurement.height 
                ? calculateBMI(measurement.weight, measurement.height)
                : 0;
              
              return (
                <Card key={measurement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        {new Date(measurement.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <Badge variant="secondary">
                        {measurement.weight} kg
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {measurement.chest && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Pecho</p>
                          <p className="font-semibold">{measurement.chest} cm</p>
                        </div>
                      )}
                      {measurement.waist && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Cintura</p>
                          <p className="font-semibold">{measurement.waist} cm</p>
                        </div>
                      )}
                      {measurement.hips && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Caderas</p>
                          <p className="font-semibold">{measurement.hips} cm</p>
                        </div>
                      )}
                      {measurement.biceps && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Bíceps</p>
                          <p className="font-semibold">{measurement.biceps} cm</p>
                        </div>
                      )}
                      {measurement.thighs && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Muslos</p>
                          <p className="font-semibold">{measurement.thighs} cm</p>
                        </div>
                      )}
                      {measurement.neck && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Cuello</p>
                          <p className="font-semibold">{measurement.neck} cm</p>
                        </div>
                      )}
                      {measurement.body_fat_percentage && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Grasa</p>
                          <p className="font-semibold">{measurement.body_fat_percentage}%</p>
                        </div>
                      )}
                      {measurement.muscle_mass && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Músculo</p>
                          <p className="font-semibold">{measurement.muscle_mass} kg</p>
                        </div>
                      )}
                    </div>
                    {measurement.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{measurement.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}