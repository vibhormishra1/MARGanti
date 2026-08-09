import { ValueObject } from "./base.value-object";
import { ResultFactory, Result } from "../types/result.type";

interface ContactInfoProps {
  email: string;
  phone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export class ContactInfo extends ValueObject<ContactInfoProps> {
  private constructor(props: ContactInfoProps) {
    super(props);
  }

  get email(): string { return this.props.email; }
  get phone(): string { return this.props.phone; }
  get emergencyContactName(): string | undefined { return this.props.emergencyContactName; }
  get emergencyContactPhone(): string | undefined { return this.props.emergencyContactPhone; }

  public static create(props: ContactInfoProps): Result<ContactInfo> {
    if (!props.email.includes("@")) {
      return ResultFactory.fail(new Error("Invalid email format."));
    }
    return ResultFactory.ok(new ContactInfo(props));
  }
}
