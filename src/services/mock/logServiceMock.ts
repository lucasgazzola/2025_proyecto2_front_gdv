import type { ILogService } from "@/services/interfaces/ILogService";

import type { LogEntry } from "@/types/Logs";

const mockLog: LogEntry = {
  id: 1,
  date: "2025-10-07T12:00:00Z",
  description: "Mock log entry",
  file: "mockFile.ts",
  logLevel: "INFO",
  method: "GET",
  user: "mock@user.com",
};

export const logServiceMock: ILogService = {
  getPaginatedLogs: async () => ({
    success: true,
    logs: [mockLog],
    totalPages: 1,
    totalElements: 1,
    message: "Mock getPaginatedLogs",
  }),
  getPaginatedUserLogs: async () => ({
    success: true,
    logs: [mockLog],
    totalPages: 1,
    totalElements: 1,
    message: "Mock getPaginatedUserLogs",
  }),
};
