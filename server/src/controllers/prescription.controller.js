import asyncHandler from "../utils/asyncHandler.js";
import generatePrescriptionA4, { generateBulkPrescriptionA4 } from "../pdf/prescriptionA4.js";

import {
  createPrescriptionService,
  getPrescriptionsService,
  getPrescriptionByIdService,
    updatePrescriptionService,
    updatePrescriptionStatusService,
    getCustomerPrescriptionHistoryService,
    getPrescriptionsByIdsService,
    deletePrescriptionService,
} from "../services/prescription.service.js";

export const createPrescriptionController = asyncHandler(async (req, res) => {
  const prescription = await createPrescriptionService(
    req.user.shopId,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    data: prescription,
    errors: null,
  });
});

export const getPrescriptionsController = asyncHandler(async (req, res) => {
  const search = req.query.search || "";

  const prescriptions = await getPrescriptionsService(
    req.user.shopId,
    search
  );

  res.json({
    success: true,
    message: "Prescriptions fetched successfully",
    data: prescriptions,
    errors: null,
  });
});
export const getPrescriptionByIdController = asyncHandler(async (req, res) => {
  const prescription = await getPrescriptionByIdService(
    req.user.shopId,
    req.params.id
  );

  res.json({
    success: true,
    message: "Prescription fetched successfully",
    data: prescription,
    errors: null,
  });
});
export const printPrescriptionA4Controller = asyncHandler(async (req, res) => {
  const prescription = await getPrescriptionByIdService(req.user.shopId, req.params.id);
  generatePrescriptionA4(res, prescription);
});
export const printBulkPrescriptionsA4Controller = asyncHandler(async (req, res) => {
  const prescriptions = await getPrescriptionsByIdsService(req.user.shopId, req.body.ids);
  generateBulkPrescriptionA4(res, prescriptions);
});
export const deletePrescriptionController=asyncHandler(async(req,res)=>{await deletePrescriptionService(req.user.shopId,req.params.id);res.json({success:true,message:"Prescription deleted successfully",data:null,errors:null});});
export const updatePrescriptionController = asyncHandler(async (req, res) => {

  const prescription = await updatePrescriptionService(
    req.user.shopId,
    req.params.id,
    req.body
  );

  res.json({
    success: true,
    message: "Prescription updated successfully",
    data: prescription,
    errors: null,
  });

});
export const updatePrescriptionStatusController = asyncHandler(async (req, res) => {
  const prescription = await updatePrescriptionStatusService(
    req.user.shopId,
    req.params.id
  );

  res.json({
    success: true,
    message: "Prescription status updated successfully",
    data: prescription,
    errors: null,
  });
});
export const getCustomerPrescriptionHistoryController =
  asyncHandler(async (req, res) => {

    const history =
      await getCustomerPrescriptionHistoryService(
        req.user.shopId,
        req.params.customerId
      );

    res.json({
      success: true,
      message: "Prescription history fetched successfully",
      data: history,
      errors: null,
    });

  });
