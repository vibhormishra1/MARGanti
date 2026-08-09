import { ValueObject } from "./base.value-object";
import { ResultFactory, Result } from "../types/result.type";

interface ResourceQuantityProps {
  amount: number;
  unit: string;
}

export class ResourceQuantity extends ValueObject<ResourceQuantityProps> {
  private constructor(props: ResourceQuantityProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get unit(): string {
    return this.props.unit;
  }

  public static create(amount: number, unit: string): Result<ResourceQuantity> {
    if (amount < 0) {
      return ResultFactory.fail(new Error("Resource quantity cannot be negative."));
    }
    if (!unit || unit.trim().length === 0) {
      return ResultFactory.fail(new Error("Resource unit must be defined."));
    }

    return ResultFactory.ok(new ResourceQuantity({ amount, unit }));
  }

  public add(other: ResourceQuantity): Result<ResourceQuantity> {
    if (this.unit !== other.unit) {
      return ResultFactory.fail(new Error("Cannot add quantities with different units."));
    }
    return ResourceQuantity.create(this.amount + other.amount, this.unit);
  }

  public subtract(other: ResourceQuantity): Result<ResourceQuantity> {
    if (this.unit !== other.unit) {
      return ResultFactory.fail(new Error("Cannot subtract quantities with different units."));
    }
    if (this.amount < other.amount) {
      return ResultFactory.fail(new Error("Cannot subtract more than available amount."));
    }
    return ResourceQuantity.create(this.amount - other.amount, this.unit);
  }
}
