import { Service, ServiceCategory } from "@/types";
import servicesData from "@/data/mock/services.json";

export async function getServices(): Promise<Service[]> {
  return servicesData as Service[];
}

export async function getServicesByCategories(
  categories: ServiceCategory[]
): Promise<Service[]> {
  return (servicesData as Service[]).filter((s) =>
    categories.includes(s.category as ServiceCategory)
  );
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  return (servicesData as Service[]).find((s) => s.id === id);
}
