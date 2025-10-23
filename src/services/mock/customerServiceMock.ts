import type { Customer } from "@/types/Customer";
import type { ICustomerService } from "@/services/interfaces/ICustomerService";

// Sample customers for the mock
export const CUSTOMERS: Customer[] = [
  {
    id: "c1",
    firstName: "María",
    lastName: "González",
    email: "maria.gonzalez@example.com",
    dni: "12345678",
    phone: "+54 9 11 1234-5678",
    address: "Calle Falsa 123",
    city: "Buenos Aires",
    invoices: [],
    active: true,
  },
  {
    id: "c2",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    dni: "87654321",
    phone: "+54 9 11 8765-4321",
    address: "Av. Siempre Viva 742",
    city: "Córdoba",
    invoices: [],
    active: true,
  },
  {
    id: "c3",
    firstName: "Lucía",
    lastName: "Ramírez",
    email: "lucia.ramirez@example.com",
    dni: "11223344",
    phone: "+54 9 11 1122-3344",
    address: "Pasaje 5",
    city: "Rosario",
    invoices: [],
    active: false,
  },
];

class CustomerServiceMock implements ICustomerService {
  async createCustomer(
    _token: string,
    customer: Partial<Customer>
  ): Promise<{ success: boolean; message?: string; customer?: Customer }> {
    if (!customer || !customer.firstName || !customer.lastName || !customer.dni) {
      return { success: false, message: "Datos incompletos" };
    }
    // prevent duplicate dni
    const exists = CUSTOMERS.some((c) => c.dni === customer.dni);
    if (exists) return { success: false, message: "Cliente con ese DNI ya existe" };

    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || "",
      dni: customer.dni!,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      invoices: customer.invoices || [],
      active: typeof customer.active === "boolean" ? customer.active : true,
    };
    CUSTOMERS.unshift(newCustomer);
    return { success: true, customer: { ...newCustomer } };
  }

  async getAllCustomers(
    _token: string
  ): Promise<{ success: boolean; message?: string; customers?: Customer[] }> {
    return { success: true, customers: [...CUSTOMERS] };
  }

  async getCustomerById(
    _token: string,
    id: string
  ): Promise<{ success: boolean; message?: string; customer?: Customer }> {
    const found = CUSTOMERS.find((c) => c.id === id);
    return { success: !!found, customer: found ? { ...found } : undefined };
  }

  async updateCustomerById(
    _token: string,
    id: string,
    customer: Partial<Customer>
  ): Promise<{ success: boolean; message?: string; customer?: Customer }> {
    const idx = CUSTOMERS.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, message: "Cliente no encontrado" };
    const updated = { ...CUSTOMERS[idx], ...customer };
    CUSTOMERS[idx] = updated;
    return { success: true, customer: { ...updated } };
  }
}

export const customerServiceMock = new CustomerServiceMock();
