import AppError from "../utils/AppError.js";
import { generateInvoiceCode, generatePrescriptionCode } from "../utils/codeGenerator.js";
import * as repo from "../repositories/invoice.repository.js";
import { applyRedemption, awardPoints, calculateRedemption, getSetting, reverseInvoiceLoyalty } from "./loyalty.service.js";

function itemType(name){const value=name.toUpperCase();return value.includes("FRAME")?"FRAME":value.includes("LENS")?"LENS":"ACCESSORY";}
function prescriptionData(data){return Object.fromEntries(Object.entries(data||{}).filter(([,value])=>value!==""&&value!==undefined&&value!==null));}
async function prepareLines(tx,shopId,items){
  const ids=[...new Set(items.map(item=>item.productId))];
  const products=await repo.findProducts(shopId,ids,tx);
  if(products.length!==ids.length)throw new AppError("One or more products were not found in this shop",404);
  const byId=new Map(products.map(product=>[product.id,product]));
  return items.map(item=>{const product=byId.get(item.productId);const price=item.price??Number(product.sellingPrice);const total=price*item.quantity-item.discount;if(total<0)throw new AppError(`Discount exceeds line total for ${product.name}`,400);return{productId:product.id,itemType:itemType(product.category.name),itemCode:product.sku,itemName:product.name,quantity:item.quantity,price,discount:item.discount,total};});
}
async function savePrescription(tx,shopId,customerId,data,existingId){
  const values=prescriptionData(data); if(!Object.keys(values).length)return null;
  if(existingId){const current=await tx.prescription.findFirst({where:{id:existingId,shopId,customerId}});if(current)return tx.prescription.update({where:{id:current.id},data:values});}
  return tx.prescription.create({data:{shopId,customerId,prescriptionCode:await generatePrescriptionCode(tx,shopId),...values}});
}
async function changeStock(tx,shopId,userId,invoiceId,lines,direction){
  for(const line of lines){
    if(direction<0){const changed=await tx.product.updateMany({where:{id:line.productId,shopId,stock:{gte:line.quantity}},data:{stock:{decrement:line.quantity}}});if(changed.count!==1)throw new AppError(`Insufficient stock for ${line.itemName}`,400);}
    else await tx.product.update({where:{id:line.productId},data:{stock:{increment:line.quantity}}});
  }
  if(direction>0){await tx.stockMovement.deleteMany({where:{shopId,referenceType:"INVOICE",referenceId:invoiceId,type:"SALE"}});return;}
  for(const line of lines)await tx.stockMovement.create({data:{shopId,productId:line.productId,type:"SALE",quantity:line.quantity,referenceType:"INVOICE",referenceId:invoiceId,createdById:userId}});
}
export async function createInvoiceService(shopId,userId,data){return repo.prisma.$transaction(async tx=>{
  if(!await repo.findCustomer(shopId,data.customerId,tx))throw new AppError("Customer not found",404);
  const lines=await prepareLines(tx,shopId,data.items);const subTotal=lines.reduce((sum,line)=>sum+line.total,0);const beforeLoyalty=subTotal-data.discount+data.gst;
  if(beforeLoyalty<0)throw new AppError("Discount exceeds invoice total",400);
  const setting=await tx.loyaltySetting.upsert({where:{shopId},create:{shopId},update:{}});
  const quote=await calculateRedemption(tx,{shopId,customerId:data.customerId,requestedPoints:data.loyaltyPointsToRedeem,invoiceValue:beforeLoyalty,setting});
  const grandTotal=beforeLoyalty-quote.discount;if(data.amountPaid>grandTotal)throw new AppError("Received amount exceeds invoice total",400);
  const prescription=await savePrescription(tx,shopId,data.customerId,data.prescription);
  const balance=grandTotal-data.amountPaid,paymentStatus=data.amountPaid===0?"PENDING":balance===0?"PAID":"PARTIAL";
  const invoice=await tx.invoice.create({data:{shopId,customerId:data.customerId,prescriptionId:prescription?.id||null,createdById:userId,invoiceCode:await generateInvoiceCode(tx,shopId),invoiceDate:data.invoiceDate||new Date(),deliveryDate:data.deliveryDate||null,subTotal,discount:data.discount,gst:data.gst,grandTotal,loyaltyPointsRedeemed:quote.points,loyaltyDiscount:quote.discount,advance:data.amountPaid,received:data.amountPaid,balance,paymentStatus,paymentMethod:data.paymentMethod||null,remarks:data.remarks,invoiceitem:{create:lines},...(data.amountPaid>0?{payments:{create:{shopId,amount:data.amountPaid,method:data.paymentMethod,createdById:userId}}}:{})}});
  await changeStock(tx,shopId,userId,invoice.id,lines,-1);
  await applyRedemption(tx,{shopId,customerId:data.customerId,invoiceId:invoice.id,requestedPoints:quote.points,invoiceValue:beforeLoyalty,setting});
  const earned=await awardPoints(tx,{shopId,customerId:data.customerId,invoiceId:invoice.id,invoiceValue:grandTotal,setting});
  await tx.invoice.update({where:{id:invoice.id},data:{loyaltyPointsEarned:earned}});
  return tx.invoice.findUnique({where:{id:invoice.id},include:{customer:true,prescription:true,invoiceitem:{include:{product:true}},payments:true}});
},{isolationLevel:"Serializable"});}

export async function updateInvoiceService(shopId,userId,id,data){return repo.prisma.$transaction(async tx=>{
  const old=await tx.invoice.findFirst({where:{id:Number(id),shopId},include:{invoiceitem:true,payments:{orderBy:[{paidAt:"asc"},{createdAt:"asc"}]}}});if(!old)throw new AppError("Invoice not found",404);
  if(!await repo.findCustomer(shopId,data.customerId,tx))throw new AppError("Customer not found",404);
  await reverseInvoiceLoyalty(tx,old.id);await changeStock(tx,shopId,userId,old.id,old.invoiceitem,1);
  const lines=await prepareLines(tx,shopId,data.items),subTotal=lines.reduce((sum,line)=>sum+line.total,0),beforeLoyalty=subTotal-data.discount+data.gst;
  const setting=await tx.loyaltySetting.upsert({where:{shopId},create:{shopId},update:{}}),quote=await calculateRedemption(tx,{shopId,customerId:data.customerId,requestedPoints:data.loyaltyPointsToRedeem,invoiceValue:beforeLoyalty,setting});
  const grandTotal=beforeLoyalty-quote.discount;
  const requestedAdvance = data.amountPaid === undefined ? Number(old.advance) : Number(data.amountPaid);
  if (!Number.isFinite(requestedAdvance) || requestedAdvance < 0) throw new AppError("Advance payment must be zero or more",400);
  const advancePayment = Number(old.advance) > 0 ? (old.payments[0] || null) : null;
  const otherPayments = old.payments.filter((payment) => !advancePayment || payment.id !== advancePayment.id).reduce((sum,payment)=>sum+Number(payment.amount),0);
  const received = requestedAdvance + otherPayments;
  if (grandTotal < received) throw new AppError("Invoice total cannot be less than payments already received",400);
  if (requestedAdvance > 0 && !data.paymentMethod && !old.paymentMethod) throw new AppError("Payment method is required for advance payment",400);
  const prescription=await savePrescription(tx,shopId,data.customerId,data.prescription,old.prescriptionId);
  await tx.invoiceitem.deleteMany({where:{invoiceId:old.id}});
  await tx.invoice.update({where:{id:old.id},data:{customerId:data.customerId,prescriptionId:prescription?.id||null,invoiceDate:data.invoiceDate||old.invoiceDate,deliveryDate:data.deliveryDate||null,subTotal,discount:data.discount,gst:data.gst,grandTotal,advance:requestedAdvance,received,balance:grandTotal-received,paymentStatus:received===0?"PENDING":grandTotal===received?"PAID":"PARTIAL",paymentMethod:data.paymentMethod||old.paymentMethod,loyaltyPointsRedeemed:quote.points,loyaltyDiscount:quote.discount,remarks:data.remarks,invoiceitem:{create:lines}}});
  if (advancePayment) {
    if (requestedAdvance > 0) await tx.payment.update({where:{id:advancePayment.id},data:{amount:requestedAdvance,method:data.paymentMethod||advancePayment.method}});
    else await tx.payment.delete({where:{id:advancePayment.id}});
  } else if (requestedAdvance > 0) {
    await tx.payment.create({data:{shopId,invoiceId:old.id,amount:requestedAdvance,method:data.paymentMethod||old.paymentMethod||"CASH",createdById:userId}});
  }
  await changeStock(tx,shopId,userId,old.id,lines,-1);await applyRedemption(tx,{shopId,customerId:data.customerId,invoiceId:old.id,requestedPoints:quote.points,invoiceValue:beforeLoyalty,setting});
  const earned=await awardPoints(tx,{shopId,customerId:data.customerId,invoiceId:old.id,invoiceValue:grandTotal,setting});await tx.invoice.update({where:{id:old.id},data:{loyaltyPointsEarned:earned}});
  return tx.invoice.findUnique({where:{id:old.id},include:{customer:true,prescription:true,invoiceitem:{include:{product:true}},payments:true}});
},{isolationLevel:"Serializable"});}
export async function deleteInvoiceService(shopId,userId,id){return repo.prisma.$transaction(async tx=>{
  const invoice=await tx.invoice.findFirst({where:{id:Number(id),shopId},include:{invoiceitem:true}});
  if(!invoice)throw new AppError("Invoice not found",404);
  await reverseInvoiceLoyalty(tx,invoice.id);
  await changeStock(tx,shopId,userId,invoice.id,invoice.invoiceitem,1);
  await tx.invoice.delete({where:{id:invoice.id}});
},{isolationLevel:"Serializable"});}
export const getInvoicesService=(shopId,search)=>repo.getInvoices(shopId,search);
export async function getInvoiceByIdService(shopId,id){const invoice=await repo.getInvoiceById(shopId,id);if(!invoice)throw new AppError("Invoice not found",404);return{...invoice,shop:await repo.findShopById(shopId)};}
export async function updatePaymentService(shopId,id){if(!await repo.findInvoice(shopId,id))throw new AppError("Invoice not found",404);throw new AppError("Record payments through the payments endpoint",409);}
export async function updateDeliveryStatusService(shopId,id,status){const invoice=await repo.findInvoice(shopId,id);if(!invoice)throw new AppError("Invoice not found",404);return repo.updateInvoice(invoice.id,{deliveryStatus:status});}
