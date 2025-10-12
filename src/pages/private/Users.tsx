import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

import EditUserModal from "./components/EditUserModal";

import useAuth from "@/hooks/useAuth";

import type { User } from "@/types/User";
import { userService } from "@/services/factories/userServiceFactory";
const { getAllUsers, updateUserByEmail } = userService;

export default function SuperUsers() {
  const { logout, email, getAccessToken } = useAuth();

  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<string>("latest");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  const token = getAccessToken();

  const fetchUsers = async () => {
    if (!token) {
      toast.error("Por favor, inicia sesión para acceder a esta sección");
      logout();
      return;
    }

    // Cargar todos los usuarios al cargar la página
    setLoading(true);
    const { success, message, users } = await getAllUsers(token);
    setLoading(false);

    if (!success && message) {
      toast.error(message);
      return;
    }
    if (!users || users.length === 0) {
      toast.info("No users found");
      return;
    }
    setUsers(users);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada vez que queramos filtrar volvemos a la página 1
  // para evitar que el usuario se quede en una página que no tiene resultados
  useEffect(() => {
    setCurrentPage(1);
  }, [search, orderBy]);

  const filtered = users.filter((user) => {
    // Excluir el usuario actual
    // if (user.email === email) return false;

    const q = search.toLowerCase().trim();

    let matchesSearch = true;
    if (q) {
      switch (orderBy) {
        case "name":
          matchesSearch = user.name.toLowerCase().includes(q);
          break;
        case "lastname":
          matchesSearch = user.lastname.toLowerCase().includes(q);
          break;
        case "email":
          matchesSearch = user.email.toLowerCase().includes(q);
          break;
        case "phone":
          matchesSearch = (
            (((user as unknown) as { phone?: string }).phone ?? "")
          )
            .toLowerCase()
            .includes(q);
          break;
        case "state":
          // compare against 'activo'/'inactivo' textual search
          matchesSearch = (user.active ? "activo" : "inactivo").includes(q);
          break;
        default:
          matchesSearch =
            user.name.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q);
      }
    }

    return matchesSearch;
  });

  const handleSave = (user: User, isEdit: boolean) => {
    if (isEdit) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.email === user.email ? user : u))
      );
      toast.success("Usuario actualizado correctamente");
    } else {
      // setUsers((prevUsers) => [...prevUsers, user]);
      fetchUsers(); // Refrescar la lista de usuarios
      toast.success("Usuario agregado correctamente");
    }
  };

  const toggleBlockUser = async (user: User) => {
    if (!token) {
      toast.error("Por favor, inicia sesión para realizar esta acción.");
      logout();
      return;
    }
    // Intercambiar el estado de bloqueo del usuario por el contrario al actual
    setBlockLoading(true);
    const {
      success,
      message,
      user: updatedUser,
    } = await updateUserByEmail(token, user.email, {
      active: !user.active,
    });
    setBlockLoading(false);
    if (!success) {
      toast.error(message || "Error al bloquear/desbloquear el usuario.");
      return;
    }

    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.email === updatedUser?.email
          ? { ...u, active: updatedUser.active }
          : u
      )
    );

    // TODO: Extraer a un archivo de traducciones
    toast.success(
      `Usuario ${updatedUser?.email} ${
        updatedUser?.active ? "activado" : "desactivado"
      } correctamente`
    );
  };

  // Paginación
  const USERS_PER_PAGE = 5;

  const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-4xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">
          Sección donde se gestionan los usuarios del sistema.
        </p>
        <Card className="mb-6 border-0 rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="text-start">
                <h3 className="text-2xl font-semibold">Todos los usuarios</h3>
                <p className="text-md text-green-500">
                  Usuarios activos ({users.filter(user => user.active).length})
                </p>
              </div>
              <div className="relative w-full max-w-60 md:w-1/3 ml-auto bg-gray-50">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </span>
                <Input
                aria-label="Buscar usuarios"
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
                  <SelectItem value="phone">Teléfono</SelectItem>
                  <SelectItem value="state">Estado</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="w-full md:w-auto">
                <Button
                  onClick={() => {
                    setSelectedUser(null);
                    setModalOpen(true);
                  }}
                >
                  Agregar usuario
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
                    <TableHead className="text-gray-400">Telefono</TableHead>
                    <TableHead className="text-gray-400">Estado</TableHead>
                    <TableHead className="text-center text-gray-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-start">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <FetchingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.email.length > 50 ? user.email.slice(0, 50) : user.email}>
                        <TableCell>
                          {user.name.length > 50
                            ? user.name.slice(0, 50)
                            : user.name}
                        </TableCell>
                        <TableCell>
                          {user.lastname.length > 50
                            ? user.lastname.slice(0, 50)
                            : user.lastname}
                        </TableCell>
                        <TableCell>
                          {user.email.length > 50
                            ? user.email.slice(0, 50)
                            : user.email}
                        </TableCell>
                        <TableCell>
                          {user.phone}
                        </TableCell>
                        <TableCell>
                          {user.active ? (
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
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Bloquear/Desbloquear"
                            disabled={blockLoading}
                            onClick={() => toggleBlockUser(user)}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                          <EditButton
                            handleEdit={() => {
                              setSelectedUser(user);
                              setModalOpen(true);
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
          <EditUserModal
            open={modalOpen}
            setModalOpen={setModalOpen}
            user={selectedUser}
            onSave={handleSave}
          />
        )}
      </div>
    </>
  );
}
