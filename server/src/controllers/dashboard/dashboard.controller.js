import asyncHandler from "../../utils/asyncHandler.js";

import { successResponse } from "../../utils/response.js";

import {
  getDashboardSummaryService,
} from "../../services/dashboard/dashboard.service.js";

/* ============================================================
   DASHBOARD SUMMARY
============================================================ */

export const getDashboardSummaryController =
asyncHandler(async (req, res) => {

  const dashboard =
    await getDashboardSummaryService(
      req.user.shopId
    );

  successResponse(
    res,
    "Dashboard fetched successfully",
    dashboard
  );

});

import prisma from "../../config/prisma.js";
export const getDashboardAnnouncementsController = asyncHandler(async (req, res) => {
  const now = new Date();
  const rows = await prisma.announcement.findMany({
    where: { published: true, startsAt: { lte: now }, OR: [{ endsAt: null }, { endsAt: { gte: now } }], targets: { some: { shopId: req.user.shopId } } },
    select: { id: true, title: true, message: true, tone: true, startsAt: true, endsAt: true },
    orderBy: { createdAt: "desc" },
  });
  successResponse(res, "Dashboard announcements fetched", rows);
});
