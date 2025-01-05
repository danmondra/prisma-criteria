import { assert, describe, expect, test } from 'vitest'
import { checkScalarOperator } from '../../../../src/filters/validation/scalar-operator-check.js'
import { PRISMA_COMMON_SCALAR_OPERATORS, PRISMA_OPERATORS_BY_GROUP } from '../../../../src/filters/validation/consts.js'

const PRISMA_OPERATORS_BY_TYPES = PRISMA_OPERATORS_BY_GROUP.types

const PRISMA_TYPES = Object.keys(
  PRISMA_OPERATORS_BY_TYPES
) as PrismaTypes[]
type PrismaTypes = keyof typeof PRISMA_OPERATORS_BY_TYPES

describe('checkScalarOperator', () => {
  test('should return true if the provided operator is valid for the provided type', () => {
    PRISMA_TYPES.forEach((PRISMA_TYPE) => {
      const allowedTypeOperators = PRISMA_OPERATORS_BY_TYPES[PRISMA_TYPE]

      allowedTypeOperators.forEach((allowedTypeOperator) => {
        const result = checkScalarOperator(
          {
            field: 'test',
            logicOperator: 'AND',
            operator: allowedTypeOperator,
            value: 'test'
          },
          PRISMA_TYPE
        )

        assert(result, `
        should the "${allowedTypeOperator}" operator be valid for "${PRISMA_TYPE}".
        `)

        expect(result).toBe(true)
      })
    })
  })

  test('should return false if the provided expected type is invalid', () => {
    const invalidTypes = [
      'smallint', 'bigint', 'decimal', 'float', 'varchar', // Specific types
      'invalid', '  ', '' // Random strings
    ]

    invalidTypes.forEach((invalidType) => {
      const result = checkScalarOperator(
        {
          field: 'test',
          logicOperator: 'AND',
          operator: PRISMA_COMMON_SCALAR_OPERATORS[0],
          value: 'test'
        },
        invalidType as any
      )

      assert(!result, `
      The provided type "${invalidType}" should be invalid.
      `)

      expect(result).toBe(false)
    })
  })

  // TODO --- When specific operators are added for every data type,
  // test that operators for the incorrect data type.
  test('should return false if the provided operator is invalid for the provided type"', () => {
    PRISMA_TYPES.forEach(prismaType => {
      const invalidOperators = [
        /* eslint-disable */
        ...PRISMA_OPERATORS_BY_TYPES[prismaType].map(v => v.toUpperCase()), // All Mayus
        ...PRISMA_OPERATORS_BY_TYPES[prismaType].map(v => ` ${v} `),        // With Spaces
        'invalid', '  ', ''                                                 // Random strings
        /* eslint-enable */
      ]

      invalidOperators.forEach((invalidOperator) => {
        const result = checkScalarOperator(
          {
            field: 'test',
            logicOperator: 'AND',
            operator: invalidOperator,
            value: 'test'
          },
          prismaType
        )

        assert(!result, `
          The provided operator "${invalidOperator}" should be invalid for "${prismaType}"
          `)

        expect(result).toBe(false)
      })
    })
  })
})

describe('checkOperator', () => {
  type CheckOperatorParameters = {
    filterPrimitives: Parameters<typeof checkScalarOperator>[0]
    expectedType: Parameters<typeof checkScalarOperator>[1]
  }

  describe('the scalar operator', () => {
    const combinedTypeAndScalarOperatorParameters:
    CheckOperatorParameters[] = Object
      .entries(PRISMA_OPERATORS_BY_TYPES)
      .flatMap(entries => {
        const [prismaType, scalarOperators] = entries
        const testID = `test--${crypto.randomUUID()}`

        return scalarOperators.map(operator => ({
          filterPrimitives: {
            field: testID,
            logicOperator: 'AND',
            operator,
            value: testID
          },
          expectedType: prismaType as PrismaTypes
        }))
      })

    test('should return true if the provided scalar operator is valid for the provided type', () => {
      combinedTypeAndScalarOperatorParameters.forEach(({
        filterPrimitives,
        expectedType
      }) => {
        const result = checkScalarOperator(filterPrimitives, expectedType)

        assert(result, `
        The provided operator "${filterPrimitives.operator}" should be valid for "${expectedType}"
        `)

        expect(result).toBe(true)
      })
    })

    const setOperatorForParameters = (
      operator: string
    ): CheckOperatorParameters[] => Object
      .keys(PRISMA_OPERATORS_BY_TYPES)
      .map((prismaType) => {
        const testID = `test--${crypto.randomUUID()}`

        return {
          filterPrimitives: { field: testID, logicOperator: 'AND', operator, value: testID },
          expectedType: prismaType as PrismaTypes
        }
      })

    const modifyOperatorsOfCheckOperatorParameters = (
      fn: Function
    ): CheckOperatorParameters[] => combinedTypeAndScalarOperatorParameters.map(v => ({
      expectedType: v.expectedType,
      filterPrimitives: {
        ...v.filterPrimitives,
        operator: fn(v.filterPrimitives.operator)
      }
    }))

    test('should return false if the provided operator is invalid for the provided expected type', () => {
      const invalidOperators = [
      // Operators are in Uppercase
        ...modifyOperatorsOfCheckOperatorParameters((op: string) => op.toUpperCase()),

        // Operators with spaces
        ...modifyOperatorsOfCheckOperatorParameters((op: string) => ` ${op} `),

        // Operators repeated
        ...modifyOperatorsOfCheckOperatorParameters((op: string) => op.repeat(2)),

        ...setOperatorForParameters('invalid'),
        ...setOperatorForParameters(''),
        ...setOperatorForParameters('  ')
      ]

      invalidOperators.forEach(({
        filterPrimitives,
        expectedType
      }) => {
        const result = checkScalarOperator(filterPrimitives, expectedType)

        assert(!result, `
        The operator ${filterPrimitives.operator} should be invalid for "${expectedType}"
      `)

        expect(result).toBe(false)
      })
    })
  })
})
