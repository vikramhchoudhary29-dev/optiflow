import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import * as service from "../services/excel-import.service.js";

const handler = (importer) => asyncHandler(async (req, res) => {
  if (!req.file?.buffer) throw new AppError("Choose an .xlsx file to import", 400);
  const result = await importer(req.user.shopId, req.user.userId, req.file.buffer);
  res.status(201).json({ success: true, message: `${result.imported} records imported successfully`, data: result, errors: null });
});

export const customers = handler((shopId, _userId, buffer) => service.importCustomers(shopId, buffer));
export const products = handler(service.importProducts);
export const suppliers = handler((shopId, _userId, buffer) => service.importSuppliers(shopId, buffer));
