import prisma from "../config/prisma.js";

export const getSettings = () =>
  prisma.platformSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
export const updateSettings = (data) =>
  prisma.platformSetting.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

export async function getShopDetails(id) {
  return prisma.shop.findUnique({
    where: { id: Number(id) },
    include: {
      users: {
        where: { role: "OWNER" },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          status: true,
          createdAt: true,
        },
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: { payments: { orderBy: { createdAt: "desc" } } },
      },
      subscriptionPayments: { orderBy: { createdAt: "desc" } },
      supportSessions: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { admin: { select: { name: true, email: true } } },
      },
      _count: {
        select: { users: true, customer: true, products: true, invoice: true },
      },
    },
  });
}

export const getShopAnalytics = (shopId) => Promise.all([
  prisma.invoice.aggregate({ where: { shopId: Number(shopId) }, _sum: { grandTotal: true, received: true, balance: true } }),
  prisma.invoice.aggregate({ where: { shopId: Number(shopId), invoiceDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { grandTotal: true } }),
  prisma.purchase.aggregate({ where: { shopId: Number(shopId) }, _sum: { totalAmount: true } }),
  prisma.expense.aggregate({ where: { shopId: Number(shopId) }, _sum: { amount: true } }),
  prisma.supplierPayment.aggregate({ where: { shopId: Number(shopId) }, _sum: { amount: true } }),
]);

export const listPayments = () =>
  prisma.subscriptionPayment.findMany({
    include: {
      shop: { select: { shopName: true, ownerName: true, mobile: true } },
      subscription: true,
    },
    orderBy: { createdAt: "desc" },
  });
export const getPayment = (id) =>
  prisma.subscriptionPayment.findUnique({
    where: { id: Number(id) },
    include: { shop: true, subscription: true },
  });
export const createPayment = (data) =>
  prisma.subscriptionPayment.create({
    data,
    include: { shop: true, subscription: true },
  });
export const updatePaymentStatuses = (now) =>
  prisma.subscriptionPayment.updateMany({
    where: { status: "UNPAID", dueDate: { lt: now } },
    data: { status: "OVERDUE" },
  });

export const createSupportSession = (data) =>
  prisma.supportSession.create({ data });
export const getActiveSupportSession = (id) =>
  prisma.supportSession.findFirst({
    where: { id: Number(id), endedAt: null, expiresAt: { gt: new Date() } },
  });
export const endSupportSession = (id) =>
  prisma.supportSession.updateMany({
    where: { id: Number(id), endedAt: null },
    data: { endedAt: new Date() },
  });

export const getAnalyticsData = async () =>
  Promise.all([
    prisma.shop.count(),
    prisma.shop.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.subscription.count({ where: { status: "TRIAL" } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscriptionPayment.aggregate({
      where: {
        status: "PAID",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { status: true } }),
    prisma.invoice.aggregate({ _sum: { grandTotal: true } }),
    prisma.subscription.findMany({
      select: { shopId: true, createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscriptionPayment.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
        },
      },
      select: { amount: true, paidAt: true },
    }),
  ]);

export const getReminderSubscriptions = () =>
  prisma.subscription.findMany({
    where: { active: true, status: { in: ["TRIAL", "ACTIVE"] } },
    include: { shop: true },
    orderBy: { expiryDate: "asc" },
  });

export async function expireSubscriptions(now, graceDays) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - graceDays);
  const expired = await prisma.subscription.findMany({
    where: {
      active: true,
      status: { in: ["TRIAL", "ACTIVE"] },
      expiryDate: { lt: cutoff },
    },
    select: { id: true, shopId: true },
  });
  if (!expired.length) return 0;
  await prisma.$transaction([
    prisma.subscription.updateMany({
      where: { id: { in: expired.map((row) => row.id) } },
      data: { active: false, status: "EXPIRED" },
    }),
    prisma.shop.updateMany({
      where: { id: { in: [...new Set(expired.map((row) => row.shopId))] } },
      data: { status: false },
    }),
  ]);
  return expired.length;
}
