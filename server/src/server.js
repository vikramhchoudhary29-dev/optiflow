import dotenv from "dotenv";
dotenv.config();
import prisma from "./config/prisma.js";
import app from "./app.js";

const PORT = Number(process.env.PORT || 5000);
const server = app.listen(PORT, () => console.log(`OptiFlow API listening on port ${PORT}`));

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
