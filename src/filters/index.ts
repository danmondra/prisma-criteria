import { PrismaIndividualCondition, UserInputCriteria } from '../types.js'
import { newFiltersToPrismaWhere } from './converter/filters-to-prisma-converter.js'
import { filtersDSLParser } from './parser/index.js'
import { validateFilters } from './validation/index.js'
import { PrismaFilterRule } from './validation/types.js'

/**
 * Only supports one dimension of filterRules, like:
 * [{ AND: { publishedIn: 'reddit' }, OR: { author: 234 } }]
 *
 * It can't support sub-queries, like:
 * [{ AND: { publishedIn: 'reddit', OR: { author: 234 } } }]
 */
export function processUserInputFilters (
  userInputFilters: UserInputCriteria['filters'],
  filterRules: PrismaFilterRule[]
): PrismaIndividualCondition[] {
  const filters = filtersDSLParser(userInputFilters)
  const validFilters = validateFilters(filters, filterRules)
  const prismaWhereStatement = newFiltersToPrismaWhere(validFilters)

  return prismaWhereStatement
}
