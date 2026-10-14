import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export function AdminGuard() {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const loc = useLocation();

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: loc.pathname + loc.search }}
      />
    );
  }
  return <Outlet />;
}