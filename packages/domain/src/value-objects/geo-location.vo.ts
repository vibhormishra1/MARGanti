import { ValueObject } from "./base.value-object";
import { ResultFactory, Result } from "../types/result.type";

interface GeoLocationProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export class GeoLocation extends ValueObject<GeoLocationProps> {
  private constructor(props: GeoLocationProps) {
    super(props);
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }

  get address(): string | undefined {
    return this.props.address;
  }

  public static create(props: GeoLocationProps): Result<GeoLocation> {
    if (props.latitude < -90 || props.latitude > 90) {
      return ResultFactory.fail(new Error("Latitude must be between -90 and 90."));
    }
    if (props.longitude < -180 || props.longitude > 180) {
      return ResultFactory.fail(new Error("Longitude must be between -180 and 180."));
    }

    return ResultFactory.ok(new GeoLocation(props));
  }
}
