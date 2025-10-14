import { useEffect, useMemo, useState } from "react";

import useAuth from "@/hooks/useAuth";
import { toast } from "react-toastify";

import { userService } from "@/services/factories/userServiceFactory";
import { productService } from "@/services/factories/productServiceFactory";
import { invoiceService } from "@/services/factories/invoiceServiceFactory";
import { brandService } from "@/services/factories/brandServiceFactory";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

// Recharts
import React, { Suspense } from "react";
const DashboardCharts = React.lazy(
  () => import("./components/DashboardCharts")
);
const MetabaseComponent = React.lazy(
  () => import("./components/MetabaseComponent")
);
import Sparkline from "@/components/ui/Sparkline";
import { Users, Box, FileText } from "lucide-react";
import type { Invoice } from "@/types/Invoice";
import type { ProductDto } from "@/types/Product";

const useMetabaseCharts = import.meta.env.VITE_USE_METABASE_CHARTS === "true";

export default function Dashboard() {
  const { getAccessToken, logout } = useAuth();

  const token = getAccessToken();

  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [invoicesCount, setInvoicesCount] = useState<number | null>(null);
  const [brandsCount, setBrandsCount] = useState<number | null>(null);

  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }

    let mounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const t = token as string;

        const [uRes, pRes, iRes, bRes] = await Promise.all([
          userService.getAllUsers(t),
          productService.getAllProducts(t),
          invoiceService.getAllInvoices(t),
          brandService.getAllBrands(t),
        ]);

        if (!mounted) return;

        if (uRes.success) setUsersCount(uRes.users?.length ?? 0);
        if (pRes.success) setProductsCount(pRes.products?.length ?? 0);
        if (iRes.success) setInvoicesCount(iRes.invoices?.length ?? 0);
        if (bRes.success) setBrandsCount(bRes.brands?.length ?? 0);

        // keep some recent items (first 5)
        if (iRes.success && iRes.invoices) {
          setRecentInvoices(iRes.invoices.slice(0, 5));
        }
        if (pRes.success && pRes.products) {
          setRecentProducts(pRes.products.slice(0, 5));
          setAllProducts(pRes.products);
        }
      } catch (err) {
        toast.error("Error cargando datos del dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [token]);

  const stats = useMemo(
    () => [
      {
        title: "Usuarios",
        value: usersCount ?? "—",
        className: "text-indigo-600",
        icon: Users,
        color: "bg-indigo-500/10",
      },
      {
        title: "Productos",
        value: productsCount ?? "—",
        className: "text-amber-500",
        icon: Box,
        color: "bg-amber-500/10",
      },
      {
        title: "Facturas",
        value: invoicesCount ?? "—",
        className: "text-emerald-600",
        icon: FileText,
        color: "bg-emerald-500/10",
      },
      { title: "Marcas", value: brandsCount ?? "—", className: "text-sky-500" },
    ],
    [usersCount, productsCount, invoicesCount, brandsCount]
  );

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      const brand =
        typeof p.brand === "string" ? p.brand : p.brand?.name ?? "Sin marca";
      map.set(brand, (map.get(brand) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [allProducts]);

  if (useMetabaseCharts) {
    return (
      <Suspense fallback={<div>Cargando gráficos...</div>}>
        <MetabaseComponent />
      </Suspense>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon as any;
          return (
            <Card key={s.title} className="p-4">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-md ${s.color || "bg-slate-100"}`}
                    >
                      {Icon ? <Icon className="h-5 w-5 text-current" /> : null}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{s.title}</CardTitle>
                      <CardDescription />
                    </div>
                  </div>
                  <Sparkline
                    data={new Array(8)
                      .fill(0)
                      .map(() => ({ value: Math.round(Math.random() * 10) }))}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className={`text-3xl font-semibold ${s.className}`}>
                      {s.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Actualizado recientemente
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 h-full">
        <DashboardCharts recentInvoices={recentInvoices} pieData={pieData} />
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas facturas</CardTitle>
              <CardDescription>Resumen rápido</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {loading && (
                  <li className="text-sm text-muted-foreground">Cargando...</li>
                )}
                {!loading && recentInvoices.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No hay facturas
                  </li>
                )}
                {recentInvoices.map((inv: Invoice) => {
                  const customerLabel =
                    typeof inv.creator.name === "string"
                      ? inv.creator.name
                      : inv.creator.name && typeof inv.creator.name === "object"
                      ? inv.creator.name ?? "-"
                      : "-";

                  return (
                    <li
                      key={inv.id}
                      className="flex justify-between items-start"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium">{inv.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {customerLabel}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">
                          ${inv.priceTotal}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(inv.createdAt ?? "").toLocaleDateString()}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos productos</CardTitle>
              <CardDescription>Últimos añadidos</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {loading && (
                  <li className="text-sm text-muted-foreground">Cargando...</li>
                )}
                {!loading && recentProducts.length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    No hay productos
                  </li>
                )}
                {recentProducts.map((p: ProductDto) => {
                  const brandLabel =
                    typeof p.brand === "string"
                      ? p.brand
                      : p.brand && typeof p.brand === "object"
                      ? p.brand.name ?? "-"
                      : "-";

                  return (
                    <li key={p.id} className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground text-start">
                          {brandLabel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ${p.price ?? "0"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {p.quantity ?? 0}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
