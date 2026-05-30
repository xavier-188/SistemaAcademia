import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PrivateRoute from "../components/PrivateRoute";
import DashboardAlunos from "../components/DashboardAlunos";

export default function AppRoutes() {
  const { autenticado } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          autenticado ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <DashboardAlunos />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardAlunos />
          </PrivateRoute>
        }
      />

      <Route
        path="/planos"
        element={
          <PrivateRoute>
            <DashboardAlunos />
          </PrivateRoute>
        }
      />

      <Route
        path="/treinos"
        element={
          <PrivateRoute>
            <DashboardAlunos />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
