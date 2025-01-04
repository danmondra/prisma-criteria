import { FilterPrimitives, Filter } from '../../shared/filter.types'
import { PrismaFilterRule, PrismaRelationFilter, PrismaRelationFilterRule } from './types'
import { checkScalarOperator } from './scalar-operator-check'
import { checkLogicOperator } from './logic-operator-check'
import { checkValue } from './value-check'
import { isValidationErr } from '../../shared/validation.util'
import { checkRelationalFilter } from './relational-filter-check'

export const isIntendedToBeARelationalFilter = (
  filterRule: PrismaFilterRule
): filterRule is PrismaRelationFilterRule => {
  return filterRule.relation !== undefined &&
    filterRule.relationField !== undefined &&
    filterRule.relationSide !== undefined
}

export const validateFilters = (
  filterProspects: FilterPrimitives[],
  filterRules: PrismaFilterRule[]
): Filter[] => {
  const evaluateFilterProspect = (
    filterProspect: FilterPrimitives
  ): false | Filter => {
    const filterRule = filterRules
      .find((fR) => fR.field === filterProspect.field)
    if (filterRule === undefined) return false

    if (isIntendedToBeARelationalFilter(filterRule)) {
      const relationalFilterCheckResult = checkRelationalFilter(
        filterProspect,
        filterRule.relationSide
      )

      if (!relationalFilterCheckResult) return false
    } else if (filterProspect.relationalFilter !== undefined) return false

    const scalarOperatorCheckResult = checkScalarOperator(filterProspect, filterRule.expectedType)
    if (!scalarOperatorCheckResult) return false

    const logicOperatorCheckResult = checkLogicOperator(filterProspect)
    if (!logicOperatorCheckResult) return false

    const valueCheckResult = checkValue(filterProspect, filterRule)
    if (isValidationErr(valueCheckResult)) return false

    return {
      field: filterProspect.field,
      logicOperator: filterProspect.logicOperator,
      relationFilter: filterProspect.relationalFilter as PrismaRelationFilter | undefined,
      operator: filterProspect.operator,
      value: valueCheckResult.ok,
      prismaRules: filterRule
    }
  }

  const validFilters = filterProspects
    .map(evaluateFilterProspect)
    .filter(Boolean) as Filter[]

  return validFilters
}
