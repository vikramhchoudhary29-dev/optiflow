import api from "../api/axios";
const data=(response)=>response.data.data;
export const listCategories=async()=>data(await api.get("/categories"));
export const listCustomers=async()=>data(await api.get("/customers"));
export const listPrescriptions=async()=>data(await api.get("/prescriptions"));
export const createCategory=async(body)=>data(await api.post("/categories",body));
export const updateCategory=async(id,body)=>data(await api.put(`/categories/${id}`,body));
export const deleteCategory=async(id)=>data(await api.delete(`/categories/${id}`));
export const listProducts=async(search="")=>data(await api.get("/products",{params:{search}}));
export const createProduct=async(body)=>data(await api.post("/products",body));
export const updateProduct=async(id,body)=>data(await api.put(`/products/${id}`,body));
export const toggleProduct=async(id)=>data(await api.patch(`/products/${id}/status`));
export const adjustStock=async(id,body)=>data(await api.post(`/products/${id}/stock-adjustment`,body));
export const listSuppliers=async()=>data(await api.get("/suppliers"));
export const createSupplier=async(body)=>data(await api.post("/suppliers",body));
export const updateSupplier=async(id,body)=>data(await api.put(`/suppliers/${id}`,body));
export const deleteSupplier=async(id)=>data(await api.delete(`/suppliers/${id}`));
export const listExpenses=async()=>data(await api.get("/expenses"));
export const createExpense=async(body)=>data(await api.post("/expenses",body));
export const updateExpense=async(id,body)=>data(await api.put(`/expenses/${id}`,body));
export const deleteExpense=async(id)=>data(await api.delete(`/expenses/${id}`));
export const listUsers=async()=>data(await api.get("/users"));
export const createUser=async(body)=>data(await api.post("/users",body));
export const updateUserStatus=async(id,status)=>data(await api.patch(`/users/${id}/status`,{status}));
export const updatePermissions=async(id,permissions)=>data(await api.put(`/users/${id}/permissions`,{permissions}));
export const getUserActivity=async(id)=>data(await api.get(`/users/${id}/activity`));
export const deleteUser=async(id)=>data(await api.delete(`/users/${id}`));
export const resetUserPassword=async(id,password)=>data(await api.post(`/users/${id}/reset-password`,{password}));
export const listPurchases=async()=>data(await api.get("/purchases"));
export const createPurchase=async(body)=>data(await api.post("/purchases",body));
export const getPurchase=async(id)=>data(await api.get(`/purchases/${id}`));
export const updatePurchase=async(id,body)=>data(await api.put(`/purchases/${id}`,body));
export const deletePurchase=async(id)=>data(await api.delete(`/purchases/${id}`));
export async function openPurchasePdf(id){const response=await api.get(`/purchases/${id}/print`,{responseType:"blob"});const url=URL.createObjectURL(response.data);window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export const listInvoices=async()=>data(await api.get("/invoices"));
export const getInvoice=async(id)=>data(await api.get(`/invoices/${id}`));
export const createInvoice=async(body)=>data(await api.post("/invoices",body));
export const updateInvoice=async(id,body)=>data(await api.put(`/invoices/${id}`,body));
export const deleteInvoice=async(id)=>data(await api.delete(`/invoices/${id}`));
export const getLoyaltySettings=async()=>data(await api.get("/loyalty/settings"));
export const updateLoyaltySettings=async(body)=>data(await api.put("/loyalty/settings",body));
export const getCustomerLoyalty=async(id)=>data(await api.get(`/loyalty/customers/${id}`));
export const setDeliveryStatus=async(id,status)=>data(await api.patch(`/invoices/${id}/delivery-status`,{status}));
export const listPayments=async(invoiceId)=>data(await api.get("/payments",{params:{invoiceId}}));
export const createPayment=async(body)=>data(await api.post("/payments",body));
export async function openPaymentReceipt(id){const response=await api.get(`/payments/${id}/receipt`,{responseType:"blob"});const url=URL.createObjectURL(response.data);window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export const getPaymentWhatsApp=async(id)=>data(await api.get(`/payments/${id}/whatsapp`));
export const listSupplierPayments=async()=>data(await api.get("/supplier-payments"));
export const getSupplierPayment=async(id)=>data(await api.get(`/supplier-payments/${id}`));
export const createSupplierPayment=async(body)=>data(await api.post("/supplier-payments",body));
export const updateSupplierPayment=async(id,body)=>data(await api.put(`/supplier-payments/${id}`,body));
export const deleteSupplierPayment=async(id)=>data(await api.delete(`/supplier-payments/${id}`));
export async function openSupplierPaymentReceipt(id){const response=await api.get(`/supplier-payments/${id}/receipt`,{responseType:"blob"});const url=URL.createObjectURL(response.data);window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}
export const importExcel=async(type,file)=>{const form=new FormData();form.append("file",file);return data(await api.post(`/import/${type}`,form,{headers:{"Content-Type":"multipart/form-data"}}));};
export async function downloadImportTemplate(type){const response=await api.get(`/import/templates/${type}`,{responseType:"blob"});const url=URL.createObjectURL(response.data);const link=document.createElement("a");link.href=url;link.download=`${type}-import-template.xlsx`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const listMarketingTemplates=async()=>data(await api.get("/marketing/templates"));
export const createMarketingTemplate=async(body)=>data(await api.post("/marketing/templates",body));
export const updateMarketingTemplate=async(id,body)=>data(await api.put(`/marketing/templates/${id}`,body));
export const deleteMarketingTemplate=async(id)=>data(await api.delete(`/marketing/templates/${id}`));
export const getMarketingLink=async(body)=>data(await api.post("/marketing/link",body));
export const getReport=async(type,params={})=>data(await api.get(`/reports/${type}`,{params}));
export const getSettings=async()=>data(await api.get("/settings"));
export const updateSettings=async(body)=>data(await api.put("/settings",body));
export const getWhatsAppLink=async(id)=>data(await api.get(`/settings/whatsapp/${id}`));
export async function openInvoicePdf(id){const response=await api.get(`/pdf/invoice/${id}`,{responseType:"blob"});const url=URL.createObjectURL(response.data);window.open(url,"_blank","noopener,noreferrer");setTimeout(()=>URL.revokeObjectURL(url),60000);}

export const getDashboardAnnouncements = async () => data(await api.get("/dashboard/announcements"));
