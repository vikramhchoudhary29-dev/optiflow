import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/platform-admin.service.js";
import subscriptionReceipt from "../pdf/subscriptionReceipt.js";
import { getAllShops } from "../services/platform.service.js";
import ExcelJS from "exceljs";

const response = (res, message, data) =>
  res.json({ success: true, message, data, errors: null });
export const settings = asyncHandler(async (_req, res) =>
  response(res, "Plan settings fetched", await service.getPlanSettings()),
);
export const updateSettings = asyncHandler(async (req, res) =>
  response(
    res,
    "Plan settings updated",
    await service.savePlanSettings(req.body),
  ),
);
export const shopDetails = asyncHandler(async (req, res) =>
  response(
    res,
    "Shop details fetched",
    await service.shopDetails(req.params.id),
  ),
);
export const analytics = asyncHandler(async (_req, res) =>
  response(res, "Platform analytics fetched", await service.analytics()),
);
export const payments = asyncHandler(async (_req, res) =>
  response(res, "Subscription payments fetched", await service.paymentList()),
);
export const createPayment = asyncHandler(async (req, res) =>
  res.status(201).json({
    success: true,
    message: "Subscription payment recorded",
    data: await service.recordPayment(req.body),
    errors: null,
  }),
);
export const receipt = asyncHandler(async (req, res) =>
  subscriptionReceipt(res, await service.paymentDetails(req.params.id)),
);
export const reminders = asyncHandler(async (_req, res) =>
  response(res, "Subscription reminders fetched", await service.reminders()),
);
export const supportLogin = asyncHandler(async (req, res) =>
  response(
    res,
    "Secure support session created",
    await service.beginSupportSession(req.user.id, req.params.id, req.ip),
  ),
);
export const exportShops = asyncHandler(async (_req, res) => {
  const shops = await getAllShops();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Shops", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = [
    { header: "Shop", key: "shop", width: 24 },
    { header: "Owner", key: "owner", width: 22 },
    { header: "Mobile", key: "mobile", width: 16 },
    { header: "Email", key: "email", width: 28 },
    { header: "Plan", key: "plan", width: 18 },
    { header: "Subscription Status", key: "subscriptionStatus", width: 20 },
    { header: "Expiry", key: "expiry", width: 14 },
    { header: "Shop Status", key: "shopStatus", width: 14 },
  ];
  shops.forEach((shop) =>
    sheet.addRow({
      shop: shop.shopName,
      owner: shop.ownerName,
      mobile: shop.mobile,
      email: shop.email,
      plan: "OptiFlow Plan",
      subscriptionStatus: shop.subscriptionStatus || "-",
      expiry: shop.expiryDate ? new Date(shop.expiryDate) : null,
      shopStatus: shop.status ? "Active" : "Inactive",
    }),
  );
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF312E81" },
  };
  sheet.getColumn("expiry").numFmt = "dd-mmm-yyyy";
  sheet.autoFilter = { from: "A1", to: "H1" };
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=optiflow-shops.xlsx",
  );
  await workbook.xlsx.write(res);
  res.end();
});
export const endSupport = asyncHandler(async (req, res) => {
  if (!req.user.isSupport || !req.user.supportSessionId)
    return res
      .status(400)
      .json({
        success: false,
        message: "No active support session",
        data: null,
        errors: [],
      });
  await service.finishSupportSession(req.user.supportSessionId);
  response(res, "Support session ended", null);
});

export const announcements = asyncHandler(async (_req, res) =>
  response(res, "Announcements fetched", await service.listAnnouncements()),
);
export const createAnnouncement = asyncHandler(async (req, res) =>
  res.status(201).json({ success: true, message: "Announcement created", data: await service.createAnnouncement(req.body), errors: null }),
);
export const updateAnnouncement = asyncHandler(async (req, res) =>
  response(res, "Announcement updated", await service.updateAnnouncement(req.params.id, req.body)),
);
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await service.deleteAnnouncement(req.params.id);
  response(res, "Announcement deleted", null);
});
