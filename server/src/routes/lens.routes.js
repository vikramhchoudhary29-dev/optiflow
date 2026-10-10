import { Router } from "express";

import shopAuth from "../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createLensController,
  getAllLensesController,
  getLensByIdController,
  updateLensController,
  toggleLensStatusController,
} from "../controllers/lens.controller.js";

import { createLensSchema } from "../validations/lens.validation.js";

const router = Router();

/* ============================================================
   HEALTH
============================================================ */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    module: "Lens",
    status: "OK",
  });
});

/* ============================================================
   LIST
============================================================ */

router.get(
  "/",
  shopAuth,
  requirePermission("products", "view"),
  getAllLensesController
);

/* ============================================================
   GET BY ID
============================================================ */

router.get(
  "/:id",
  shopAuth,
  requirePermission("products", "view"),
  getLensByIdController
);

/* ============================================================
   CREATE
============================================================ */

router.post(
  "/",
  shopAuth,
  requirePermission("products", "create"),
  validate(createLensSchema),
  createLensController
);

/* ============================================================
   UPDATE
============================================================ */

router.put(
  "/:id",
  shopAuth,
  requirePermission("products", "edit"),
  validate(createLensSchema),
  updateLensController
);

/* ============================================================
   ACTIVATE / DEACTIVATE
============================================================ */

router.patch(
  "/:id/status",
  shopAuth,
  requirePermission("products", "edit"),
  toggleLensStatusController
);

export default router;
