'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Scale, Ruler, Activity, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { bodyMeasurementsSchema, BodyMeasurementsFormData } from '@/lib/validations/measurements';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BodyMap from '@/components/BodyMap';
import { toast } from 'sonner';
import { z } from 'zod';

// Types
type BodyMeasurement = {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  height?: number;
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

type MeasurementFormData = BodyMeasurementsFormData;

// Query keys
const measurementKeys = {
  all: ['measurements'] as const,
  lists: () => [...measurementKeys.all, 'list'] as const,
  list: (userId: string) => [...measurementKeys.lists(), userId] as const,
};

export default function MeasurementsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // React Hook Form with Zod validation
  const form = useForm<MeasurementFormData>({
    resolver: zodResolver(bodyMeasurementsSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      leftArm: undefined,
      rightArm: undefined,
      leftThigh: undefined,
      rightThigh: undefined,
      neck: undefined,
      bodyFat: undefined,
      muscleMass: undefined,
      measurementDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // Fetch measurements
  const { data: measurements = [], isLoading } = useQuery({
    queryKey: measurementKeys.list(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as BodyMeasurement[];
    },
    enabled: !!user?.id,
  });

  // Create measurement mutation
  const createMeasurementMutation = useMutation({
    mutationFn: async (data: MeasurementFormData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const measurementData = {
        user_id: user.id,
        date: data.measurementDate,
        weight: data.weight,
        height: data.height,
        measurements: {
          chest: data.chest,
          waist: data.waist,
          hips: data.hips,
          leftArm: data.leftArm,
          rightArm: data.rightArm,
          leftThigh: data.leftThigh,
          rightThigh: data.rightThigh,
          neck: data.neck,
        },
        body_fat_percentage: data.bodyFat,
        muscle_mass: data.muscleMass,
        notes: data.notes,
      };
      
      const { data: result, error } = await supabase
        .from('body_measurements')
        .insert([measurementData])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.list(user?.id || '') });
      form.reset();
      toast.success('Medidas registradas correctamente');
    },
    onError: (error) => {
      console.error('Error creating measurement:', error);
      toast.error('Error al guardar las medidas');
    },
  });

  // Helper functions
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

  const onSubmit = (data: MeasurementFormData) => {
    createMeasurementMutation.mutate(data);
  };

  const watchedWeight = form.watch('weight');
  const watchedHeight = form.watch('height');
  const currentBMI = watchedWeight && watchedHeight 
    ? calculateBMI(watchedWeight, watchedHeight)
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
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `${measurements.length} registros`
          )}
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Datos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="measurementDate">Fecha de Medición</Label>
                    <Input
                      id="measurementDate"
                      type="date"
                      {...form.register('measurementDate')}
                    />
                    {form.formState.errors.measurementDate && (
                      <p className="text-sm text-red-500">{form.formState.errors.measurementDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="75.5"
                      {...form.register('weight', { valueAsNumber: true })}
                    />
                    {form.formState.errors.weight && (
                      <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      {...form.register('height', { valueAsNumber: true })}
                    />
                    {form.formState.errors.height && (
                      <p className="text-sm text-red-500">{form.formState.errors.height.message}</p>
                    )}
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
                            {...form.register('chest', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('chest')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.chest && (
                            <p className="text-sm text-red-500">{form.formState.errors.chest.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waist">Cintura</Label>
                          <Input
                            id="waist"
                            type="number"
                            step="0.1"
                            placeholder="80.0"
                            {...form.register('waist', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('waist')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.waist && (
                            <p className="text-sm text-red-500">{form.formState.errors.waist.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hips">Caderas</Label>
                          <Input
                            id="hips"
                            type="number"
                            step="0.1"
                            placeholder="98.0"
                            {...form.register('hips', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('hips')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.hips && (
                            <p className="text-sm text-red-500">{form.formState.errors.hips.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leftArm">Brazo Izquierdo</Label>
                          <Input
                            id="leftArm"
                            type="number"
                            step="0.1"
                            placeholder="35.0"
                            {...form.register('leftArm', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('leftArm')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.leftArm && (
                            <p className="text-sm text-red-500">{form.formState.errors.leftArm.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rightArm">Brazo Derecho</Label>
                          <Input
                            id="rightArm"
                            type="number"
                            step="0.1"
                            placeholder="35.0"
                            {...form.register('rightArm', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('rightArm')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.rightArm && (
                            <p className="text-sm text-red-500">{form.formState.errors.rightArm.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leftThigh">Muslo Izquierdo</Label>
                          <Input
                            id="leftThigh"
                            type="number"
                            step="0.1"
                            placeholder="58.0"
                            {...form.register('leftThigh', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('leftThigh')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.leftThigh && (
                            <p className="text-sm text-red-500">{form.formState.errors.leftThigh.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rightThigh">Muslo Derecho</Label>
                          <Input
                            id="rightThigh"
                            type="number"
                            step="0.1"
                            placeholder="58.0"
                            {...form.register('rightThigh', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('rightThigh')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.rightThigh && (
                            <p className="text-sm text-red-500">{form.formState.errors.rightThigh.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="neck">Cuello</Label>
                          <Input
                            id="neck"
                            type="number"
                            step="0.1"
                            placeholder="38.0"
                            {...form.register('neck', { valueAsNumber: true })}
                            onFocus={() => handleFieldFocus('neck')}
                            onBlur={handleFieldBlur}
                          />
                          {form.formState.errors.neck && (
                            <p className="text-sm text-red-500">{form.formState.errors.neck.message}</p>
                          )}
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
                        {...form.register('bodyFat', { valueAsNumber: true })}
                      />
                      {form.formState.errors.bodyFat && (
                        <p className="text-sm text-red-500">{form.formState.errors.bodyFat.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="muscleMass">Masa Muscular (kg)</Label>
                      <Input
                        id="muscleMass"
                        type="number"
                        step="0.1"
                        placeholder="63.8"
                        {...form.register('muscleMass', { valueAsNumber: true })}
                      />
                      {form.formState.errors.muscleMass && (
                        <p className="text-sm text-red-500">{form.formState.errors.muscleMass.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agrega cualquier observación relevante..."
                    {...form.register('notes')}
                    rows={3}
                  />
                  {form.formState.errors.notes && (
                    <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
                  )}
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
              const measurementBMI = measurement.height && measurement.weight
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