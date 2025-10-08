import { apiEndpoints } from "@/api/endpoints";
import type { LogEntry } from "@/types/Logs";
import type { ILogService } from "./interfaces/ILogService";

type PaginatedLogsDto = {
  content: LogEntry[];
  totalPages: number;
  totalElements: number;
};

class LogServiceReal implements ILogService {
  async getPaginatedLogs({
    page,
    size,
    token,
    level = "all",
  }: {
    page: number;
    size: number;
    token: string;
    level?: string;
  }) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    const baseUrl =
      level && level !== "all"
        ? apiEndpoints.logs.GET_ALL_BY_LEVEL_PAGINATED(level, params.toString())
        : apiEndpoints.logs.GET_ALL_PAGINATED(params.toString());
    try {
      const response = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.message };
      }
      const data = (await response.json()) as PaginatedLogsDto;
      return {
        success: true,
        logs: data.content || [],
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || 0,
      };
    } catch (error) {
      return { success: false, message: "Error de red" };
    }
  }

  async getPaginatedUserLogs({
    page,
    size,
    token,
    level = "all",
    search = "",
  }: {
    page: number;
    size: number;
    token: string;
    level?: string;
    search?: string;
  }) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (search) params.append("search", search);
    try {
      const baseUrl =
        level && level !== "all"
          ? apiEndpoints.logs.GET_ALL_BY_LEVEL_BY_USER_PAGINATED(
              level,
              params.toString()
            )
          : apiEndpoints.logs.GET_ALL_BY_USER_PAGINATED(params.toString());
      const response = await fetch(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.message };
      }
      const data = (await response.json()) as PaginatedLogsDto;
      return {
        success: true,
        logs: data.content || [],
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || 0,
      };
    } catch (error) {
      return { success: false, message: "Error de red" };
    }
  }
}

export const logServiceReal = new LogServiceReal();
