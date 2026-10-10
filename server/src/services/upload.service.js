import fs from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";
import { findCurrentLogo, updateLogo } from "../repositories/upload/upload.repository.js";

export async function uploadLogoService(shopId,file){
  if(!file)throw new Error("Please select a logo image.");
  const current=await findCurrentLogo(shopId);let logoUrl;
  if(process.env.BLOB_READ_WRITE_TOKEN){
    const extension=path.extname(file.originalname).toLowerCase()||".png";
    const blob=await put(`optiflow/logos/shop-${shopId}${extension}`,file.buffer,{access:"public",addRandomSuffix:false,contentType:file.mimetype});
    logoUrl=blob.url;
    if(current?.logoUrl?.includes(".public.blob.vercel-storage.com")&&current.logoUrl!==logoUrl)await del(current.logoUrl).catch(()=>{});
  }else{
    const directory=path.resolve("uploads/logos");await fs.mkdir(directory,{recursive:true});
    const filename=`logo-${shopId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`;await fs.writeFile(path.join(directory,filename),file.buffer);logoUrl=`/uploads/logos/${filename}`;
  }
  return updateLogo(shopId,logoUrl);
}
