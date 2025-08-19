// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  height: number; // cm
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: string[];
  created_at: string;
  updated_at: string;
}

// Workout Types
export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment?: string;
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  exercise_id: string;
  reps: number;
  weight: number; // kg
  rest_time: number; // seconds
  notes?: string;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  order: number;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  date: string;
  duration: number; // minutes
  exercises: WorkoutExercise[];
  notes?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Routine Types
export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  rest_time: number;
  order: number;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // minutes
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Measurement Types
export interface WeightMeasurement {
  id: string;
  user_id: string;
  weight: number; // kg
  date: string;
  notes?: string;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  measurements: {
    chest?: number; // cm
    waist?: number; // cm
    hips?: number; // cm
    bicep_left?: number; // cm
    bicep_right?: number; // cm
    thigh_left?: number; // cm
    thigh_right?: number; // cm
    neck?: number; // cm
  };
  body_fat_percentage?: number;
  muscle_mass?: number; // kg
  notes?: string;
  created_at: string;
}

// Progress Photo Types
export interface ProgressPhoto {
  id: string;
  user_id: string;
  url: string;
  date: string;
  type: 'front' | 'side' | 'back';
  weight?: number;
  notes?: string;
  created_at: string;
}

// Analytics Types
export interface WorkoutStats {
  total_workouts: number;
  total_duration: number; // minutes
  average_duration: number; // minutes
  total_weight_lifted: number; // kg
  favorite_exercises: string[];
  workout_frequency: number; // workouts per week
}

export interface ProgressStats {
  weight_change: number; // kg
  weight_change_percentage: number;
  muscle_gain: number; // kg
  fat_loss: number; // kg
  strength_improvement: number; // percentage
  consistency_score: number; // 0-100
}

export interface PeriodStats {
  period: 'week' | 'month' | 'quarter' | 'year';
  workout_stats: WorkoutStats;
  progress_stats: ProgressStats;
  start_date: string;
  end_date: string;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  success: boolean;
}

// Form Types
export interface WorkoutFormData {
  name: string;
  date: string;
  exercises: {
    exercise_id: string;
    sets: {
      reps: number;
      weight: number;
      rest_time: number;
    }[];
  }[];
  notes?: string;
}

export interface RoutineFormData {
  name: string;
  description?: string;
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number;
    weight?: number;
    rest_time: number;
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  is_public: boolean;
}

export interface MeasurementFormData {
  weight?: number;
  body_measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    bicep_left?: number;
    bicep_right?: number;
    thigh_left?: number;
    thigh_right?: number;
    neck?: number;
  };
  body_fat_percentage?: number;
  muscle_mass?: number;
  date: string;
  notes?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  categories: string[];
  difficulty: string[];
  tags: string[];
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
  children?: NavItem[];
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

// PWA Types
export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  outcome: 'accepted' | 'dismissed';
}

// All types are already exported with their interface declarations above