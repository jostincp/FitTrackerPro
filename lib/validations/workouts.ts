import { z } from 'zod';

// Workout validation
export const workoutSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del entrenamiento es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  notes: z
    .string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  workoutDate: z
    .string()
    .min(1, 'La fecha del entrenamiento es requerida')
    .refine((date) => {
      const workoutDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      return workoutDate >= oneYearAgo && workoutDate <= today;
    }, 'La fecha debe estar entre hace un año y hoy'),
  durationMinutes: z
    .number()
    .min(1, 'La duración debe ser al menos 1 minuto')
    .max(480, 'La duración no puede exceder 8 horas')
    .optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'skipped']).default('planned'),
});

// Exercise set validation
export const exerciseSetSchema = z.object({
  weight: z
    .number()
    .min(0, 'El peso no puede ser negativo')
    .max(1000, 'El peso no puede exceder 1000 kg')
    .optional(),
  reps: z
    .number()
    .int('Las repeticiones deben ser un número entero')
    .min(1, 'Debe realizar al menos 1 repetición')
    .max(1000, 'Las repeticiones no pueden exceder 1000'),
  rpe: z
    .number()
    .int('El RPE debe ser un número entero')
    .min(1, 'El RPE debe ser al menos 1')
    .max(10, 'El RPE no puede exceder 10')
    .optional(),
  restSeconds: z
    .number()
    .int('El descanso debe ser un número entero')
    .min(0, 'El descanso no puede ser negativo')
    .max(3600, 'El descanso no puede exceder 1 hora')
    .optional(),
  notes: z
    .string()
    .max(200, 'Las notas no pueden exceder 200 caracteres')
    .optional(),
});

// Workout exercise validation
export const workoutExerciseSchema = z.object({
  exerciseId: z.string().uuid('ID de ejercicio inválido'),
  orderIndex: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),
  sets: z
    .array(exerciseSetSchema)
    .min(1, 'Debe agregar al menos una serie')
    .max(20, 'No puede exceder 20 series por ejercicio'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

// Complete workout with exercises validation
export const completeWorkoutSchema = workoutSchema.extend({
  exercises: z
    .array(workoutExerciseSchema)
    .min(1, 'Debe agregar al menos un ejercicio')
    .max(50, 'No puede exceder 50 ejercicios por entrenamiento'),
});

// Routine validation
export const routineSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la rutina es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  weeklySchedule: z
    .record(
      z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      z.boolean()
    )
    .refine(
      (schedule) => Object.values(schedule).some((day) => day === true),
      'Debe seleccionar al menos un día de la semana'
    ),
  isActive: z.boolean().default(false),
});

// Routine exercise validation
export const routineExerciseSchema = z.object({
  exerciseId: z.string().uuid('ID de ejercicio inválido'),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  orderIndex: z
    .number()
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),
  targetSets: z
    .number()
    .int('Las series objetivo deben ser un número entero')
    .min(1, 'Debe tener al menos 1 serie')
    .max(20, 'No puede exceder 20 series'),
  targetRepsMin: z
    .number()
    .int('Las repeticiones mínimas deben ser un número entero')
    .min(1, 'Debe tener al menos 1 repetición'),
  targetRepsMax: z
    .number()
    .int('Las repeticiones máximas deben ser un número entero')
    .min(1, 'Debe tener al menos 1 repetición'),
  targetWeight: z
    .number()
    .min(0, 'El peso objetivo no puede ser negativo')
    .max(1000, 'El peso objetivo no puede exceder 1000 kg')
    .optional(),
}).refine(
  (data) => data.targetRepsMax >= data.targetRepsMin,
  {
    message: 'Las repeticiones máximas deben ser mayor o igual a las mínimas',
    path: ['targetRepsMax'],
  }
);

// Complete routine with exercises validation
export const completeRoutineSchema = routineSchema.extend({
  exercises: z
    .array(routineExerciseSchema)
    .min(1, 'Debe agregar al menos un ejercicio')
    .max(100, 'No puede exceder 100 ejercicios por rutina'),
});

// Type exports
export type WorkoutFormData = z.infer<typeof workoutSchema>;
export type ExerciseSetFormData = z.infer<typeof exerciseSetSchema>;
export type WorkoutExerciseFormData = z.infer<typeof workoutExerciseSchema>;
export type CompleteWorkoutFormData = z.infer<typeof completeWorkoutSchema>;
export type RoutineFormData = z.infer<typeof routineSchema>;
export type RoutineExerciseFormData = z.infer<typeof routineExerciseSchema>;
export type CompleteRoutineFormData = z.infer<typeof completeRoutineSchema>;