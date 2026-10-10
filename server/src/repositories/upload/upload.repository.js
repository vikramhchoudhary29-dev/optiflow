import prisma from "../../config/prisma.js";

/* ============================================================
   GET CURRENT LOGO
============================================================ */

export async function findCurrentLogo(shopId) {
  return prisma.setting.findUnique({
    where: {
      shopId,
    },
    select: {
      logoUrl: true,
    },
  });
}

/* ============================================================
   UPDATE LOGO
============================================================ */

export async function updateLogo(shopId, logoUrl) {
  return prisma.setting.update({
    where: {
      shopId,
    },
    data: {
      logoUrl,
    },
  });
}