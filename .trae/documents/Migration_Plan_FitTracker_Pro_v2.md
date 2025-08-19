# Plan de Migración - FitTracker Pro v1.0 → v2.0

## 1. Resumen Ejecutivo

### Situación Actual
- **Tecnología:** Vanilla JavaScript, HTML5, CSS3
- **Almacenamiento:** LocalStorage del navegador
- **Funcionalidades:** Dashboard básico, registro de entrenamientos, rutinas, mediciones, peso, fotos
- **Limitaciones:** Sin sincronización, sin backup, funcionalidad offline limitada

### Objetivo de Migración
- **Nueva Tecnología:** React 18 + Next.js 14/15 + TypeScript + Supabase
- **Mejoras:** Sincronización en la nube, PWA, análisis avanzado, UI moderna
- **Cronograma:** 12 semanas de desarrollo
- **Estrategia:** Migración incremental con coexistencia temporal

## 2. Análisis de Datos Existentes

### 2.1 Estructura de Datos Actual (LocalStorage)

```javascript
// Estructura actual en localStorage
const currentDataStructure = {
  // Datos de usuario
  userProfile: {
    name: string,
    age: number,
    weight: number,
    height: number
  },
  
  // Entrenamientos
  workouts: [{
    id: string,
    date: string,
    exercises: [{
      name: string,
      sets: [{
        weight: number,
        reps: number,
        rest: number
      }]
    }]
  }],
  
  // Rutinas
  routines: [{
    id: string,
    name: string,
    exercises: [{
      name: string,
      sets: number,
      reps: string,
      weight: number
    }]
  }],
  
  // Mediciones corporales
  measurements: [{
    date: string,
    chest: number,
    waist: number,
    arms: number,
    legs: number
  }],
  
  // Registro de peso
  weightHistory: [{
    date: string,
    weight: number
  }],
  
  // Fotos de progreso
  progressPhotos: [{
    id: string,
    date: string,
    dataUrl: string, // Base64
    type: string
  }]
};
```

### 2.2 Script de Migración de Datos

```typescript
// utils/dataMigration.ts
export interface LegacyData {
  userProfile: any;
  workouts: any[];
  routines: any[];
  measurements: any[];
  weightHistory: any[];
  progressPhotos: any[];
}

export class DataMigrationService {
  private supabase: SupabaseClient;
  
  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }
  
  async migrateLegacyData(legacyData: LegacyData, userId: string) {
    try {
      // 1. Migrar perfil de usuario
      await this.migrateUserProfile(legacyData.userProfile, userId);
      
      // 2. Migrar entrenamientos
      await this.migrateWorkouts(legacyData.workouts, userId);
      
      // 3. Migrar rutinas
      await this.migrateRoutines(legacyData.routines, userId);
      
      // 4. Migrar mediciones
      await this.migrateMeasurements(legacyData.measurements, userId);
      
      // 5. Migrar historial de peso
      await this.migrateWeightHistory(legacyData.weightHistory, userId);
      
      // 6. Migrar fotos (convertir base64 a archivos)
      await this.migrateProgressPhotos(legacyData.progressPhotos, userId);
      
      return { success: true, message: 'Migración completada exitosamente' };
    } catch (error) {
      console.error('Error en migración:', error);
      return { success: false, error: error.message };
    }
  }
  
  private async migrateUserProfile(profile: any, userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name: profile.name,
        height_cm: profile.height,
        // Mapear otros campos según sea necesario
      });
    
    if (error) throw error;
    return data;
  }
  
  private async migrateWorkouts(workouts: any[], userId: string) {
    for (const workout of workouts) {
      // Crear entrenamiento
      const { data: workoutData, error: workoutError } = await this.supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: `Entrenamiento ${new Date(workout.date).toLocaleDateString()}`,
          workout_date: workout.date,
          status: 'completed'
        })
        .select()
        .single();
      
      if (workoutError) throw workoutError;
      
      // Migrar ejercicios del entrenamiento
      for (const exercise of workout.exercises) {
        await this.migrateWorkoutExercise(exercise, workoutData.id);
      }
    }
  }
  
  private async migrateProgressPhotos(photos: any[], userId: string) {
    for (const photo of photos) {
      // Convertir base64 a blob
      const blob = this.base64ToBlob(photo.dataUrl);
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
          photo_type: photo.type || 'front',
          photo_date: photo.date
        });
      
      if (dbError) throw dbError;
    }
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