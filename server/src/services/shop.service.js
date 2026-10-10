import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import AppError from "../utils/AppError.js";

import { findUserByIdentifier } from "../repositories/shop.repository.js";

export async function loginShopUser(identifier, password) {
  const user = await findUserByIdentifier(identifier);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.status) {
    throw new AppError("User account is inactive", 403);
  }

  if (!user.shop.status) {
    throw new AppError("Shop is inactive", 403);
  }

  const subscription = user.shop.subscriptions[0];
  if (!subscription || !["TRIAL", "ACTIVE"].includes(subscription.status) || subscription.expiryDate <= new Date()) {
    throw new AppError("Shop subscription is inactive or expired", 403);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      shopId: user.shopId,
      role: user.role,
      permissions: user.permissions,
      shop: {
        id: user.shop.id,
        shopName: user.shop.shopName,
        mobile: user.shop.mobile,
        email: user.shop.email,
      },
      tokenType: "SHOP_USER",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: {
      id: user.id,
      shopId: user.shopId,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    token,
  };
}
