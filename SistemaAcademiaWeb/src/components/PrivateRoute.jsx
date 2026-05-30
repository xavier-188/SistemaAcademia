import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
