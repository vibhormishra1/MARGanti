export class StorageError extends Error {
  constructor(message: string, public readonly code: string = "STORAGE_ERROR") {
    super(message);
    this.name = "StorageError";
  }
}

export class TransactionError extends StorageError {
  constructor(message: string) {
    super(message, "TRANSACTION_ERROR");
    this.name = "TransactionError";
  }
}
