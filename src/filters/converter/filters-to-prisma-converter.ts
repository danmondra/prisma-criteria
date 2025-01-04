import { Filter } from '../../shared/filter.types'
import {
  PrismaLogicOperator,
  PrismaRelationFilterRule,
  PrismaScalarFilterRule
} from '../validation/types'
import { Prettify } from '../../shared/utility.types'
import {
  PrismaWhereFilter,
  PrismaWhereRelationStatement,
  PrismaWhereSelfStatement,
  PrismaWhereStatement
} from '../../types'

export const isRelationFilter = (
  filter: Filter
): filter is Filter<PrismaRelationFilterRule> =>
  filter.relationFilter !== undefined

const mapScalarFilter = (
  scalarFilter: Filter<PrismaScalarFilterRule>
): PrismaWhereSelfStatement => {
  return {
    [scalarFilter.prismaRules.mapFieldTo ?? scalarFilter.prismaRules.field]: {
      [scalarFilter.operator]: scalarFilter.value
    }
  }
}

const mapRelationalFilter = (
  relationFilter: Filter<PrismaRelationFilterRule>
): PrismaWhereRelationStatement => {
  return {
    [relationFilter.prismaRules.relation]: {
      [relationFilter.relationFilter]: {
        [relationFilter.prismaRules.relationField]: {
          [relationFilter.operator]: relationFilter.value
        }
      }
    }
  }
}

export function filtersToPrismaWhere (
  filters: Filter[]
): Prettify<PrismaWhereStatement> {
  const prismaWhere: Partial<PrismaWhereStatement> = {}

  const createOrPushToPrismaWhere = (
    operator: PrismaLogicOperator,
    whereFilter: PrismaWhereFilter
  ): void => {
    operator in prismaWhere
      ? prismaWhere[operator]!.push(whereFilter)
      : prismaWhere[operator] = [whereFilter]
  }

  for (const filter of filters) {
    if (isRelationFilter(filter)) {
      createOrPushToPrismaWhere(
        filter.logicOperator,
        mapRelationalFilter(filter)
      )

      continue
    }

    createOrPushToPrismaWhere(
      filter.logicOperator,
      mapScalarFilter(filter as Filter<PrismaScalarFilterRule>)
    )
  }

  return prismaWhere
}
