import prisma from "../config/prisma.js";
export async function findUserByIdentifier(identifier){return prisma.user.findFirst({where:{OR:[{loginId:identifier},{email:identifier}]},include:{permissions:true,shop:{include:{subscriptions:{where:{active:true},orderBy:{expiryDate:"desc"},take:1}}}}});}
