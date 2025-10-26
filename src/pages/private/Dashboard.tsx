import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { invoiceService } from "@/services/factories/invoiceServiceFactory";
import { productService } from "@/services/factories/productServiceFactory";
import { userService } from "@/services/factories/userServiceFactory";
import { customerService } from "@/services/factories/customerServiceFactory";
import useAuth from "@/hooks/useAuth";
import DashboardCharts from "./components/DashboardCharts";
import type { Invoice } from "@/types/Invoice";
import type { ProductDto } from "@/types/Product";

export default function Dashboard() {
  const { getAccessToken, logout } = useAuth();
  const token = getAccessToken();

  // loading state intentionally omitted (not needed in this summary view)
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [customersCount, setCustomersCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        toast.error("Por favor inicia sesión para ver el dashboard");
        logout();
        return;
      }
      // start loading
      try {
        const [invRes, prodRes, usersRes, customersRes] = await Promise.all([
          invoiceService.getAllInvoices(token),
          productService.getAllProducts(token),
          userService.getAllUsers(token),
          customerService.getAllCustomers(token),
        ]);

        if (invRes.success && invRes.invoices) setInvoices(invRes.invoices);
        else setInvoices([]);

        if (prodRes.success && prodRes.products) setProducts(prodRes.products);
        else setProducts([]);

        if (usersRes.success && usersRes.users)
          setUsersCount(usersRes.users.length);
        else setUsersCount(null);

        if (customersRes.success && customersRes.customers)
          setCustomersCount(customersRes.customers.length);
        else setCustomersCount(null);
      } catch (error) {
        toast.error("Error cargando datos del dashboard");
      } finally {
        // finished
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sólo sumar ingresos de facturas que estén en estado PAID
  const totalRevenue = useMemo(() => {
    return invoices
      .filter((i) => i.state === "PAID")
      .reduce((s, i) => s + (i.priceTotal ?? 0), 0);
  }, [invoices]);

  const counts = useMemo(() => {
    const totalInvoices = invoices.length;
    const pending = invoices.filter(
      (i) => (i.state ?? "PENDING") === "PENDING"
    ).length;
    const paid = invoices.filter((i) => i.state === "PAID").length;
    const cancelled = invoices.filter((i) => i.state === "CANCELLED").length;
    return { totalInvoices, pending, paid, cancelled };
  }, [invoices]);

  const recentInvoices = useMemo(() => {
    // last 14 days
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 13; // include today and 13 previous days => 14
    return invoices.filter((i) =>
      i.createdAt ? new Date(i.createdAt).getTime() >= cutoff : false
    );
  }, [invoices]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const key = p.brand?.name ?? "Sin marca";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Resumen general del sistema</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Ingresos totales
            </div>
            <div className="text-2xl font-semibold mt-2">
              $
              {totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Basado en facturas marcadas como pagadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Facturas</div>
            <div className="text-2xl font-semibold mt-2">
              {counts.totalInvoices}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Pendientes: {counts.pending} • Pagadas: {counts.paid} •
              Canceladas: {counts.cancelled}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-sm text-muted-foreground">Clientes</div>
            <div className="text-2xl font-semibold mt-2">
              {customersCount ?? "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Usuarios: {usersCount ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DashboardCharts recentInvoices={recentInvoices} pieData={pieData} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top métricas</CardTitle>
              <CardDescription>Resumen rápido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Productos</div>
                  <div className="text-lg font-semibold">{products.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Usuarios</div>
                  <div className="text-lg font-semibold">
                    {usersCount ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Clientes</div>
                  <div className="text-lg font-semibold">
                    {customersCount ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Facturas</div>
                  <div className="text-lg font-semibold">
                    {counts.totalInvoices}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
              <CardDescription>Atajos para tareas comunes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button asChild size="sm">
                  <Link to="/new-invoice">Crear factura</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/invoice-history">Ver facturas</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/products">Administrar productos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
