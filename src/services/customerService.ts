import { apiEndpoints } from "@/api/endpoints";
import type { Customer } from "@/types/Customer";
import type { ICustomerService } from "@/services/interfaces/ICustomerService";

class CustomerServiceReal implements ICustomerService {
  async createCustomer(
    token: string,
    customer: Partial<Customer>
  ): Promise<{ success: boolean; message?: string; customer?: Customer }> {
    try {
      const response = await fetch(apiEndpoints.customers.CREATE_CUSTOMER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const msg = err?.message || "Error al crear el cliente";
        return { success: false, message: msg };
      }

      const data = (await response.json()) as Customer;
      return { success: true, customer: data };
    } catch {
      return { success: false, message: "Error al crear el cliente" };
    }
  }

  async getAllCustomers(
    token: string
  ): Promise<{ success: boolean; message?: string; customers?: Customer[] }> {
    try {
      const response = await fetch(apiEndpoints.customers.GET_ALL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los clientes");
      }
      const data = (await response.json()) as Customer[];
      return { success: true, customers: data };
    } catch {
      return {
        success: false,
        message: "Error desconocido al obtener los clientes",
      };
    }
  }

  async getCustomerById(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string; customer?: Customer }> {
    try {
      const response = await fetch(apiEndpoints.customers.GET_BY_ID(id), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        return { success: false, message: "Cliente no encontrado" };
      }
      const data = (await response.json()) as Customer;
      return { success: true, customer: data };
    } catch {
      return { success: false, message: "Error al obtener el cliente" };
    }
  }

  async updateCustomerById(
    token: string,
    id: string,
    customer: Partial<Customer>
  ): Promise<{ success: boolean; message?: string; customer?: Customer }> {
    try {
      const response = await fetch(apiEndpoints.customers.UPDATE_BY_ID(id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        return {
          success: false,
          message: err?.message || "Error al actualizar el cliente",
        };
      }
      const data = (await response.json()) as Customer;
      return { success: true, customer: data };
    } catch {
      return { success: false, message: "Error al actualizar el cliente" };
    }
  }
  async deleteCustomerById(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(apiEndpoints.customers.DELETE_BY_ID(id), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        return {
          success: false,
          message: err?.message || "Error al eliminar el cliente",
        };
      }
      return { success: true };
    } catch {
      return { success: false, message: "Error al eliminar el cliente" };
    }
  }
}

export const customerServiceReal = new CustomerServiceReal();
