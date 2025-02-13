interface BaseResultType {
  ok: boolean
}

interface ResultOkType<T> extends BaseResultType {
  ok: true
  data: T
}

interface ResultErrorType extends BaseResultType {
  ok: false
  data: {
    message: string
  }
}

export type Result<T> = ResultOkType<T> | ResultErrorType

export function Ok<T>(data: T): Result<T> {
  return {
    ok: true,
    data,
  }
}

export function Err(message: string): Result<never> {
  return { ok: false, data: { message } }
}

/**
 * @description Will return the data of a successful Result. If Result is not successful it will throw an error
 * @param result
 * @returns
 */
export function Unwrap<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(
      `[UNWRAP] tried to unwrap result that contained an error. (${result.data})`,
    )
  } else return result.data
}

/**
 * @description will ensure value is not a promise or, if value is promise, throw an error
 * @param value
 * @returns
 */
export function Unpromise<T>(value: Result<T> | Promise<Result<T>>): Result<T> {
  if (value instanceof Promise) {
    throw new Error(
      `[UNPROMISE] tried to unpromise a value that was indeed a promise`,
    )
  } else return value
}

/**
 * @description Combines the functionality of Unpromise and Unwarp into one! Will throw an error if: value is a promise OR Result is not successfull
 * @param value
 * @returns the fully unwrapped value if successfull
 */
export function Yolo<T>(value: Result<T> | Promise<Result<T>>) {
  return Unwrap(Unpromise(value))
}
