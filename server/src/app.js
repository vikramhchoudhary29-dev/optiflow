import path from "path";
import "dotenv/config";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";

import platformRoutes from "./routes/platform.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import frameRoutes from "./routes/frame.routes.js";
import lensRoutes from "./routes/lens.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import supplierPaymentRoutes from "./routes/supplier-payment.routes.js";
import userRoutes from "./routes/user.routes.js";
import excelImportRoutes from "./routes/excel-import.routes.js";
import marketingRoutes from "./routes/marketing.routes.js";
import loyaltyRoutes from "./routes/loyalty.routes.js";
import crmRoutes from "./routes/crm.routes.js";

import dashboardRoutes from "./routes/dashboard/dashboard.routes.js";
import reportsRoutes from "./routes/reports/reports.routes.js";
import settingsRoutes from "./routes/settings/settings.routes.js";
import uploadRoutes from "./routes/upload/upload.routes.js";

import errorMiddleware from "./middlewares/error.middleware.js";

import pdfRoutes from "./routes/pdf/pdf.routes.js";
/* ============================================================
   PATH
============================================================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
   APP
============================================================ */

const app = express();
app.set("trust proxy", 1);

/* ============================================================
   GLOBAL MIDDLEWARES
============================================================ */

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
app.use((req, res, next) => {
  const sameOrigin = `${req.protocol}://${req.get("host")}`;

  return cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || origin === sameOrigin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
  })(req, res, next);
});

app.use(express.json({ limit: "1mb" }));
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.use(
  "/uploads",
  express.static(
    path.resolve("uploads")
  )
);

/* ============================================================
   API ROUTES
============================================================ */

app.use("/api/platform", platformRoutes);

app.use("/api/shop", shopRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/prescriptions", prescriptionRoutes);

app.use("/api/frames", frameRoutes);

app.use("/api/lenses", lensRoutes);

app.use("/api/purchases", purchaseRoutes);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/supplier-payments", supplierPaymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/import", excelImportRoutes);
app.use("/api/marketing", marketingRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/crm", crmRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reports", reportsRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/pdf", pdfRoutes);

/* ============================================================
   ROOT
============================================================ */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OptiFlow API Running 🚀",
    version: "1.0.0",
  });
});
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "healthy", version: "1.0.0" });
});

/* ============================================================
   ERROR HANDLER
============================================================ */

app.use(errorMiddleware);

export default app;
