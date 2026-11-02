import { inspect } from 'util'
import { createPrismaCriteria } from './index.js'
import { PrismaFilterRule } from './filters/validation/types.js'

const userInputCriteriaTest =
  {
    userInputTestFilters: 'AND mxStateID equals 23 OR name equals Valle de Bravo OR id equals 1',
    definedAllowedFilters: [
      { expectedType: 'string', field: 'name' },
      { expectedType: 'number', field: 'mxStateID' },
      { expectedType: 'number', field: 'id' }
    ],
    prismaWhereStatementExpected: {
      AND: [{ name: { equals: 'Tlan' } }],
      OR: [{ age: { equals: 13 } }]
    }
  }

const result = createPrismaCriteria(
  { filters: userInputCriteriaTest.userInputTestFilters },
  {
    rules: {
      allowedFilters: userInputCriteriaTest.definedAllowedFilters as PrismaFilterRule[],
      allowedFieldsToOrderBy: [],
      pageSizeMax: 20
    }
  }
)

console.log(
  '###### INPUT ######\n',
  userInputCriteriaTest.userInputTestFilters + '\n\n',
  '###### RESULT ######\n',
  inspect(result, { depth: Infinity })
)
