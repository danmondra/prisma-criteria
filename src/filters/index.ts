import { PrismaWhereStatement, UserInputCriteria } from '../types'
import { filtersToPrismaWhere } from './converter/filters-to-prisma-converter'
import { filtersDSLParser } from './parser'
import { validateFilters } from './validation'
import { PrismaFilterRule } from './validation/types'

export function processUserInputFilters (
  userInputFilters: UserInputCriteria['filters'],
  filterRules: PrismaFilterRule[]
): PrismaWhereStatement {
  const filters = filtersDSLParser(userInputFilters)
  const validFilters = validateFilters(filters, filterRules)
  const prismaWhereStatement = filtersToPrismaWhere(validFilters)

  return prismaWhereStatement
}
