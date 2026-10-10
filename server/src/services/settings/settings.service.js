import {
  getSettings,
  updateSettings,
  findInvoiceForWhatsApp,
} from "../../repositories/settings/settings.repository.js";

/* ============================================================
   GET SETTINGS
============================================================ */

export async function getSettingsService(shopId) {
  return await getSettings(shopId);
}

/* ============================================================
   UPDATE SETTINGS
============================================================ */

export async function updateSettingsService(shopId, data) {
  return await updateSettings(shopId, data);
}

export async function getWhatsAppLinkService(shopId, invoiceId) {
  const invoice = await findInvoiceForWhatsApp(shopId, invoiceId);
  if (!invoice) return null;
  const deliveryStatus = String(invoice.deliveryStatus || "").trim().toUpperCase();

  const pendingDefault =
    "Hello {customerName},\n\nThank you for choosing {shopName}. We have received your order successfully.\n\nInvoice Number: {invoiceCode}\nTotal Amount: ₹{grandTotal}\nAmount Received: ₹{received}\nBalance Due: ₹{balance}\n\nWe will notify you as soon as your spectacles are ready.\n\nRegards,\n{shopName}";
  const readyDefault =
    "Hello {customerName},\n\nGood news! Your spectacles for Invoice {invoiceCode} are ready for collection from {shopName}.\n\nTotal Amount: ₹{grandTotal}\nAmount Received: ₹{received}\nBalance Due: ₹{balance}\n\nPlease visit us at {shopAddress}. For assistance, call {shopMobile}.\n\nRegards,\n{shopName}";
  const deliveredDefault =
    "Hello {customerName}, your order from {shopName} has been delivered successfully. Thank you for choosing us. If you need any support or changes, please reply to this message. Invoice No: {invoiceCode}. We would love your feedback here: {reviewLink}";

  const notification = invoice.shop.notificationTemplate;
  const template =
    deliveryStatus === "DELIVERED"
      ? notification?.deliveredMessage || deliveredDefault
      : deliveryStatus === "READY"
        ? notification?.readyMessage || readyDefault
        : notification?.message || pendingDefault;

  const values = {
    customerName: invoice.customer.name,
    invoiceCode: invoice.invoiceCode,
    shopName: invoice.shop.shopName,
    balance: Number(invoice.balance).toFixed(2),
    grandTotal: Number(invoice.grandTotal).toFixed(2),
    received: Number(invoice.received).toFixed(2),
    deliveryStatus: invoice.deliveryStatus,
    shopAddress: invoice.shop.address || "",
    shopMobile: invoice.shop.mobile || "",
    reviewLink: invoice.shop.setting?.reviewLink || "",
  };

  const message = Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
  const mobile = invoice.customer.mobile.replace(/\D/g, "");

  return {
    url: `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`,
    message,
    mobile,
  };
}
