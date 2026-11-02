import { isValidationOk } from './shared/validation.util.js'
import { validateOrder } from './order-validation.js'
import { NewPrismaWhereStatement3, PrismaCriteria, PrismaCriteriaOptions, PrismaIndividualCondition, PrismaWhereFilter, UserInputCriteria } from './types.js'
import { processUserInputFilters } from './filters/index.js'
import { stringToNumber } from './shared/string-to-number.util.js'
import assert from 'assert'
import { PRISMA_LOGIC_OPERATORS } from './filters/validation/consts.js'

export { type UserInputCriteria, type PrismaCriteriaOptions }

export function createPrismaCriteria (
  userInputCriteria: UserInputCriteria,
  criteriaOptions: PrismaCriteriaOptions
): PrismaCriteria {
  const {
    filters: defaultFilters,
    orderBy: defaultOrderBy,
    pagination: defaultPagination
  } = criteriaOptions.defaults ?? {}

  if (defaultPagination && defaultPagination.pageSize < 1)
    throw new Error('The minimium page size is "1".')
  if (defaultPagination && defaultPagination.pageNumber < 1)
    throw new Error('The minimium page number is "1".')

  if (criteriaOptions.rules.allowedFieldsToOrderBy.length > 1)
    throw new Error('You can only order by one field (for now).')

  const onlyStringUserInputs = Object.fromEntries(
    Object.entries(userInputCriteria)
      .filter(entry => typeof entry[1] === 'string')
  )

  const processedUserInputFilters = processUserInputFilters(
    onlyStringUserInputs.filters,
    criteriaOptions.rules.allowedFilters
  )

  let orderBy = defaultOrderBy
  const validationOfUsersInputOrderBy = validateOrder(
    onlyStringUserInputs.orderBy,
    onlyStringUserInputs.orderDir,
    criteriaOptions.rules.allowedFieldsToOrderBy
  )
  if (isValidationOk(validationOfUsersInputOrderBy))
    orderBy = validationOfUsersInputOrderBy.ok.orderBy

  let take = defaultPagination?.pageSize
  const validationOfUsersInputPageSize = stringToNumber(
    onlyStringUserInputs.pageSize
  )
  if (
    isValidationOk(validationOfUsersInputPageSize) &&
    validationOfUsersInputPageSize.ok > 0
  ) {
    take = Math.min(
      validationOfUsersInputPageSize.ok,
      criteriaOptions.rules.pageSizeMax
    )
  }

  // Skip can be undefined, and take defined, but no the otherwise.
  // Skip depends on "take", because:
  // - If there is no "take" defined, it isn't possible to paginate.
  // - If skip is 0, then doesn't matter if take is 20, page should stay 0.
  let skip = defaultPagination && take
    ? (defaultPagination.pageNumber - 1) * take
    : undefined
  const validationOfUsersInputPageNumber = stringToNumber(
    onlyStringUserInputs.pageNumber
  )
  if (
    isValidationOk(validationOfUsersInputPageNumber) &&
    validationOfUsersInputPageNumber.ok > 0 &&
    take
  ) skip = (validationOfUsersInputPageNumber.ok - 1) * take

  const userProvidedAndDefaultFilters: PrismaIndividualCondition[] = [
    ...(defaultFilters ?? []),
    ...(processedUserInputFilters ?? [])
  ]

  const didUserProvideFilters = userInputCriteria.filters?.length !== 0
  const didUserProvideValidFilters = processUserInputFilters.length !== 0
  const wereDefaultFiltersProvided = defaultFilters?.length !== 0

  const whereClause: NewPrismaWhereStatement3 = { where: {} }

  switch (true) {
    // Ignores the where clause (returns all the items)
    case (!didUserProvideFilters && !wereDefaultFiltersProvided):
      whereClause.where = { AND: [] }
      break

    // Doesn't return any match
    case (
      didUserProvideFilters &&
      !didUserProvideValidFilters &&
      !wereDefaultFiltersProvided
    ):
      whereClause.where = { OR: [] }
      break

    // return the matched places with the filters
    case (didUserProvideValidFilters || wereDefaultFiltersProvided): {
      const andGroup: PrismaWhereFilter[] =
        userProvidedAndDefaultFilters.map(individualCondition => {
          const logicOperator = Object.keys(individualCondition)[0]
          if (logicOperator !== PRISMA_LOGIC_OPERATORS.and) return false

          const test: PrismaWhereFilter = Object.values(individualCondition)[0]!
          return test
        }).filter(test => test !== false)
      const orGroup: PrismaWhereFilter[] =
        userProvidedAndDefaultFilters.map(individualCondition => {
          const logicOperator = Object.keys(individualCondition)[0]
          if (logicOperator !== PRISMA_LOGIC_OPERATORS.or) return false

          const test: PrismaWhereFilter = Object.values(individualCondition)[0]!
          return test
        }).filter(test => test !== false)

      whereClause.where = {
        ...(andGroup.length > 0 && { AND: andGroup }),
        ...(orGroup.length > 0 && { OR: orGroup }) as any
      }
      break
    }

    default: assert.fail('Shouln\'t reach this point')
  }

  return {
    ...whereClause,
    orderBy,
    skip,
    take
  }
}
