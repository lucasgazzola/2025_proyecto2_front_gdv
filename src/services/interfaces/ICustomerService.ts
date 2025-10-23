import type { Customer } from "@/types/Customer";

export interface ICustomerService {
  createCustomer(
    token: string,
    customer: Partial<Customer>
  ): Promise<{ success: boolean; message?: string; customer?: Customer }>;
  getAllCustomers(
    token: string
  ): Promise<{ success: boolean; message?: string; customers?: Customer[] }>;
  getCustomerById(
    token: string,
    id: string
  ): Promise<{ success: boolean; message?: string; customer?: Customer }>;
  updateCustomerById(
    token: string,
    id: string,
    customer: Partial<Customer>
  ): Promise<{ success: boolean; message?: string; customer?: Customer }>;
}