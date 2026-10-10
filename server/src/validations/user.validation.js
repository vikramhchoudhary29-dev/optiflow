import { z } from "zod";
export const permissionModules=["dashboard","customers","prescriptions","categories","products","suppliers","purchases","sales","payments","expenses","reports","marketing","settings","crm"];
const permission=z.object({module:z.enum(permissionModules),canView:z.boolean().default(false),canCreate:z.boolean().default(false),canEdit:z.boolean().default(false),canDelete:z.boolean().default(false)});
export const createUserSchema=z.object({name:z.string().trim().min(2).max(150),loginId:z.string().trim().min(2).max(100),mobile:z.string().trim().min(7).max(20),email:z.string().trim().email().nullable().optional(),password:z.string().min(8).max(100),permissions:z.array(permission).default([])});
export const updateUserSchema=z.object({name:z.string().trim().min(2).max(150).optional(),loginId:z.string().trim().min(2).max(100).optional(),mobile:z.string().trim().min(7).max(20).optional(),email:z.string().trim().email().nullable().optional()}).refine((data)=>Object.keys(data).length,"At least one field is required");
export const permissionsSchema=z.object({permissions:z.array(permission)});
export const userStatusSchema=z.object({status:z.boolean()});
export const userPasswordSchema=z.object({password:z.string().min(8).max(100)});
