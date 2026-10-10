import { createContext, useEffect, useState } from "react";
import { getToken, removeToken, saveToken } from "../utils/helpers";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();

    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = (jwt, userData) => {
    saveToken(jwt);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setToken(jwt);
    setUser(userData);
  };

  const logout = () => {
    removeToken();

    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}