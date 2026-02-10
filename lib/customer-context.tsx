"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Customer } from "@/types";

interface CustomerContextType {
  customer: Customer | null;
  setCustomerId: (id: string) => void;
  customers: Customer[];
  loading: boolean;
}

const CustomerContext = createContext<CustomerContextType>({
  customer: null,
  setCustomerId: () => {},
  customers: [],
  loading: true,
});

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/data/mock/customers.json").then((mod) => {
      const data = mod.default as Customer[];
      setCustomers(data);
      setCustomer(data[0]);
      setLoading(false);
    });
  }, []);

  const setCustomerId = (id: string) => {
    const found = customers.find((c) => c.id === id);
    if (found) setCustomer(found);
  };

  return (
    <CustomerContext.Provider value={{ customer, setCustomerId, customers, loading }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  return useContext(CustomerContext);
}
