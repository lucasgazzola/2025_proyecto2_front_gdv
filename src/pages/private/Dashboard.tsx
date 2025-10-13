import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { BarChart3, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { userService } from "@/services/factories/userServiceFactory";
const { getAllUsers } = userService;
import { logsService } from "@/services/factories/logServiceFactory";
const { getAllLogs } = logsService;
import useAuth from "@/hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();

  const [userCount, setUserCount] = useState(0);
  const [logCount, setLogCount] = useState(0);

  const token = getAccessToken();

  useEffect(() => {
    if (!token) return;

    getAllUsers(token).then((res) => {
      if (res.success && res.users) setUserCount(res.users.length - 1); // Exclude the auditor user
    });

    getAllLogs(token).then((res) => {
      if (res.success && Array.isArray(res.logs)) {
        setLogCount(res.logs.length);
      }
    });
  }, [token]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Panel General</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios totales
            </CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">Actualizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logCount}</div>
            <p className="text-xs text-muted-foreground">Ver logs recientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center pb-2">
            <CardTitle className="text-sm font-medium">
              Uso del sistema
            </CardTitle>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">↑ 0%</div>
            <p className="text-xs text-muted-foreground">vs semana pasada</p>
          </CardContent>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>
              Gestioná todas las empresas registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button onClick={() => navigate("/companies")}>Ver empresas</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Usuarios globales</CardTitle>
            <CardDescription>
              Ver todos los usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button onClick={() => navigate("/users")}>Ver usuarios</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Registro de Logs del sistema</CardTitle>
            <CardDescription>Consultá los eventos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button onClick={() => navigate("/logs")}>Ir a Logs</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
            <CardDescription>Actividad general del sistema</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button onClick={() => navigate("/transactions")}>
              Ver transacciones
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
