# Arquitectura Técnica - FitTracker Pro v2.0

## 1. Diseño de Arquitectura

```mermaid
graph TD
    A[Usuario - Navegador] --> B[React 18 + Next.js 14/15]
    B --> C[Supabase Client SDK]
    C --> D[Supabase Backend Platform]
    
    B --> E[PWA Service Workers]
    B --> F[IndexedDB - Offline Storage]
    B --> G[Chart.js - Visualizaciones]
    B --> H[SVG Interactivo - Cuerpo Humano]
    
    D --> I[PostgreSQL Database]
    D --> J[Supabase Auth JWT]
    D --> K[Supabase Storage]
    D --> L[Supabase Edge Functions]
    D --> M[Supabase Realtime]
    
    N[APIs Wearables] --> O[Edge Functions]
    O --> D
    
    P[Netlify CDN] --> B
    
    subgraph "Frontend Layer - Netlify"
        B
        E
        F
        G
        H
    end
    
    subgraph "Backend as a Service - Supabase"
        D
        I
        J
        K
        L
        M
        O
    end
    
    subgraph "External Integrations"
        N
        Q[Fitbit API]
        R[Garmin API]
        S[Apple Health]
        T[Google Fit]
    end
    
    N --> O
    Q --> O
    R --> O
    S --> O
    T --> O
```

## 2. Descripción de Tecnologías

**Frontend:**
- React@18 + Next.js@14/15 + TypeScript@5
- Tailwind CSS@3 para diseño responsivo
- PWA con Service Workers para funcionalidad offline
- Chart.js@4 para visualizaciones de datos
- SVG interactivo para diagrama del cuerpo humano
- Zod@3 para validación de formularios
- React Query (TanStack Query)@4 para sincronización de datos

**Backend:**
- Supabase (PostgreSQL + Auth JWT + Storage + Realtime + Edge Functions)
- Row Level Security (RLS) para seguridad de datos
- APIs REST automáticas generadas por Supabase

**Deployment:**
- Netlify (Frontend + PWA + CI/CD automático)
- Supabase Cloud (Backend services)
- CDN global para assets estáticos

**Integraciones Futuras:**
- APIs de Wearables: Fitbit, Garmin, Apple Health, Google Fit
- D3.js para visualizaciones avanzadas
- Lighthouse/Web Vitals para monitoreo de rendimiento

## 3. Definiciones de Rutas

| Ruta             | Propósito                                    |
| ---------------- | -------------------------------------------- |
| /                | Dashboard principal con métricas y resumen   |
| /auth/login      | Página de autenticación con Supabase Auth    |
| /auth/register   | Registro de nuevos usuarios                  |
| /workouts        | Registro y gestión de entrenamientos         |
| /workouts/\[id]  | Detalle de entrenamiento específico          |
| /routines        | Creación y gestión de rutinas personalizadas |
| /routines/create | Creador de rutinas con drag & drop           |
| /measurements    | Medición corporal con diagrama interactivo   |
| /weight          | Seguimiento de peso corporal y gráficos      |
| /progress        | Galería de fotos de progreso                 |
| /analytics       | Dashboard analítico y reportes               |
| /settings        | Configuración de usuario y preferencias      |
| /profile         | Perfil de usuario y gestión de cuenta        |

## 4. Definiciones de API

### 4.1 APIs Core de Supabase

**Autenticación de Usuario**

```typescript
// Supabase Auth API
POST /auth/v1/signup
POST /auth/v1/token
POST /auth/v1/logout
```

Request (Registro):

| Parámetro | Tipo   | Requerido | Descripción                       |
| --------- | ------ | --------- | --------------------------------- |
| email     | string | true      | Email del usuario                 |
| password  | string | true      | Contraseña (mín. 8 caracteres)    |
| data      | object | false     | Metadatos adicionales del usuario |

Response:

| Parámetro | Tipo    | Descripción                |
| --------- | ------- | -------------------------- |
| user      | User    | Objeto usuario de Supabase |
| session   | Session | Sesión con JWT tokens      |

**Gestión de Entrenamientos**

```typescript
// Supabase Database API via SDK
supabase.from('workouts').select('*')
supabase.from('workouts').insert(workout)
supabase.from('workouts').update(workout).eq('id', id)
```

**Subida de Fotos de Progreso**

```typescript
// Supabase Storage API
supabase.storage.from('progress-photos').upload(path, file)
supabase.storage.from('progress-photos').getPublicUrl(path)
```

### 4.2 Edge Functions Personalizadas

**Análisis de Progreso con IA**

```
POST /functions/v1/analyze-progress
```

Request:

| Parámetro | Tipo   | Requerido | Descripción                           |
| --------- | ------ | --------- | ------------------------------------- |
| user\_id  | uuid   | true      | ID del usuario                        |
| period    | string | true      | Período de análisis (week/month/year) |
| metrics   | array  | false     | Métricas específicas a analizar       |

Response:

| Parámetro       | Tipo   | Descripción                    |
| --------------- | ------ | ------------------------------ |
| progress\_score | number | Puntuación de progreso (0-100) |
| trends          | object | Tendencias por categoría       |
| recommendations | array  | Recomendaciones personalizadas |
| ai\_insights    | object | Análisis con inteligencia artificial |

**Sincronización con Wearables**

```
POST /functions/v1/sync-wearable
```

Request:

| Parámetro | Tipo   | Requerido | Descripción                    |
| --------- | ------ | --------- | ------------------------------ |
| user\_id  | uuid   | true      | ID del usuario                 |
| provider  | string | true      | Proveedor (fitbit/garmin/apple/google) |
| auth\_token | string | true    | Token de autorización del wearable |

Response:

| Parámetro     | Tipo    | Descripción                    |
| ------------- | ------- | ------------------------------ |
| synced\_data  | object  | Datos sincronizados            |
| last\_sync    | timestamp | Última sincronización        |

**Exportación de Datos**

```
POST /functions/v1/export-data
```

Request:

| Parámetro   | Tipo   | Requerido | Descripción                           |
| ----------- | ------ | --------- | ------------------------------------- |
| user\_id    | uuid   | true      | ID del usuario                        |
| format      | string | true      | Formato de exportación (csv/pdf/json) |
| date\_range | object | false     | Rango de fechas                       |
| include\_photos | boolean | false | Incluir fotos de progreso          |

Response:

| Parámetro     | Tipo      | Descripción                    |
| ------------- | --------- | ------------------------------ |
| download\_url | string    | URL temporal de descarga       |
| expires\_at   | timestamp | Fecha de expiración del enlace |
| file\_size    | number    | Tamaño del archivo en bytes    |

## 5. Arquitectura del Servidor

```mermaid
graph TD
    A[Next.js App Router - Netlify] --> B[API Routes]
    A --> C[Server Components]
    A --> D[Client Components]
    
    B --> E[Supabase Server Client]
    C --> E
    D --> F[Supabase Browser Client]
    
    E --> G[Row Level Security]
    F --> G
    
    G --> H[PostgreSQL Database]
    
    I[Supabase Edge Functions] --> E
    J[Supabase Auth JWT] --> G
    K[Supabase Storage] --> L[Netlify CDN]
    
    M[PWA Service Worker] --> D
    N[IndexedDB Cache] --> D
    O[React Query Cache] --> F
    
    P[Wearable APIs] --> I
    Q[Chart.js] --> D
    R[SVG Body Diagram] --> D
    
    subgraph "Netlify Platform"
        A
        B
        C
        L
        M
    end
    
    subgraph "Client Browser"
        D
        F
        N
        O
        Q
        R
    end
    
    subgraph "Supabase Platform"
        E
        G
        H
        I
        J
        K
    end
    
    subgraph "External APIs"
        P
    end
```

## 6. Modelo de Datos

### 6.1 Definición del Modelo de Datos

```mermaid
erDiagram
    USERS ||--o{ WORKOUTS : creates
    USERS ||--o{ ROUTINES : designs
    USERS ||--o{ BODY_MEASUREMENTS : records
    USERS ||--o{ WEIGHT_ENTRIES : logs
    USERS ||--o{ PROGRESS_PHOTOS : uploads
    USERS ||--o{ WEARABLE_CONNECTIONS : connects
    USERS ||--o{ WEARABLE_DATA : syncs
    USERS ||--o{ AI_INSIGHTS : generates
    
    WORKOUTS ||--|{ WORKOUT_EXERCISES : contains
    ROUTINES ||--|{ ROUTINE_EXERCISES : includes
    WORKOUT_EXERCISES ||--o{ EXERCISE_SETS : has
    
    EXERCISES ||--o{ WORKOUT_EXERCISES : used_in
    EXERCISES ||--o{ ROUTINE_EXERCISES : planned_in
    MUSCLE_GROUPS ||--o{ EXERCISES : targets
    
    WEARABLE_CONNECTIONS ||--o{ WEARABLE_DATA : produces
    
    USERS {
        uuid id PK
        string email UK
        string full_name
        date birth_date
        enum gender
        float height_cm
        enum fitness_level
        jsonb preferences
        timestamp created_at
        timestamp updated_at
    }
    
    WORKOUTS {
        uuid id PK
        uuid user_id FK
        string name
        text notes
        integer duration_minutes
        date workout_date
        enum status
        timestamp created_at
    }
    
    EXERCISES {
        uuid id PK
        string name UK
        text description
        enum category
        uuid primary_muscle_group_id FK
        uuid[] secondary_muscle_groups
        string[] equipment_needed
        text instructions
        string gif_url
    }
    
    WORKOUT_EXERCISES {
        uuid id PK
        uuid workout_id FK
        uuid exercise_id FK
        integer order_index
        text notes
    }
    
    EXERCISE_SETS {
        uuid id PK
        uuid workout_exercise_id FK
        integer set_number
        float weight_kg
        integer reps
        integer rpe
        integer rest_seconds
        timestamp completed_at
    }
    
    ROUTINES {
        uuid id PK
        uuid user_id FK
        string name
        text description
        jsonb weekly_schedule
        boolean is_active
        timestamp created_at
    }
    
    ROUTINE_EXERCISES {
        uuid id PK
        uuid routine_id FK
        uuid exercise_id FK
        enum day_of_week
        integer order_index
        integer target_sets
        integer target_reps_min
        integer target_reps_max
        float target_weight_kg
    }
    
    BODY_MEASUREMENTS {
        uuid id PK
        uuid user_id FK
        float chest_cm
        float waist_cm
        float hips_cm
        float left_arm_cm
        float right_arm_cm
        float left_thigh_cm
        float right_thigh_cm
        float neck_cm
        date measurement_date
        timestamp created_at
    }
    
    WEIGHT_ENTRIES {
        uuid id PK
        uuid user_id FK
        float weight_kg
        float body_fat_percentage
        date entry_date
        timestamp created_at
    }
    
    PROGRESS_PHOTOS {
        uuid id PK
        uuid user_id FK
        string file_path
        enum photo_type
        date photo_date
        text notes
        timestamp created_at
    }
    
    MUSCLE_GROUPS {
        uuid id PK
        string name UK
        string display_name
        string color_hex
        jsonb body_diagram_coordinates
    }
    
    WEARABLE_CONNECTIONS {
        uuid id PK
        uuid user_id FK
        enum provider
        string access_token
        string refresh_token
        timestamp token_expires_at
        boolean is_active
        timestamp last_sync
        timestamp created_at
    }
    
    WEARABLE_DATA {
        uuid id PK
        uuid user_id FK
        uuid connection_id FK
        enum data_type
        jsonb data_payload
        date data_date
        timestamp synced_at
        timestamp created_at
    }
    
    AI_INSIGHTS {
        uuid id PK
        uuid user_id FK
        enum insight_type
        jsonb analysis_data
        text recommendations
        float confidence_score
        date analysis_period_start
        date analysis_period_end
        timestamp created_at
    }
```

### 6.2 Lenguaje de Definición de Datos (DDL)

**Tabla de Usuarios**

```sql
-- Crear tabla de usuarios (extendiendo auth.users de Supabase)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    height_cm DECIMAL(5,2),
    fitness_level VARCHAR(20) DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permisos
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
```

**Tabla de Entrenamientos**

```sql
CREATE TABLE public.workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    notes TEXT,
    duration_minutes INTEGER,
    workout_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workouts" ON public.workouts
    FOR ALL USING (auth.uid() = user_id);

GRANT ALL PRIVILEGES ON public.workouts TO authenticated;
GRANT SELECT ON public.workouts TO anon;

**Tabla de Conexiones de Wearables**

```sql
CREATE TABLE public.wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('fitbit', 'garmin', 'apple_health', 'google_fit')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- RLS para wearable_connections
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wearable connections" ON public.wearable_connections
    FOR ALL USING (auth.uid() = user_id);

GRANT ALL PRIVILEGES ON public.wearable_connections TO authenticated;

**Tabla de Datos de Wearables**

```sql
CREATE TABLE public.wearable_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES public.wearable_connections(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('steps', 'heart_rate', 'calories', 'sleep', 'activity', 'weight')),
    data_payload JSONB NOT NULL,
    data_date DATE NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, connection_id, data_type, data_date)
);

-- Índices para wearable_data
CREATE INDEX idx_wearable_data_user_date ON public.wearable_data(user_id, data_date DESC);
CREATE INDEX idx_wearable_data_type ON public.wearable_data(data_type, data_date DESC);

-- RLS para wearable_data
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable data" ON public.wearable_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert wearable data" ON public.wearable_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.wearable_data TO authenticated;

**Tabla de Insights de IA**

```sql
CREATE TABLE public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('progress_analysis', 'workout_recommendation', 'nutrition_advice', 'recovery_suggestion')),
    analysis_data JSONB NOT NULL,
    recommendations TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ai_insights
CREATE INDEX idx_ai_insights_user_type ON public.ai_insights(user_id, insight_type, created_at DESC);
CREATE INDEX idx_ai_insights_confidence ON public.ai_insights(confidence_score DESC);

-- RLS para ai_insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI insights" ON public.ai_insights
    FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON public.ai_insights TO authenticated;
GRANT INSERT ON public.ai_insights TO service_role; -- Solo para Edge Functions
    name VARCHAR(100) NOT NULL,
    notes TEXT,
    duration_minutes INTEGER,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_date ON public.workouts(workout_date DESC);
CREATE INDEX idx_workouts_status ON public.workouts(status);

-- RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workouts" ON public.workouts
    USING (auth.uid() = user_id);

-- Permisos
GRANT ALL PRIVILEGES ON public.workouts TO authenticated;
```

**Tabla de Ejercicios (Datos Maestros)**

```sql
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    primary_muscle_group_id UUID REFERENCES public.muscle_groups(id),
    secondary_muscle_groups UUID[],
    equipment_needed TEXT[],
    instructions TEXT,
    gif_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_muscle_group ON public.exercises(primary_muscle_group_id);

-- Permisos (solo lectura para usuarios)
GRANT SELECT ON public.exercises TO authenticated;
GRANT SELECT ON public.exercises TO anon;
```

**Tabla de Series de Ejercicios**

```sql
CREATE TABLE public.exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight_kg DECIMAL(6,2),
    reps INTEGER,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    rest_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_exercise_sets_workout_exercise ON public.exercise_sets(workout_exercise_id);
CREATE INDEX idx_exercise_sets_completed ON public.exercise_sets(completed_at DESC);

-- RLS
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exercise sets" ON public.exercise_sets
    USING (auth.uid() = (SELECT w.user_id FROM public.workouts w 
                        JOIN public.workout_exercises we ON w.id = we.workout_id 
                        WHERE we.id = workout_exercise_id));

-- Permisos
GRANT ALL PRIVILEGES ON public.exercise_sets TO authenticated;
```

**Tabla de Medidas Corporales**

```sql
CREATE TABLE public.body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    left_arm_cm DECIMAL(5,2),
    right_arm_cm DECIMAL(5,2),
    left_thigh_cm DECIMAL(5,2),
    right_thigh_cm DECIMAL(5,2),
    neck_cm DECIMAL(5,2),
    measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, measurement_date DESC);

-- RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own measurements" ON public.body_measurements
    USING (auth.uid() = user_id);

-- Permisos
GRANT ALL PRIVILEGES ON public.body_measurements TO authenticated;
```

**Datos Iniciales**

```sql
-- Insertar grupos musculares
INSERT INTO public.muscle_groups (name, display_name, color_hex, body_diagram_coordinates) VALUES
('chest', 'Pecho', '#FF6B6B', '{"x": 150, "y": 120, "width": 80, "height": 60}'),
('back', 'Espalda', '#4ECDC4', '{"x": 150, "y": 120, "width": 80, "height": 100}'),
('shoulders', 'Hombros', '#45B7D1', '{"x": 120, "y": 100, "width": 140, "height": 40}'),
('arms', 'Brazos', '#96CEB4', '{"x": 80, "y": 140, "width": 40, "height": 80}'),
('core', 'Core', '#FFEAA7', '{"x": 140, "y": 180, "width": 100, "height": 60}'),
('legs', 'Piernas', '#DDA0DD', '{"x": 130, "y": 280, "width": 120, "height": 160}');

-- Insertar ejercicios básicos
INSERT INTO public.exercises (name, description, category, primary_muscle_group_id, equipment_needed, instructions) VALUES
('Press de Banca', 'Ejercicio fundamental para el desarrollo del pecho', 'strength', 
 (SELECT id FROM public.muscle_groups WHERE name = 'chest'), 
 ARRAY['barbell', 'bench'], 
 'Acuéstate en el banco, agarra la barra con las manos separadas al ancho de los hombros, baja controladamente hasta el pecho y empuja hacia arriba.'),
('Sentadillas', 'Ejercicio compuesto para piernas y glúteos', 'strength',
 (SELECT id FROM public.muscle_groups WHERE name = 'legs'),
 ARRAY['barbell', 'squat_rack'],
 'Coloca la barra sobre los hombros, separa los pies al ancho de los hombros, baja como si te fueras a sentar y vuelve a la posición inicial.');
```

