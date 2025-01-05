import { describe, test } from 'vitest'
import { PrismaCriteria, PrismaCriteriaOptions, UserInputCriteria } from '../../../../src/types.js'

/* This test will be completelly implemented after the DSL implementation stops changing */

describe('filtersToPrismaWhere', () => {
  type DSLQueryTest = {
    DSLQuery: UserInputCriteria
    criteriaOptions: PrismaCriteriaOptions
    prismaWhereStatementExpected: PrismaCriteria
  }

  const queriesToTest: DSLQueryTest[] = [
    {
      DSLQuery: { filters: '' },
      criteriaOptions: {
        defaults: { pagination: { pageNumber: 0, pageSize: 20 } },
        rules: {
          allowedFieldsToOrderBy: [],
          allowedFilters: [{ expectedType: 'string', field: 'name' }],
          pageSizeMax: 20
        }
      },
      prismaWhereStatementExpected: {
        where: { AND: [{ name: { equals: 'Tlan' } }] },
        orderBy: undefined,
        skip: 0,
        take: 20
      }
    }
  ]

  test.for(
    queriesToTest
  )('should return a valid prisma where statement with the data provided by the DSL', ({
    DSLQuery,
    criteriaOptions,
    prismaWhereStatementExpected
  }) => {
    const result = (DSLQuery)
  })
})
