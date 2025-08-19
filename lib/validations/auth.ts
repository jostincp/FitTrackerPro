import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor, ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor, ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Por favor, ingresa un email válido'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Weight measurement validation schema
export const weightMeasurementSchema = z.object({
  weight: z.string().min(1, 'El peso es obligatorio')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 500;
    }, 'El peso debe ser un número válido entre 1 y 500 kg'),
  notes: z.string().optional(),
});

export type WeightMeasurementFormData = z.infer<typeof weightMeasurementSchema>;

// Progress photo validation schema
export const progressPhotoSchema = z.object({
  photo_type: z.enum(['front', 'side', 'back', 'custom'], {
    message: 'Por favor selecciona el tipo de foto',
  }),
  photo_date: z.string().min(1, 'La fecha es obligatoria'),
  notes: z.string().optional(),
});

export type ProgressPhotoFormData = z.infer<typeof progressPhotoSchema>;