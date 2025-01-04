import { PRISMA_LOGIC_OPERATORS } from './consts'
import { FilterPrimitives } from '../../shared/filter.types'
import { PrismaLogicOperator } from './types'

export function checkLogicOperator (
  filterProspect: FilterPrimitives
): filterProspect is Omit<FilterPrimitives, 'logicOperator'> & {
  logicOperator: PrismaLogicOperator
} {
  const isValidLogicOperator = (Object.values(
    PRISMA_LOGIC_OPERATORS
  ) as string[])
    .includes(filterProspect.logicOperator)

  return isValidLogicOperator
}
