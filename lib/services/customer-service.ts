import { Customer } from "@/types";
import customersData from "@/data/mock/customers.json";

export async function getCustomers(): Promise<Customer[]> {
  return customersData as Customer[];
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return (customersData as Customer[]).find((c) => c.id === id);
}
