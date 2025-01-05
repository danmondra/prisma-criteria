import { PrismaWhereStatement, UserInputCriteria } from '../types.js'
import { filtersToPrismaWhere } from './converter/filters-to-prisma-converter.js'
import { filtersDSLParser } from './parser/index.js'
import { validateFilters } from './validation/index.js'
import { PrismaFilterRule } from './validation/types.js'

export function processUserInputFilters (
  userInputFilters: UserInputCriteria['filters'],
  filterRules: PrismaFilterRule[]
): PrismaWhereStatement {
  const filters = filtersDSLParser(userInputFilters)
  const validFilters = validateFilters(filters, filterRules)
  const prismaWhereStatement = filtersToPrismaWhere(validFilters)

  return prismaWhereStatement
}
