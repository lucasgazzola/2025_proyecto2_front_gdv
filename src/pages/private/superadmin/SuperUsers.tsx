import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { InfoIcon, Lock, MailCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

import SuperEditUserModal from "./components/SuperEditUserModal";

import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

import { authService } from "@/services/factories/authServiceFactory";
const { regenerateOtp: regenerateOtpService } = authService;

import type { User } from "@/types/User";
import { userService } from "@/services/factories/userServiceFactory";
const { getAllUsers, updateUserByEmail } = userService;
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SuperUsers() {
  const { logout, email, getAccessToken } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
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
  }, [search, roleFilter, activeFilter]);

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.email !== email && // Excluir el usuario actual
      (user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      roleFilter === "" || roleFilter === "all" || user.role === roleFilter;
    const matchesActive =
      activeFilter === "" ||
      activeFilter === "all" ||
      (activeFilter === "active" && user.active) ||
      (activeFilter === "inactive" && !user.active);

    return matchesSearch && matchesRole && matchesActive;
  });

  const handleSave = (user: User, isEdit: boolean) => {
    if (isEdit) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.email === user.email ? user : u))
      );
      toast.success(t("users.userUpdatedSuccessfully"));
    } else {
      // setUsers((prevUsers) => [...prevUsers, user]);
      fetchUsers(); // Refrescar la lista de usuarios
      toast.success(t("users.userAddedSuccessfully"));
    }
  };

  const regenerateOtp = async (email: string) => {
    if (!token) {
      toast.error("Debes iniciar sesión");
      logout();
      return;
    }

    const { success, message } = await regenerateOtpService({ token, email });
    if (!success) {
      toast.error(message || "Error al reenviar el OTP");
      return;
    }

    toast.success(`OTP reenviado al correo de ${email}`);
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t("users.userPageHeader")}</h1>
        <p className="text-muted-foreground mb-6">
          {t("users.userPageHeaderDescription")}
        </p>
      </div>
      <Card className="mb-6">
        <CardContent className="p-6 flex flex-col items-center justify-between gap-4">
          <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
            <Input
              id="user-search"
              name="user-search"
              autoComplete="search-users"
              placeholder={t("users.searchPlaceholder")}
              value={search}
              type="text"
              onChange={(e) => setSearch(e.target.value)}
              className="w-full lg:w-1/4"
            />

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-1/4">
                <SelectValue placeholder={t("users.filterByRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="user">{t("roles.user")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full lg:w-1/4">
                <SelectValue placeholder={t("users.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                <SelectItem value="active">{t("common.active")}</SelectItem>
                <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSelectedUser(null);
                setModalOpen(true);
              }}
              className="w-full lg:max-w-36 lg:w-1/4 lg:ml-auto"
            >
              {t("users.addUserButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>
            {t("users.usersHeader")} ({filtered.length})
          </CardTitle>
          <CardDescription>{t("users.listOfUsersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("users.name")}</TableHead>
                  <TableHead>{t("users.lastname")}</TableHead>
                  <TableHead>{t("users.email")}</TableHead>
                  <TableHead>{t("users.rol")}</TableHead>
                  <TableHead>{t("common.demo")}</TableHead>
                  <TableHead>{t("common.usedTokensOfAvaiable")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-center">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-start">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-6"
                    >
                      <FetchingSpinner />
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-6"
                    >
                      {t("users.noUsersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow
                      key={
                        user.email.length > 50
                          ? user.email.slice(0, 50)
                          : user.email
                      }
                    >
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
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${
                            user.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {!user.active
                            ? t("common.inactive")
                            : t("common.active")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          title={t("users.sendOtp")}
                          onClick={() => regenerateOtp(user.email)}
                        >
                          <MailCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={t("users.lockUnlock")}
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
              {t("common.page")} {currentPage} de {totalPages || 1}
            </span>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t("common.previous")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => (p < totalPages ? p + 1 : totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {modalOpen && (
        <SuperEditUserModal
          open={modalOpen}
          setModalOpen={setModalOpen}
          user={selectedUser}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
