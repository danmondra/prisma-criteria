import { Validation, validationError, validationOk } from '../../../shared/validation.util.js'
import { PrismaScalarType } from '../types.js'

type TypeValidationsAndTransformations =
  Record<PrismaScalarType, (value: string) => Validation<undefined, unknown>>

const isString = (v: unknown): v is string => typeof v === 'string'

export const POSTGRES_VALIDATIONS_AND_TRANSFORMATIONS = Object.freeze({

  string: (value: string): Validation<undefined, string> => {
    if (!isString(value)) return validationError(undefined)

    return validationOk(value)
  },

  number: (value: string): Validation<undefined, number> => {
    if (!isString(value)) return validationError(undefined)

    const convertedNumber = parseInt(value, 10)

    const isValidNumber = isFinite(convertedNumber)
    if (!isValidNumber) return validationError(undefined)

    // const SMALLINT_RANGE = 32768
    // const isSmallInt = convertedNumber <= SMALLINT_RANGE && convertedNumber >= -SMALLINT_RANGE

    // if (!isSmallInt) { console.log(convertedNumber); return validationError(undefined) }

    return validationOk(convertedNumber)
  },

  datetime: (value: string): Validation<undefined, Date> => {
    if (!isString(value)) return validationError(undefined)

    const convertedDate = Date.parse(value)

    if (isNaN(convertedDate)) return validationError(undefined)

    return validationOk(new Date(convertedDate))
  }

} as const) satisfies TypeValidationsAndTransformations
