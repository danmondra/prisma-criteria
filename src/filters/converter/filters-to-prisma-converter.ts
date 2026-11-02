import { Filter } from '../../shared/filter.types.js'
import {
  PrismaLogicOperator,
  PrismaRelationFilterRule,
  PrismaScalarFilterRule
} from '../validation/types.js'
import { Prettify } from '../../shared/utility.types.js'
import {
  PrismaIndividualCondition,
  PrismaWhereFilter,
  PrismaWhereRelationStatement,
  PrismaWhereSelfStatement,
  PrismaWhereStatement
} from '../../types.js'

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

export function newFiltersToPrismaWhere (
  filters: Filter[]
): PrismaIndividualCondition[] {
  const prismaWhere: PrismaIndividualCondition[] = []

  for (const filter of filters) {
    if (isRelationFilter(filter)) {
      // WTF typescript?
      // filter.logicOperator is a PrismaLogicOperator
      // not a string!!!
      prismaWhere.push({
        [filter.logicOperator]: mapRelationalFilter(filter)
      } as unknown as PrismaIndividualCondition)

      continue
    }

    prismaWhere.push({
      [filter.logicOperator]: mapScalarFilter(filter as Filter<PrismaScalarFilterRule>)
    } as unknown as PrismaIndividualCondition)
  }

  return prismaWhere
}
