import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

function unauthorized(res, message = "Invalid or expired token") {
  return res.status(401).json({
    success: false,
    message,
    data: null,
    errors: [],
  });
}

function forbidden(res, message = "Forbidden") {
  return res.status(403).json({
    success: false,
    message,
    data: null,
    errors: [],
  });
}

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(res, "Authorization bearer token missing");
    }

    const token = authHeader.slice(7).trim();
    if (!token) return unauthorized(res, "Authorization bearer token missing");

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return unauthorized(res);
  }
}

export function requirePlatformAdmin(req, res, next) {
  return authenticate(req, res, () => {
    if (req.user.tokenType !== "PLATFORM_ADMIN") {
      return forbidden(res, "Platform administrator access required");
    }
    return next();
  });
}

export function requireShopUser(req, res, next) {
  return authenticate(req, res, async () => {
    if (
      !["SHOP_USER", "SUPPORT_SESSION"].includes(req.user.tokenType) ||
      !req.user.shopId
    ) {
      return forbidden(res, "Shop user access required");
    }
    try {
      if (req.user.tokenType === "SUPPORT_SESSION") {
        const session = await prisma.supportSession.findFirst({
          where: {
            id: req.user.supportSessionId,
            shopId: req.user.shopId,
            endedAt: null,
            expiresAt: { gt: new Date() },
          },
        });
        if (!session) return unauthorized(res, "Support session has expired");
        req.user.role = "OWNER";
        req.user.isSupport = true;
        return next();
      }
      const user = await prisma.user.findFirst({
        where: { id: req.user.userId, shopId: req.user.shopId, status: true },
        include: {
          shop: {
            include: {
              subscriptions: {
                where: { active: true },
                orderBy: { expiryDate: "desc" },
                take: 1,
              },
            },
          },
        },
      });
      const subscription = user?.shop.subscriptions[0];
      if (!user || !user.shop.status)
        return forbidden(res, "Shop account is inactive");
      const settings = await prisma.platformSetting.findUnique({
        where: { id: 1 },
      });
      const accessUntil = subscription
        ? new Date(subscription.expiryDate)
        : null;
      if (accessUntil)
        accessUntil.setDate(
          accessUntil.getDate() + Number(settings?.gracePeriodDays || 0),
        );
      if (
        !subscription ||
        !["TRIAL", "ACTIVE"].includes(subscription.status) ||
        (settings?.autoExpire !== false && accessUntil <= new Date())
      ) {
        return forbidden(res, "Shop subscription is inactive or expired");
      }
      req.user.role = user.role;
      return next();
    } catch (error) {
      return next(error);
    }
  });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return forbidden(
        res,
        "You do not have permission to perform this action",
      );
    }
    return next();
  };
}

export function requirePermission(module, action) {
  const fieldByAction = {
    view: "canView",
    create: "canCreate",
    edit: "canEdit",
    delete: "canDelete",
  };
  const permissionField = fieldByAction[action];

  if (!permissionField) throw new Error(`Unknown permission action: ${action}`);

  return async (req, res, next) => {
    try {
      if (req.user?.role === "OWNER") return next();
      if (!req.user?.userId || !req.user?.shopId) return forbidden(res);

      const permission = await prisma.userPermission.findFirst({
        where: {
          userId: req.user.userId,
          shopId: req.user.shopId,
          module,
        },
        select: { [permissionField]: true },
      });

      if (!permission?.[permissionField]) {
        return forbidden(res, `Missing ${action} permission for ${module}`);
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
