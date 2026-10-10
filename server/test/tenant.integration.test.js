import test,{before,after}from"node:test";import assert from"node:assert/strict";import fs from"node:fs/promises";import jwt from"jsonwebtoken";import bcrypt from"bcrypt";import dotenv from"dotenv";import prisma from"../src/config/prisma.js";import app from"../src/app.js";
dotenv.config();let server,base;const created=[];const token=(user)=>jwt.sign({userId:user.id,shopId:user.shopId,role:"OWNER",tokenType:"SHOP_USER"},process.env.JWT_SECRET);
async function makeTenant(label){const unique=`${Date.now()}${Math.floor(Math.random()*10000)}`;const shop=await prisma.shop.create({data:{shopName:`Test ${label}`,ownerName:"Test Owner",mobile:unique,email:`${label}.${unique}@test.invalid`,status:true}});created.push(shop.id);const user=await prisma.user.create({data:{shopId:shop.id,name:"Owner",loginId:`owner-${label}-${unique}`,mobile:`9${unique}`,email:`owner.${label}.${unique}@test.invalid`,password:await bcrypt.hash("TestPass!234",4),role:"OWNER",status:true}});await prisma.setting.create({data:{shopId:shop.id}});const expiryDate=new Date();expiryDate.setDate(expiryDate.getDate()+30);await prisma.subscription.create({data:{shopId:shop.id,plan:"STARTER",amount:0,startDate:new Date(),expiryDate,status:"ACTIVE",active:true}});return{shop,user,token:token(user)}}
async function call(auth,path,{method="GET",body}={}){const response=await fetch(`${base}${path}`,{method,headers:{Authorization:`Bearer ${auth}`,...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});const json=await response.json();return{response,json}}
async function upload(auth,type,file){const form=new FormData();form.append("file",new Blob([await fs.readFile(file)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),`${type}.xlsx`);const response=await fetch(`${base}/import/${type}`,{method:"POST",headers:{Authorization:`Bearer ${auth}`},body:form});return{response,json:await response.json()};}
before(async()=>{server=app.listen(0);await new Promise(resolve=>server.once("listening",resolve));base=`http://127.0.0.1:${server.address().port}/api`});
after(async()=>{for(const id of created.reverse())await prisma.shop.delete({where:{id}}).catch(()=>{});await prisma.$disconnect();await new Promise(resolve=>server.close(resolve))});

test("tenant references are isolated and stock transactions are atomic",async()=>{
  const a=await makeTenant("a"),b=await makeTenant("b");
  const loginResponse=await fetch(`${base}/shop/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:a.user.loginId,password:"TestPass!234"})});assert.equal(loginResponse.status,200);
  const categoryA=(await call(a.token,"/categories",{method:"POST",body:{name:"Frames"}})).json.data;
  const categoryB=(await call(b.token,"/categories",{method:"POST",body:{name:"Frames"}})).json.data;
  const productA=(await call(a.token,"/products",{method:"POST",body:{categoryId:categoryA.id,name:"A Frame",sku:"A-1",purchasePrice:100,sellingPrice:250,minimumStock:1}})).json.data;
  const productB=(await call(b.token,"/products",{method:"POST",body:{categoryId:categoryB.id,name:"B Frame",sku:"B-1",purchasePrice:90,sellingPrice:220,minimumStock:1}})).json.data;
  const supplierA=(await call(a.token,"/suppliers",{method:"POST",body:{name:"A Supplier"}})).json.data;
  const purchase=await call(a.token,"/purchases",{method:"POST",body:{supplierId:supplierA.id,items:[{productId:productA.id,quantity:5,purchasePrice:110}]}});
  assert.equal(purchase.response.status,201);assert.equal(Number(purchase.json.data.totalAmount),550);
  assert.equal((await prisma.product.findUnique({where:{id:productA.id}})).stock,5);
  const customerA=await prisma.customer.create({data:{shopId:a.shop.id,customerCode:"CUS000001",name:"Customer A",mobile:"9000000001"}});
  const customerB=await prisma.customer.create({data:{shopId:b.shop.id,customerCode:"CUS000001",name:"Customer B",mobile:"9000000002"}});
  const sale=await call(a.token,"/invoices",{method:"POST",body:{customerId:customerA.id,amountPaid:100,paymentMethod:"CASH",items:[{productId:productA.id,quantity:2}]}});
  assert.equal(sale.response.status,201);assert.equal(Number(sale.json.data.grandTotal),500);assert.equal((await prisma.product.findUnique({where:{id:productA.id}})).stock,3);
  const pdfResponse=await fetch(`${base}/pdf/invoice/${sale.json.data.id}`,{headers:{Authorization:`Bearer ${a.token}`}});assert.equal(pdfResponse.status,200);assert.match(pdfResponse.headers.get("content-type"),/application\/pdf/);const pdfBytes=new Uint8Array(await pdfResponse.arrayBuffer());assert.equal(new TextDecoder().decode(pdfBytes.slice(0,4)),"%PDF");
  const whatsapp=await call(a.token,`/settings/whatsapp/${sale.json.data.id}`);assert.equal(whatsapp.response.status,200);assert.match(whatsapp.json.data.url,/^https:\/\/wa\.me\//);
  const crossTenant=await call(b.token,"/invoices",{method:"POST",body:{customerId:customerB.id,items:[{productId:productA.id,quantity:1}]}});
  assert.equal(crossTenant.response.status,404);assert.equal((await prisma.product.findUnique({where:{id:productA.id}})).stock,3);assert.equal((await prisma.product.findUnique({where:{id:productB.id}})).stock,0);
  assert.equal(await prisma.stockMovement.count({where:{shopId:a.shop.id,productId:productA.id}}),2);
  await prisma.shop.update({where:{id:b.shop.id},data:{status:false}});const deactivated=await call(b.token,"/products");assert.equal(deactivated.response.status,403);
});

test("platform lifecycle is isolated from shop tokens",async()=>{
  const tenant=await makeTenant("token-boundary");
  const platformToken=jwt.sign({id:987654,email:"test-platform@test.invalid",tokenType:"PLATFORM_ADMIN"},process.env.JWT_SECRET);
  assert.equal((await call(tenant.token,"/platform/shops")).response.status,403);
  assert.equal((await call(platformToken,"/products")).response.status,403);
  const suffix=String(Date.now()).slice(-8);const email=`platform-shop-${suffix}@test.invalid`;const mobile=`91${suffix}`;
  const createdResponse=await call(platformToken,"/platform/shops",{method:"POST",body:{shopName:"Lifecycle Optical",ownerName:"Lifecycle Owner",mobile,email,password:"OwnerPass!234",address:"Test address",plan:"STARTER"}});
  assert.equal(createdResponse.response.status,201);const shopId=createdResponse.json.data.shop.id;created.push(shopId);
  assert.equal((await call(platformToken,`/platform/shops/${shopId}`,{method:"PUT",body:{shopName:"Updated Optical"}})).response.status,200);
  assert.equal((await call(platformToken,`/platform/shops/${shopId}/status`,{method:"PATCH",body:{status:false}})).response.status,200);
  assert.equal((await call(platformToken,`/platform/shops/${shopId}/trial`,{method:"POST",body:{days:14}})).response.status,201);
  const expiryDate=new Date();expiryDate.setFullYear(expiryDate.getFullYear()+1);
  assert.equal((await call(platformToken,`/platform/shops/${shopId}/subscription`,{method:"POST",body:{plan:"PROFESSIONAL",amount:12000,expiryDate:expiryDate.toISOString()}})).response.status,201);
  assert.equal((await call(platformToken,`/platform/shops/${shopId}/reset-owner-password`,{method:"POST",body:{password:"NewOwnerPass!234"}})).response.status,200);
  assert.equal((await call(platformToken,`/platform/shops/${shopId}`,{method:"DELETE"})).response.status,200);created.splice(created.indexOf(shopId),1);
  assert.equal(await prisma.shop.findUnique({where:{id:shopId}}),null);
});

test("Excel imports, reports and marketing stay inside the tenant",async()=>{
  const tenant=await makeTenant("imports-marketing");
  const templateRoot="../outputs/019fda8c-d9d3-78c0-9a2d-8c632a815628";
  const customerImport=await upload(tenant.token,"customers",`${templateRoot}/customers-import-template.xlsx`);assert.equal(customerImport.response.status,201,JSON.stringify(customerImport.json));assert.equal(customerImport.json.data.imported,1);
  const productImport=await upload(tenant.token,"products",`${templateRoot}/products-import-template.xlsx`);assert.equal(productImport.response.status,201,JSON.stringify(productImport.json));assert.equal(productImport.json.data.imported,1);
  const supplierImport=await upload(tenant.token,"suppliers",`${templateRoot}/suppliers-import-template.xlsx`);assert.equal(supplierImport.response.status,201);assert.equal(supplierImport.json.data.imported,1);
  const customer=await prisma.customer.findFirst({where:{shopId:tenant.shop.id,mobile:"9876543210"}});assert.ok(customer);
  const product=await prisma.product.findFirst({where:{shopId:tenant.shop.id,barcode:"BARCODE-8901234567890"}});assert.match(product.sku,/^PRD/);assert.equal(product.stock,8);
  const template=await call(tenant.token,"/marketing/templates",{method:"POST",body:{name:"Welcome",message:"Hello {customerName} from {shopName}"}});assert.equal(template.response.status,201);
  const link=await call(tenant.token,"/marketing/link",{method:"POST",body:{customerId:customer.id,templateId:template.json.data.id}});assert.equal(link.response.status,200);assert.match(link.json.data.url,/^https:\/\/wa\.me\/91/);assert.match(link.json.data.message,/Amit Kumar/);
  const customerReport=await call(tenant.token,"/reports/customers");assert.equal(customerReport.response.status,200);assert.equal(customerReport.json.data.totalCustomers,1);
  const stockReport=await call(tenant.token,"/reports/stock");assert.equal(stockReport.response.status,200);assert.equal(stockReport.json.data.totalStock,8);
});

test("invoice prescriptions, editing, day book and loyalty work together",async()=>{
  const tenant=await makeTenant("invoice-loyalty"),category=(await call(tenant.token,"/categories",{method:"POST",body:{name:"Lenses"}})).json.data;
  const product=(await call(tenant.token,"/products",{method:"POST",body:{categoryId:category.id,name:"Blue Cut Lens",purchasePrice:500,sellingPrice:1000}})).json.data;
  await call(tenant.token,"/products/"+product.id+"/stock-adjustment",{method:"POST",body:{quantity:10}});
  const customer=await prisma.customer.create({data:{shopId:tenant.shop.id,customerCode:"CUS000001",name:"Loyal Customer",mobile:"9111111111"}});
  const setting=await call(tenant.token,"/loyalty/settings",{method:"PUT",body:{enabled:true,spendPerPoint:1000,minimumEarnInvoice:1000,expiryEnabled:true,expiryDays:90,redemptionValuePerPoint:10,maximumRedemptionPercent:20,minimumRedeemInvoice:500}});assert.equal(setting.response.status,200);
  const created=await call(tenant.token,"/invoices",{method:"POST",body:{customerId:customer.id,items:[{productId:product.id,quantity:2}],prescription:{rightSph:-1.5,leftSph:-1.25,pdDistance:62}}});assert.equal(created.response.status,201,JSON.stringify(created.json));assert.ok(created.json.data.prescription);assert.equal(created.json.data.loyaltyPointsEarned,2);
  const edited=await call(tenant.token,`/invoices/${created.json.data.id}`,{method:"PUT",body:{customerId:customer.id,items:[{productId:product.id,quantity:3}],prescription:{rightSph:-2,leftSph:-1.25},discount:0,gst:0,loyaltyPointsToRedeem:0}});assert.equal(edited.response.status,200,JSON.stringify(edited.json));assert.equal((await prisma.product.findUnique({where:{id:product.id}})).stock,7);assert.equal(Number(edited.json.data.prescription.rightSph),-2);
  const loyalty=await call(tenant.token,`/loyalty/customers/${customer.id}`);assert.equal(loyalty.response.status,200);assert.equal(loyalty.json.data.balance,3);
  const dayBook=await call(tenant.token,`/reports/day-book?date=${new Date().toISOString().slice(0,10)}`);assert.equal(dayBook.response.status,200);assert.ok(dayBook.json.data.items.some(item=>item.reference===created.json.data.invoiceCode));
});
