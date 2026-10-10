import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL || "admin@optiflow.local";
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return console.log("Platform Admin already exists.");
  if (!password || password.length < 12) throw new Error("PLATFORM_ADMIN_PASSWORD (minimum 12 characters) is required to seed a new admin.");
  await prisma.admin.create({ data: {
    name: process.env.PLATFORM_ADMIN_NAME || "Platform Admin",
    email,
    password: await bcrypt.hash(password, 12),
  }});
  console.log("Platform Admin created successfully.");
}
main().catch((error)=>{console.error(error);process.exitCode=1}).finally(()=>prisma.$disconnect());
