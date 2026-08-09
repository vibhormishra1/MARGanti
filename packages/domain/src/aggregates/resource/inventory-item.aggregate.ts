import { AggregateRoot } from "../../aggregates/aggregate-root";
import { GeoLocation } from "../../value-objects/geo-location.vo";
import { ResourceCategory } from "../../value-objects/resource-category.enum";
import { ResourceQuantity } from "../../value-objects/resource-quantity.vo";
import { MaintenanceStatus } from "../../value-objects/maintenance-status.enum";
import { Reservation, ReservationProps } from "../../entities/resource/reservation.entity";
import { MaintenanceRecord } from "../../entities/resource/maintenance-record.entity";
import { ResultFactory, Result } from "../../types/result.type";
import { DomainError } from "../../errors/domain.error";
import { InventoryUpdatedEvent } from "../../events/resource/inventory-updated.event";

export interface InventoryItemProps {
  catalogId: string;
  category: ResourceCategory;
  location: GeoLocation;
  totalQuantity: ResourceQuantity;
  availableQuantity: ResourceQuantity;
  maintenanceStatus: MaintenanceStatus;
  reservations: Reservation[];
  maintenanceRecords: MaintenanceRecord[];
  lastUpdatedAt: Date;
}

export class InventoryItem extends AggregateRoot<InventoryItemProps> {
  private constructor(props: InventoryItemProps, id: string) {
    super(props, id);
  }

  get catalogId(): string { return this.props.catalogId; }
  get category(): ResourceCategory { return this.props.category; }
  get location(): GeoLocation { return this.props.location; }
  get totalQuantity(): ResourceQuantity { return this.props.totalQuantity; }
  get availableQuantity(): ResourceQuantity { return this.props.availableQuantity; }
  get maintenanceStatus(): MaintenanceStatus { return this.props.maintenanceStatus; }
  get reservations(): Reservation[] { return [...this.props.reservations]; }

  public static create(
    id: string,
    catalogId: string,
    category: ResourceCategory,
    location: GeoLocation,
    quantity: ResourceQuantity
  ): InventoryItem {
    const item = new InventoryItem({
      catalogId,
      category,
      location,
      totalQuantity: quantity,
      availableQuantity: quantity,
      maintenanceStatus: MaintenanceStatus.OPERATIONAL,
      reservations: [],
      maintenanceRecords: [],
      lastUpdatedAt: new Date()
    }, id);
    return item;
  }

  public reserve(reservationProps: ReservationProps): Result<Reservation> {
    if (this.maintenanceStatus === MaintenanceStatus.OUT_OF_SERVICE) {
      return ResultFactory.fail(new DomainError("Cannot reserve out of service items."));
    }

    const availableRes = this.availableQuantity.subtract(reservationProps.quantity);
    if (!availableRes.isSuccess) {
      return ResultFactory.fail(new DomainError("Insufficient quantity available for reservation."));
    }

    const reservation = Reservation.create(reservationProps);
    this.props.reservations.push(reservation);
    this.props.availableQuantity = availableRes.getValue();
    this.props.lastUpdatedAt = new Date();

    this.addDomainEvent(new InventoryUpdatedEvent(this.id, this.totalQuantity, this.availableQuantity));
    
    return ResultFactory.ok(reservation);
  }

  public consume(quantity: ResourceQuantity): Result<void> {
    const remainingRes = this.totalQuantity.subtract(quantity);
    if (!remainingRes.isSuccess) {
      return ResultFactory.fail(new DomainError("Cannot consume more than total quantity."));
    }
    // Also deduct from available if it wasn't reserved
    const availRes = this.availableQuantity.subtract(quantity);
    
    this.props.totalQuantity = remainingRes.getValue();
    if (availRes.isSuccess) {
        this.props.availableQuantity = availRes.getValue();
    }
    
    this.props.lastUpdatedAt = new Date();
    this.addDomainEvent(new InventoryUpdatedEvent(this.id, this.totalQuantity, this.availableQuantity));
    return ResultFactory.ok(undefined);
  }
}
