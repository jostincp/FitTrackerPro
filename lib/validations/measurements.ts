import { z } from 'zod';

// Body measurements validation
export const bodyMeasurementsSchema = z.object({
  weight: z
    .number()
    .min(30, 'El peso debe ser al menos 30 kg')
    .max(300, 'El peso no puede exceder 300 kg')
    .optional(),
  height: z
    .number()
    .min(100, 'La altura debe ser al menos 100 cm')
    .max(250, 'La altura no puede exceder 250 cm')
    .optional(),
  chest: z
    .number()
    .min(50, 'La medida del pecho debe ser al menos 50 cm')
    .max(200, 'La medida del pecho no puede exceder 200 cm')
    .optional(),
  waist: z
    .number()
    .min(40, 'La medida de la cintura debe ser al menos 40 cm')
    .max(200, 'La medida de la cintura no puede exceder 200 cm')
    .optional(),
  hips: z
    .number()
    .min(50, 'La medida de las caderas debe ser al menos 50 cm')
    .max(200, 'La medida de las caderas no puede exceder 200 cm')
    .optional(),
  leftArm: z
    .number()
    .min(15, 'La medida del brazo debe ser al menos 15 cm')
    .max(60, 'La medida del brazo no puede exceder 60 cm')
    .optional(),
  rightArm: z
    .number()
    .min(15, 'La medida del brazo debe ser al menos 15 cm')
    .max(60, 'La medida del brazo no puede exceder 60 cm')
    .optional(),
  leftThigh: z
    .number()
    .min(30, 'La medida del muslo debe ser al menos 30 cm')
    .max(100, 'La medida del muslo no puede exceder 100 cm')
    .optional(),
  rightThigh: z
    .number()
    .min(30, 'La medida del muslo debe ser al menos 30 cm')
    .max(100, 'La medida del muslo no puede exceder 100 cm')
    .optional(),
  neck: z
    .number()
    .min(25, 'La medida del cuello debe ser al menos 25 cm')
    .max(60, 'La medida del cuello no puede exceder 60 cm')
    .optional(),
  bodyFat: z
    .number()
    .min(3, 'El porcentaje de grasa corporal debe ser al menos 3%')
    .max(50, 'El porcentaje de grasa corporal no puede exceder 50%')
    .optional(),
  muscleMass: z
    .number()
    .min(20, 'La masa muscular debe ser al menos 20 kg')
    .max(150, 'La masa muscular no puede exceder 150 kg')
    .optional(),
  measurementDate: z
    .string()
    .min(1, 'La fecha de medición es requerida')
    .refine((date) => {
      const measurementDate = new Date(date);
      const today = new Date();
      return measurementDate <= today;
    }, 'La fecha de medición no puede ser futura'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
}).refine(
  (data) => {
    // At least one measurement must be provided
    const measurements = [
      data.weight,
      data.height,
      data.chest,
      data.waist,
      data.hips,
      data.leftArm,
      data.rightArm,
      data.leftThigh,
      data.rightThigh,
      data.neck,
      data.bodyFat,
      data.muscleMass,
    ];
    return measurements.some((measurement) => measurement !== undefined);
  },
  {
    message: 'Debe proporcionar al menos una medida corporal',
    path: ['weight'], // Show error on weight field
  }
);

// Weight entry validation (simplified for weight tracking page)
export const weightEntrySchema = z.object({
  weight: z
    .number()
    .min(30, 'El peso debe ser al menos 30 kg')
    .max(300, 'El peso no puede exceder 300 kg'),
  bodyFat: z
    .number()
    .min(3, 'El porcentaje de grasa corporal debe ser al menos 3%')
    .max(50, 'El porcentaje de grasa corporal no puede exceder 50%')
    .optional(),
  entryDate: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date) => {
      const entryDate = new Date(date);
      const today = new Date();
      return entryDate <= today;
    }, 'La fecha no puede ser futura'),
  notes: z
    .string()
    .max(200, 'Las notas no pueden exceder 200 caracteres')
    .optional(),
});

// Type exports
export type BodyMeasurementsFormData = z.infer<typeof bodyMeasurementsSchema>;
export type WeightEntryFormData = z.infer<typeof weightEntrySchema>;