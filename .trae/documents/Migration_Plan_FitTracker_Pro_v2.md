# Plan de Migración - FitTracker Pro v1.0 → v2.0

## 1. Resumen Ejecutivo

### Situación Actual
- **Tecnología:** Next.js básico con configuración mixta Vite/Next.js
- **Almacenamiento:** LocalStorage del navegador
- **Funcionalidades:** Dashboard, registro de entrenamientos, rutinas, mediciones corporales, peso, fotos
- **Limitaciones:** Sin backend robusto, sin sincronización en la nube, sin PWA, sin integraciones

### Objetivo de Migración
- **Nueva Tecnología:** React 18 + Next.js 14/15 + TypeScript + Tailwind CSS + Supabase + PWA
- **Deployment:** Migración de Vercel a Netlify
- **Mejoras:** Backend completo con Supabase, PWA, integraciones con wearables, análisis con IA, UI moderna
- **Cronograma:** 8 semanas de desarrollo (proyecto ya iniciado)
- **Estrategia:** Migración completa del stack tecnológico con preservación de datos existentes

## 2. Análisis de Datos Existentes

### 2.1 Estructura de Datos Actual

**Estado Actual del Proyecto:**
- Frontend: Next.js 14 con App Router
- Componentes: React con TypeScript
- Estilos: Tailwind CSS
- Datos: LocalStorage (temporal) + tipos TypeScript definidos
- Funcionalidades implementadas: Dashboard, mediciones corporales

```typescript
// Tipos TypeScript actuales (types/index.ts)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface ExerciseSet {
  weight: number;
  reps: number;
  rpe?: number;
  restTime?: number;
}

export interface MeasurementFormData {
  weight: number;
  height: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
  bodyFat?: number;
  muscleMass?: number;
  date: string;
  notes?: string;
}

export interface WeightMeasurement {
  id: string;
  weight: number;
  date: string;
  bmi?: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  neck?: number;
  bodyFat?: number;
  muscleMass?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageUrl: string;
  type: 'front' | 'side' | 'back';
  notes?: string;
}
```

### 2.2 Plan de Migración Tecnológica

**Fases de Migración:**

1. **Configuración de Supabase** (Semana 1)
2. **Migración de Autenticación** (Semana 2)
3. **Migración de Base de Datos** (Semana 3-4)
4. **Implementación de PWA** (Semana 5)
5. **Integraciones con Wearables** (Semana 6-7)
6. **Deploy en Netlify** (Semana 8)

```typescript
// lib/supabase/migration.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { 
  UserProfile, 
  MeasurementFormData, 
  WeightMeasurement, 
  BodyMeasurement,
  ProgressPhoto 
} from '@/types';

export class SupabaseMigrationService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  async migrateLocalStorageData(userId: string) {
    try {
      // 1. Obtener datos del localStorage
      const localData = this.getLocalStorageData();
      
      // 2. Migrar perfil de usuario
      if (localData.userProfile) {
        await this.migrateUserProfile(localData.userProfile, userId);
      }
      
      // 3. Migrar mediciones corporales
      if (localData.measurements?.length > 0) {
        await this.migrateMeasurements(localData.measurements, userId);
      }
      
      // 4. Migrar historial de peso
      if (localData.weightHistory?.length > 0) {
        await this.migrateWeightHistory(localData.weightHistory, userId);
      }
      
      // 5. Migrar fotos de progreso
      if (localData.progressPhotos?.length > 0) {
        await this.migrateProgressPhotos(localData.progressPhotos, userId);
      }
      
      // 6. Limpiar localStorage después de migración exitosa
      this.clearLocalStorage();
      
      return { success: true, message: 'Migración completada exitosamente' };
    } catch (error) {
      console.error('Error en migración:', error);
      return { success: false, error: error.message };
    }
  }
  
  private getLocalStorageData() {
    return {
      userProfile: JSON.parse(localStorage.getItem('userProfile') || 'null'),
      measurements: JSON.parse(localStorage.getItem('measurements') || '[]'),
      weightHistory: JSON.parse(localStorage.getItem('weightHistory') || '[]'),
      progressPhotos: JSON.parse(localStorage.getItem('progressPhotos') || '[]')
    };
  }
  
  private async migrateUserProfile(profile: UserProfile, userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name: profile.name,
        height_cm: profile.height,
        fitness_level: profile.fitnessLevel || 'beginner'
      });
    
    if (error) throw error;
    return data;
  }
  
  private async migrateMeasurements(measurements: BodyMeasurement[], userId: string) {
    const measurementData = measurements.map(measurement => ({
      user_id: userId,
      chest_cm: measurement.chest,
      waist_cm: measurement.waist,
      hips_cm: measurement.hips,
      left_arm_cm: measurement.biceps,
      right_arm_cm: measurement.biceps,
      left_thigh_cm: measurement.thighs,
      right_thigh_cm: measurement.thighs,
      neck_cm: measurement.neck,
      measurement_date: measurement.date
    }));
    
    const { data, error } = await this.supabase
      .from('body_measurements')
      .insert(measurementData);
    
    if (error) throw error;
    return data;
  }
  
  private async migrateWeightHistory(weightHistory: WeightMeasurement[], userId: string) {
    const weightData = weightHistory.map(entry => ({
      user_id: userId,
      weight_kg: entry.weight,
      entry_date: entry.date
    }));
    
    const { data, error } = await this.supabase
      .from('weight_entries')
      .insert(weightData);
    
    if (error) throw error;
    return data;
  }
  
  private async migrateProgressPhotos(photos: ProgressPhoto[], userId: string) {
    for (const photo of photos) {
      // Si la foto está en base64, convertir a blob
      if (photo.imageUrl.startsWith('data:')) {
        const blob = this.base64ToBlob(photo.imageUrl);
        const fileName = `${userId}/${photo.date}_${photo.id}.jpg`;
        
        // Subir a Supabase Storage
        const { data: uploadData, error: uploadError } = await this.supabase.storage
          .from('progress-photos')
          .upload(fileName, blob);
        
        if (uploadError) throw uploadError;
        
        // Guardar referencia en base de datos
        const { error: dbError } = await this.supabase
          .from('progress_photos')
          .insert({
            user_id: userId,
            file_path: fileName,
            photo_type: photo.type,
            photo_date: photo.date,
            notes: photo.notes
          });
        
        if (dbError) throw dbError;
      }
    }
  }
  
  private clearLocalStorage() {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('measurements');
    localStorage.removeItem('weightHistory');
    localStorage.removeItem('progressPhotos');
  }
  
  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }
}
```

## 3. Cronograma Detallado de Migración

### Semana 1: Configuración de Supabase
**Objetivos:**
- Configurar proyecto Supabase
- Implementar autenticación
- Configurar base de datos inicial

**Tareas:**
- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Implementar Supabase Auth en Next.js
- [ ] Crear tablas básicas (user_profiles, workouts, body_measurements)
- [ ] Configurar Row Level Security (RLS)
- [ ] Implementar middleware de autenticación

### Semana 2: Migración de Componentes Core
**Objetivos:**
- Migrar componentes existentes a Supabase
- Implementar CRUD operations
- Configurar React Query

**Tareas:**
- [ ] Migrar página de mediciones corporales a Supabase
- [ ] Implementar React Query para cache y sincronización
- [ ] Crear hooks personalizados para datos
- [ ] Implementar validación con Zod
- [ ] Migrar dashboard principal

### Semana 3-4: Funcionalidades Avanzadas
**Objetivos:**
- Implementar todas las funcionalidades core
- Optimizar rendimiento
- Implementar Storage para fotos

**Tareas:**
- [ ] Implementar sistema de entrenamientos completo
- [ ] Crear sistema de rutinas personalizadas
- [ ] Configurar Supabase Storage para fotos
- [ ] Implementar galería de progreso
- [ ] Crear sistema de análisis y reportes
- [ ] Optimizar queries y rendimiento

### Semana 5: Implementación PWA
**Objetivos:**
- Convertir aplicación en PWA
- Implementar funcionalidad offline
- Configurar notificaciones

**Tareas:**
- [ ] Configurar Service Workers
- [ ] Implementar manifest.json
- [ ] Configurar cache strategies
- [ ] Implementar sincronización offline
- [ ] Configurar notificaciones push
- [ ] Optimizar para instalación

### Semana 6-7: Integraciones con Wearables
**Objetivos:**
- Implementar APIs de wearables
- Crear Edge Functions
- Implementar análisis con IA

**Tareas:**
- [ ] Crear Edge Functions para wearables
- [ ] Implementar integración con Fitbit API
- [ ] Implementar integración con Garmin API
- [ ] Crear sistema de sincronización automática
- [ ] Implementar análisis de datos con IA
- [ ] Crear dashboard de insights

### Semana 8: Deploy y Optimización
**Objetivos:**
- Migrar de Vercel a Netlify
- Optimizar rendimiento
- Testing y QA

**Tareas:**
- [ ] Configurar deploy en Netlify
- [ ] Configurar CI/CD pipeline
- [ ] Implementar Lighthouse optimizations
- [ ] Configurar Web Vitals monitoring
- [ ] Testing completo de funcionalidades
- [ ] Migración de datos de producción
- [ ] Go-live y monitoreo

## 4. Configuración de Entorno

### 4.1 Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Wearable APIs
FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret
GARMIN_CLIENT_ID=your_garmin_client_id
GARMIN_CLIENT_SECRET=your_garmin_client_secret

# Netlify
NETLIFY_SITE_ID=your_netlify_site_id
NETLIFY_AUTH_TOKEN=your_netlify_token

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4.2 Dependencias Nuevas

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "workbox-webpack-plugin": "^7.0.0",
    "next-pwa": "^5.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "lighthouse": "^11.0.0",
    "web-vitals": "^3.5.0"
  }
}
```

## 5. Riesgos y Mitigaciones

### 5.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos durante migración | Media | Alto | Backup completo antes de migración, testing en ambiente de desarrollo |
| Problemas de rendimiento con Supabase | Baja | Medio | Optimización de queries, implementación de cache con React Query |
| Incompatibilidad con APIs de wearables | Media | Medio | Implementación gradual, fallbacks para APIs no disponibles |
| Problemas de deploy en Netlify | Baja | Medio | Testing previo, configuración de rollback automático |

### 5.2 Plan de Rollback

1. **Backup de datos:** Exportar todos los datos antes de la migración
2. **Versión anterior:** Mantener versión actual disponible en branch separado
3. **DNS switching:** Capacidad de revertir DNS en caso de problemas críticos
4. **Monitoreo:** Alertas automáticas para detectar problemas post-deploy

## 6. Criterios de Éxito

### 6.1 Métricas Técnicas
- [ ] Tiempo de carga < 3 segundos
- [ ] Lighthouse Score > 90
- [ ] PWA installable en todos los dispositivos
- [ ] 99.9% uptime
- [ ] Sincronización de datos < 5 segundos

### 6.2 Métricas de Usuario
- [ ] Migración de datos sin pérdida
- [ ] Funcionalidad offline completa
- [ ] Integración exitosa con al menos 2 wearables
- [ ] Análisis de IA funcionando correctamente
- [ ] Interfaz responsive en todos los dispositivos
```

## 3. Fases de Migración

### Fase 1: Configuración del Entorno (Semanas 1-2)

**Objetivos:**
- Configurar proyecto Next.js con TypeScript
- Integrar Supabase y configurar base de datos
- Establecer estructura de componentes base

**Tareas Específicas:**

```bash
# 1. Crear proyecto Next.js
npx create-next-app@latest fittracker-pro-v2 --typescript --tailwind --eslint --app
cd fittracker-pro-v2

# 2. Instalar dependencias principales
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @headlessui/react @heroicons/react
npm install chart.js react-chartjs-2 three @types/three
npm install framer-motion date-fns clsx
npm install -D @types/node

# 3. Configurar PWA
npm install next-pwa workbox-webpack-plugin
```

**Estructura de Directorios:**
```
fittracker-pro-v2/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── workouts/
│   │   ├── routines/
│   │   ├── measurements/
│   │   ├── weight/
│   │   ├── progress/
│   │   └── analytics/
│   ├── api/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── charts/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── utils/
│   └── types/
├── hooks/
├── utils/
└── public/
```

### Fase 2: Autenticación y Perfil de Usuario (Semanas 3-4)

**Componentes a Desarrollar:**

```typescript
// components/auth/LoginForm.tsx
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      router.push('/');
    }
    
    setLoading(false);
  };
  
  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Formulario de login con Tailwind CSS */}
    </form>
  );
}

// components/profile/MigrationWizard.tsx
export default function MigrationWizard() {
  const [legacyData, setLegacyData] = useState<LegacyData | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'migrating' | 'completed'>('idle');
  
  const detectLegacyData = () => {
    const data = {
      userProfile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
      workouts: JSON.parse(localStorage.getItem('workouts') || '[]'),
      routines: JSON.parse(localStorage.getItem('routines') || '[]'),
      measurements: JSON.parse(localStorage.getItem('measurements') || '[]'),
      weightHistory: JSON.parse(localStorage.getItem('weightHistory') || '[]'),
      progressPhotos: JSON.parse(localStorage.getItem('progressPhotos') || '[]')
    };
    
    setLegacyData(data);
  };
  
  const startMigration = async () => {
    if (!legacyData) return;
    
    setMigrationStatus('migrating');
    const migrationService = new DataMigrationService(supabase);
    const result = await migrationService.migrateLegacyData(legacyData, user.id);
    
    if (result.success) {
      setMigrationStatus('completed');
      toast.success('¡Datos migrados exitosamente!');
    } else {
      toast.error('Error en la migración: ' + result.error);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Wizard de migración con pasos */}
    </div>
  );
}
```

### Fase 3: Dashboard y Visualizaciones (Semanas 5-6)

**Componentes de Dashboard:**

```typescript
// components/dashboard/StatsCards.tsx
export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Entrenamientos Totales"
        value={stats?.total_workouts || 0}
        icon={<FireIcon className="h-8 w-8 text-orange-500" />}
        trend="+12%"
      />
      <StatCard
        title="Peso Actual"
        value={`${stats?.current_weight || 0} kg`}
        icon={<ScaleIcon className="h-8 w-8 text-blue-500" />}
        trend="-2.5kg"
      />
      {/* Más tarjetas de estadísticas */}
    </div>
  );
}

// components/charts/ProgressChart.tsx
export default function ProgressChart({ type }: { type: 'weight' | 'measurements' }) {
  const { data: chartData } = useQuery({
    queryKey: ['progress-chart', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(type === 'weight' ? 'weight_entries' : 'body_measurements')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(30);
      
      if (error) throw error;
      return data;
    }
  });
  
  const chartConfig = {
    type: 'line' as const,
    data: {
      labels: chartData?.map(item => format(new Date(item.created_at), 'dd/MM')),
      datasets: [{
        label: type === 'weight' ? 'Peso (kg)' : 'Medidas',
        data: chartData?.map(item => type === 'weight' ? item.weight_kg : item.chest_cm),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: type === 'weight' ? 'Progreso de Peso' : 'Progreso de Medidas'
        }
      }
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <Line {...chartConfig} />
    </div>
  );
}
```

### Fase 4: Gestión de Entrenamientos (Semanas 7-8)

**Funcionalidades Clave:**

```typescript
// components/workouts/WorkoutForm.tsx
export default function WorkoutForm() {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [currentSets, setCurrentSets] = useState<Record<string, ExerciseSet[]>>({});
  
  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*, muscle_groups(*)')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });
  
  const addExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => [...prev, exercise]);
    setCurrentSets(prev => ({
      ...prev,
      [exercise.id]: [{ weight_kg: 0, reps: 0, rpe: 5 }]
    }));
  };
  
  const addSet = (exerciseId: string) => {
    setCurrentSets(prev => ({
      ...prev,
      [exerciseId]: [...prev[exerciseId], { weight_kg: 0, reps: 0, rpe: 5 }]
    }));
  };
  
  const saveWorkout = async () => {
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: `Entrenamiento ${format(new Date(), 'dd/MM/yyyy')}`,
        workout_date: new Date().toISOString().split('T')[0],
        status: 'completed'
      })
      .select()
      .single();
    
    if (workoutError) throw workoutError;
    
    // Guardar ejercicios y series
    for (const exercise of selectedExercises) {
      const { data: workoutExercise } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workout.id,
          exercise_id: exercise.id,
          order_index: selectedExercises.indexOf(exercise)
        })
        .select()
        .single();
      
      // Guardar series
      const sets = currentSets[exercise.id].map((set, index) => ({
        workout_exercise_id: workoutExercise.id,
        set_number: index + 1,
        weight_kg: set.weight_kg,
        reps: set.reps,
        rpe: set.rpe,
        completed_at: new Date().toISOString()
      }));
      
      await supabase.from('exercise_sets').insert(sets);
    }
    
    toast.success('¡Entrenamiento guardado!');
    router.push('/workouts');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Formulario de entrenamiento */}
    </div>
  );
}
```

### Fase 5: Medición Corporal Interactiva (Semanas 9-10)

**Componente de Diagrama 3D:**

```typescript
// components/measurements/BodyDiagram3D.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useRef, useState } from 'react';

function BodyModel({ onMuscleClick }: { onMuscleClick: (muscle: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  
  const muscleGroups = [
    { name: 'chest', position: [0, 0.5, 0.2], color: '#FF6B6B' },
    { name: 'arms', position: [-0.8, 0.2, 0], color: '#4ECDC4' },
    { name: 'core', position: [0, -0.2, 0.1], color: '#45B7D1' },
    { name: 'legs', position: [0, -1.2, 0], color: '#96CEB4' }
  ];
  
  return (
    <group>
      {/* Modelo base del cuerpo */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 2, 0.3]} />
        <meshStandardMaterial color="#F3E5AB" />
      </mesh>
      
      {/* Grupos musculares interactivos */}
      {muscleGroups.map((muscle) => (
        <mesh
          key={muscle.name}
          position={muscle.position}
          onClick={() => onMuscleClick(muscle.name)}
          onPointerOver={() => setHoveredMuscle(muscle.name)}
          onPointerOut={() => setHoveredMuscle(null)}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial 
            color={hoveredMuscle === muscle.name ? '#FFD93D' : muscle.color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Etiquetas de medidas */}
      {hoveredMuscle && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          Click para medir {hoveredMuscle}
        </Text>
      )}
    </group>
  );
}

export default function BodyDiagram3D() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [measurementValue, setMeasurementValue] = useState('');
  
  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscle(muscle);
  };
  
  const saveMeasurement = async () => {
    if (!selectedMuscle || !measurementValue) return;
    
    const { error } = await supabase
      .from('body_measurements')
      .upsert({
        user_id: user.id,
        [`${selectedMuscle}_cm`]: parseFloat(measurementValue),
        measurement_date: new Date().toISOString().split('T')[0]
      });
    
    if (error) {
      toast.error('Error al guardar medición');
    } else {
      toast.success('Medición guardada');
      setSelectedMuscle(null);
      setMeasurementValue('');
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Diagrama 3D */}
      <div className="flex-1 h-96 bg-gray-100 rounded-lg">
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <BodyModel onMuscleClick={handleMuscleClick} />
          <OrbitControls enableZoom={true} />
        </Canvas>
      </div>
      
      {/* Panel de medición */}
      <div className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-sm">
        {selectedMuscle ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">
              Medir {selectedMuscle}
            </h3>
            <input
              type="number"
              value={measurementValue}
              onChange={(e) => setMeasurementValue(e.target.value)}
              placeholder="Medida en cm"
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="flex gap-2">
              <button
                onClick={saveMeasurement}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
              <button
                onClick={() => setSelectedMuscle(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>Haz click en un grupo muscular para registrar su medida</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Fase 6: PWA y Funcionalidad Offline (Semanas 11-12)

**Configuración PWA:**

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

module.exports = withPWA({
  // Configuración de Next.js
});
```

**Service Worker para Sincronización:**

```typescript
// lib/offline/syncService.ts
export class OfflineSyncService {
  private db: IDBDatabase;
  
  async init() {
    this.db = await this.openDB();
  }
  
  async saveOfflineWorkout(workout: any) {
    const transaction = this.db.transaction(['offline_workouts'], 'readwrite');
    const store = transaction.objectStore('offline_workouts');
    await store.add({
      ...workout,
      timestamp: Date.now(),
      synced: false
    });
  }
  
  async syncPendingData() {
    const transaction = this.db.transaction(['offline_workouts'], 'readonly');
    const store = transaction.objectStore('offline_workouts');
    const pendingWorkouts = await store.getAll();
    
    for (const workout of pendingWorkouts.filter(w => !w.synced)) {
      try {
        await this.syncWorkout(workout);
        await this.markAsSynced(workout.id);
      } catch (error) {
        console.error('Error syncing workout:', error);
      }
    }
  }
  
  private async syncWorkout(workout: any) {
    const { error } = await supabase
      .from('workouts')
      .insert(workout);
    
    if (error) throw error;
  }
  
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FitTrackerOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('offline_workouts')) {
          const store = db.createObjectStore('offline_workouts', {
            keyPath: 'id',
            autoIncrement: true
          });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }
}
```

## 4. Cronograma de Implementación

| Semana | Fase | Entregables | Responsable |
|--------|------|-------------|-------------|
| 1-2 | Configuración | Proyecto base, Supabase setup, estructura de componentes | Dev Lead |
| 3-4 | Autenticación | Login/Register, migración de datos, perfil de usuario | Frontend Dev |
| 5-6 | Dashboard | Métricas, gráficos, visualizaciones de progreso | Frontend Dev |
| 7-8 | Entrenamientos | CRUD entrenamientos, formularios, historial | Full Stack Dev |
| 9-10 | Mediciones | Diagrama 3D, registro de medidas, comparaciones | Frontend Dev |
| 11-12 | PWA/Offline | Service workers, sincronización, optimizaciones | Full Stack Dev |

## 5. Criterios de Éxito

### Funcionales
- ✅ Migración completa de datos existentes
- ✅ Todas las funcionalidades de v1.0 implementadas
- ✅ Nuevas funcionalidades: diagrama 3D, análisis avanzado, PWA
- ✅ Sincronización en tiempo real
- ✅ Funcionalidad offline

### Técnicos
- ✅ Performance: Lighthouse score > 90
- ✅ Accesibilidad: WCAG 2.1 AA compliance
- ✅ SEO: Meta tags, sitemap, structured data
- ✅ Seguridad: Row Level Security, validación de datos
- ✅ Testing: Cobertura > 80%

### UX/UI
- ✅ Diseño responsive en todos los dispositivos
- ✅ Tiempo de carga < 3 segundos
- ✅ Interfaz intuitiva y moderna
- ✅ Feedback visual en todas las acciones

## 6. Plan de Rollout

### Beta Testing (Semana 13)
- Despliegue en entorno de staging
- Testing con 10 usuarios beta
- Recolección de feedback
- Corrección de bugs críticos

### Lanzamiento Gradual (Semana 14)
- Lanzamiento para 25% de usuarios
- Monitoreo de métricas y errores
- Ajustes basados en datos reales

### Lanzamiento Completo (Semana 15)
- Migración completa de todos los usuarios
- Comunicación de nuevas funcionalidades
- Documentación de usuario actualizada
- Plan de soporte post-lanzamiento

## 7. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos en migración | Baja | Alto | Backup completo, testing exhaustivo, rollback plan |
| Performance issues con 3D | Media | Medio | Fallback a 2D, lazy loading, optimización |
| Problemas de sincronización | Media | Alto | Queue system, retry logic, conflict resolution |
| Adopción lenta de usuarios | Alta | Medio | Onboarding mejorado, tutorial interactivo |

Este plan de migración asegura una transición suave y exitosa hacia la nueva plataforma, manteniendo la continuidad del servicio y mejorando significativamente la experiencia del usuario.