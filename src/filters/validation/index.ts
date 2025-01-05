import { FilterPrimitives, Filter } from '../../shared/filter.types.js'
import { PrismaFilterRule, PrismaRelationFilter, PrismaRelationFilterRule } from './types.js'
import { checkScalarOperator } from './scalar-operator-check.js'
import { checkLogicOperator } from './logic-operator-check.js'
import { checkValue } from './value-check.js'
import { isValidationErr } from '../../shared/validation.util.js'
import { checkRelationalFilter } from './relational-filter-check.js'

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
    if (filterProspect.field === undefined) return false

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
