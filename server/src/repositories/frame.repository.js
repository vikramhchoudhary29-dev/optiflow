import prisma from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Count
|--------------------------------------------------------------------------
*/

export async function countFrames(shopId) {
  return prisma.frame.count({
    where: {
      shopId,
    },
  });
}

/*
|--------------------------------------------------------------------------
| Find by Code
|--------------------------------------------------------------------------
*/

export async function findFrameByCode(shopId, frameCode) {
  return prisma.frame.findFirst({
    where: {
      shopId,
      frameCode,
    },
  });
}

export async function findFrameByBarcode(shopId, barcode) {
  if (!barcode) return null;

  return prisma.frame.findFirst({
    where: {
      shopId,
      barcode,
    },
  });
}

/*
|--------------------------------------------------------------------------
| Find by ID
|--------------------------------------------------------------------------
*/

export async function findFrameById(shopId, id) {
  return prisma.frame.findFirst({
    where: {
      id,
      shopId,
    },
  });
}

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export async function findAllFrames(shopId, search = "") {
  return prisma.frame.findMany({
    where: {
      shopId,
      active: true,

      OR: [
        {
          frameCode: {
            contains: search,
          },
        },
        {
          brand: {
            contains: search,
          },
        },
        {
          model: {
            contains: search,
          },
        },
      ],
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export async function createFrame(data) {
  return prisma.frame.create({
    data,
  });
}

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export async function updateFrame(id, data) {
  return prisma.frame.update({
    where: {
      id,
    },
    data,
  });
}

/*
|--------------------------------------------------------------------------
| Toggle Status
|--------------------------------------------------------------------------
*/

export async function toggleFrameStatus(id, active) {
  return prisma.frame.update({
    where: {
      id,
    },
    data: {
      active,
    },
  });
}

export { prisma };