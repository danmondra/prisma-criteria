import { PRISMA_LOGIC_OPERATORS } from './consts.js'
import { FilterPrimitives } from '../../shared/filter.types.js'
import { PrismaLogicOperator } from './types.js'

export function checkLogicOperator (
  filterProspect: FilterPrimitives
): filterProspect is Omit<FilterPrimitives, 'logicOperator'> & {
  logicOperator: PrismaLogicOperator
} {
  if (filterProspect.logicOperator === undefined) return false

  const isValidLogicOperator = (Object.values(
    PRISMA_LOGIC_OPERATORS
  ) as string[])
    .includes(filterProspect.logicOperator)

  return isValidLogicOperator
}
