import React, { useState } from "react";
import { InventoryItem } from "@marg/domain";
import { useAllocateResource } from "../api/resource.api";
import { useResourceStore } from "../store/resource.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AllocationFormProps {
  item: InventoryItem;
  incidentId: string;
  onSuccess?: () => void;
}

export function AllocationForm({ item, incidentId, onSuccess }: AllocationFormProps) {
  const [amount, setAmount] = useState<number>(1);
  const allocateMutation = useAllocateResource();
  const saveOffline = useResourceStore(s => s.saveOfflineAllocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > item.availableQuantity.amount) return;

    const payload = {
      incident_id: incidentId,
      assigned_to: "user-123", // From auth
      allocations: [
        {
          inventory_item_id: item.id,
          quantity: { amount, unit: item.availableQuantity.unit }
        }
      ]
    };

    allocateMutation.mutate(payload, {
      onSuccess: () => onSuccess?.(),
      onError: () => {
        // Fallback to offline store
        saveOffline(crypto.randomUUID(), {
          id: crypto.randomUUID(),
          incidentId,
          inventoryItemId: item.id,
          quantity: { amount, unit: item.availableQuantity.unit } as any,
          assignedTo: "user-123",
          timestamp: Date.now()
        });
        onSuccess?.(); // Optimistically close
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white">
      <h3 className="font-semibold text-lg">Allocate {item.category}</h3>
      <p className="text-sm text-gray-500">Available: {item.availableQuantity.amount} {item.availableQuantity.unit}</p>
      
      <div>
        <label className="block text-sm mb-1">Quantity</label>
        <div className="flex gap-2">
          <Input 
            type="number"
            min="1"
            max={item.availableQuantity.amount}
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}
            className="flex-1"
          />
          <div className="bg-gray-100 flex items-center px-3 border rounded text-sm text-gray-600">
            {item.availableQuantity.unit}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={allocateMutation.isPending} className="w-full">
        {allocateMutation.isPending ? "Allocating..." : "Confirm Allocation"}
      </Button>
      {allocateMutation.isError && (
        <p className="text-red-500 text-sm mt-1">Saved offline. Will sync when connected.</p>
      )}
    </form>
  );
}
