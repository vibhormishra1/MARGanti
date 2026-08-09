import { Repository } from "./base.repository";
import { InventoryItem } from "../aggregates/resource/inventory-item.aggregate";
import { ResourceCategory } from "../value-objects/resource-category.enum";

export interface InventoryRepository extends Repository<InventoryItem> {
  findByLocation(lat: number, lng: number, radiusKm: number): Promise<InventoryItem[]>;
  searchByCategory(category: ResourceCategory): Promise<InventoryItem[]>;
}
