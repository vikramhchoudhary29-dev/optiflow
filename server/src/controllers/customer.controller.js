import asyncHandler from "../utils/asyncHandler.js";
import { createCustomerService } from "../services/customer.service.js";
import { getCustomersService } from "../services/customer.service.js";
import { getCustomerByIdService } from "../services/customer.service.js";
import { updateCustomerService } from "../services/customer.service.js";
import { updateCustomerStatusService, getCustomerProfileService } from "../services/customer.service.js";



export const createCustomerController = asyncHandler(async (req, res) => {
  const customer = await createCustomerService(req.user.shopId, req.body);

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
    errors: null,
  });
});

export const getCustomersController = asyncHandler(async (req, res) => {
  const search = req.query.search || "";

  const active =
    req.query.active === undefined
      ? undefined
      : req.query.active === "true";

  const customers = await getCustomersService(
    req.user.shopId,
    search,
    active
  );

  res.json({
    success: true,
    message: "Customers fetched successfully",
    data: customers,
    errors: null,
  });
});
export const getCustomerByIdController = asyncHandler(async (req, res) => {
  const customer = await getCustomerByIdService(
    req.user.shopId,
    req.params.id
  );

  res.json({
    success: true,
    message: "Customer fetched successfully",
    data: customer,
    errors: null,
  });
});
export const updateCustomerController = asyncHandler(async (req, res) => {

  const customer = await updateCustomerService(
    req.user.shopId,
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
    errors: null,
  });

});
export const updateCustomerStatusController = asyncHandler(async (req, res) => {

  const customer = await updateCustomerStatusService(
    req.user.shopId,
    req.params.id,
    req.body.active
  );

  res.json({
    success: true,
    message: "Customer status updated successfully",
    data: customer,
    errors: null,
  });

});
export const getCustomerProfileController = asyncHandler(async (req, res) => {
  const customer = await getCustomerProfileService(req.user.shopId, req.params.id);
  res.json({ success: true, message: "Customer profile fetched successfully", data: customer, errors: null });
});
