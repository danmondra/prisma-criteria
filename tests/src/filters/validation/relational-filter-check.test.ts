import { assert, describe, expect, test } from 'vitest'
import { PRISMA_LOGIC_OPERATORS, PRISMA_RELATION_FILTERS_BY_SIDE, PRISMA_SCALAR_OPERATORS } from '../../../../src/filters/validation/consts.js'
import { checkRelationalFilter } from '../../../../src/filters/validation/relational-filter-check.js'

describe('checkRelationalFilter', () => {
  test.for([
    'to-many',
    'to-one'
  ] satisfies Array<keyof typeof PRISMA_RELATION_FILTERS_BY_SIDE>
  )('should return true if the provided "relationFilter" is valid for the "%s" relation side', (relationSide) => {
    const validFilters = Object.values(PRISMA_RELATION_FILTERS_BY_SIDE[relationSide])

    validFilters.forEach(filter => {
      const result = checkRelationalFilter({
        field: 'test',
        logicOperator: PRISMA_LOGIC_OPERATORS.and,
        operator: PRISMA_SCALAR_OPERATORS.equals,
        relationalFilter: filter,
        value: 'test'
      }, relationSide)

      expect(result).toBe(true)
    })
  })

  test('should return false if the provided "relationSide" is invalid', () => {
    const invalidRelationSides = [
      'tomany', 'to_one', 'TO_MANY', 'TO_ONE', '  to-many', ' to-one ', 'to-manyy'
    ]

    invalidRelationSides.forEach((invalidRelationSide) => {
      const validToManyRelationFilter = Object.keys(PRISMA_RELATION_FILTERS_BY_SIDE['to-many'])[0]
      const validToOneRelationFilter = Object.keys(PRISMA_RELATION_FILTERS_BY_SIDE['to-one'])[0]

      const result1 = checkRelationalFilter(
        {
          field: 'test',
          logicOperator: PRISMA_LOGIC_OPERATORS.and,
          operator: PRISMA_SCALAR_OPERATORS.equals,
          relationalFilter: validToManyRelationFilter,
          value: 'test'
        },
        invalidRelationSide as any
      )
      const result2 = checkRelationalFilter(
        {
          field: 'test',
          logicOperator: PRISMA_LOGIC_OPERATORS.and,
          operator: PRISMA_SCALAR_OPERATORS.equals,
          relationalFilter: validToOneRelationFilter,
          value: 'test'
        },
        invalidRelationSide as any
      )

      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })
  })

  test.for([
    {
      relationSide: 'to-many',
      invalidRelationFilters: [
        ...Object.values(PRISMA_RELATION_FILTERS_BY_SIDE['to-one']),
        'everi', 'soome', 'n0ne', 'to-many', ' ', 'invalid', 'NONE'
      ]
    },
    {
      relationSide: 'to-one',
      invalidRelationFilters: [
        ...Object.values(PRISMA_RELATION_FILTERS_BY_SIDE['to-many']),
        'iz', 'isNott', 'IS', '  IS  ', ' ', 'invalid', 'isnot'
      ]
    }
  ] satisfies Array<{
    relationSide: keyof typeof PRISMA_RELATION_FILTERS_BY_SIDE
    invalidRelationFilters: string[]
  }>)('should return false if the provided relation filter is invalid for the $relationSide relation side', ({
    relationSide,
    invalidRelationFilters
  }) => {
    invalidRelationFilters.forEach(invalidRelationFilter => {
      const result = checkRelationalFilter(
        {
          field: 'test',
          logicOperator: PRISMA_LOGIC_OPERATORS.and,
          operator: PRISMA_SCALAR_OPERATORS.equals,
          relationalFilter: invalidRelationFilter,
          value: 'test'
        },
        relationSide
      )

      assert(!result, `
      should "${invalidRelationFilter}" be a invalid relation filter
      `)

      expect(result).toBe(false)
    })
  })
})
