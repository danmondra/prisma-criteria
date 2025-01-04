import { assert, describe, expect, test } from 'vitest'
import { PrismaCriteria, PrismaCriteriaOptions, PrismaWhereStatement, UserInputCriteria } from '../../src/types'
import { createPrismaCriteria } from '../../src'

describe('createPrismaCriteria', () => {
  describe('the filters', () => {
    /* This suit test will be completelly implemented after the DSL implementation stops changing */
    type TestWhereStatement = {
      userInputTestFilters: UserInputCriteria['filters']
      definedAllowedFilters: PrismaCriteriaOptions['rules']['allowedFilters']
      prismaWhereStatementExpected: PrismaCriteria['where']
    }

    type TestWhereStatementWithInvalidFields =
      TestWhereStatement & { invalidReason: string }

    describe('the scalar filters', () => {
      test('should return a valid prisma where statement with the provided DSL query', () => {
        const queriesToTestWhere: TestWhereStatement[] = [
          {
            userInputTestFilters: 'AND name equals Tlan',
            definedAllowedFilters: [{ expectedType: 'string', field: 'name' }],
            prismaWhereStatementExpected: { AND: [{ name: { equals: 'Tlan' } }] }
          },
          {
            userInputTestFilters: 'AND name equals Tlan OR age equals 13',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'name' },
              { expectedType: 'number', field: 'age' }
            ],
            prismaWhereStatementExpected: {
              AND: [{ name: { equals: 'Tlan' } }],
              OR: [{ age: { equals: 13 } }]
            }
          },
          {
            userInputTestFilters: 'AND name equals Tlan OR age equals 13 AND autor in [1;2;3] OR createdAt equals 2022-01-30',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'name' },
              { expectedType: 'number', field: 'age' },
              { expectedType: 'number', field: 'autor' },
              { expectedType: 'datetime', field: 'createdAt' }
            ],
            prismaWhereStatementExpected: {
              AND: [
                { name: { equals: 'Tlan' } },
                { autor: { in: [1, 2, 3] } }
              ],
              OR: [
                { age: { equals: 13 } },
                { createdAt: { equals: new Date('2022-01-30') } }
              ]
            }
          }
        ]

        queriesToTestWhere.forEach(({
          userInputTestFilters,
          definedAllowedFilters,
          prismaWhereStatementExpected
        }) => {
          const result = createPrismaCriteria(
            { filters: userInputTestFilters },
            {
              rules: {
                allowedFieldsToOrderBy: [],
                allowedFilters: definedAllowedFilters,
                pageSizeMax: 20
              }
            }
          )

          expect(result.where).toStrictEqual(prismaWhereStatementExpected)
        })
      })

      test.todo('should normalize the value')

      test('should return only the valid prisma statements and omit those with invalid data or rules not followed', () => {
        const queriesToTestWhere: TestWhereStatementWithInvalidFields[] = [
          {
            invalidReason: 'The DSL contains a not allowed field.',
            userInputTestFilters: 'AND name equals Tlan AND notAllowedField equals test',
            definedAllowedFilters: [{ expectedType: 'string', field: 'name' }],
            prismaWhereStatementExpected: { AND: [{ name: { equals: 'Tlan' } }] }
          },
          {
            invalidReason: 'The DSL contains a field with a value of a different type (string) than the specified (number).',
            userInputTestFilters: 'AND name equals Tlan OR invalidType equals invalidNumber',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'name' },
              { expectedType: 'number', field: 'invalidType' }
            ],
            prismaWhereStatementExpected: { AND: [{ name: { equals: 'Tlan' } }] }
          },
          {
            invalidReason: 'The DSL contains an invalid operator (equalz).',
            userInputTestFilters: 'AND name equals Tlan OR age equalz 13',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'name' },
              { expectedType: 'number', field: 'age' }
            ],
            prismaWhereStatementExpected: { AND: [{ name: { equals: 'Tlan' } }] }
          },
          {
            invalidReason: 'The DSL contains an invalid logic operator (XOR).',
            userInputTestFilters: 'AND name equals Tlan OR age equals 13 AND autor in [1;2;3] XOR createdAt equals 2022-01-30',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'name' },
              { expectedType: 'number', field: 'age' },
              { expectedType: 'number', field: 'autor' },
              { expectedType: 'datetime', field: 'createdAt' }
            ],
            prismaWhereStatementExpected: {
              AND: [{ name: { equals: 'Tlan' } }],
              OR: [{ age: { equals: 13 } }]
            }
          }
        ]

        queriesToTestWhere.forEach(({
          invalidReason,
          userInputTestFilters,
          definedAllowedFilters,
          prismaWhereStatementExpected
        }) => {
          const result = createPrismaCriteria(
            { filters: userInputTestFilters },
            {
              rules: {
                allowedFieldsToOrderBy: [],
                allowedFilters: definedAllowedFilters,
                pageSizeMax: 20
              }
            }
          )

          assert.deepStrictEqual(result.where, prismaWhereStatementExpected, invalidReason)

          // replace this to test the expected invalid fields
          expect(result.where).toStrictEqual(prismaWhereStatementExpected)
        })
      })
    })

    describe('the relational filters', () => {
      test('should return a valid prisma where statement with the provided DSL query', () => {
        const queriesToTestWhere: TestWhereStatement[] = [
          {
            userInputTestFilters: 'AND stateName some-equals Jalisco',
            definedAllowedFilters: [
              {
                expectedType: 'string',
                field: 'stateName',
                relation: 'mx_state',
                relationField: 'name',
                relationSide: 'to-many'
              }
            ],
            prismaWhereStatementExpected: {
              AND: [{ mx_state: { some: { name: { equals: 'Jalisco' } } } }]
            }
          },
          {
            userInputTestFilters: 'AND stateName some-equals Jalisco OR autor every-in [Graydon Hoare;John Backus;John McCarty] AND category isNot-equals Museos',
            definedAllowedFilters: [
              {
                field: 'stateName',
                expectedType: 'string',
                relation: 'mx_state',
                relationField: 'name',
                relationSide: 'to-many'
              },
              {
                field: 'autor',
                expectedType: 'string',
                relation: 'autor',
                relationField: 'name',
                relationSide: 'to-many'
              },
              {
                field: 'category',
                expectedType: 'string',
                relation: 'category',
                relationField: 'name',
                relationSide: 'to-one'
              }
            ],
            prismaWhereStatementExpected: {
              AND: [
                { mx_state: { some: { name: { equals: 'Jalisco' } } } },
                { category: { isNot: { name: { equals: 'Museos' } } } }
              ],
              OR: [{ autor: { every: { name: { in: ['Graydon Hoare', 'John Backus', 'John McCarty'] } } } }]
            }
          }
        ]

        queriesToTestWhere.forEach(({
          userInputTestFilters,
          definedAllowedFilters,
          prismaWhereStatementExpected
        }) => {
          const result = createPrismaCriteria(
            { filters: userInputTestFilters },
            {
              rules: {
                allowedFieldsToOrderBy: [],
                allowedFilters: definedAllowedFilters,
                pageSizeMax: 20
              }
            }
          )

          expect(result.where).toStrictEqual(prismaWhereStatementExpected)
        })
      })

      test('should return only the valid prisma statements and omit those with invalid data or rules not followed', () => {
        const queriesToTestWhere: TestWhereStatementWithInvalidFields[] = [
          {
            invalidReason: '"all" relation filter is invalid',
            userInputTestFilters: 'AND stateName some-equals Jalisco AND category all-equals Test',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'stateName', relation: 'mx_state', relationField: 'name', relationSide: 'to-many' },
              { expectedType: 'string', field: 'category', relation: 'categories', relationField: 'name', relationSide: 'to-many' }
            ],
            prismaWhereStatementExpected: { AND: [{ mx_state: { some: { name: { equals: 'Jalisco' } } } }] }
          },
          {
            invalidReason: '"equalz" operator is invalid',
            userInputTestFilters: 'AND stateName some-equals Jalisco AND category every-equalz Test',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'stateName', relation: 'mx_state', relationField: 'name', relationSide: 'to-many' },
              { expectedType: 'string', field: 'category', relation: 'categories', relationField: 'name', relationSide: 'to-many' }
            ],
            prismaWhereStatementExpected: { AND: [{ mx_state: { some: { name: { equals: 'Jalisco' } } } }] }
          },
          {
            invalidReason: '"some" relation operator is invalid when the relation side is defined as "to-one"',
            userInputTestFilters: 'AND stateName some-equals Jalisco AND category some-equals Test',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'stateName', relation: 'mx_state', relationField: 'name', relationSide: 'to-many' },
              { expectedType: 'string', field: 'category', relation: 'categories', relationField: 'name', relationSide: 'to-one' }
            ],
            prismaWhereStatementExpected: { AND: [{ mx_state: { some: { name: { equals: 'Jalisco' } } } }] }
          },
          {
            invalidReason: '"is" relation filter is invalid when the relation side is defined as "to-many"',
            userInputTestFilters: 'AND stateName some-equals Jalisco AND category is-equals Test',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'stateName', relation: 'mx_state', relationField: 'name', relationSide: 'to-many' },
              { expectedType: 'string', field: 'category', relation: 'categories', relationField: 'name', relationSide: 'to-many' }
            ],
            prismaWhereStatementExpected: { AND: [{ mx_state: { some: { name: { equals: 'Jalisco' } } } }] }
          },
          {
            invalidReason: 'operator is invalid (separator "_" instead of "-")',
            userInputTestFilters: 'AND stateName some-equals Jalisco AND category every_equals Museos',
            definedAllowedFilters: [
              { expectedType: 'string', field: 'stateName', relation: 'mx_state', relationField: 'name', relationSide: 'to-many' },
              { expectedType: 'string', field: 'category', relation: 'category', relationField: 'name', relationSide: 'to-many' }
            ],
            prismaWhereStatementExpected: {
              AND: [{ mx_state: { some: { name: { equals: 'Jalisco' } } } }]
            }
          }
        ]

        queriesToTestWhere.forEach(({
          invalidReason,
          userInputTestFilters,
          definedAllowedFilters,
          prismaWhereStatementExpected
        }) => {
          const result = createPrismaCriteria(
            { filters: userInputTestFilters },
            {
              rules: {
                allowedFieldsToOrderBy: [],
                allowedFilters: definedAllowedFilters,
                pageSizeMax: 20
              }
            }
          )

          assert.deepStrictEqual(result.where, prismaWhereStatementExpected, invalidReason)

          expect(result.where).toStrictEqual(prismaWhereStatementExpected)
        })
      })
    })

    test('should include the provided default filters', () => {
      type TestWhereStatementWithDefaultFilters = TestWhereStatement & {
        defaultFilters: PrismaWhereStatement
      }

      const defaultFiltersTest: PrismaWhereStatement = {
        AND: [
          { id: { equals: 23 } },
          { test: { in: ['test1', 'test2'] } }
        ]
      }

      const queriesToTest: TestWhereStatementWithDefaultFilters[] = [
        {
          userInputTestFilters: '',
          definedAllowedFilters: [],
          defaultFilters: defaultFiltersTest,
          prismaWhereStatementExpected: defaultFiltersTest
        },
        {
          userInputTestFilters: 'AND name equals Tlan',
          definedAllowedFilters: [{ expectedType: 'string', field: 'name' }],
          defaultFilters: defaultFiltersTest,
          prismaWhereStatementExpected: {
            AND: [
              ...defaultFiltersTest.AND!,
              { name: { equals: 'Tlan' } }
            ]
          }
        },
        {
          userInputTestFilters: 'AND name equals Tlan OR year equals 2023',
          definedAllowedFilters: [
            { expectedType: 'string', field: 'name' },
            { expectedType: 'number', field: 'year' }
          ],
          defaultFilters: defaultFiltersTest,
          prismaWhereStatementExpected: {
            AND: [
              ...defaultFiltersTest.AND!,
              { name: { equals: 'Tlan' } }
            ],
            OR: [
              { year: { equals: 2023 } }
            ]
          }
        }
      ]

      queriesToTest.forEach(({
        defaultFilters,
        definedAllowedFilters,
        prismaWhereStatementExpected,
        userInputTestFilters
      }) => {
        const result = createPrismaCriteria(
          { filters: userInputTestFilters },
          {
            defaults: { filters: defaultFilters },
            rules: {
              allowedFieldsToOrderBy: [],
              allowedFilters: definedAllowedFilters,
              pageSizeMax: 20
            }
          }
        )

        expect(result.where).toStrictEqual(prismaWhereStatementExpected)
      })
    })
  })

  describe('the pagination', () => {
    test('should return a "skip" and "take" statements according to the pagination provided', () => {
      type TestPagination<ValidOrInvalid extends 'invalid' | 'valid'> = {
        pagination: {
          pageNumber: UserInputCriteria['pageNumber']
          pageSize: UserInputCriteria['pageSize']
        }
        prismaWhereStatementExpected: {
          skip: PrismaCriteria['skip']
          take: PrismaCriteria['skip']
        }
      } & (ValidOrInvalid extends 'invalid' ? { invalidReason: string } : {})

      const queriesToTestPagination: Array<TestPagination<'valid'>> = [
        {
          pagination: { pageNumber: '1', pageSize: '20' },
          prismaWhereStatementExpected: { skip: 0, take: 20 }
        },
        {
          pagination: { pageNumber: '5', pageSize: '15' },
          prismaWhereStatementExpected: { skip: 4, take: 15 }
        },
        {
          pagination: { pageNumber: '999', pageSize: '20' },
          prismaWhereStatementExpected: { skip: 998, take: 20 }
        }
      ]

      queriesToTestPagination.forEach(({
        pagination,
        prismaWhereStatementExpected
      }) => {
        const { take, skip } = createPrismaCriteria(
          { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize },
          {
            rules: {
              allowedFieldsToOrderBy: [],
              allowedFilters: [],
              pageSizeMax: 20
            }
          }
        )

        expect({ take, skip }).toStrictEqual(prismaWhereStatementExpected)
      })
    })

    test('should return the provided default "skip" and "take" values when the user-provided ones are invalid or not provided', () => {
      type TestInvalidPagination = {
        invalidReason: string
        pagination: { pageNumber: string, pageSize: string }
      }

      const queriesToTestPagination: TestInvalidPagination[] = [
        {
          invalidReason: 'The pagination values are not numbers',
          pagination: { pageNumber: 'invalid', pageSize: 'asdf' }
        },
        {
          invalidReason: 'The pagination values are negatives',
          pagination: { pageNumber: '-10', pageSize: '-15' }
        },
        {
          invalidReason: 'The pagination values are 0',
          pagination: { pageNumber: '0', pageSize: '0' }
        }
      ]

      queriesToTestPagination.forEach(({
        invalidReason,
        pagination
      }) => {
        const defaultPagination = { pageNumber: 33, pageSize: 77 }

        const { skip, take } = createPrismaCriteria(
          { pageNumber: pagination.pageNumber, pageSize: pagination.pageSize },
          {
            defaults: { pagination: defaultPagination },
            rules: {
              allowedFieldsToOrderBy: [],
              allowedFilters: [],
              pageSizeMax: 20
            }
          }
        )

        assert.deepStrictEqual(
          { skip, take }, // actual
          { skip: defaultPagination.pageNumber - 1, take: defaultPagination.pageSize },
          `should return the default pagination if: "${invalidReason}"`
        )
      })
    })

    describe('should throw an error if the provided default pageSize is invalid', () => {
      test.for([
        'invalid',
        {},
        0,
        -1
      ])('(%s)', (pageSize) => {
        try {
          createPrismaCriteria(
            {},
            {
              defaults: {
                pagination: { pageNumber: 1, pageSize: pageSize as any }
              },
              rules: {
                allowedFieldsToOrderBy: [],
                allowedFilters: [],
                pageSizeMax: 20
              }
            }
          )

          expect.unreachable()
        } catch (e: unknown) {
          expect(e).toBeInstanceOf(Error)
        }
      })
    })

    describe('should throw an error if the provided default pageNumber is invalid', () => {
      test.for([
        'invalid',
        {},
        0,
        -1,
        -33
      ])('(%s)', (pageNumber) => {
        try {
          createPrismaCriteria(
            {},
            {
              defaults: {
                pagination: { pageNumber: pageNumber as any, pageSize: 20 }
              },
              rules: {
                allowedFieldsToOrderBy: [],
                allowedFilters: [],
                pageSizeMax: 20
              }
            }
          )

          expect.unreachable()
        } catch (e: unknown) {
          expect(e).toBeInstanceOf(Error)
        }
      })
    })

    test('should return the maximum page size defined in the "take" value if the user provides a value that exceeds the allowed limit', () => {
      const pageSizeMax = 99
      const excedentPageSize = 100

      const result = createPrismaCriteria(
        { pageSize: String(excedentPageSize) },
        {
          rules: {
            allowedFieldsToOrderBy: [],
            allowedFilters: [],
            pageSizeMax
          }
        }
      )

      expect(result.take).toBe(pageSizeMax)
      expect(result.take).not.toBe(excedentPageSize)
    })
  })

  describe('the order', () => {
    type TestOrder = {
      orderBy: string
      orderDir: Exclude<PrismaCriteria['orderBy'], undefined>[string]
      allowedFieldsToOrderBy: PrismaCriteriaOptions['rules']['allowedFieldsToOrderBy']
      expectedResult: Exclude<PrismaCriteriaOptions['defaults'], undefined>['orderBy']
    }

    test('should return a "orderBy" and "orderDir" properties according to the user provided values', () => {
      const queriesToTest: TestOrder[] = [
        {
          orderBy: 'test',
          orderDir: 'asc',
          allowedFieldsToOrderBy: ['test'],
          expectedResult: { test: 'asc' }
        },
        {
          orderBy: 'orderTest',
          orderDir: 'asc',
          allowedFieldsToOrderBy: ['orderTest'],
          expectedResult: { orderTest: 'asc' }
        }
      ]

      queriesToTest.forEach(({
        orderBy,
        orderDir,
        allowedFieldsToOrderBy,
        expectedResult
      }) => {
        const result = createPrismaCriteria(
          { orderBy, orderDir },
          {
            rules: {
              allowedFieldsToOrderBy,
              allowedFilters: [],
              pageSizeMax: 20
            }
          }
        )

        expect(result.orderBy).toStrictEqual(expectedResult)
      })
    })

    test('should return the default orderBy when the provided by the user is invalid or not provided', () => {
      type TestOrder2 = Omit<TestOrder, 'expectedResult'> & {
        defaultOrder: Exclude<PrismaCriteriaOptions['defaults'], undefined>['orderBy']
      }

      const queriesToTest: TestOrder2[] = [
        {
          orderBy: ' ',
          orderDir: 'asc',
          allowedFieldsToOrderBy: [],
          defaultOrder: { defaultOrderTest: 'asc' }
        },
        {
          orderBy: undefined as any,
          orderDir: 'asc',
          allowedFieldsToOrderBy: [],
          defaultOrder: { defaultOrderTest: 'asc' }
        },
        {
          orderBy: 'allowedOrderBy',
          orderDir: 'invalidOrder' as any,
          allowedFieldsToOrderBy: ['allowedOrderBy'],
          defaultOrder: { defaultOrderTest: 'asc' }
        }
      ]

      queriesToTest.forEach(({
        orderBy,
        orderDir,
        allowedFieldsToOrderBy,
        defaultOrder
      }) => {
        const result = createPrismaCriteria(
          { orderBy, orderDir },
          {
            defaults: { orderBy: defaultOrder },
            rules: {
              allowedFieldsToOrderBy,
              allowedFilters: [],
              pageSizeMax: 20
            }
          }
        )

        expect(result.orderBy).toStrictEqual(defaultOrder)
      })
    })

    test('should omit the provided orderBy if it is not defined as allowed', () => {
      const result = createPrismaCriteria(
        { orderBy: 'test', orderDir: 'asc' },
        {
          rules: {
            allowedFieldsToOrderBy: [], // None field allowed
            allowedFilters: [],
            pageSizeMax: 20
          }
        }
      )

      expect(result.orderBy).toBeUndefined()
    })

    test('should omit the provided orderBy if the orderDir is neither "asc" nor "desc"', () => {
      const queriesToTest: Array<Pick<TestOrder, 'orderBy' | 'orderDir'>> = [
        { orderBy: 'allowedOrderBy', orderDir: undefined },
        { orderBy: 'allowedOrderBy', orderDir: 'invalidOrder' as any },
        { orderBy: 'allowedOrderBy', orderDir: 'ascc' as any },
        { orderBy: 'allowedOrderBy', orderDir: ' desc' as any }
      ]

      queriesToTest.forEach(({ orderBy, orderDir }) => {
        const result = createPrismaCriteria(
          { orderBy, orderDir },
          {
            rules: {
              allowedFieldsToOrderBy: [orderBy],
              allowedFilters: [],
              pageSizeMax: 20
            }
          }
        )

        expect(result.orderBy).toBe(undefined)
      })
    })

    test('should throw an error if the allowedFieldsToOrderBy are more than one', () => {
      try {
        const allowedFieldToOrderBy = 'allowedFieldToOrderBy'

        createPrismaCriteria(
          { allowedFieldToOrderBy, orderDir: 'asc' },
          {
            rules: {
              allowedFieldsToOrderBy: [allowedFieldToOrderBy, 'invalid'],
              allowedFilters: [],
              pageSizeMax: 20
            }
          }
        )

        expect.unreachable()
      } catch (e: unknown) {
        expect(e).toBeDefined()
      }
    })
  })
})
