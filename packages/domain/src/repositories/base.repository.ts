export interface Repository<T> {
  exists(id: string): Promise<boolean>;
  save(t: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}
