import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
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
import { useLanguage } from "@/hooks/useLanguage";
import useAuth from "@/hooks/useAuth";
import type { LogEntry, LogLevel } from "@/types/Logs";
import { logsService } from "@/services/factories/logServiceFactory";
const { getPaginatedLogs } = logsService;
import { toast } from "react-toastify";

import FetchingSpinner from "@/components/common/FetchingSpinner";

export default function Audits() {
  const { logout, getAccessToken } = useAuth();
  const { t, language } = useLanguage();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  const [logsPerPage, setLogsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = getAccessToken();

  useEffect(() => {
    if (!token) {
      toast.error("Por favor, inicia sesión.");
      logout();
      return;
    }

    const fetchLogs = async () => {
      setLoading(true);
      // TODO: VER COMO MEJORAR LA BUSQUEDA PORQUE SOLO BUSCA ENTRE LOS QUE ESTÁN EN EL ESTADO Y SON LOS 5, 10 QUE SELECCIONA EL USER
      const { success, logs, totalPages, message } = await getPaginatedLogs({
        page: currentPage - 1,
        size: logsPerPage,
        token,
        level: levelFilter,
      });
      setLoading(false);

      if (!success) {
        toast.error("Error al obtener logs");
        console.error(message);
        return;
      }

      setLogEntries(logs || []);
      setTotalPages(totalPages || 1);
    };

    fetchLogs();
  }, [currentPage, levelFilter, logout, logsPerPage, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, levelFilter, logsPerPage]);

  const filteredLogs = logEntries.filter((log: LogEntry) => {
    const matchSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.file.toLowerCase().includes(search.toLowerCase()) ||
      log.method.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());
    // const matchLevel =
    //   levelFilter === "" ||
    //   levelFilter === "all" ||
    //   log.logLevel === levelFilter;
    return matchSearch;
  });

  const toggleExpand = (id: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const levelBadgeStyle: Record<LogLevel, string> = {
    INFO: "bg-blue-100 text-blue-800",
    ERROR: "bg-red-100 text-red-800",
    WARN: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("logs.title")}</CardTitle>
          <CardDescription>{t("logs.description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input
              placeholder={t("logs.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2"
            />
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t("logs.filterByLevel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("logs.all")}</SelectItem>
                <SelectItem value="INFO">{t("logs.info")}</SelectItem>
                <SelectItem value="ERROR">{t("logs.error")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span>{t("common.show")}:</span>
              <Select
                value={String(logsPerPage)}
                onValueChange={(value) => setLogsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>{t("common.perPage")}</span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">{t("logs.date")}</TableHead>
                  <TableHead>{t("logs.message")}</TableHead>
                  <TableHead>{t("logs.file")}</TableHead>
                  <TableHead className="text-center">
                    {t("logs.level")}
                  </TableHead>
                  <TableHead>{t("logs.method")}</TableHead>
                  <TableHead>{t("logs.user")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-start">
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      <FetchingSpinner />
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      {t("logs.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedLogs[log.id];
                    const isShortText = log.description.length <= 70;

                    const formatDescriptionByLength = (
                      description: string,
                      isExpanded: boolean,
                      isShortText: boolean
                    ) => {
                      if (isShortText) return description;
                      return isExpanded
                        ? description
                        : description.slice(0, 70) + "...";
                    };

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-nowrap">
                          {formatDateByLocale(log.date, language)}
                        </TableCell>
                        <TableCell className="whitespace-pre-line break-words min-w-sm">
                          <span>
                            {formatDescriptionByLength(
                              log.description,
                              isExpanded,
                              isShortText
                            )}
                          </span>

                          {!isShortText && (
                            <Button
                              onClick={() => toggleExpand(log.id)}
                              variant="ghost"
                              className="self-start px-2 text-sm text-slate-800  h-auto hover:bg-transparent hover:underline"
                            >
                              {isExpanded
                                ? t("logs.viewLess")
                                : t("logs.viewMore")}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.file}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={levelBadgeStyle[log.logLevel]}
                            variant="outline"
                          >
                            {log.logLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.method}</TableCell>
                        <TableCell>{log.user}</TableCell>
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
              {t("common.page")} {currentPage} {t("common.of")}{" "}
              {totalPages || 1}
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
    </div>
  );
}
