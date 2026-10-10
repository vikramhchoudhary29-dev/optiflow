import { z } from "zod";
export const shopLoginSchema=z.object({identifier:z.string().trim().min(2).max(150),password:z.string().min(8).max(100)});
