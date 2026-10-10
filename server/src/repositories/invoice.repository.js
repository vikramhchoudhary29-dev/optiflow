import prisma from "../config/prisma.js";
export { prisma };
export const findCustomer = (shopId,id,tx=prisma) => tx.customer.findFirst({where:{id:Number(id),shopId,active:true}});
export const findPrescription = (shopId,id,tx=prisma) => !id ? null : tx.prescription.findFirst({where:{id:Number(id),shopId}});
export const findProducts = (shopId,ids,tx=prisma) => tx.product.findMany({where:{shopId,id:{in:ids},active:true},include:{category:true}});
export const findInvoice = (shopId,id,tx=prisma) => tx.invoice.findFirst({where:{id:Number(id),shopId}});
export const findShopById = (shopId) => prisma.shop.findUnique({where:{id:shopId},include:{setting:true}});
export function getInvoices(shopId,search="") { return prisma.invoice.findMany({where:{shopId,OR:[{invoiceCode:{contains:search}},{customer:{name:{contains:search}}}]},include:{customer:{select:{id:true,name:true,mobile:true}},payments:true},orderBy:{createdAt:"desc"}}); }
export const getInvoiceById = (shopId,id) => prisma.invoice.findFirst({where:{id:Number(id),shopId},include:{customer:true,prescription:true,payments:{orderBy:{paidAt:"desc"}},invoiceitem:{include:{product:{include:{category:true}},frame:true,lens:true}}}});
export const getInvoiceForPrint = (shopId,id) => prisma.invoice.findFirst({where:{id:Number(id),shopId},include:{customer:true,prescription:true,shop:{include:{setting:true}},payments:true,invoiceitem:{include:{product:{include:{category:true}},frame:true,lens:true}}}});
export const updatePayment = (id,data) => prisma.invoice.update({where:{id:Number(id)},data});
export const updateInvoice=(id,data)=>prisma.invoice.update({where:{id:Number(id)},data});
