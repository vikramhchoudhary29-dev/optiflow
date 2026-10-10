import prisma from "../config/prisma.js";

/* ============================================================
   PLATFORM ADMIN
============================================================ */

export async function findPlatformAdminByEmail(email) {
  return prisma.admin.findUnique({
    where: { email },
  });
}

export async function findPlatformAdminById(id) {
  return prisma.admin.findUnique({
    where: { id },
  });
}

/* ============================================================
   DASHBOARD
============================================================ */

export async function countTotalShops() {
  return prisma.shop.count();
}

export async function countActiveShops() {
  return prisma.shop.count({
    where: {
      status: true,
    },
  });
}

export async function countInactiveShops() {
  return prisma.shop.count({
    where: {
      status: false,
    },
  });
}

export async function countTotalUsers() {
  return prisma.user.count();
}

export const countTrialShops = () =>
  prisma.shop.count({
    where: { subscriptions: { some: { active: true, status: "TRIAL" } } },
  });
export const countExpiringSubscriptions = (until) =>
  prisma.subscription.count({
    where: {
      active: true,
      status: { in: ["TRIAL", "ACTIVE"] },
      expiryDate: { gte: new Date(), lte: until },
    },
  });

/* ============================================================
   SHOPS
============================================================ */

export async function findAllShops() {
  return prisma.shop.findMany({
    include: {
      subscriptions: {
        where: {
          active: true,
        },
        select: {
          plan: true,
          expiryDate: true,
          active: true,
          status: true,
          trialEndsAt: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });
}

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
        where: { active: true },
        orderBy: { expiryDate: "desc" },
        take: 1,
        select: {
          id: true,
          plan: true,
          amount: true,
          startDate: true,
          expiryDate: true,
          active: true,
          status: true,
          trialEndsAt: true,
        },
      },
    },
  });
}

export async function findShopByEmail(email) {
  return prisma.shop.findUnique({
    where: {
      email,
    },
  });
}

export async function findShopByMobile(mobile) {
  return prisma.shop.findUnique({
    where: {
      mobile,
    },
  });
}

export async function createShopWithOwner(data) {
  return prisma.$transaction(async (tx) => {
    const shop = await tx.shop.create({
      data: {
        shopName: data.shopName,
        ownerName: data.ownerName,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
        gstNumber: data.gstNumber,
        status: true,
      },
    });

    const user = await tx.user.create({
      data: {
        shopId: shop.id,
        name: data.ownerName,
        mobile: data.mobile,
        email: data.email,
        loginId: data.email,
        password: data.password,
        role: "OWNER",
        status: true,
      },
      select: {
        id: true,
        shopId: true,
        name: true,
        mobile: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const startDate = data.startDate || new Date();
    const expiryDate = new Date(startDate);
    if (data.accessType === "TRIAL")
      expiryDate.setDate(expiryDate.getDate() + data.trialDays);
    else expiryDate.setMonth(expiryDate.getMonth() + data.durationMonths);

    const subscription = await tx.subscription.create({
      data: {
        shopId: shop.id,
        plan: data.plan,
        amount: data.accessType === "TRIAL" ? 0 : data.amount,
        startDate,
        expiryDate,
        active: true,
        status: data.accessType === "TRIAL" ? "TRIAL" : "ACTIVE",
        trialEndsAt: data.accessType === "TRIAL" ? expiryDate : null,
      },
    });

    if (data.accessType === "PAID") {
      await tx.subscriptionPayment.create({
        data: {
          shopId: shop.id,
          subscriptionId: subscription.id,
          amount: data.amount,
          status: data.paymentStatus,
          reference: data.paymentReference || null,
          notes: data.paymentNotes || null,
          paidAt: data.paymentStatus === "PAID" ? new Date() : null,
        },
      });
    }

    await tx.setting.create({
      data: { shopId: shop.id, gstNumber: data.gstNumber || null },
    });
    await tx.notificationTemplate.create({
      data: {
        shopId: shop.id,
        message:
          "Hello {customerName},\n\nThank you for choosing {shopName}. We have received your order successfully.\n\nInvoice Number: {invoiceCode}\nTotal Amount: ₹{grandTotal}\nAmount Received: ₹{received}\nBalance Due: ₹{balance}\n\nWe will notify you as soon as your spectacles are ready.\n\nRegards,\n{shopName}",
        readyMessage:
          "Hello {customerName},\n\nGood news! Your spectacles for Invoice {invoiceCode} are ready for collection from {shopName}.\n\nTotal Amount: ₹{grandTotal}\nAmount Received: ₹{received}\nBalance Due: ₹{balance}\n\nPlease visit us at {shopAddress}. For assistance, call {shopMobile}.\n\nRegards,\n{shopName}",
        deliveredMessage:
          "Hello {customerName}, your order from {shopName} has been delivered successfully. Thank you for choosing us. If you need any support or changes, please reply to this message. Invoice No: {invoiceCode}. We would love your feedback here: {reviewLink}",
      },
    });

    return {
      shop,
      user,
      subscription,
    };
  });
}

export const updateShop = (id, data) =>
  prisma.shop.update({ where: { id: Number(id) }, data });
export const deleteShop = (id) =>
  prisma.shop.delete({ where: { id: Number(id) } });
export const findOwner = (shopId) =>
  prisma.user.findFirst({ where: { shopId: Number(shopId), role: "OWNER" } });
export const updateOwnerPassword = (id, password) =>
  prisma.user.update({ where: { id }, data: { password } });
export async function replaceSubscription(shopId, data) {
  return prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { shopId: Number(shopId), active: true },
      data: { active: false, status: "CANCELLED" },
    });
    return tx.subscription.create({
      data: { shopId: Number(shopId), ...data },
    });
  });
}

