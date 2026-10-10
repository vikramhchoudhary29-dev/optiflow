import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import * as repo from "../repositories/platform-admin.repository.js";

const number = (value) => Number(value || 0);
const monthKey = (date) => new Date(date).toISOString().slice(0, 7);

export const getPlanSettings = () => repo.getSettings();
export const savePlanSettings = (data) =>
  repo.updateSettings({ ...data, reminderDays: data.reminderDays.join(",") });

export async function applyAutomaticExpiry() {
  const settings = await repo.getSettings();
  if (!settings.autoExpire) return 0;
  return repo.expireSubscriptions(new Date(), settings.gracePeriodDays);
}

export async function shopDetails(id) {
  const shop = await repo.getShopDetails(id);
  if (!shop) throw new AppError("Shop not found", 404);
  const [sales, monthlySales, purchases, expenses, supplierPayments] = await repo.getShopAnalytics(id);
  return {
    ...shop,
    analytics: {
      totalSales: number(sales._sum.grandTotal),
      collected: number(sales._sum.received),
      outstanding: number(sales._sum.balance),
      salesThisMonth: number(monthlySales._sum.grandTotal),
      totalPurchases: number(purchases._sum.totalAmount),
      totalExpenses: number(expenses._sum.amount),
      supplierPayments: number(supplierPayments._sum.amount),
    },
  };
}

export async function analytics() {
  await applyAutomaticExpiry();
  const [
    totalShops,
    newShops,
    trialCount,
    paidCount,
    revenue,
    activeUsers,
    shopSales,
    subscriptions,
    payments,
  ] = await repo.getAnalyticsData();
  const convertedShopIds = new Set();
  const trials = new Set();
  const monthly = {};
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    monthly[monthKey(date)] = {
      month: date.toLocaleString("en", { month: "short" }),
      revenue: 0,
      renewals: 0,
      trials: 0,
    };
  }
  subscriptions.forEach((row) => {
    if (row.status === "TRIAL") trials.add(row.shopId);
    if (row.status === "ACTIVE" && trials.has(row.shopId))
      convertedShopIds.add(row.shopId);
    const key = monthKey(row.createdAt);
    if (monthly[key]) {
      monthly[key].renewals += row.status === "ACTIVE" ? 1 : 0;
      monthly[key].trials += row.status === "TRIAL" ? 1 : 0;
    }
  });
  payments.forEach((row) => {
    const key = monthKey(row.paidAt);
    if (monthly[key]) monthly[key].revenue += number(row.amount);
  });
  return {
    totalShops,
    newShopsThisMonth: newShops,
    monthlyRevenue: number(revenue._sum.amount),
    activeUsers,
    totalShopSales: number(shopSales._sum.grandTotal),
    trialCount,
    paidCount,
    trialConversionRate: trials.size
      ? Math.round((convertedShopIds.size / trials.size) * 100)
      : 0,
    monthly: Object.values(monthly),
  };
}

export async function paymentList() {
  await repo.updatePaymentStatuses(new Date());
  return repo.listPayments();
}
export async function paymentDetails(id) {
  const payment = await repo.getPayment(id);
  if (!payment) throw new AppError("Subscription payment not found", 404);
  return payment;
}
export async function recordPayment(data) {
  const shop = await repo.getShopDetails(data.shopId);
  if (!shop) throw new AppError("Shop not found", 404);
  const subscription = data.subscriptionId
    ? shop.subscriptions.find((row) => row.id === data.subscriptionId)
    : shop.subscriptions[0];
  return repo.createPayment({
    shopId: shop.id,
    subscriptionId: subscription?.id || null,
    amount: data.amount,
    status: data.status,
    reference: data.reference || null,
    notes: data.notes || null,
    dueDate: data.dueDate || null,
    paidAt: data.status === "PAID" ? data.paidAt || new Date() : null,
  });
}

export async function reminders() {
  await applyAutomaticExpiry();
  const settings = await repo.getSettings();
  const configured = settings.reminderDays.split(",").map(Number);
  const now = new Date();
  const rows = await repo.getReminderSubscriptions();
  return rows
    .map((row) => {
      const daysRemaining = Math.ceil((row.expiryDate - now) / 86400000);
      const type =
        row.status === "TRIAL"
          ? "TRIAL_ENDING"
          : daysRemaining < 0
            ? "EXPIRED"
            : "EXPIRING";
      const message = `Hello ${row.shop.ownerName},\n\nYour ${settings.planName}${row.status === "TRIAL" ? " trial" : " subscription"} ${daysRemaining < 0 ? "has expired" : `will expire in ${daysRemaining} day(s)`} on ${row.expiryDate.toLocaleDateString("en-IN")}. Please contact us to renew your access.\n\nRegards,\nOptiFlow`;
      return {
        subscriptionId: row.id,
        shopId: row.shopId,
        shopName: row.shop.shopName,
        ownerName: row.shop.ownerName,
        mobile: row.shop.mobile,
        expiryDate: row.expiryDate,
        daysRemaining,
        type,
        due: daysRemaining < 0 || configured.includes(daysRemaining),
        whatsappUrl: `https://wa.me/91${row.shop.mobile.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(message)}`,
      };
    })
    .filter((row) => row.due);
}

export async function beginSupportSession(adminId, shopId, ipAddress) {
  const shop = await repo.getShopDetails(shopId);
  if (!shop) throw new AppError("Shop not found", 404);
  const owner = shop.users[0];
  if (!owner) throw new AppError("Shop owner not found", 404);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const session = await repo.createSupportSession({
    adminId,
    shopId: shop.id,
    ownerId: owner.id,
    ipAddress,
    expiresAt,
  });
  const token = jwt.sign(
    {
      userId: owner.id,
      shopId: shop.id,
      role: "OWNER",
      tokenType: "SUPPORT_SESSION",
      supportSessionId: session.id,
      isSupport: true,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30m" },
  );
  return {
    token,
    expiresAt,
    user: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      mobile: owner.mobile,
      role: "OWNER",
      shopId: shop.id,
      shopName: shop.shopName,
      isSupport: true,
      supportSessionId: session.id,
    },
  };
}

export const activeSupportSession = (id) => repo.getActiveSupportSession(id);
export const finishSupportSession = (id) => repo.endSupportSession(id);


export async function listAnnouncements() {
  return prisma.announcement.findMany({
    include: { targets: { include: { shop: { select: { id: true, shopName: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAnnouncement(data) {
  const shopIds = [...new Set((data.shopIds || []).map(Number).filter(Number.isInteger))];
  if (!shopIds.length) throw new AppError("Select at least one shop", 400);
  const shops = await prisma.shop.findMany({ where: { id: { in: shopIds } }, select: { id: true } });
  if (shops.length !== shopIds.length) throw new AppError("One or more selected shops were not found", 404);
  if (data.endsAt && data.startsAt && new Date(data.endsAt) < new Date(data.startsAt)) throw new AppError("End date must be after start date", 400);
  return prisma.announcement.create({ data: {
    title: data.title.trim(), message: data.message.trim(), tone: data.tone || "INFO",
    published: Boolean(data.published), startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
    endsAt: data.endsAt ? new Date(data.endsAt) : null,
    targets: { create: shopIds.map((shopId) => ({ shopId })) },
  }, include: { targets: { include: { shop: { select: { id: true, shopName: true } } } } } });
}

export async function updateAnnouncement(id, data) {
  const announcementId = Number(id);
  const existing = await prisma.announcement.findUnique({ where: { id: announcementId } });
  if (!existing) throw new AppError("Announcement not found", 404);
  const shopIds = [...new Set((data.shopIds || []).map(Number).filter(Number.isInteger))];
  if (!shopIds.length) throw new AppError("Select at least one shop", 400);
  const shops = await prisma.shop.findMany({ where: { id: { in: shopIds } }, select: { id: true } });
  if (shops.length !== shopIds.length) throw new AppError("One or more selected shops were not found", 404);
  const startsAt = data.startsAt ? new Date(data.startsAt) : existing.startsAt;
  const endsAt = data.endsAt ? new Date(data.endsAt) : null;
  if (endsAt && endsAt < startsAt) throw new AppError("End date must be after start date", 400);
  return prisma.$transaction(async (tx) => {
    await tx.announcementShop.deleteMany({ where: { announcementId } });
    return tx.announcement.update({ where: { id: announcementId }, data: {
      title: data.title.trim(), message: data.message.trim(), tone: data.tone || "INFO",
      published: Boolean(data.published), startsAt, endsAt,
      targets: { create: shopIds.map((shopId) => ({ shopId })) },
    }, include: { targets: { include: { shop: { select: { id: true, shopName: true } } } } } });
  });
}

export async function deleteAnnouncement(id) {
  const announcementId = Number(id);
  const existing = await prisma.announcement.findUnique({ where: { id: announcementId }, select: { id: true } });
  if (!existing) throw new AppError("Announcement not found", 404);
  return prisma.announcement.delete({ where: { id: announcementId } });
}
