import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(
    !!localStorage.getItem("token"),
  );

  const fazerLogin = (token) => {
    localStorage.setItem("token", token);
    setAutenticado(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAutenticado(false);
  };

  return (
    <AuthContext.Provider value={{ autenticado, login: fazerLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
