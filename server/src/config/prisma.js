import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const prisma = globalForPrisma.__optiflowPrisma || new PrismaClient({
  transactionOptions: {
    maxWait: 10000,
    timeout: 30000,
  },
});
if (process.env.NODE_ENV !== "production") globalForPrisma.__optiflowPrisma = prisma;

export default prisma;
