import type { ILogService } from "@/services/interfaces/ILogService";

import type { AuditLog } from "@/types/Logs";

const LOGS: AuditLog[] = [
  {
    id: "log-20251007-01",
    timestamp: "2025-10-07T12:00:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Login",
    status: "success",
    details: "Inicio de sesión exitoso desde 192.168.1.10",
  },
  {
    id: "log-20251007-02",
    timestamp: "2025-10-07T12:05:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Create product",
    status: "success",
    details:
      "Producto 'Laptop Pro 15' creado (sku: LAP-1501, RAM:16GB, SSD:512GB, CPU: i7)",
  },
  {
    id: "log-20251007-03",
    timestamp: "2025-10-07T12:10:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Update product",
    status: "success",
    details:
      "Actualizó precio de 'SSD NVMe 1TB' (sku: SSD-1000) de $120 a $105",
  },
  {
    id: "log-20251008-01",
    timestamp: "2025-10-08T09:20:00Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Login",
    status: "success",
    details: "Inicio de sesión exitoso desde 172.16.0.4",
  },
  {
    id: "log-20251008-02",
    timestamp: "2025-10-08T09:25:00Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Create invoice",
    status: "success",
    details: "Factura #F-2025-0001 creada por comun@user.com (3 líneas)",
  },
  {
    id: "log-20251009-01",
    timestamp: "2025-10-09T14:02:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Delete product",
    status: "failure",
    details:
      "Intento de borrar producto 'GPU-RX999' fallido: producto con SKU GPU-RX999 no existe",
  },
  {
    id: "log-20251009-02",
    timestamp: "2025-10-09T14:10:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Export logs",
    status: "success",
    details: "Exportó 120 entradas al archivo exports/logs_2025-10-09.csv",
  },
  {
    id: "log-20251010-01",
    timestamp: "2025-10-10T08:30:00Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Reset password",
    status: "success",
    details: "Solicitud de reseteo de contraseña enviada por comun@user.com",
  },
  {
    id: "log-20251010-02",
    timestamp: "2025-10-10T08:35:30Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Change password",
    status: "success",
    details: "Usuario cambió su contraseña correctamente",
  },
  {
    id: "log-20251011-01",
    timestamp: "2025-10-11T11:11:11Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Create user",
    status: "success",
    details: "Usuario 'nuevo@cliente.com' creado con rol USER",
  },
  {
    id: "log-20251011-02",
    timestamp: "2025-10-11T11:15:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Update user",
    status: "success",
    details: "Actualizó datos de 'nuevo@cliente.com' (teléfono, dirección)",
  },
  {
    id: "log-20251012-01",
    timestamp: "2025-10-12T16:45:00Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Access denied",
    status: "failure",
    details: "Intento de acceso a /admin/reportes desde IP 10.0.0.7",
  },
  {
    id: "log-20251012-02",
    timestamp: "2025-10-12T17:00:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Create invoice",
    status: "success",
    details:
      "Factura #F-2025-0002 creada (cliente: TechDistribuciones) total: $4.250 — incluye 1x Laptop Pro 15 y 2x SSD NVMe 1TB",
  },
  {
    id: "log-20251013-01",
    timestamp: "2025-10-13T09:00:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Login failed",
    status: "failure",
    details: "Intento de login fallido para usuario unknown@bad.com",
  },
  {
    id: "log-20251013-02",
    timestamp: "2025-10-13T09:05:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "Permission granted",
    status: "info",
    details:
      "Se concedió acceso temporal al módulo 'reportes' para mock@user.com",
  },
  {
    id: "log-20251013-03",
    timestamp: "2025-10-13T09:15:00Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Update invoice",
    status: "success",
    details:
      "Editó la factura #F-2025-0001: cambió cantidad de 'SSD NVMe 1TB' de 1 a 2",
  },
  {
    id: "log-20251013-04",
    timestamp: "2025-10-13T09:30:00Z",
    user: { email: "mock@user.com", role: "AUDITOR" },
    action: "System check",
    status: "info",
    details: "Chequeo programado completado: 0 errores críticos",
  },
  {
    id: "log-20251013-05",
    timestamp: "2025-10-13T10:00:00Z",
    user: { email: "comun@user.com", role: "USER" },
    action: "Logout",
    status: "info",
    details: "Cerró sesión",
  },
];

class LogServiceMock implements ILogService {
  getAllLogs(
    _token: string
  ): Promise<{ success: boolean; logs?: AuditLog[]; message?: string }> {
    return Promise.resolve({
      success: true,
      logs: LOGS,
    });
  }
}

export const logServiceMock = new LogServiceMock();
