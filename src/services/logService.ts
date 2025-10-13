import { apiEndpoints } from "@/api/endpoints";
import type { AuditLog } from "@/types/Logs";
import type { ILogService } from "./interfaces/ILogService";

class LogServiceReal implements ILogService {
  async getAllLogs(token: string): Promise<{
    success: boolean;
    logs?: AuditLog[];
    message?: string;
  }> {
    try {
      const response = await fetch(apiEndpoints.logs.GET_ALL_LOGS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || "Error fetching logs",
        };
      }

      const data: AuditLog[] = await response.json();
      return { success: true, logs: data };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || "Network error",
      };
    }
  }
}

export const logServiceReal = new LogServiceReal();
