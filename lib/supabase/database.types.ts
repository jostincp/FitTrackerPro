export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          height: number
          birth_date: string
          gender: 'male' | 'female' | 'other'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
          goals: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          height: number
          birth_date: string
          gender: 'male' | 'female' | 'other'
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
          goals: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          height?: number
          birth_date?: string
          gender?: 'male' | 'female' | 'other'
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
          goals?: string[]
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          category: string
          muscle_groups: string[]
          equipment: string | null
          instructions: string[]
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          muscle_groups: string[]
          equipment?: string | null
          instructions: string[]
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          muscle_groups?: string[]
          equipment?: string | null
          instructions?: string[]
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          date: string
          duration: number
          notes: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          date: string
          duration: number
          notes?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          date?: string
          duration?: number
          notes?: string | null
          completed?: boolean
          updated_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          order?: number
        }
      }
      workout_sets: {
        Row: {
          id: string
          workout_exercise_id: string
          reps: number
          weight: number
          rest_time: number
          notes: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workout_exercise_id: string
          reps: number
          weight: number
          rest_time: number
          notes?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workout_exercise_id?: string
          reps?: number
          weight?: number
          rest_time?: number
          notes?: string | null
          completed?: boolean
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: number
          tags: string[]
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration: number
          tags: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          estimated_duration?: number
          tags?: string[]
          is_public?: boolean
          updated_at?: string
        }
      }
      routine_exercises: {
        Row: {
          id: string
          routine_id: string
          exercise_id: string
          sets: number
          reps: number
          weight: number | null
          rest_time: number
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          exercise_id: string
          sets: number
          reps: number
          weight?: number | null
          rest_time: number
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          exercise_id?: string
          sets?: number
          reps?: number
          weight?: number | null
          rest_time?: number
          order?: number
        }
      }
      weight_measurements: {
        Row: {
          id: string
          user_id: string
          weight: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          date?: string
          notes?: string | null
        }
      }
      body_measurements: {
        Row: {
          id: string
          user_id: string
          date: string
          measurements: Json
          body_fat_percentage: number | null
          muscle_mass: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          measurements: Json
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          measurements?: Json
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          notes?: string | null
        }
      }
      progress_photos: {
        Row: {
          id: string
          user_id: string
          url: string
          date: string
          type: 'front' | 'side' | 'back'
          weight: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          date: string
          type: 'front' | 'side' | 'back'
          weight?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          date?: string
          type?: 'front' | 'side' | 'back'
          weight?: number | null
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}