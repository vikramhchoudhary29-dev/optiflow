import api from "../api/axios";
const data = (response) => response.data.data;
export const getCrmDashboard = async () => data(await api.get("/crm/dashboard"));
export const getCrmCustomers = async (params = {}) => data(await api.get("/crm/customers", { params }));
export const getCrmCustomer = async (id) => data(await api.get(`/crm/customers/${id}`));
export const getCrmActivities = async (params = {}) => data(await api.get("/crm/activities", { params }));
export const createCrmActivity = async (payload) => data(await api.post("/crm/activities", payload));
export const updateCrmActivityStatus = async (id, status) => data(await api.patch(`/crm/activities/${id}/status`, { status }));
