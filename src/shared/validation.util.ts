type ValidationError<Err> = { _result: 'error', error: Err }
type ValidationOk<Ok> = { _result: 'ok', ok: Ok }

export type Validation<Err, Ok> = ValidationError<Err> | ValidationOk<Ok>

export const validationError = <Err>(
  v: Err
): ValidationError<Err> => ({ _result: 'error', error: v })

export const validationOk = <Ok>(
  v: Ok
): ValidationOk<Ok> => ({ _result: 'ok', ok: v })

export const isValidationOk = (
  e: Validation<any, any>
): e is ValidationOk<any> => e._result === 'ok'

export const isValidationErr = (
  e: Validation<any, any>
): e is ValidationError<any> => e._result === 'error'
