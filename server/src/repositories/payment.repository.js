import prisma from "../config/prisma.js";
export const findPayments = (shopId, invoiceId) => prisma.payment.findMany({ where: { shopId, ...(invoiceId ? { invoiceId: Number(invoiceId) } : {}) }, include: { invoice: { select: { id:true,invoiceCode:true,grandTotal:true,received:true,balance:true,customer:{select:{name:true,mobile:true}} } }, createdBy: { select:{id:true,name:true} } }, orderBy:{paidAt:"desc"} });
export const findPayment = (shopId,id) => prisma.payment.findFirst({where:{shopId,id:Number(id)},include:{invoice:{include:{customer:true}},shop:true,createdBy:{select:{name:true}}}});
export const findInvoice = (shopId,id,tx=prisma) => tx.invoice.findFirst({where:{shopId,id:Number(id)}});
export const transaction = (callback) => prisma.$transaction(callback,{isolationLevel:"Serializable"});
