import api from "../api/axios";

export const getPrescriptions = async (search = "") => {
  const response = await api.get("/prescriptions", {
    params: {
      search,
    },
  });

  return response.data;
};

export const getPrescriptionById = async (id) => {
  const response = await api.get(`/prescriptions/${id}`);

  return response.data;
};

export const createPrescription = async (data) => {
  const response = await api.post(
    "/prescriptions",
    data
  );

  return response.data;
};

export const updatePrescription = async (
  id,
  data
) => {
  const response = await api.put(
    `/prescriptions/${id}`,
    data
  );

  return response.data;
};

export const updatePrescriptionStatus =
  async (id) => {
    const response = await api.patch(
      `/prescriptions/${id}/status`
    );

    return response.data;
  };

export const getCustomerPrescriptionHistory =
  async (customerId) => {
    const response = await api.get(
      `/prescriptions/customer/${customerId}`
    );

    return response.data;
  };

export const getPrescriptionPdf = async (id) => {
  const response = await api.get(`/prescriptions/${id}/pdf/a4`, { responseType: "blob" });
  return response.data;
};

export const getBulkPrescriptionPdf = async (ids) => {
  const response = await api.post("/prescriptions/pdf/a4/bulk", { ids }, { responseType: "blob" });
  return response.data;
};
export const deletePrescription = async (id) => api.delete(`/prescriptions/${id}`);
