import { FilterPrimitives } from '../../shared/filter.types.js'
import { PrismaFilterRule, PrismaScalarType } from './types.js'
import { PRISMA_COMMON_LIST_OPERATORS } from './consts.js'
import { POSTGRES_VALIDATIONS_AND_TRANSFORMATIONS } from './data-type-validations/postgres-validations-and-transformations.js'
import { isValidationOk, Validation, validationError, validationOk } from '../../shared/validation.util.js'

export const validateValue = (
  value: string,
  expectedType: PrismaScalarType
): Validation<undefined, unknown> => {
  if (value.trim() === '')
    return validationError(undefined)

  if (!(expectedType in POSTGRES_VALIDATIONS_AND_TRANSFORMATIONS))
    return validationError(undefined) // TODO - Logger Instead of this

  return POSTGRES_VALIDATIONS_AND_TRANSFORMATIONS[expectedType](value)
}

export function checkValue (
  filterProspect: FilterPrimitives,
  filterRule: PrismaFilterRule
): Validation<undefined, unknown> {
  const { value, operator } = filterProspect
  const { expectedType } = filterRule

  if (operator === undefined) return validationError(undefined)

  const isOperatorAListOperator = (PRISMA_COMMON_LIST_OPERATORS as readonly string[])
    .includes(operator)

  const isASingleValueFilter = typeof value === 'string' && !isOperatorAListOperator
  if (isASingleValueFilter) return validateValue(value, expectedType)

  const isAListValueFilter = value instanceof Array && isOperatorAListOperator
  if (!isAListValueFilter) return validationError(undefined)

  const validatedValueResults = value.map((val) => {
    return validateValue(val, expectedType)
  })

  const isAListOfTheExpectedType = validatedValueResults
    .every(res => isValidationOk(res))

  if (!isAListOfTheExpectedType) return validationError(undefined)

  return validationOk(validatedValueResults.map(res => res.ok))
}
