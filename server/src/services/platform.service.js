import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import * as platformAdminRepo from "../repositories/platform-admin.repository.js";

import {
  findPlatformAdminByEmail,
  findPlatformAdminById,
  countTotalShops,
  countActiveShops,
  countInactiveShops,
  countTotalUsers,
  countTrialShops,
  countExpiringSubscriptions,
  createShopWithOwner,
  findAllShops,
  findShopById,
  findShopByEmail,
  findShopByMobile,
  updateShop,
  deleteShop,
  findOwner,
  updateOwnerPassword,
  replaceSubscription,
} from "../repositories/platform.repository.js";

/* ============================================================
   LOGIN
============================================================ */

export async function loginPlatformAdmin(email, password) {
  const admin = await findPlatformAdminByEmail(email);

  if (!admin) {
    throw new Error("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, admin.password);

  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      tokenType: "PLATFORM_ADMIN",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
    },
    token,
  };
}

/* ============================================================
   PROFILE
============================================================ */

export async function getProfile(id) {
  const admin = await findPlatformAdminById(id);

  if (!admin) {
    throw new AppError("Platform admin not found", 404);
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
  };
}

/* ============================================================
   DASHBOARD
============================================================ */

export async function getDashboard() {
  const until = new Date();
  until.setDate(until.getDate() + 30);
  const [
    totalShops,
    activeShops,
    inactiveShops,
    totalUsers,
    trialShops,
    expiringSubscriptions,
  ] = await Promise.all([
    countTotalShops(),
    countActiveShops(),
    countInactiveShops(),
    countTotalUsers(),
    countTrialShops(),
    countExpiringSubscriptions(until),
  ]);

  return {
    totalShops,
    activeShops,
    inactiveShops,
    totalUsers,
    trialShops,
    expiringSubscriptions,
  };
}

/* ============================================================
   CREATE SHOP
============================================================ */

export async function createShop(data) {
  const existingEmail = await findShopByEmail(data.email);

  if (existingEmail) {
    throw new AppError("Email already exists", 409);
  }

  const existingMobile = await findShopByMobile(data.mobile);

  if (existingMobile) {
    throw new AppError("Mobile already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const settings = await platformAdminRepo.getSettings();

  return createShopWithOwner({
    ...data,
    password: hashedPassword,
    trialDays: settings.trialDays,
    yearlyPrice: settings.yearlyPrice,
    amount: data.accessType === "TRIAL" ? 0 : data.amount,
  });
}

/* ============================================================
   LIST SHOPS
============================================================ */

export async function getAllShops() {
  const shops = await findAllShops();

  return shops.map((shop) => ({
    id: shop.id,
    shopName: shop.shopName,
    ownerName: shop.ownerName,
    mobile: shop.mobile,
    email: shop.email,
    address: shop.address,
    gstNumber: shop.gstNumber,
    status: shop.status,
    createdAt: shop.createdAt,
    plan: shop.subscriptions[0]?.plan ?? null,
    subscriptionStatus: shop.subscriptions[0]?.status ?? null,
    expiryDate: shop.subscriptions[0]?.expiryDate ?? null,
  }));
}

/* ============================================================
   SHOP DETAILS
============================================================ */

export async function getShopById(id) {
  const shop = await findShopById(Number(id));

  if (!shop) {
    throw new AppError("Shop not found", 404);
  }

  return {
    id: shop.id,
    shopName: shop.shopName,
    ownerName: shop.ownerName,
    mobile: shop.mobile,
    email: shop.email,
    address: shop.address,
    gstNumber: shop.gstNumber,
    status: shop.status,
    createdAt: shop.createdAt,
    users: shop.users,
    subscription: shop.subscriptions[0] ?? null,
  };
}

export async function editShop(id, data) {
  const shop = await getShopById(id);
  if (
    data.email &&
    data.email !== shop.email &&
    (await findShopByEmail(data.email))
  )
    throw new AppError("Email already exists", 409);
  if (
    data.mobile &&
    data.mobile !== shop.mobile &&
    (await findShopByMobile(data.mobile))
  )
    throw new AppError("Mobile already exists", 409);
  return updateShop(shop.id, data);
}
export async function setShopStatus(id, status) {
  const shop = await getShopById(id);
  return updateShop(shop.id, { status });
}
export async function removeShop(id) {
  const shop = await getShopById(id);
  await deleteShop(shop.id);
}
export async function startTrial(id, days) {
  const shop = await getShopById(id);
  const current = shop.subscription;
  if (
    current?.active &&
    current.status === "ACTIVE" &&
    current.expiryDate > new Date()
  ) {
    throw new AppError(
      "An active paid plan cannot be replaced with a trial",
      409,
    );
  }
  if (current?.status === "TRIAL")
    throw new AppError("This shop has already used its trial", 409);
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return replaceSubscription(shop.id, {
    plan: "STARTER",
    amount: 0,
    startDate,
    expiryDate,
    trialEndsAt: expiryDate,
    status: "TRIAL",
    active: true,
  });
}
export async function activateSubscription(id, data) {
  const shop = await getShopById(id);
  const subscription = await replaceSubscription(shop.id, {
    amount: data.amount,
    expiryDate: data.expiryDate,
    plan: "STARTER",
    startDate: data.startDate || new Date(),
    status: "ACTIVE",
    active: true,
    trialEndsAt: null,
  });
  await platformAdminRepo.createPayment({
    shopId: shop.id,
    subscriptionId: subscription.id,
    amount: data.amount,
    status: data.paymentStatus || "PAID",
    reference: data.reference || null,
    notes: data.notes || null,
    dueDate: data.dueDate || null,
    paidAt: (data.paymentStatus || "PAID") === "PAID" ? new Date() : null,
  });
  return subscription;
}
export async function resetOwnerPassword(id, password) {
  await getShopById(id);
  const owner = await findOwner(id);
  if (!owner) throw new AppError("Shop owner not found", 404);
  await updateOwnerPassword(owner.id, await bcrypt.hash(password, 10));
}
