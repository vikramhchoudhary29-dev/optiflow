import AppError from "../utils/AppError.js";

import {
  prisma,
  findLensByCode,
  findAllLenses,
  findLensById,
  updateLens,
} from "../repositories/lens.repository.js";

/* ============================================================
   CREATE
============================================================ */

export async function createLensService(shopId, data) {
  const codeExists = await findLensByCode(
    shopId,
    data.lensCode
  );

  if (codeExists) {
    throw new AppError(
      "Lens code already exists",
      400
    );
  }

  return prisma.lens.create({
    data: {
      shopId,

      lensCode: data.lensCode,

      lensName: data.lensName,

      purchasePrice: data.purchasePrice,

      sellingPrice: data.sellingPrice,
    },
  });
}

/* ============================================================
   LIST
============================================================ */

export async function getAllLensesService(shopId, search) {
  return findAllLenses(shopId, search);
}

/* ============================================================
   GET BY ID
============================================================ */

export async function getLensByIdService(shopId, id) {
  const lens = await findLensById(shopId, id);

  if (!lens) {
    throw new AppError(
      "Lens not found",
      404
    );
  }

  return lens;
}

/* ============================================================
   UPDATE
============================================================ */

export async function updateLensService(
  shopId,
  id,
  data
) {
  const lens = await findLensById(shopId, id);

  if (!lens) {
    throw new AppError(
      "Lens not found",
      404
    );
  }

  if (data.lensCode !== lens.lensCode) {
    const codeExists = await findLensByCode(
      shopId,
      data.lensCode
    );

    if (codeExists) {
      throw new AppError(
        "Lens code already exists",
        400
      );
    }
  }

  return updateLens(id, {
    lensCode: data.lensCode,

    lensName: data.lensName,

    purchasePrice: data.purchasePrice,

    sellingPrice: data.sellingPrice,
  });
}

/* ============================================================
   ACTIVATE / DEACTIVATE
============================================================ */

export async function toggleLensStatusService(
  shopId,
  id
) {
  const lens = await findLensById(shopId, id);

  if (!lens) {
    throw new AppError(
      "Lens not found",
      404
    );
  }

  return updateLens(id, {
    active: !lens.active,
  });
}