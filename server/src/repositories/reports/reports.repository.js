import prisma from "../../config/prisma.js";

function dateOnly(value, end = false) {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(value);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (end) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

function range(from,to){
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: dateOnly(from) } : {}),
    ...(to ? { lt: dateOnly(to, true) } : {}),
  };
}
export async function getSalesSummary(shopId,query={}){const invoiceDate=range(query.from,query.to);const where={shopId,deliveryStatus:{not:"CANCELLED"},...(invoiceDate?{invoiceDate}:{})};const[items,summary]=await Promise.all([prisma.invoice.findMany({where,include:{customer:{select:{name:true,mobile:true}}},orderBy:{invoiceDate:"desc"}}),prisma.invoice.aggregate({where,_sum:{grandTotal:true,received:true,balance:true},_count:true})]);return{totalInvoices:summary._count,totalSales:Number(summary._sum.grandTotal||0),totalReceived:Number(summary._sum.received||0),totalOutstanding:Number(summary._sum.balance||0),items};}
export async function getPurchaseReport(shopId,query={}){const purchaseDate=range(query.from,query.to);const where={shopId,...(purchaseDate?{purchaseDate}:{})};const[items,summary]=await Promise.all([prisma.purchase.findMany({where,include:{supplier:true},orderBy:{purchaseDate:"desc"}}),prisma.purchase.aggregate({where,_sum:{totalAmount:true},_count:true})]);return{totalPurchases:summary._count,totalAmount:Number(summary._sum.totalAmount||0),items};}
export async function getExpenseReport(shopId,query={}){const expenseDate=range(query.from,query.to);const where={shopId,...(expenseDate?{expenseDate}:{})};const[items,summary]=await Promise.all([prisma.expense.findMany({where,orderBy:{expenseDate:"desc"}}),prisma.expense.aggregate({where,_sum:{amount:true},_count:true})]);return{totalExpenses:summary._count,totalAmount:Number(summary._sum.amount||0),items};}
export async function getStockReport(shopId){const items=await prisma.product.findMany({where:{shopId,active:true},include:{category:true},orderBy:{name:"asc"}});return{totalProducts:items.length,totalStock:items.reduce((s,p)=>s+p.stock,0),purchaseValue:items.reduce((s,p)=>s+Number(p.purchasePrice)*p.stock,0),sellingValue:items.reduce((s,p)=>s+Number(p.sellingPrice)*p.stock,0),items};}
export async function getLowStockReport(shopId){const report=await getStockReport(shopId);const items=report.items.filter((item)=>item.stock<=item.minimumStock);return{count:items.length,items};}
export async function getCustomerReport(shopId,query={}){
  const invoiceDate=range(query.from,query.to);
  const invoiceWhere={deliveryStatus:{not:"CANCELLED"},...(invoiceDate?{invoiceDate}: {})};
  const customers=await prisma.customer.findMany({where:{shopId},include:{invoice:{where:invoiceWhere,select:{invoiceDate:true,grandTotal:true,balance:true}}},orderBy:{name:"asc"}});
  const items=customers.map((customer)=>({id:customer.id,customerCode:customer.customerCode,name:customer.name,mobile:customer.mobile,city:customer.city,active:customer.active,totalInvoices:customer.invoice.length,totalSales:customer.invoice.reduce((sum,item)=>sum+Number(item.grandTotal),0),outstanding:customer.invoice.reduce((sum,item)=>sum+Number(item.balance),0),lastPurchase:customer.invoice.reduce((latest,item)=>!latest||item.invoiceDate>latest?item.invoiceDate:latest,null)}));
  return{totalCustomers:items.length,activeCustomers:items.filter((item)=>item.active).length,inactiveCustomers:items.filter((item)=>!item.active).length,customersWithSales:items.filter((item)=>item.totalInvoices>0).length,totalOutstanding:items.reduce((sum,item)=>sum+item.outstanding,0),items};
}
export async function getProfitReport(shopId,query={}){const[sales,purchases,expenses]=await Promise.all([getSalesSummary(shopId,query),getPurchaseReport(shopId,query),getExpenseReport(shopId,query)]);const net=sales.totalSales-purchases.totalAmount-expenses.totalAmount;return{totalSales:sales.totalSales,purchaseCost:purchases.totalAmount,expenses:expenses.totalAmount,netProfit:net,profitMargin:sales.totalSales?Number((net/sales.totalSales*100).toFixed(2)):0};}
export async function getDayBook(shopId,date){
  const value=date||new Date().toISOString().slice(0,10),start=new Date(`${value}T00:00:00`),end=new Date(`${value}T23:59:59.999`);
  const [sales,payments,purchases,expenses,supplierPayments]=await Promise.all([
    prisma.invoice.findMany({where:{shopId,invoiceDate:{gte:start,lte:end},deliveryStatus:{not:"CANCELLED"}},include:{customer:{select:{name:true}}}}),
    prisma.payment.findMany({where:{shopId,paidAt:{gte:start,lte:end}},include:{invoice:{select:{invoiceCode:true,customer:{select:{name:true}}}}}}),
    prisma.purchase.findMany({where:{shopId,purchaseDate:{gte:start,lte:end}},include:{supplier:{select:{name:true}}}}),
    prisma.expense.findMany({where:{shopId,expenseDate:{gte:start,lte:end}}}),
    prisma.supplierPayment.findMany({where:{shopId,paymentDate:{gte:start,lte:end}},include:{supplier:{select:{name:true}}}}),
  ]);
  const items=[
    ...sales.map(x=>({id:`sale-${x.id}`,date:x.invoiceDate,type:"SALE",reference:x.invoiceCode,party:x.customer.name,debit:0,credit:Number(x.grandTotal)})),
    ...payments.map(x=>({id:`payment-${x.id}`,date:x.paidAt,type:"RECEIPT",reference:x.invoice.invoiceCode,party:x.invoice.customer.name,debit:0,credit:Number(x.amount),method:x.method})),
    ...purchases.map(x=>({id:`purchase-${x.id}`,date:x.purchaseDate,type:"PURCHASE",reference:x.purchaseCode,party:x.supplier?.name||x.supplierName,debit:Number(x.totalAmount),credit:0})),
    ...expenses.map(x=>({id:`expense-${x.id}`,date:x.expenseDate,type:"EXPENSE",reference:`EXP-${x.id}`,party:x.description,debit:Number(x.amount),credit:0,method:x.paymentMethod})),
    ...supplierPayments.map(x=>({id:`supplier-payment-${x.id}`,date:x.paymentDate,type:"PAYMENT OUT",reference:`PAYOUT${String(x.id).padStart(4,"0")}`,party:x.supplier.name,debit:Number(x.amount),credit:0,method:x.paymentMethod})),
  ].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const totalSales=sales.reduce((s,x)=>s+Number(x.grandTotal),0),totalReceipts=payments.reduce((s,x)=>s+Number(x.amount),0),totalPurchases=purchases.reduce((s,x)=>s+Number(x.totalAmount),0),totalExpenses=expenses.reduce((s,x)=>s+Number(x.amount),0);
  const totalSupplierPayments=supplierPayments.reduce((s,x)=>s+Number(x.amount),0);
  return{date:value,totalSales,totalReceipts,totalPurchases,totalExpenses,totalSupplierPayments,netCash:totalReceipts-totalPurchases-totalExpenses-totalSupplierPayments,items};
}
