import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import useAuth from "@/hooks/useAuth";

import { userService } from "@/services/factories/userServiceFactory";
const { getUserProfile, updateUserByEmail } = userService;
import { authService } from "@/services/factories/authServiceFactory";
const { changePassword } = authService;

import type { User } from "@/types/User";
import ShowPasswordIcon from "@/components/common/ShowPasswordIcon";
import { storeLoggedUserData } from "@/utils/localStorage";
// Nota: se usa el campo de contraseña inline con el botón de visibilidad

export default function Profile() {
  const { logout, name, lastname, setName, setLastname, getAccessToken } =
    useAuth();

  const [user, setUser] = useState<User>();
  const [newName, setNewName] = useState("");
  const [newLastname, setNewLastname] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = getAccessToken();

  useEffect(() => {
    (async () => {
      if (!token) {
        toast.error("Error de autenticación");
        logout();
        return;
      }

      const result = await getUserProfile(token);

      if (!result.success) {
        toast.error(result.message || "Error de autenticación");
        return;
      }

      const fetchedUser = result.user as User;

      if (!fetchedUser) {
        toast.error("Usuario no encontrado");
        return;
      }

      setUser(fetchedUser);
      setNewName(fetchedUser.name);
      setNewLastname(fetchedUser.lastname);
      setAddress(fetchedUser.address || "");
      setPhone(fetchedUser.phone || "");
      setCity(fetchedUser.city || "");
      setProvince(fetchedUser.province || "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!newName.trim() || !newLastname.trim()) {
      toast.error("El nombre y el apellido son obligatorios.");
      return;
    }

    if (!token) {
      toast.error("Error de autenticación");
      logout();
      return;
    }
    // Si el usuario tocó algún campo de contraseña, validar antes de guardar.
    const wantsChangePassword = Boolean(
      oldPassword || newPassword || confirmPassword
    );
    if (wantsChangePassword) {
      // Si tocó pero dejó incompleto, mostrar error y no guardar.
      if (!oldPassword || !newPassword || !confirmPassword) {
        toast.error("Para cambiar la contraseña completa los 3 campos.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Las contraseñas no coinciden.");
        return;
      }
    }

    const { success, message } = await updateUserByEmail(
      token,
      user?.email || "",
      {
        name: newName,
        lastname: newLastname,
        email: user?.email || "",
        address,
        phone,
        city,
        province,
      }
    );

    if (!success) {
      toast.error(message || "Error al actualizar el perfil");
      return;
    }

    localStorage.setItem("name", newName);
    localStorage.setItem("lastname", newLastname);

    setName(newName);
    setLastname(newLastname);
    storeLoggedUserData({
      ...user,
      name: newName,
      lastname: newLastname,
    } as User);

    toast.success("Perfil actualizado con éxito");

    // Si el usuario quería cambiar la contraseña, ya validada arriba, llamamos al servicio
    if (wantsChangePassword) {
      if (!token || !user?.email) {
        toast.error("Error de autenticación");
        return;
      }
      const { success: passSuccess, message: passMessage } =
        await changePassword(
          token,
          user.email,
          oldPassword,
          newPassword,
          confirmPassword
        );
      if (!passSuccess) {
        toast.error(passMessage || "Error al cambiar la contraseña");
        return;
      }
      toast.success("Contraseña cambiada correctamente");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleCancel = () => {
    // Restaurar valores desde el usuario cargado
    if (!user) return;
    setNewName(user.name);
    setNewLastname(user.lastname);
    setAddress(user.address || "");
    setPhone(user.phone || "");
    setCity(user.city || "");
    setProvince(user.province || "");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <h1 className="text-4xl font-bold">Editar Perfil</h1>
      <p className="text-muted-foreground">
        Sección donde se editan los datos del perfil del usuario.
      </p>
      <Card className="p-8 shadow-lg rounded-none">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="w-20 h-20 border-2 border-blue-500 shadow">
              <AvatarImage src="/avatar-user.png" alt={name} />
              <AvatarFallback>
                {(name + " " + lastname)
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{user?.email}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {"Editar perfil"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 mt-4">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-6 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="lastname">Apellido</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={newLastname}
                  onChange={(e) => setNewLastname(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="space-y-2 w-full">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={user?.email || ""} />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  name="role"
                  value={
                    user?.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : ""
                  }
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="space-y-2 w-full">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(225) 555-0118"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Universidad 450"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Villa María"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  name="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Córdoba"
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-full">
                <Label htmlFor="oldPassword">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    className="mt-1"
                    id="oldPassword"
                    name="oldPassword"
                    autoComplete="off"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder={"Ingresa tu contraseña actual"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((s) => !s)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <ShowPasswordIcon />
                  </button>
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    className="mt-1"
                    id="newPassword"
                    name="newPassword"
                    autoComplete="off"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={"Ingresa la nueva contraseña"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((s) => !s)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <ShowPasswordIcon />
                  </button>
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="confirmPassword">
                  Confirmar nueva contraseña
                </Label>
                <div className="relative">
                  <Input
                    className="mt-1"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="off"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={"Reingresa la nueva contraseña"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <ShowPasswordIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-6 justify-end">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-all w-24"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button className="w-24" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cambio de contraseña via inline field */}
    </div>
  );
}
