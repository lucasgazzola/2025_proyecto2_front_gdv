import { lazy } from "react";

import {
  LayoutDashboard,
  IdCard,
  Mail,
  FilePlus,
  User,
  Users as IconUsers,
  Package,
  Tag,
  FileSearch,
  Building2,
  Shapes,
} from "lucide-react";

export type RouteItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  element?: React.ReactNode;
  hiddenOnSidebar?: boolean;
};

import { Role } from "./types/Role";

const Login = lazy(() => import("@/pages/public/Login"));
const Register = lazy(() => import("@/pages/public/Register"));
const ForgotPassword = lazy(() => import("@/pages/public/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/public/ResetPassword"));

const Profile = lazy(() => import("@/pages/private/Profile"));
const Dashboard = lazy(() => import("@/pages/private/Dashboard"));
const InvoiceHistory = lazy(() => import("@/pages/private/InvoiceHistory"));
const Invoices = lazy(() => import("@/pages/private/Invoices"));
const Users = lazy(() => import("@/pages/private/Users"));
const Audits = lazy(() => import("@/pages/private/Audits"));
const Products = lazy(() => import("@/pages/private/Products"));
const Brands = lazy(() => import("@/pages/private/Brands"));
const Category = lazy(() => import("@/pages/private/Category"));
const Provider = lazy(() => import("@/pages/private/Provider"));
const Customers = lazy(() => import("@/pages/private/Customers"));
const TeamMetrics = lazy(() => import("@/pages/public/TeamMetrics"));

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
  {
    label: "Métricas del equipo",
    to: "/team-metrics",
    icon: LayoutDashboard,
    element: <TeamMetrics />,
  },
];

export function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => route.to === path);
}

export const roleBasedRoutes: Record<Role, RouteItem[]> = {
  [Role.USER]: [
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
      element: <Dashboard />,
    },
    {
      label: "Nueva factura",
      to: "/new-invoice",
      icon: FilePlus,
      element: <Invoices />,
    },
    {
      label: "Historial de facturas",
      to: "/invoice-history",
      icon: FileSearch,
      element: <InvoiceHistory />,
    },
    {
      label: "Productos",
      to: "/products",
      icon: Package,
      element: <Products />,
    },
    {
      label: "Clientes",
      to: "/customers",
      icon: IconUsers,
      element: <Customers />,
    },
    {
      label: "Marcas",
      to: "/brands",
      icon: Tag,
      element: <Brands />,
    },
    {
      label: "Categorias",
      to: "/categories",
      icon: Shapes,
      element: <Category />,
    },
    {
      label: "Proveedores",
      to: "/providers",
      icon: Building2,
      element: <Provider />,
    },
  ],
  [Role.ADMIN]: [
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
      element: <Dashboard />,
    },
    {
      label: "Nueva factura",
      to: "/new-invoice",
      icon: FilePlus,
      element: <Invoices />,
    },
    {
      label: "Historial de facturas",
      to: "/invoice-history",
      icon: FileSearch,
      element: <InvoiceHistory />,
    },
    {
      label: "Productos",
      to: "/products",
      icon: Package,
      element: <Products />,
    },
    {
      label: "Clientes",
      to: "/customers",
      icon: IconUsers,
      element: <Customers />,
    },
    {
      label: "Marcas",
      to: "/brands",
      icon: Tag,
      element: <Brands />,
    },
    {
      label: "Categorias",
      to: "/categories",
      icon: Shapes,
      element: <Category />,
    },
    {
      label: "Proveedores",
      to: "/providers",
      icon: Building2,
      element: <Provider />,
    },
    {
      label: "Usuarios",
      to: "/users",
      icon: IdCard,
      element: <Users />,
    },
  ],

  [Role.AUDITOR]: [
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
      element: <Dashboard />,
    },
    {
      label: "Auditoría",
      to: "/audits",
      icon: FileSearch,
      element: <Audits />,
    },
  ],
};

export function getSidebarRoutesForRole(role: Role): RouteItem[] {
  const routes = roleBasedRoutes[role] || [];
  return routes.filter((item) => !item.hiddenOnSidebar);
}

export function getProtectedRoutesForRole(role: Role): RouteItem[] {
  return roleBasedRoutes[role];
}

export function getPublicRoutes(): RouteItem[] {
  return publicRoutes;
}
