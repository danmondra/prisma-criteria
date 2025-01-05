import { isValidationOk } from './shared/validation.util.js'
import { validateOrder } from './order-validation.js'
import { PrismaCriteria, PrismaCriteriaOptions, PrismaWhereStatement, UserInputCriteria } from './types.js'
import { processUserInputFilters } from './filters/index.js'
import { stringToNumber } from './shared/string-to-number.util.js'
import { PRISMA_LOGIC_OPERATORS } from './filters/validation/consts.js'

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

  const mixedFiltersProvidedByUserAndDefaultFilters = (
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

  let skip = defaultPagination ? defaultPagination.pageNumber - 1 : undefined
  const validationOfUsersInputPageNumber = stringToNumber(
    onlyStringUserInputs.pageNumber
  )
  if (
    isValidationOk(validationOfUsersInputPageNumber) &&
    validationOfUsersInputPageNumber.ok > 0
  ) skip = validationOfUsersInputPageNumber.ok - 1

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

  return {
    where: mixedFiltersProvidedByUserAndDefaultFilters,
    orderBy,
    skip,
    take
  }
}
