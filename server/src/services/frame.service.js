import AppError from "../utils/AppError.js";

import {
  countFrames,
  findFrameByCode,
  findFrameByBarcode,
  createFrame,
  findAllFrames,
  findFrameById,
  updateFrame,
  toggleFrameStatus,
} from "../repositories/frame.repository.js";

/* ============================================================
   CREATE
============================================================ */

export async function createFrameService(shopId, data) {
  // Check duplicate frame code
  const existingCode = await findFrameByCode(
    shopId,
    data.frameCode
  );

  if (existingCode) {
    throw new AppError("Frame code already exists", 409);
  }

  // Check duplicate barcode (if provided)
  if (data.barcode) {
    const existingBarcode = await findFrameByBarcode(
      shopId,
      data.barcode
    );

    if (existingBarcode) {
      throw new AppError("Barcode already exists", 409);
    }
  }

  return await createFrame({
    shopId,

    frameCode: data.frameCode,

    brand: data.brand,
    model: data.model,

    color: data.color,
    size: data.size,
    shape: data.shape,
    material: data.material,

    barcode: data.barcode,

    purchasePrice: data.purchasePrice.toString(),
    sellingPrice: data.sellingPrice.toString(),

    stock: Number(data.stock),
    minimumStock: Number(data.minimumStock),
  });
}

/* ============================================================
   LIST
============================================================ */

export async function getAllFramesService(
  shopId,
  search = ""
) {
  return await findAllFrames(shopId, search);
}

/* ============================================================
   DETAILS
============================================================ */

export async function getFrameByIdService(
  shopId,
  id
) {
  const frame = await findFrameById(shopId, id);

  if (!frame) {
    throw new AppError("Frame not found", 404);
  }

  return frame;
}

/* ============================================================
   UPDATE
============================================================ */

export async function updateFrameService(
  shopId,
  id,
  data
) {
  const frame = await findFrameById(shopId, id);

  if (!frame) {
    throw new AppError("Frame not found", 404);
  }

  // Frame Code Validation
  if (
    data.frameCode &&
    data.frameCode !== frame.frameCode
  ) {
    const existingCode = await findFrameByCode(
      shopId,
      data.frameCode
    );

    if (existingCode) {
      throw new AppError(
        "Frame code already exists",
        409
      );
    }
  }

  // Barcode Validation
  if (
    data.barcode &&
    data.barcode !== frame.barcode
  ) {
    const existingBarcode =
      await findFrameByBarcode(
        shopId,
        data.barcode
      );

    if (existingBarcode) {
      throw new AppError(
        "Barcode already exists",
        409
      );
    }
  }

  await updateFrame(id, {
    frameCode: data.frameCode,

    brand: data.brand,
    model: data.model,

    color: data.color,
    size: data.size,
    shape: data.shape,
    material: data.material,

    barcode: data.barcode,

    purchasePrice: data.purchasePrice.toString(),
    sellingPrice: data.sellingPrice.toString(),

    stock: Number(data.stock),
    minimumStock: Number(data.minimumStock),
  });

  return await findFrameById(shopId, id);
}

/* ============================================================
   STATUS
============================================================ */

export async function toggleFrameStatusService(
  shopId,
  id
) {
  const frame = await findFrameById(shopId, id);

  if (!frame) {
    throw new AppError("Frame not found", 404);
  }

  await toggleFrameStatus(
    id,
    !frame.active
  );

  return await findFrameById(shopId, id);
}