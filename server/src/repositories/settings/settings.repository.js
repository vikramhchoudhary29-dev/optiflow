import prisma from "../../config/prisma.js";
export const findSettings=(shopId)=>prisma.setting.findUnique({where:{shopId}});
export async function getSettings(shopId){
  return prisma.shop.findUnique({
    where:{id:shopId},
    select:{
      id:true,
      shopName:true,
      address:true,
      mobile:true,
      email:true,
      gstNumber:true,
      setting:true,
      notificationTemplate:true
    }
  });
}
export function updateSettings(shopId,data){const{shopName,address,mobile,reviewLink,whatsappMessage,readyWhatsappMessage,deliveredWhatsappMessage,gstNumber,currency,footerNote,terms,logoUrl,...settings}=data;return prisma.$transaction(async(tx)=>{
  await tx.shop.update({where:{id:shopId},data:{shopName,address,mobile,gstNumber}});
  await tx.setting.upsert({
    where:{shopId},
    create:{shopId,currency,footerNote,terms,logoUrl,reviewLink,...settings},
    update:{currency,footerNote,terms,logoUrl,reviewLink,...settings}
  });
  await tx.notificationTemplate.upsert({where:{shopId},create:{shopId,message:whatsappMessage,readyMessage:readyWhatsappMessage,deliveredMessage:deliveredWhatsappMessage},update:{message:whatsappMessage,readyMessage:readyWhatsappMessage,deliveredMessage:deliveredWhatsappMessage}});
  return tx.shop.findUnique({
    where:{id:shopId},
    select:{
      id:true,
      shopName:true,
      address:true,
      mobile:true,
      email:true,
      gstNumber:true,
      setting:true,
      notificationTemplate:true
    }
  });
});}
export const findInvoiceForWhatsApp=(shopId,id)=>prisma.invoice.findFirst({
  where:{shopId,id:Number(id)},
  include:{
    customer:true,
    shop:{
      include:{
        notificationTemplate:true,
        setting:true
      }
    }
  }
});
