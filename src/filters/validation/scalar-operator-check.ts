import { FilterPrimitives } from '../../shared/filter.types'
import { PRISMA_OPERATORS_BY_GROUP } from './consts'
import { PrismaFilterRule, PrismaScalarOperator } from './types'

export const checkScalarOperator = (
  filterProspect: FilterPrimitives,
  expectedType: PrismaFilterRule['expectedType']
): filterProspect is Omit<FilterPrimitives, 'operator'> & {
  operator: PrismaScalarOperator
} => {
  if (filterProspect.operator === undefined) return false

  if (!(expectedType in PRISMA_OPERATORS_BY_GROUP.types))
    return false

  const scalarOperatorsAccordingToExpectedType = Object.values(
    PRISMA_OPERATORS_BY_GROUP.types[expectedType]
  )

  const isValidOperator = (scalarOperatorsAccordingToExpectedType as string[])
    .includes(filterProspect.operator)

  return isValidOperator
}
