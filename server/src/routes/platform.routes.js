import { Router } from "express";

import {
  login,
  profile,
  dashboard,
  createShopController,
  getAllShopsController,
  getShopByIdController,
  updateShopController,
  updateShopStatusController,
  deleteShopController,
  startTrialController,
  activateSubscriptionController,
  resetOwnerPasswordController,
} from "../controllers/platform.controller.js";

import { requirePlatformAdmin } from "../middlewares/auth.middleware.js";
import loginRateLimit from "../middlewares/loginRateLimit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createShopSchema,
  updateShopSchema,
  shopStatusSchema,
  subscriptionSchema,
  trialSchema,
  resetPasswordSchema,
  platformLoginSchema,
} from "../validations/platform.validation.js";
import * as admin from "../controllers/platform-admin.controller.js";
import {
  planSettingsSchema,
  platformPaymentSchema,
} from "../validations/platform-admin.validation.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    module: "Platform",
    status: "OK",
  });
});

router.post("/login", loginRateLimit, validate(platformLoginSchema), login);

router.get("/profile", requirePlatformAdmin, profile);

router.get("/dashboard", requirePlatformAdmin, dashboard);

router.post(
  "/shops",
  requirePlatformAdmin,
  validate(createShopSchema),
  createShopController,
);

router.get("/shops/:id", requirePlatformAdmin, getShopByIdController);

router.get("/shops", requirePlatformAdmin, getAllShopsController);
router.get("/shops/export/excel", requirePlatformAdmin, admin.exportShops);
router.put(
  "/shops/:id",
  requirePlatformAdmin,
  validate(updateShopSchema),
  updateShopController,
);
router.patch(
  "/shops/:id/status",
  requirePlatformAdmin,
  validate(shopStatusSchema),
  updateShopStatusController,
);
router.delete("/shops/:id", requirePlatformAdmin, deleteShopController);
router.post(
  "/shops/:id/trial",
  requirePlatformAdmin,
  validate(trialSchema),
  startTrialController,
);
router.post(
  "/shops/:id/subscription",
  requirePlatformAdmin,
  validate(subscriptionSchema),
  activateSubscriptionController,
);
router.post(
  "/shops/:id/reset-owner-password",
  requirePlatformAdmin,
  validate(resetPasswordSchema),
  resetOwnerPasswordController,
);
router.get("/analytics", requirePlatformAdmin, admin.analytics);
router.get("/plan-settings", requirePlatformAdmin, admin.settings);
router.put(
  "/plan-settings",
  requirePlatformAdmin,
  validate(planSettingsSchema),
  admin.updateSettings,
);
router.get("/shops/:id/details", requirePlatformAdmin, admin.shopDetails);
router.post(
  "/shops/:id/support-login",
  requirePlatformAdmin,
  admin.supportLogin,
);
router.get("/subscription-payments", requirePlatformAdmin, admin.payments);
router.post(
  "/subscription-payments",
  requirePlatformAdmin,
  validate(platformPaymentSchema),
  admin.createPayment,
);
router.get(
  "/subscription-payments/:id/receipt",
  requirePlatformAdmin,
  admin.receipt,
);
router.get("/reminders", requirePlatformAdmin, admin.reminders);
router.get("/announcements", requirePlatformAdmin, admin.announcements);
router.post("/announcements", requirePlatformAdmin, admin.createAnnouncement);
router.put("/announcements/:id", requirePlatformAdmin, admin.updateAnnouncement);
router.delete("/announcements/:id", requirePlatformAdmin, admin.deleteAnnouncement);
export default router;

export async function findShopById(id) {
  return prisma.shop.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          role: true,
          status: true,
        },
      },
      subscriptions: {
        select: {
          id: true,
          plan: true,
          amount: true,
          startDate: true,
          expiryDate: true,
          active: true,
        },
      },
    },
  });
}
