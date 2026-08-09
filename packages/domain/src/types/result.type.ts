export type Success<T> = {
  isSuccess: true;
  isFailure: false;
  getValue: () => T;
};

export type Failure<E> = {
  isSuccess: false;
  isFailure: true;
  getError: () => E;
};

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class ResultFactory {
  public static ok<T>(value: T): Success<T> {
    return {
      isSuccess: true,
      isFailure: false,
      getValue: () => value,
    };
  }

  public static fail<E>(error: E): Failure<E> {
    return {
      isSuccess: false,
      isFailure: true,
      getError: () => error,
    };
  }
}
