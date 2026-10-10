import AppError from "../utils/AppError.js";
import { findCustomerById } from "../repositories/customer.repository.js";
import { updateCustomer } from "../repositories/customer.repository.js";
import { updateCustomerStatus } from "../repositories/customer.repository.js";


import prisma from "../config/prisma.js";
import { generateCustomerCode } from "../utils/codeGenerator.js";
import { getCustomer360 } from "../repositories/crm.repository.js";





export async function createCustomerService(shopId, data) {
  return prisma.$transaction(async (tx) => {
    const exists = await tx.customer.findFirst({
      where: {
        shopId,
        mobile: data.mobile,
      },
    });

    if (exists) {
      throw new AppError("Customer mobile already exists", 409);
    }

    const customerCode = await generateCustomerCode(tx, shopId);

    return tx.customer.create({
      data: {
        ...data,
        shopId,
        customerCode,
        dob: data.dob ? new Date(data.dob) : null,
      },
    });
  });
}
import { findCustomers } from "../repositories/customer.repository.js";

export async function getCustomersService(
  shopId,
  search = "",
  active
) {
  return findCustomers(shopId, search, active);
}
export async function getCustomerByIdService(shopId, id) {
  const customer = await findCustomerById(shopId, id);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
}
export async function updateCustomerService(shopId, id, data) {

  const customer = await findCustomerById(shopId, id);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return updateCustomer(id, {
    ...data,
    dob: data.dob ? new Date(data.dob) : null,
  });
}
export async function updateCustomerStatusService(shopId, id, active) {

  const customer = await findCustomerById(shopId, id);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return updateCustomerStatus(id, active);
}
export async function getCustomerProfileService(shopId, id) {
  const customer = await getCustomer360(shopId, Number(id));
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}
