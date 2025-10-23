import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

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
import DeleteButton from "@/components/common/DeleteButton";
import MoreDetailsButton from "@/components/common/MoreDetailsButton";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";

import EditCustomerModal from "./components/EditCustomerModal";

import useAuth from "@/hooks/useAuth";

import type { Customer } from "@/types/Customer";
import { customerService } from "@/services/factories/customerServiceFactory";
const { getAllCustomers, updateCustomerById } = customerService;

export default function Customers() {
  const { logout, getAccessToken } = useAuth();

  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<string>("latest");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const token = getAccessToken();

  const fetchCustomers = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección");
      logout();
      return;
    }

    // Cargar todos los clientes al cargar la página
    setLoading(true);
    const { success, message, customers } = await getAllCustomers(token);
    setLoading(false);

    if (!success && message) {
      toast.error(message);
      return;
    }
    if (!customers || customers.length === 0) {
      toast.info("No customers found");
      return;
    }
    setCustomers(customers);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Cada vez que queramos filtrar volvemos a la página 1
  // para evitar que el cliente se quede en una página que no tiene resultados
  useEffect(() => {
    setCurrentPage(1);
  }, [search, orderBy]);

  // Filtro de clientes por nombre, apellido, dni, correo electrónico y teléfono
  const filteredCustomers = customers.filter((customer) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;

    const name = (customer.firstName || "").toLowerCase();
    const lastname = (customer.lastName || "").toLowerCase();
    const email = (customer.email || "").toLowerCase();
    const dni = (customer.dni || "").toLowerCase();
    const phone = (
      (customer as unknown as { phone?: string }).phone ?? ""
    ).toLowerCase();

    return (
      name.includes(q) ||
      lastname.includes(q) ||
      email.includes(q) ||
      dni.includes(q) ||
      phone.includes(q)
    );
  });

  // Ordenar por: nombre/apellido/correo electrónico de A-Z, teléfono ASC, latest = as-is
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
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
        return ((a as unknown as { phone?: string }).phone || "").localeCompare(
          (b as unknown as { phone?: string }).phone || ""
        );
      case "latest":
      default:
        return 0;
    }
  });

  const handleSave = (customer: Customer, isEdit: boolean) => {
    if (isEdit) {
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) => (c.email === customer.email ? customer : c))
      );
      toast.success("Cliente actualizado correctamente");
    } else {
      // setCustomers((prevCustomers) => [...prevCustomers, customer]);
      fetchCustomers(); // Refrescar la lista de clientes
      toast.success("Cliente agregado correctamente");
    }
  };

  // Soft-delete customer by id (backend may not provide hard delete).
  const handleDeleteCustomer = async (customer: Customer) => {
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }

    try {
      const { success, message } = await updateCustomerById(token, customer.id, {
        active: false,
      });

      if (!success) {
        toast.error(message || "Error al eliminar el cliente.");
        return;
      }

      // Remove customer from list (simulate delete) or you could just mark inactive
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      toast.success("Cliente eliminado correctamente.");
    } catch {
      toast.error("Error al eliminar el cliente.");
    }
  };

  // Paginación
  const CUSTOMERS_PER_PAGE = 5;

  const totalPages = Math.ceil(sortedCustomers.length / CUSTOMERS_PER_PAGE);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * CUSTOMERS_PER_PAGE,
    currentPage * CUSTOMERS_PER_PAGE
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-4xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">
          Sección donde se gestionan los clientes del sistema.
        </p>
        <Card className="mb-6 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-start">
                <h3 className="text-2xl font-semibold">Todos los clientes</h3>
                <p className="text-md text-green-500">
                  Clientes activos ({customers.filter((customer) => customer.active).length}
                  )
                </p>
              </div>
              <div className="relative w-full max-w-60 md:w-1/3 ml-auto bg-gray-50">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </span>
                <Input
                  aria-label="Buscar clientes"
                  placeholder="Buscar"
                  value={search}
                  type="text"
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 border-none"
                />
              </div>

              <Select value={orderBy} onValueChange={(v) => setOrderBy(v)}>
                <SelectTrigger className="w-full lg:w-1/4 max-w-60 bg-gray-50 border-none font-semibold">
                  <span className="font-normal">Ordenar por:</span>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Más reciente</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="lastname">Apellido</SelectItem>
                  <SelectItem value="email">Correo</SelectItem>
                  <SelectItem value="dni">DNI</SelectItem>
                  <SelectItem value="phone">Teléfono</SelectItem>
                </SelectContent>
              </Select>
              <div className="w-full md:w-auto">
                <Button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setModalOpen(true);
                  }}
                >
                  Agregar cliente
                </Button>
              </div>
            </div>
          </CardContent>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Nombre</TableHead>
                    <TableHead className="text-gray-400">Apellido</TableHead>
                    <TableHead className="text-gray-400">Correo electrónico</TableHead>
                    <TableHead className="text-gray-400">DNI</TableHead>
                    <TableHead className="text-gray-400">Telefono</TableHead>
                    <TableHead className="text-gray-400">Direccion</TableHead>
                    <TableHead className="text-gray-400">Ciudad</TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
                    <TableHead className="text-center text-gray-400">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-start">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <FetchingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : paginatedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No se encontraron clientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCustomers.map((customer: Customer) => (
                      <TableRow
                        key={
                          customer.id.length > 50
                            ? customer.id.slice(0, 50)
                            : customer.id
                        }
                      >
                        <TableCell>
                          {customer.firstName.length > 50
                            ? customer.firstName.slice(0, 50)
                            : customer.firstName}
                        </TableCell>
                        <TableCell>
                          {customer.lastName.length > 50
                            ? customer.lastName.slice(0, 50)
                            : customer.lastName}
                        </TableCell>
                        <TableCell>
                          {customer.email.length > 50
                            ? customer.email.slice(0, 50)
                            : customer.email}
                        </TableCell>
                        <TableCell>{customer.dni}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>{customer.city}</TableCell>
                        <TableCell>
                          {customer.active ? (
                            <span className="block text-center w-24 text-emerald-700 p-4 rounded-sm bg-emerald-100 text-xs">
                              Activo
                            </span>
                          ) : (
                            <span className="block text-center w-24 text-rose-700 p-4 rounded-sm bg-rose-100 text-xs">
                              Inactivo
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <MoreDetailsButton
                            handleViewDetails={() => {
                              setSelectedCustomer(customer);
                              setModalOpen(true);
                            }}
                          />
                          <EditButton
                            handleEdit={() => {
                              setSelectedCustomer(customer);
                              setModalOpen(true);
                            }}
                          />
                          <DeleteButton
                            handleDelete={() => {
                              setSelectedCustomer(customer);
                              setDeleteModalOpen(true);
                            }}
                          />
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
                Página {currentPage} de {totalPages || 1}
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
                    setCurrentPage((p) => (p < totalPages ? p + 1 : totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {modalOpen && (
          <EditCustomerModal
            open={modalOpen}
            setModalOpen={setModalOpen}
            customer={selectedCustomer}
            onSave={handleSave}
          />
        )}
        {deleteModalOpen && selectedCustomer && (
          <ConfirmDeleteModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedCustomer(null);
            }}
            onConfirm={async () => {
              if (selectedCustomer) {
                await handleDeleteCustomer(selectedCustomer);
              }
              setDeleteModalOpen(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
    </>
  );
}
