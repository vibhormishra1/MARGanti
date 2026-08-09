import { DomainEvent } from "../../events/domain.event";
import { ResourceQuantity } from "../../value-objects/resource-quantity.vo";

export class InventoryUpdatedEvent implements DomainEvent {
  public readonly dateTimeOccurred: Date;
  public readonly inventoryItemId: string;
  public readonly totalQuantity: ResourceQuantity;
  public readonly availableQuantity: ResourceQuantity;

  constructor(
    inventoryItemId: string,
    totalQuantity: ResourceQuantity,
    availableQuantity: ResourceQuantity
  ) {
    this.dateTimeOccurred = new Date();
    this.inventoryItemId = inventoryItemId;
    this.totalQuantity = totalQuantity;
    this.availableQuantity = availableQuantity;
  }

  getAggregateId(): string {
    return this.inventoryItemId;
  }
}
