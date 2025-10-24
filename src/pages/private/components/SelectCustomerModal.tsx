import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, Plus, UsersIcon } from "lucide-react";

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

import FetchingSpinner from "@/components/common/FetchingSpinner";
import EditButton from "@/components/common/EditButton";
import MoreDetailsButton from "@/components/common/MoreDetailsButton";
import EditCustomerModal from "./EditCustomerModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import useAuth from "@/hooks/useAuth";
import type { Customer } from "@/types/Customer";
import { customerService } from "@/services/factories/customerServiceFactory";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (customer: Customer) => void;
};

export default function SelectCustomerModal({ open, onOpenChange, onSelect }: Props) {
  const { logout, getAccessToken } = useAuth();
  const token = getAccessToken();

  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<string>("latest");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false); // for edit/create
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const CUSTOMERS_PER_PAGE = 5;

  const fetchCustomers = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección");
      logout();
      return;
    }
    setLoading(true);
    const { success, message, customers } = await customerService.getAllCustomers(token);
    setLoading(false);
    if (!success) {
      toast.error(message || "Error al cargar clientes");
      return;
    }
    setCustomers(customers || []);
  };

  useEffect(() => {
    if (open) fetchCustomers();
  }, [open]);

  const filtered = customers.filter((customer) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const name = (customer.firstName || "").toLowerCase();
    const lastname = (customer.lastName || "").toLowerCase();
    const email = (customer.email || "").toLowerCase();
    const dni = (customer.dni || "").toLowerCase();
  const phone = ((customer as unknown as { phone?: string }).phone || "").toLowerCase();
    return (
      name.includes(q) || lastname.includes(q) || email.includes(q) || dni.includes(q) || phone.includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (orderBy) {
      case "name":
        return (a.firstName || "").localeCompare(b.firstName || "");
      case "lastName":
        return (a.lastName || "").localeCompare(b.lastName || "");
      case "email":
        return (a.email || "").localeCompare(b.email || "");
      case "dni":
        return (a.dni || "").localeCompare(b.dni || "");
      case "phone":
        return ((a as unknown as { phone?: string }).phone || "").localeCompare((b as unknown as { phone?: string }).phone || "");
      case "latest":
      default:
        return 0;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / CUSTOMERS_PER_PAGE));
  const paginated = sorted.slice((currentPage - 1) * CUSTOMERS_PER_PAGE, currentPage * CUSTOMERS_PER_PAGE);

  const handleSelect = (c: Customer) => {
    onSelect(c);
    onOpenChange(false);
  };

  const handleSaveFromModal = (c: Customer, isEdit: boolean) => {
    if (isEdit) {
      setCustomers((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    } else {
      // refresh to include created
      fetchCustomers();
    }
    setModalOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <UsersIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-800 text-lg font-semibold">
                Seleccionar Cliente
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Seleccionar cliente para factura
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center gap-4">
                <Button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setModalOpen(true);
                  }}
                >
                  Agregar Cliente
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative w-full max-w-xs bg-gray-50">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={16} />
                    </span>
                    <Input
                      placeholder="Buscar"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10"
                    />
                  </div>
                  <Select value={orderBy} onValueChange={(v) => setOrderBy(v)}>
                    <SelectTrigger className="w-48">
                      <span className="font-normal">Ordenar por:</span>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Más reciente</SelectItem>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="lastName">Apellido</SelectItem>
                      <SelectItem value="email">Correo</SelectItem>
                      <SelectItem value="dni">DNI</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apellido</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6"><FetchingSpinner /></TableCell>
                      </TableRow>
                    ) : paginated.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">No hay clientes</TableCell>
                      </TableRow>
                    ) : (
                      paginated.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.firstName}</TableCell>
                          <TableCell>{c.lastName}</TableCell>
                          <TableCell>{c.email}</TableCell>
                          <TableCell>{c.dni}</TableCell>
                          <TableCell>{c.phone}</TableCell>
                          <TableCell>{c.city}</TableCell>
                          <TableCell className="text-center space-x-2">
                            <MoreDetailsButton handleViewDetails={() => { setSelectedCustomer(c); setModalOpen(true); }} />
                            <EditButton handleEdit={() => { setSelectedCustomer(c); setModalOpen(true); }} />
                            <Button variant="ghost" size="sm" onClick={() => handleSelect(c)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</Button>
                  <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {modalOpen && (
          <EditCustomerModal open={modalOpen} setModalOpen={setModalOpen} customer={selectedCustomer} onSave={handleSaveFromModal} />
        )}
      </DialogContent>
    </Dialog>
  );
}
