import { isValidationOk } from './shared/validation.util.js'
import { validateOrder } from './order-validation.js'
import { PrismaCriteria, PrismaCriteriaOptions, PrismaWhereStatement, UserInputCriteria } from './types.js'
import { processUserInputFilters } from './filters/index.js'
import { stringToNumber } from './shared/string-to-number.util.js'
import { PRISMA_LOGIC_OPERATORS } from './filters/validation/consts.js'
import assert from 'assert'

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

  const userProvidedAndDefaultFilters = (
    Object.values(PRISMA_LOGIC_OPERATORS)
  ).reduce<PrismaWhereStatement>((acc, logicOperator) => {
    const isPresentInDefaultFilters = Object.hasOwn(defaultFilters ?? {}, logicOperator)
    const isPresentInProcessedFilters = Object.hasOwn(processedUserInputFilters, logicOperator)

    if (!isPresentInDefaultFilters && !isPresentInProcessedFilters) return acc

    return {
      ...acc,
      [logicOperator]: [
        ...(isPresentInDefaultFilters ? defaultFilters![logicOperator]! : []),
        ...(isPresentInProcessedFilters ? processedUserInputFilters[logicOperator]! : [])
      ]
    }
  }, {})

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

  const didUserProvideFilters = userInputCriteria.filters?.length === 0
  const thereAreValidFilters = Object
    .values(userProvidedAndDefaultFilters)
    .some((logicOperatorFilters) => logicOperatorFilters.length > 0)

  const whereClause: Partial<{ where: PrismaCriteria['where'] }> = {}

  switch (true) {
    // Doesn't return any match
    case (didUserProvideFilters && !thereAreValidFilters):
      whereClause.where = { OR: [] }
      break

    // Ignores the where clause (as if it were not provided)
    case (!didUserProvideFilters):
      whereClause.where = { AND: [] }
      break

    // return the matched places with the filters
    case (thereAreValidFilters):
      whereClause.where = userProvidedAndDefaultFilters
      break

    default: assert.fail('Shouln\'t reach this point')
  }

  return {
    ...whereClause,
    orderBy,
    skip,
    take
  }
}
