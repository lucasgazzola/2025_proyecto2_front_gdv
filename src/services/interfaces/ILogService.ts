import type { AuditLog } from "@/types/Logs";

export interface ILogService {
  getAllLogs(token: string): Promise<{
    success: boolean;
    logs?: AuditLog[];
    message?: string;
  }>;
}
