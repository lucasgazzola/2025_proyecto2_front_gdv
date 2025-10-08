import { lazy } from "react";

import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  Database,
  Infinity as InfinityLogo,
  User,
  Settings,
  Bug,
  Boxes,
} from "lucide-react";

export type RouteItem = {
  label: string;
  to: string;
  icon: React.ElementType;
  element?: React.ReactNode;
  hiddenOnSidebar?: boolean;
};

import { Role } from "./types/Role";

// Lazy-loaded pages
const Login = lazy(() => import("@/pages/public/Login"));
const Register = lazy(() => import("@/pages/public/Register"));
const ForgotPassword = lazy(() => import("@/pages/public/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/public/ResetPassword"));
const Profile = lazy(() => import("@/pages/public/Profile"));
const Config = lazy(() => import("@/pages/public/Config"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const SuperDashboard = lazy(
  () => import("@/pages/private/superadmin/SuperDashboard")
);
const SuperUsers = lazy(() => import("@/pages/private/superadmin/SuperUsers"));

const SuperLogs = lazy(() => import("@/pages/private/superadmin/SuperLogs"));
const SuperProducts = lazy(
  () => import("@/pages/private/superadmin/SuperProducts")
);

export const publicRoutes: RouteItem[] = [
  {
    label: "nav.login",
    to: "/login",
    icon: User,
    element: <Login />,
  },
  {
    label: "nav.register",
    to: "/register",
    icon: User,
    element: <Register />,
  },
  {
    label: "nav.forgotPassword",
    to: "/forgot-password",
    icon: Mail,
    element: <ForgotPassword />,
  },
  {
    label: "nav.resetPassword",
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
      label: "nav.profile",
      to: "/profile",
      icon: User,
      element: <Profile />,
      hiddenOnSidebar: true,
    },
  ],

  [Role.SUPERADMIN]: [
    {
      label: "nav.profile",
      to: "/profile",
      icon: User,
      element: <Profile />,
      hiddenOnSidebar: true,
    },
    {
      label: "nav.dashboard",
      to: "/dashboard",
      icon: LayoutDashboard,
      element: <SuperDashboard />,
    },
    {
      label: "nav.users",
      to: "/users",
      icon: Users,
      element: <SuperUsers />,
    },
    {
      label: "nav.products",
      to: "/products",
      icon: Boxes,
      element: <SuperProducts />,
    },
    // {
    //   label: "nav.stats",
    //   to: "/stats",
    //   icon: BarChart3,
    //   element: <SuperStats />,
    // },
    { label: "nav.logs", to: "/logs", icon: Bug, element: <SuperLogs /> },
    { label: "nav.config", to: "/config", icon: Settings, element: <Config /> },
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

export const footerLinks: RouteItem[] = [
  {
    to: "/data-integration",
    icon: Database,
    label: "Integración de datos",
  },
  { to: "/about-us", icon: InfinityLogo, label: "Acerca de nosotros" },
  { to: "/use-cases", icon: FileText, label: "Casos de uso" },
  { to: "/contact", icon: Mail, label: "Contáctenos" },
];
