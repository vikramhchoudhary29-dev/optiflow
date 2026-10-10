import axios from "axios";

const platform = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "/api" : "http://localhost:5000/api"),
});
platform.interceptors.request.use((config) => {
  const token = localStorage.getItem("platformToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
const data = (response) => response.data.data;
export const login = async (body) =>
  data(await platform.post("/platform/login", body));
export const dashboard = async () =>
  data(await platform.get("/platform/dashboard"));
export const analytics = async () =>
  data(await platform.get("/platform/analytics"));
export const shops = async () => data(await platform.get("/platform/shops"));
export const shopDetails = async (id) =>
  data(await platform.get(`/platform/shops/${id}/details`));
export const createShop = async (body) =>
  data(await platform.post("/platform/shops", body));
export const updateShop = async (id, body) =>
  data(await platform.put(`/platform/shops/${id}`, body));
export const setStatus = async (id, status) =>
  data(await platform.patch(`/platform/shops/${id}/status`, { status }));
export const deleteShop = async (id) =>
  data(await platform.delete(`/platform/shops/${id}`));
export const startTrial = async (id, days) =>
  data(await platform.post(`/platform/shops/${id}/trial`, { days }));
export const activate = async (id, body) =>
  data(await platform.post(`/platform/shops/${id}/subscription`, body));
export const resetPassword = async (id, password) =>
  data(
    await platform.post(`/platform/shops/${id}/reset-owner-password`, {
      password,
    }),
  );
export const getPlanSettings = async () =>
  data(await platform.get("/platform/plan-settings"));
export const savePlanSettings = async (body) =>
  data(await platform.put("/platform/plan-settings", body));
export const listPayments = async () =>
  data(await platform.get("/platform/subscription-payments"));
export const createPayment = async (body) =>
  data(await platform.post("/platform/subscription-payments", body));
export const listReminders = async () =>
  data(await platform.get("/platform/reminders"));
export async function openReceipt(id) {
  const response = await platform.get(
    `/platform/subscription-payments/${id}/receipt`,
    { responseType: "blob" },
  );
  const url = URL.createObjectURL(response.data);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export async function exportShops() {
  const response = await platform.get("/platform/shops/export/excel", {
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "optiflow-shops.xlsx";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function supportLogin(id) {
  const result = data(
    await platform.post(`/platform/shops/${id}/support-login`),
  );
  localStorage.setItem("supportPlatformReturn", "true");
  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.user));
  return result;
}

export const announcements = async () => data(await platform.get("/platform/announcements"));
export const createAnnouncement = async (body) => data(await platform.post("/platform/announcements", body));
export const updateAnnouncement = async (id, body) => data(await platform.put(`/platform/announcements/${id}`, body));
export const deleteAnnouncement = async (id) => data(await platform.delete(`/platform/announcements/${id}`));
