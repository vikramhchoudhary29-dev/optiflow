import prisma from "../config/prisma.js";

/* ============================================================
   CREATE
============================================================ */

export async function countLenses(shopId) {
  return prisma.lens.count({
    where: {
      shopId,
    },
  });
}

export async function findLensByCode(shopId, lensCode) {
  return prisma.lens.findFirst({
    where: {
      shopId,
      lensCode,
    },
  });
}

export async function findLensByName(shopId, lensName) {
  return prisma.lens.findFirst({
    where: {
      shopId,
      lensName,
    },
  });
}

/* ============================================================
   LIST
============================================================ */

export async function findAllLenses(shopId, search = "") {
  return prisma.lens.findMany({
    where: {
      shopId,
      active: true,

      ...(search && {
        OR: [
          {
            lensCode: {
              contains: search,
            },
          },
          {
            lensName: {
              contains: search,
            },
          },
        ],
      }),
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/* ============================================================
   GET BY ID
============================================================ */

export async function findLensById(shopId, id) {
  return prisma.lens.findFirst({
    where: {
      id: Number(id),
      shopId,
    },
  });
}

/* ============================================================
   UPDATE
============================================================ */

export async function updateLens(id, data) {
  return prisma.lens.update({
    where: {
      id: Number(id),
    },
    data,
  });
}

export { prisma };