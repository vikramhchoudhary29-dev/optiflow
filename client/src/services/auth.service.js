import api from "../api/axios";

export const login = async (credentials) => {

  const response = await api.post(
    "/shop/login",
    credentials
  );

  return response.data;

};