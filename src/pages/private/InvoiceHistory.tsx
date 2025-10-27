import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Search, Eye, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import FetchingSpinner from "@/components/common/FetchingSpinner";

import useAuth from "@/hooks/useAuth";
import { invoiceService } from "@/services/factories/invoiceServiceFactory";
import type { Invoice, InvoiceDetail } from "@/types/Invoice";
import ViewInvoiceDetailsModal from "./components/ViewInvoiceDetailsModal";
import { Link } from "react-router-dom";
import ConfirmStateChangeModal from "@/components/common/ConfirmStateChangeModal";

export default function InvoiceHistory() {
  const { logout, getAccessToken } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [confirmStateModalOpen, setConfirmStateModalOpen] = useState(false);
  const [confirmTargetInvoice, setConfirmTargetInvoice] =
    useState<Invoice | null>(null);
  const [confirmTargetState, setConfirmTargetState] = useState<
    "PAID" | "CANCELLED"
  >("PAID");
  // const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const token = getAccessToken();

  const fetchInvoices = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección.");
      logout();
      return;
    }

    setLoading(true);
    try {
      const {
        success,
        invoices: fetched,
        message,
      } = await invoiceService.getAllInvoices(token);
      if (!success) {
        toast.error(message || "Error al obtener facturas");
        setInvoices([]);
      } else if (fetched) {
        // ordenar por createdAt descendente si existe
        const sorted = [...fetched].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        setInvoices(sorted);
      }
    } catch (e) {
      toast.error("Ocurrió un error al cargar las facturas.");
    } finally {
      setLoading(false);
    }
  };

  const customersList = useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach((i) => {
      if (i.customer && i.customer.id) {
        map.set(
          i.customer.id,
          `${i.customer.firstName ?? ""} ${i.customer.lastName ?? ""}`.trim()
        );
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [invoices]);

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredInvoices = useMemo(() => {
    const q = search.toLowerCase().trim();

    return invoices.filter((inv) => {
      // search (id, date string, customer name, line product names)
      const inId = (inv.id || "").toLowerCase().includes(q);
      const inDate = (inv.createdAt || "").toLowerCase().includes(q);
      const inCustomer = (
        inv.customer
          ? `${inv.customer.firstName ?? ""} ${inv.customer.lastName ?? ""}`
          : ""
      )
        .toLowerCase()
        .includes(q);
      const inLines = (inv.items || []).some((l) =>
        (l.product.name || "").toLowerCase().includes(q)
      );

      if (q && !(inId || inDate || inCustomer || inLines)) return false;

      // status filter
      if (statusFilter !== "all" && inv.state !== statusFilter) return false;

      // customer filter (by id)
      if (customerFilter !== "all") {
        if (!inv.customer || inv.customer.id !== customerFilter) return false;
      }

      // date range filter (startDate/endDate are YYYY-MM-DD)
      if (startDate) {
        const invDate = inv.createdAt ? new Date(inv.createdAt) : null;
        const start = new Date(startDate + "T00:00:00");
        if (!invDate || invDate < start) return false;
      }
      if (endDate) {
        const invDate = inv.createdAt ? new Date(inv.createdAt) : null;
        // include the whole end day
        const end = new Date(endDate + "T23:59:59.999");
        if (!invDate || invDate > end) return false;
      }

      return true;
    });
  }, [invoices, search, startDate, endDate, statusFilter, customerFilter]);

  const INVOICES_PER_PAGE = 6;
  useEffect(
    () => setCurrentPage(1),
    [search, startDate, endDate, statusFilter, customerFilter]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE)
  );

  const paginated = useMemo(() => {
    return filteredInvoices.slice(
      (currentPage - 1) * INVOICES_PER_PAGE,
      currentPage * INVOICES_PER_PAGE
    );
  }, [filteredInvoices, currentPage]);

  // const handleDelete = async (id?: string) => {
  //   if (!id) return;
  //   if (!token) {
  //     toast.error("Por favor, inicia sesión para realizar esta acción.");
  //     logout();
  //     return;
  //   }

  //   try {
  //     const res = await invoiceService.deleteInvoiceById(token, id);
  //     if (!res.success) {
  //       toast.error(res.message || "No se pudo eliminar la factura.");
  //       return;
  //     }
  //     setInvoices((prev) => prev.filter((i) => i.id !== id));
  //     toast.success("Factura eliminada correctamente.");
  //   } catch {
  //     toast.error("Error al eliminar la factura.");
  //   }
  // };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold">Historial de Facturas</h1>
      <p className="text-muted-foreground">
        Sección donde se listan todas las facturas existentes dentro del
        sistema.
      </p>

      <Card className="overflow-hidden rounded-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <div className="text-start">
              <h3 className="text-2xl font-semibold">Todas las facturas</h3>
              <p className="text-md text-green-500">
                Facturas totales ({invoices.length})
              </p>
            </div>
            <div className="relative w-full max-w-60 md:w-1/3 ml-auto bg-gray-50">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <Input
                aria-label="Buscar productos"
                placeholder="Buscar"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 border-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="w-36 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Estado</span>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PAID">Pagadas</SelectItem>
                  <SelectItem value="CANCELLED">Canceladas</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={customerFilter}
                onValueChange={(v) => setCustomerFilter(v)}
              >
                <SelectTrigger className="w-48 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Cliente</span>
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {customersList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 border-none w-40"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border-none w-40"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/new-invoice"
                className="inline-block"
                title="Crear nueva factura"
              >
                <Button size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Nueva factura
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">ID</TableHead>
                  <TableHead className="text-gray-400">Fecha</TableHead>
                  <TableHead className="text-center text-gray-400">
                    Estado
                  </TableHead>
                  <TableHead className="text-gray-400">Cliente</TableHead>
                  <TableHead className="text-gray-400">Productos</TableHead>
                  <TableHead className="text-gray-400">Total</TableHead>
                  <TableHead className="text-center text-gray-400">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6">
                      <FetchingSpinner />
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6">
                      No se encontraron facturas
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((inv) => (
                    <TableRow
                      key={inv.id ?? Math.random()}
                      className="hover:bg-primary/5 transition"
                    >
                      <TableCell className="font-medium whitespace-nowrap text-start">
                        {inv.id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap text-start">
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                            inv.state === "PAID"
                              ? "bg-green-100 text-green-800"
                              : inv.state === "CANCELLED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {inv.state ?? "PENDING"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap text-start">
                        {inv.customer
                          ? `${inv.customer.firstName} ${inv.customer.lastName}`
                          : "—"}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm flex flex-col max-w-[440px]">
                          {(inv.items || []).map((invDetail: InvoiceDetail) => (
                            <div
                              key={`${invDetail.id}-${invDetail.product.id}`}
                              className="flex items-center"
                            >
                              <span className="truncate block max-w-[340px]">
                                {invDetail.product.name}
                              </span>
                              <span className="text-muted-foreground ml-4 whitespace-nowrap">
                                x{invDetail.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>

                      <TableCell className="text-start whitespace-nowrap">
                        ${inv.priceTotal.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Ver detalles"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setViewDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {/* Sólo permitir cambiar estado si está PENDING */}
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            title={
                              (inv.state ?? "PENDING") !== "PENDING"
                                ? "No se puede cambiar el estado"
                                : "Marcar como pagada"
                            }
                            onClick={() => {
                              setConfirmTargetInvoice(inv);
                              setConfirmTargetState("PAID");
                              setConfirmStateModalOpen(true);
                            }}
                            disabled={(inv.state ?? "PENDING") !== "PENDING"}
                          >
                            Pagar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            title={
                              (inv.state ?? "PENDING") !== "PENDING"
                                ? "No se puede cambiar el estado"
                                : "Cancelar factura"
                            }
                            onClick={() => {
                              setConfirmTargetInvoice(inv);
                              setConfirmTargetState("CANCELLED");
                              setConfirmStateModalOpen(true);
                            }}
                            disabled={(inv.state ?? "PENDING") !== "PENDING"}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <ViewInvoiceDetailsModal
        open={viewDetailsModalOpen}
        onOpenChange={(v) => setViewDetailsModalOpen(v)}
        selectedInvoice={selectedInvoice}
        setSelectedInvoice={setSelectedInvoice}
        onStateChanged={fetchInvoices}
      />

      <ConfirmStateChangeModal
        isOpen={confirmStateModalOpen}
        onClose={() => setConfirmStateModalOpen(false)}
        invoiceId={confirmTargetInvoice?.id}
        stateToSet={confirmTargetState}
        onConfirm={async () => {
          if (!confirmTargetInvoice) return;
          const token = getAccessToken();
          if (!token) {
            toast.error("Por favor, inicia sesión para realizar esta acción.");
            logout();
            return;
          }
          const res = await invoiceService.changeInvoiceState(
            token,
            confirmTargetInvoice.id,
            confirmTargetState
          );
          if (!res.success) {
            toast.error(res.message || "No se pudo cambiar el estado");
            setConfirmStateModalOpen(false);
            return;
          }
          toast.success("Estado actualizado");
          setConfirmStateModalOpen(false);
          // refresh list
          await fetchInvoices();
          // if currently viewing details of that invoice, update it
          if (selectedInvoice?.id === confirmTargetInvoice.id && res.invoice) {
            setSelectedInvoice(res.invoice);
            setViewDetailsModalOpen(false);
            setViewDetailsModalOpen(true);
          }
        }}
      />
      {/* Confirm delete modal */}
      {/* <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={async () => {
          if (selectedInvoice && selectedInvoice.id) {
            await handleDelete(selectedInvoice.id);
          }
          setDeleteModalOpen(false);
          setSelectedInvoice(null);
        }}
      /> */}
    </div>
  );
}
