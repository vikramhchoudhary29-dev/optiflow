import prisma from "../config/prisma.js";

export async function countPrescriptions(shopId) {
  return prisma.prescription.count({
    where: {
      shopId,
    },
  });
}

export async function findCustomer(shopId, customerId) {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      shopId,
      active: true,
    },
  });
}

export async function createPrescription(data) {
  return prisma.prescription.create({
    data,
  });
}
export async function findPrescriptions(shopId, search = "") {
  return prisma.prescription.findMany({
    where: {
      shopId,
      OR: [
        {
          prescriptionCode: {
            contains: search,
          },
        },
        {
          customer: {
            name: {
              contains: search,
            },
          },
        },
      ],
    },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          name: true,
          mobile: true,
        },
      },
      invoice: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          invoiceCode: true,
          invoiceitem: { select: { itemName: true, itemType: true, product: { select: { category: { select: { name: true } } } } } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function findPrescriptionById(shopId, id) {
  return prisma.prescription.findFirst({
    where: {
      id: Number(id),
      shopId,
    },
    include: {
      customer: {
        select: {
          id: true,
          customerCode: true,
          name: true,
          mobile: true,
          email: true,
        },
      },
      shop: { include: { setting: true } },
      invoice: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          invoiceCode: true,
          invoiceitem: { select: { itemName: true, itemType: true, product: { select: { category: { select: { name: true } } } } } },
        },
      },
    },
  });
}
export async function updatePrescription(id, shopId, data) {
  return prisma.prescription.updateMany({
    where: {
      id: Number(id),
      shopId,
    },
    data,
  });
}
export async function updatePrescriptionStatus(id, shopId, status) {
  return prisma.prescription.updateMany({
    where: {
      id: Number(id),
      shopId,
    },
    data: {
      status,
    },
  });
}

export async function findCustomerPrescriptionHistory(shopId, customerId) {
  return prisma.prescription.findMany({
    where: {
      shopId,
      customerId: Number(customerId),
    },
    orderBy: {
      prescriptionDate: "desc",
    },
    select: {
      id: true,
      prescriptionCode: true,
      prescriptionDate: true,
      expiryDate: true,

      lensType: true,
      lens: true,
      frame: true,

      doctorName: true,

      status: true,
    },
  });
}
export async function deletePrescription(shopId,id){return prisma.$transaction(async(tx)=>{await tx.invoice.updateMany({where:{shopId,prescriptionId:Number(id)},data:{prescriptionId:null}});return tx.prescription.deleteMany({where:{shopId,id:Number(id)}});});}

export async function findPrescriptionsByIds(shopId, ids) {
  return prisma.prescription.findMany({
    where: { shopId, id: { in: ids.map(Number) } },
    include: {
      customer: { select: { id: true, customerCode: true, name: true, mobile: true, email: true } },
      shop: { include: { setting: true } },
      invoice: { take: 1, orderBy: { createdAt: "desc" }, select: { invoiceCode: true, invoiceitem: { select: { itemName: true, itemType: true, product: { select: { category: { select: { name: true } } } } } } } },
    },
    orderBy: { prescriptionDate: "desc" },
  });
}
