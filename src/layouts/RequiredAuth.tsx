import useAuth from "@/hooks/useAuth";
import { Navigate, Outlet } from "react-router";

export default function RequireAuth() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
