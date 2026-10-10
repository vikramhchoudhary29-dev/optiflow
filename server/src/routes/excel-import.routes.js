import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import * as controller from "../controllers/excel-import.controller.js";
import { requirePermission, requireShopUser } from "../middlewares/auth.middleware.js";
import AppError from "../utils/AppError.js";

const router = Router();
const templatesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../outputs/019fda8c-d9d3-78c0-9a2d-8c632a815628");
const templateFiles = {
  customers: "customers-import-template.xlsx",
  products: "products-import-template.xlsx",
  suppliers: "suppliers-import-template.xlsx",
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!file.originalname.toLowerCase().endsWith(".xlsx")) return callback(new AppError("Only .xlsx files are supported", 400));
    callback(null, true);
  },
});

router.get("/templates/:type", (req, res, next) => {
  const file = templateFiles[req.params.type];
  if (!file) return next(new AppError("Import template not found", 404));
  return res.download(path.join(templatesDirectory, file), file);
});
router.use(requireShopUser);
router.post("/customers", requirePermission("customers", "create"), upload.single("file"), controller.customers);
router.post("/products", requirePermission("products", "create"), upload.single("file"), controller.products);
router.post("/suppliers", requirePermission("suppliers", "create"), upload.single("file"), controller.suppliers);

export default router;
