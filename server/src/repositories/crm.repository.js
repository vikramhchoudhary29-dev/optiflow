import prisma from "../config/prisma.js";

const customerSelect = {
  id: true,
  customerCode: true,
  name: true,
  mobile: true,
  email: true,
  city: true,
  dob: true,
  active: true,
  createdAt: true,
  invoice: {
    orderBy: { invoiceDate: "desc" },
    take: 1,
    select: { id: true, invoiceCode: true, invoiceDate: true, grandTotal: true, balance: true, paymentStatus: true },
  },
  prescription: {
    orderBy: { prescriptionDate: "desc" },
    take: 1,
    select: { id: true, prescriptionCode: true, prescriptionDate: true, expiryDate: true, status: true },
  },
  _count: { select: { invoice: true, prescription: true, activities: true } },
};

export const getCustomerList = (shopId, { search = "", page = 1, limit = 50 } = {}) => {
  const where = {
    shopId,
    active: true,
    ...(search ? { OR: [
      { name: { contains: search, mode: "insensitive" } },
      { mobile: { contains: search } },
      { customerCode: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ] } : {}),
  };
  return Promise.all([
    prisma.customer.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit, select: customerSelect }),
    prisma.customer.count({ where }),
  ]);
};

export const getCustomer360 = async (shopId, customerId) => {
  const customer = await prisma.customer.findFirst({
    where: { shopId, id: customerId },
    include: {
      invoice: {
        orderBy: { invoiceDate: "desc" },
        take: 50,
        include: {
          invoiceitem: {
            orderBy: { id: "asc" },
            select: { id: true, itemCode: true, itemName: true, quantity: true, price: true, total: true },
          },
        },
      },
      prescription: { orderBy: { prescriptionDate: "desc" }, take: 20 },
      loyaltyTransactions: { orderBy: { createdAt: "desc" }, take: 100 },
      activities: { orderBy: { createdAt: "desc" }, take: 50, include: { createdBy: { select: { id: true, name: true } } } },
    },
  });

  if (!customer) return null;

  const loyalty = customer.loyaltyTransactions;
  const loyaltyEarned = loyalty.filter((item) => item.type === "EARN").reduce((sum, item) => sum + item.points, 0);
  const loyaltyRedeemed = loyalty.filter((item) => item.type === "REDEEM").reduce((sum, item) => sum + item.points, 0);
  const loyaltyAdjusted = loyalty.filter((item) => item.type === "ADJUSTMENT").reduce((sum, item) => sum + item.points, 0);
  const availablePoints = loyalty
    .filter((item) => item.type === "EARN" && item.remainingPoints > 0 && (!item.expiresAt || item.expiresAt > new Date()))
    .reduce((sum, item) => sum + item.remainingPoints, 0);

  return {
    ...customer,
    loyaltySummary: {
      availablePoints: availablePoints + loyaltyAdjusted,
      totalEarned: loyaltyEarned,
      totalRedeemed: loyaltyRedeemed,
      totalAdjusted: loyaltyAdjusted,
    },
  };
};

export const createActivity = (data) => prisma.customerActivity.create({ data, include: { createdBy: { select: { id: true, name: true } } } });
export const findCustomer = (shopId, customerId) => prisma.customer.findFirst({ where: { shopId, id: customerId }, select: { id: true, name: true, mobile: true } });
export const listActivities = (shopId, { status, from, to, limit = 100 } = {}) => prisma.customerActivity.findMany({
  where: { shopId, ...(status ? { status } : {}), ...(from || to ? { dueDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}) },
  orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }], take: limit,
  include: { customer: { select: { id: true, name: true, mobile: true, customerCode: true } }, createdBy: { select: { id: true, name: true } } },
});
export const getActivity = (shopId, id) => prisma.customerActivity.findFirst({ where: { shopId, id }, include: { customer: { select: { id: true, name: true, mobile: true } } } });
export const updateActivity = (shopId, id, data) => prisma.customerActivity.updateMany({ where: { shopId, id }, data });

export async function getDashboard(shopId) {
  const now = new Date();
  const start30 = new Date(now); start30.setDate(start30.getDate() - 30);
  const end30 = new Date(now); end30.setDate(end30.getDate() + 30);
  const [activeCustomers, newCustomers, openFollowUps, overdueFollowUps, expiringPrescriptions, upcomingBirthdays] = await Promise.all([
    prisma.customer.count({ where: { shopId, active: true } }),
    prisma.customer.count({ where: { shopId, active: true, createdAt: { gte: start30 } } }),
    prisma.customerActivity.count({ where: { shopId, status: "OPEN", type: { in: ["FOLLOW_UP", "REMINDER"] } } }),
    prisma.customerActivity.count({ where: { shopId, status: "OPEN", dueDate: { lt: now } } }),
    prisma.prescription.count({ where: { shopId, status: "ACTIVE", expiryDate: { gte: now, lte: end30 } } }),
    prisma.customer.findMany({ where: { shopId, active: true, dob: { not: null } }, select: { id: true, name: true, mobile: true, dob: true }, take: 200 }),
  ]);
  const birthdays = upcomingBirthdays.filter((c) => {
    const d = new Date(c.dob); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const birthday = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (birthday < today) birthday.setFullYear(now.getFullYear() + 1);
    return birthday <= end30;
  }).length;
  return { activeCustomers, newCustomers, openFollowUps, overdueFollowUps, expiringPrescriptions, upcomingBirthdays: birthdays };
}
