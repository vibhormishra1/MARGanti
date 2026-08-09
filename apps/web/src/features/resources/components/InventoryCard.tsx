import React from "react";
import { InventoryItem, MaintenanceStatus } from "@marg/domain";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, AlertTriangle } from "lucide-react";

interface InventoryCardProps {
  item: InventoryItem;
  onAllocate?: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onAllocate }: InventoryCardProps) {
  const isOutOfService = item.maintenanceStatus === MaintenanceStatus.OUT_OF_SERVICE;

  return (
    <Card className={`relative ${isOutOfService ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
            <Package className="w-4 h-4" />
            {item.category}
          </CardTitle>
          <Badge variant={isOutOfService ? "destructive" : "secondary"}>
            {item.maintenanceStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm text-gray-600 space-y-2">
        <div className="flex justify-between font-mono">
          <span>Available:</span>
          <span className={item.availableQuantity.amount === 0 ? "text-red-500 font-bold" : ""}>
            {item.availableQuantity.amount} {item.availableQuantity.unit}
          </span>
        </div>
        <div className="flex justify-between font-mono text-xs text-gray-400">
          <span>Total Stock:</span>
          <span>{item.totalQuantity.amount} {item.totalQuantity.unit}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 gap-1 pt-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{item.location.address || "Depot Location Unknown"}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <button
          className="w-full bg-blue-600 text-white rounded py-2 text-sm disabled:opacity-50"
          disabled={isOutOfService || item.availableQuantity.amount === 0}
          onClick={() => onAllocate?.(item)}
        >
          Allocate Resource
        </button>
      </CardFooter>
      {isOutOfService && (
        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none rounded-lg border-2 border-red-500/50">
          <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
        </div>
      )}
    </Card>
  );
}
