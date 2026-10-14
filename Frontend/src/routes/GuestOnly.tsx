import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function GuestOnly() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  return isAdmin ? <Navigate to="/admin" replace /> : <Outlet />;
}