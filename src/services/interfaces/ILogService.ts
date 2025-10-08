import type { LogEntry } from "@/types/Logs";

export interface ILogService {
  getPaginatedLogs(params: {
    page: number;
    size: number;
    token: string;
    level?: string;
  }): Promise<{
    success: boolean;
    logs?: LogEntry[];
    totalPages?: number;
    totalElements?: number;
    message?: string;
  }>;

  getPaginatedUserLogs(params: {
    page: number;
    size: number;
    token: string;
    level?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    logs?: LogEntry[];
    totalPages?: number;
    totalElements?: number;
    message?: string;
  }>;
}
