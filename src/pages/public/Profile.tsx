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
const { getUserProfile, updateUserProfile } = userService;

import type { User } from "@/types/User";
import ProfileChangePasswordModal from "./components/ProfileChangePasswordModal";
import { Lock } from "lucide-react";

export default function Profile() {
  const { logout, name, lastname, setName, setLastname, getAccessToken } =
    useAuth();

  const [user, setUser] = useState<User>();
  const [newName, setNewName] = useState("");
  const [newLastname, setNewLastname] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const token = getAccessToken();

  useEffect(() => {
    (async () => {
      if (!token) {
        toast.error("Error de autenticación");
        logout();
        return;
      }

      const { success, user, message } = await getUserProfile(token);

      if (!success) {
        toast.error(message || "Error de autenticación");
        return;
      }

      if (!user) {
        toast.error("Usuario no encontrado");
        return;
      }

      setUser(user);
      setNewName(user.name);
      setNewLastname(user.lastname);
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

    const { success, message } = await updateUserProfile(token, {
      name: newName,
      lastname: newLastname,
      email: user?.email || "",
    });

    if (!success) {
      toast.error(message || "Error al actualizar el perfil");
      return;
    }

    localStorage.setItem("name", newName);
    localStorage.setItem("lastname", newLastname);

    setName(newName);
    setLastname(newLastname);
    toast.success("Perfil actualizado con éxito");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Mi Perfil</h1>

      <Card className="p-8 shadow-lg rounded-2xl">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastname">Apellido</Label>
              <Input
                id="lastname"
                value={newLastname}
                onChange={(e) => setNewLastname(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Input
                value={
                  user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : ""
                }
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={user?.active ? "Activo" : "Inactivo"} disabled />
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2"
              onClick={() => setPasswordModalOpen(true)}
            >
              <Lock className="w-4 h-4" />
              Cambiar Contraseña
            </Button>
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </div>
        </CardContent>
      </Card>

      {passwordModalOpen && (
        <ProfileChangePasswordModal
          token={token || ""}
          setPasswordModalOpen={setPasswordModalOpen}
          passwordModalOpen={passwordModalOpen}
        />
      )}
    </div>
  );
}
