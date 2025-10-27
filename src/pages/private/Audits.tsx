import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateByLocale } from "@/utils/dates";
import useAuth from "@/hooks/useAuth";
import type { AuditLog } from "@/types/Logs";
import { logsService } from "@/services/factories/logServiceFactory";
import { toast } from "react-toastify";

import FetchingSpinner from "@/components/common/FetchingSpinner";
import { LogsIcon, Search } from "lucide-react";

export default function Audits() {
  const { logout, getAccessToken } = useAuth();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [logEntries, setLogEntries] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;
  const token = getAccessToken();

  useEffect(() => {
    if (!token) {
      toast.error("Por favor, inicia sesión.");
      logout();
      return;
    }
    const fetchLogs = async () => {
      setLoading(true);
      const { success, logs, message } = await logsService.getAllLogs(token);
      setLoading(false);
      if (!success) {
        toast.error(message || "Error al cargar los registros.");
        return;
      }
      setLogEntries([...(logs?.reverse() || [])]);
      setTotalPages(Math.ceil((logs?.length || 0) / logsPerPage));
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter, logsPerPage]);

  // Filter all logs first, then paginate the filtered result (same pattern as Products.tsx)
  const filteredAll = logEntries
    .filter((log: AuditLog) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      const inAction = log.action?.toLowerCase().includes(q);
      const inDetails = (log.details || "").toLowerCase().includes(q);
      const inUser = (log.user?.email || "").toLowerCase().includes(q);
      return inAction || inDetails || inUser;
    })
    .filter((log) => {
      if (levelFilter === "all") return true;
      return log.status === levelFilter;
    });

  const totalFiltered = filteredAll.length;
  const computedTotalPages = Math.max(
    1,
    Math.ceil(totalFiltered / logsPerPage)
  );
  // Update totalPages whenever the filtered set or page size changes
  useEffect(() => {
    setTotalPages(computedTotalPages);
  }, [computedTotalPages]);

  const paginatedLogs = filteredAll.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const levelBadgeStyle: Record<string, string> = {
    SUCCESS: "bg-emerald-100 text-emerald-800",
    FAILURE: "bg-red-100 text-red-800",
    INFO: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold">Auditoría</h1>
      <p className="text-muted-foreground">
        Historial de acciones y eventos del sistema. Filtra por usuario, nivel o
        busca por texto para inspeccionar registros.
      </p>

      <Card className="mb-6 border-0 rounded-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="text-start">
              <h3 className="text-2xl font-semibold">Registros de auditoría</h3>
              <p className="text-md text-green-500">
                Entradas totales ({logEntries.length})
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
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 border-none"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full lg:w-1/4 max-w-60 bg-gray-50 border-none font-semibold">
                <span className="font-normal">Estado:</span>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILURE">Failure</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">Usuario</TableHead>
                  <TableHead className="text-gray-400">Rol</TableHead>
                  <TableHead className="text-gray-400">Acción</TableHead>
                  <TableHead className="w-48 text-gray-400">
                    Fecha y Hora
                  </TableHead>
                  <TableHead className="text-center text-gray-400">
                    Estado
                  </TableHead>
                  <TableHead className="text-gray-400">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-start">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <FetchingSpinner />
                    </TableCell>
                  </TableRow>
                ) : paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No se encontraron registros.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => {
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="px-2 py-4 text-start">
                          {log.user?.email || "—"}
                        </TableCell>
                        <TableCell className="px-2 py-4 text-start">
                          {log.user?.role || "—"}
                        </TableCell>
                        <TableCell className="px-2 py-4 text-start">
                          {log.action}
                        </TableCell>
                        <TableCell className="px-2 py-4 text-start">
                          {formatDateByLocale(log.timestamp, "es-AR")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={levelBadgeStyle[log.status || "info"]}
                            variant="outline"
                          >
                            {log.status || "info"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-pre-line break-words min-w-sm">
                          <span>{log.details}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
    </div>
  );
}
