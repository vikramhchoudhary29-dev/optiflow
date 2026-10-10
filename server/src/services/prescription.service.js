import AppError from "../utils/AppError.js";
import { findPrescriptions } from "../repositories/prescription.repository.js";
import { findPrescriptionById } from "../repositories/prescription.repository.js";
import { updatePrescription } from "../repositories/prescription.repository.js";
import { updatePrescriptionStatus } from "../repositories/prescription.repository.js";
import { findCustomerPrescriptionHistory } from "../repositories/prescription.repository.js";
import { findPrescriptionsByIds } from "../repositories/prescription.repository.js";
import { deletePrescription } from "../repositories/prescription.repository.js";

import prisma from "../config/prisma.js";
import { generatePrescriptionCode } from "../utils/codeGenerator.js";


export async function createPrescriptionService(shopId, data) {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findFirst({
      where: {
        id: data.customerId,
        shopId,
      },
    });

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    const prescriptionCode = await generatePrescriptionCode(
      tx,
      shopId
    );

    return tx.prescription.create({
      data: {
        customerId: data.customerId,
        shopId,

        prescriptionCode,

        rightSph: data.rightSph?.toString(),
        rightCyl: data.rightCyl?.toString(),
        rightAxis: data.rightAxis,
        rightAdd: data.rightAdd?.toString(),

        leftSph: data.leftSph?.toString(),
        leftCyl: data.leftCyl?.toString(),
        leftAxis: data.leftAxis,
        leftAdd: data.leftAdd?.toString(),

        pdDistance: data.pdDistance?.toString(),
        pdNear: data.pdNear?.toString(),

        lensType: data.lensType,
        lens: data.lens,
        frame: data.frame,

        contactLensBrand: data.contactLensBrand,
        contactLensType: data.contactLensType,

        rightBc: data.rightBc?.toString(),
        rightDia: data.rightDia?.toString(),
        rightPower: data.rightPower?.toString(),

        leftBc: data.leftBc?.toString(),
        leftDia: data.leftDia?.toString(),
        leftPower: data.leftPower?.toString(),

        doctorName: data.doctorName,
        doctorNotes: data.doctorNotes,

        expiryDate: data.expiryDate
          ? new Date(data.expiryDate)
          : null,
      },
    });
  });
}

export async function getPrescriptionsService(shopId, search = "") {
  return await findPrescriptions(shopId, search);
}

export async function getPrescriptionByIdService(shopId, id) {
  const prescription = await findPrescriptionById(shopId, id);

  if (!prescription) {
    throw new AppError("Prescription not found", 404);
  }

  return prescription;
}
export async function updatePrescriptionService(shopId, id, data) {

  const prescription = await findPrescriptionById(shopId, id);

  if (!prescription) {
    throw new AppError("Prescription not found", 404);
  }

  await updatePrescription(id, shopId, {
    rightSph: data.rightSph?.toString(),
    rightCyl: data.rightCyl?.toString(),
    rightAxis: data.rightAxis,
    rightAdd: data.rightAdd?.toString(),

    leftSph: data.leftSph?.toString(),
    leftCyl: data.leftCyl?.toString(),
    leftAxis: data.leftAxis,
    leftAdd: data.leftAdd?.toString(),

    pdDistance: data.pdDistance?.toString(),
    pdNear: data.pdNear?.toString(),

    lensType: data.lensType,
    lens: data.lens,
    frame: data.frame,

    contactLensBrand: data.contactLensBrand,
    contactLensType: data.contactLensType,

    rightBc: data.rightBc?.toString(),
    rightDia: data.rightDia?.toString(),
    rightPower: data.rightPower?.toString(),

    leftBc: data.leftBc?.toString(),
    leftDia: data.leftDia?.toString(),
    leftPower: data.leftPower?.toString(),

    doctorName: data.doctorName,
    doctorNotes: data.doctorNotes,

    expiryDate: data.expiryDate
      ? new Date(data.expiryDate)
      : null,
  });

  return await findPrescriptionById(shopId, id);
}
export async function updatePrescriptionStatusService(shopId, id) {
  const prescription = await findPrescriptionById(shopId, id);

  if (!prescription) {
    throw new AppError("Prescription not found", 404);
  }

  const newStatus =
    prescription.status === "ACTIVE"
      ? "ARCHIVED"
      : "ACTIVE";

  await updatePrescriptionStatus(id, shopId, newStatus);

  return await findPrescriptionById(shopId, id);
}
export async function getCustomerPrescriptionHistoryService(
  shopId,
  customerId
) {
  return await findCustomerPrescriptionHistory(
    shopId,
    customerId
  );
}
export async function getPrescriptionsByIdsService(shopId, ids) {
  if (!Array.isArray(ids) || !ids.length) throw new AppError("Select at least one prescription", 400);
  if (ids.length > 500) throw new AppError("A maximum of 500 prescriptions can be printed at once", 400);
  const prescriptions = await findPrescriptionsByIds(shopId, ids);
  if (!prescriptions.length) throw new AppError("No prescriptions found", 404);
  return prescriptions;
}
export async function deletePrescriptionService(shopId,id){const prescription=await findPrescriptionById(shopId,id);if(!prescription)throw new AppError("Prescription not found",404);await deletePrescription(shopId,id);}
