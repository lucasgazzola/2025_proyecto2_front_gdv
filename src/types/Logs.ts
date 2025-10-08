export type LogLevel = "INFO" | "ERROR" | "WARN";

export type LogEntry = {
  id: number;
  date: string;
  description: string;
  file: string;
  logLevel: LogLevel;
  method: string;
  user: string;
};
