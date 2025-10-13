// Simple audit log type for the app's Audits page
export type LogStatus = "success" | "failure" | "info";

export type AuditLog = {
  id: string; // uuid or unique string
  timestamp: string; // ISO datetime
  user?: {
    email?: string;
    role?: string;
  };
  action: string; // short action name e.g. "Login", "Create brand"
  status?: LogStatus; // success/failure/info
  details?: string; // human-friendly details
};

export const makeAudit = (
  id: string,
  action: string,
  opts?: Partial<Omit<AuditLog, "id" | "action">>
): AuditLog => ({
  id,
  action,
  timestamp: opts?.timestamp ?? new Date().toISOString(),
  user: opts?.user,
  status: opts?.status ?? "info",
  details: opts?.details,
});
