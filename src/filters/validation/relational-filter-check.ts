import { FilterPrimitives } from '../../shared/filter.types.js'
import { PRISMA_RELATION_FILTERS_BY_SIDE } from './consts.js'
import { PrismaRelationFilter, PrismaRelationFilterRule } from './types.js'

export const checkRelationalFilter = (
  filterProspect: FilterPrimitives,
  relationSide: PrismaRelationFilterRule['relationSide']
): filterProspect is Omit<FilterPrimitives, 'relationalFilter'> & {
  relationalFilter: PrismaRelationFilter
} => {
  if (!(relationSide in PRISMA_RELATION_FILTERS_BY_SIDE)) return false

  const validRelationFilters = Object.values(
    PRISMA_RELATION_FILTERS_BY_SIDE[relationSide]
  )

  const isValidRelationalFilter = (validRelationFilters as string[])
    .includes(filterProspect.relationalFilter!)

  return isValidRelationalFilter
}
