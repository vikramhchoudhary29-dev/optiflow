import prisma from "../config/prisma.js";
const select={id:true,shopId:true,name:true,loginId:true,mobile:true,email:true,role:true,status:true,createdAt:true,updatedAt:true,permissions:true};
export const findUsers=(shopId)=>prisma.user.findMany({where:{shopId},select,orderBy:{name:"asc"}});
export const findUser=(shopId,id)=>prisma.user.findFirst({where:{shopId,id:Number(id)},select});
export const findByEmail=(email)=>email?prisma.user.findUnique({where:{email}}):null;
export const findByMobile=(mobile)=>prisma.user.findUnique({where:{mobile}});
export const findByLoginId=(loginId)=>loginId?prisma.user.findUnique({where:{loginId}}):null;
export const createUser=(shopId,data)=>prisma.user.create({data:{shopId,role:"STAFF",...data},select});
export const updateUser=(id,data)=>prisma.user.update({where:{id:Number(id)},data,select});
export const deleteUser=(id)=>prisma.user.delete({where:{id:Number(id)}});
export const transaction=(callback)=>prisma.$transaction(callback);
export async function getUserActivity(shopId,userId){
  const id=Number(userId);
  const [invoiceSummary,paymentSummary,invoices]=await Promise.all([
    prisma.invoice.aggregate({where:{shopId,createdById:id,deliveryStatus:{not:"CANCELLED"}},_count:{_all:true},_sum:{grandTotal:true}}),
    prisma.payment.aggregate({where:{shopId,createdById:id},_sum:{amount:true}}),
    prisma.invoice.findMany({where:{shopId,createdById:id},select:{id:true,invoiceCode:true,invoiceDate:true,grandTotal:true,received:true,balance:true,paymentStatus:true,deliveryStatus:true,customer:{select:{name:true,mobile:true}}},orderBy:{createdAt:"desc"}}),
  ]);
  return{invoiceCount:invoiceSummary._count._all,billedTotal:Number(invoiceSummary._sum.grandTotal||0),collectedTotal:Number(paymentSummary._sum.amount||0),invoices};
}
