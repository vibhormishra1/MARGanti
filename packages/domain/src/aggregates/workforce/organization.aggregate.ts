import { AggregateRoot } from "../../aggregates/aggregate-root";

export interface Department {
  id: string;
  name: string;
}

export interface OrganizationProps {
  name: string;
  departments: Department[];
}

export class Organization extends AggregateRoot<OrganizationProps> {
  private constructor(props: OrganizationProps, id: string) {
    super(props, id);
  }

  get name(): string { return this.props.name; }
  get departments(): Department[] { return [...this.props.departments]; }

  public static create(id: string, name: string): Organization {
    return new Organization({
      name,
      departments: []
    }, id);
  }

  public addDepartment(department: Department): void {
    if (!this.props.departments.find(d => d.id === department.id)) {
      this.props.departments.push(department);
    }
  }
}
