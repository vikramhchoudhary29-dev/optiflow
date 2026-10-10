import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

const defaults = {
  enabled: false, spendPerPoint: 1000, minimumEarnInvoice: 1000,
  expiryEnabled: true, expiryDays: 90, redemptionValuePerPoint: 1,
  maximumRedemptionPercent: 20, minimumRedeemInvoice: 1000,
};
export const getSetting = (shopId) => prisma.loyaltySetting.upsert({ where: { shopId }, create: { shopId, ...defaults }, update: {} });
export const updateSetting = (shopId, data) => prisma.loyaltySetting.upsert({ where: { shopId }, create: { shopId, ...data }, update: data });

export async function getBalance(shopId, customerId, tx = prisma) {
  const lots = await tx.loyaltyTransaction.findMany({
    where: { shopId, customerId: Number(customerId), type: "EARN", remainingPoints: { gt: 0 }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    orderBy: [{ expiresAt: "asc" }, { createdAt: "asc" }],
  });
  return { points: lots.reduce((sum, lot) => sum + lot.remainingPoints, 0), lots };
}

export async function applyRedemption(tx, { shopId, customerId, invoiceId, requestedPoints, invoiceValue, setting }) {
  const quote = await calculateRedemption(tx, { shopId, customerId, requestedPoints, invoiceValue, setting });
  if (!quote.points) return quote;
  const { points, discount, lots } = quote;
  const redemption = await tx.loyaltyTransaction.create({ data: { shopId, customerId, invoiceId, type: "REDEEM", points, monetaryValue: discount } });
  let remaining = points;
  for (const lot of lots) {
    if (!remaining) break;
    const used = Math.min(remaining, lot.remainingPoints);
    await tx.loyaltyTransaction.update({ where: { id: lot.id }, data: { remainingPoints: { decrement: used } } });
    await tx.loyaltyRedemptionAllocation.create({ data: { redemptionId: redemption.id, earningId: lot.id, points: used } });
    remaining -= used;
  }
  return { points, discount };
}

export async function calculateRedemption(tx, { shopId, customerId, requestedPoints, invoiceValue, setting }) {
  const points = Number(requestedPoints || 0);
  if (!points) return { points: 0, discount: 0, lots: [] };
  if (!setting.enabled) throw new AppError("Loyalty points are not enabled", 400);
  if (invoiceValue < Number(setting.minimumRedeemInvoice)) throw new AppError(`Invoice must be at least ₹${Number(setting.minimumRedeemInvoice).toFixed(2)} to redeem points`, 400);
  const { points: available, lots } = await getBalance(shopId, customerId, tx);
  const pointValue = Number(setting.redemptionValuePerPoint);
  const maximumPoints = Math.floor((invoiceValue * Number(setting.maximumRedemptionPercent) / 100) / pointValue);
  if (points > available) throw new AppError(`Only ${available} loyalty points are available`, 400);
  if (points > maximumPoints) throw new AppError(`A maximum of ${maximumPoints} points can be used on this invoice`, 400);
  return { points, discount: points * pointValue, lots };
}

export async function awardPoints(tx, { shopId, customerId, invoiceId, invoiceValue, setting }) {
  if (!setting.enabled || invoiceValue < Number(setting.minimumEarnInvoice)) return 0;
  const points = Math.floor(invoiceValue / Number(setting.spendPerPoint));
  if (!points) return 0;
  const expiresAt = setting.expiryEnabled ? new Date(Date.now() + setting.expiryDays * 86400000) : null;
  await tx.loyaltyTransaction.create({ data: { shopId, customerId, invoiceId, type: "EARN", points, remainingPoints: points, expiresAt } });
  return points;
}

export async function reverseInvoiceLoyalty(tx, invoiceId) {
  const transactions = await tx.loyaltyTransaction.findMany({ where: { invoiceId }, include: { redemptionUses: true } });
  const earned = transactions.find((item) => item.type === "EARN");
  if (earned && earned.remainingPoints !== earned.points) throw new AppError("This invoice cannot be edited because some earned loyalty points have already been redeemed", 409);
  for (const redemption of transactions.filter((item) => item.type === "REDEEM")) {
    for (const allocation of redemption.redemptionUses) await tx.loyaltyTransaction.update({ where: { id: allocation.earningId }, data: { remainingPoints: { increment: allocation.points } } });
  }
  await tx.loyaltyTransaction.deleteMany({ where: { invoiceId } });
}

export async function getCustomerSummary(shopId, customerId) {
  const customer = await prisma.customer.findFirst({ where: { id: Number(customerId), shopId, active: true } });
  if (!customer) throw new AppError("Customer not found", 404);
  const [setting, balance, history] = await Promise.all([
    getSetting(shopId), getBalance(shopId, customerId),
    prisma.loyaltyTransaction.findMany({ where: { shopId, customerId: Number(customerId) }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return { setting, balance: balance.points, history };
}
