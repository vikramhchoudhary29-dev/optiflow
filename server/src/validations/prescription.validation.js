import { z } from "zod";

export const createPrescriptionSchema = z.object({
  customerId: z.coerce.number().int().positive(),

  // Right Eye
  rightSph: z.coerce.number().optional(),
  rightCyl: z.coerce.number().optional(),
  rightAxis: z.coerce.number().int().min(0).max(180).optional(),
  rightAdd: z.coerce.number().optional(),

  // Left Eye
  leftSph: z.coerce.number().optional(),
  leftCyl: z.coerce.number().optional(),
  leftAxis: z.coerce.number().int().min(0).max(180).optional(),
  leftAdd: z.coerce.number().optional(),

  // PD
  pdDistance: z.coerce.number().optional(),
  pdNear: z.coerce.number().optional(),

  // Lens
  lensType: z.string().optional(),
  lens: z.string().optional(),

  // Frame
  frame: z.string().optional(),

  // Contact Lens
  contactLensBrand: z.string().optional(),
  contactLensType: z.string().optional(),

  rightBc: z.coerce.number().optional(),
  rightDia: z.coerce.number().optional(),
  rightPower: z.coerce.number().optional(),

  leftBc: z.coerce.number().optional(),
  leftDia: z.coerce.number().optional(),
  leftPower: z.coerce.number().optional(),

  // Doctor
  doctorName: z.string().optional(),
  doctorNotes: z.string().optional(),

  expiryDate: z.string().optional(),
});