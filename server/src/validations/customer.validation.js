import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(100),

  mobile: z.string().min(10).max(15),

  email: z.string().email().optional().or(z.literal("")),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),

  dob: z.string().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  state: z.string().optional(),

  pincode: z.string().optional(),

  remarks: z.string().optional(),
});