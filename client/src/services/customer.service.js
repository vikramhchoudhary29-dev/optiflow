import api from "../api/axios";

export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

export const getCustomerProfile = async (id) => {
  const response = await api.get(`/customers/${id}/profile`);
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await api.post("/customers", data);
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const updateCustomerStatus = async (
  id,
  active
) => {
  const response = await api.patch(
    `/customers/${id}/status`,
    {
      active,
    }
  );

  return response.data;
};