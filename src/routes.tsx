import { lazy } from "react";

import {
  LayoutDashboard,
  Users,
  Mail,
  FilePlus,
  User,
  Package,
  Tag,
  FileSearch,
} from "lucide-react";

export type RouteItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  element?: React.ReactNode;
  hiddenOnSidebar?: boolean;
};

import { Role } from "./types/Role";
import Audits from "./pages/private/superadmin/Audits";

// Lazy-loaded pages
const Login = lazy(() => import("@/pages/public/Login"));
const Register = lazy(() => import("@/pages/public/Register"));
const ForgotPassword = lazy(() => import("@/pages/public/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/public/ResetPassword"));
const Profile = lazy(() => import("@/pages/public/Profile"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const SuperDashboard = lazy(
  () => import("@/pages/private/superadmin/SuperDashboard")
);
const SuperUsers = lazy(() => import("@/pages/private/superadmin/SuperUsers"));

const SuperProducts = lazy(
  () => import("@/pages/private/superadmin/SuperProducts")
);

const Invoices = lazy(() => import("@/pages/private/superadmin/Invoices"));
const Brands = lazy(() => import("@/pages/private/superadmin/Brands"));

export const publicRoutes: RouteItem[] = [
  {
    label: "Login",
    to: "/login",
    icon: User,
    element: <Login />,
  },
  {
    label: "Registro",
    to: "/register",
    icon: User,
    element: <Register />,
  },
  {
    label: "Olvidé mi contraseña",
    to: "/forgot-password",
    icon: Mail,
    element: <ForgotPassword />,
  },
  {
    label: "Restablecer contraseña",
    to: "/reset-password",
    icon: Mail,
    element: <ResetPassword />,
  },
];

export const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some((route) => route.to === path);
};

export const roleBasedRoutes: Record<Role, RouteItem[]> = {
  [Role.USER]: [
    {
      label: "Perfil",
      to: "/profile",
      icon: User,
      element: <Profile />,
      hiddenOnSidebar: true,
    },
  ],

  [Role.SUPERADMIN]: [
    {
      label: "Perfil",
      to: "/profile",
      icon: User,
      element: <Profile />,
      hiddenOnSidebar: true,
    },
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      element: <SuperDashboard />,
    },
    {
      label: "Facturas",
      to: "/new-invoice",
      icon: FilePlus,
      element: <Invoices />,
    },
    {
      label: "Productos",
      to: "/products",
      icon: Package,
      element: <SuperProducts />,
    },
    {
      label: "Marcas",
      to: "/brands",
      icon: Tag,
      element: <Brands />,
    },
    {
      label: "Usuario",
      to: "/users",
      icon: Users,
      element: <SuperUsers />,
    },
    {
      label: "Auditoría",
      to: "/audits",
      icon: FileSearch,
      element: <Audits />,
    },
  ],
};

export const getSidebarRoutesForRole = (role: Role): RouteItem[] => {
  const routes = roleBasedRoutes[role] || [];
  return routes.filter((item) => !item.hiddenOnSidebar);
};

export const getProtectedRoutesForRole = (role: Role): RouteItem[] => {
  return roleBasedRoutes[role];
};

export const getPublicRoutes = (): RouteItem[] => {
  return publicRoutes;
};

export const getNotFound404Element = () => {
  return <NotFound />;
};
