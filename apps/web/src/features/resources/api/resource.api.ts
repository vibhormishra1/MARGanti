import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InventoryItem, ResourceAllocation, Reservation } from "@marg/domain";
// Placeholder for the generated api-sdk
import { httpClient } from "@/lib/http-client";

export const resourceKeys = {
  all: ["resources"] as const,
  inventoryList: (category?: string) => [...resourceKeys.all, "inventory", { category }] as const,
  allocations: (incidentId: string) => [...resourceKeys.all, "allocations", incidentId] as const,
};

const fetchInventory = async (category?: string): Promise<InventoryItem[]> => {
  const params = category ? `?category=${category}` : "";
  const { data } = await httpClient.get<InventoryItem[]>(`/api/v1/resources/inventory${params}`);
  return data;
};

const reserveResource = async (payload: any): Promise<Reservation> => {
  const { data } = await httpClient.post<Reservation>(`/api/v1/resources/inventory/${payload.inventory_item_id}/reserve`, payload);
  return data;
};

const createAllocation = async (payload: any): Promise<ResourceAllocation> => {
  const { data } = await httpClient.post<ResourceAllocation>("/api/v1/resources/allocations", payload);
  return data;
};

export function useInventory(category?: string) {
  return useQuery({
    queryKey: resourceKeys.inventoryList(category),
    queryFn: () => fetchInventory(category),
  });
}

export function useReserveResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reserveResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
  });
}

export function useAllocateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAllocation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.allocations(variables.incident_id) });
      queryClient.invalidateQueries({ queryKey: resourceKeys.inventoryList() });
    },
  });
}
