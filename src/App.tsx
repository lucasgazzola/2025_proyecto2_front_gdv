import { Suspense, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router";
import "@/App.css";

import {
  getNotFound404Element,
  getProtectedRoutesForRole,
  getPublicRoutes,
  isPublicRoute,
} from "@/routes";

import MainLayout from "@/layouts/MainLayout.tsx";
import RequireAuth from "@/layouts/RequiredAuth.tsx";

import useAuth from "@/hooks/useAuth.tsx";
import LoadingFallback from "@/components/common/LoadingFallback.tsx";

import { isValidRole } from "@/types/Role";

function App() {
  const navigate = useNavigate();
  const { isLoggedIn, authLoading, role } = useAuth();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      const pathname = window.location.pathname;
      if (!isPublicRoute(pathname)) {
        navigate("/login", { replace: true });
      }
    }
  }, [authLoading, isLoggedIn, navigate]);

  if (authLoading) return <LoadingFallback />;

  const dynamicRoutes = isValidRole(role)
    ? getProtectedRoutesForRole(role)
    : [];

  const publicRoutes = getPublicRoutes();

  return (
    <div className="flex flex-col min-h-screen w-dvw max-w-dvw min-w-0">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {publicRoutes.map((route) => (
            <Route
              key={route.to}
              path={route.to}
              element={
                isLoggedIn ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  route.element
                )
              }
            />
          ))}

          <Route element={<RequireAuth />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              {dynamicRoutes.map((route) => (
                <Route key={route.to} path={route.to} element={route.element} />
              ))}
            </Route>
          </Route>
          {/* 👇 Ruta 404 al final */}
          <Route path="*" element={getNotFound404Element()} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
