import { describe, expect, test } from 'vitest'
import { checkValue, validateValue } from '../../../../src/filters/validation/value-check'
import assert from 'assert'
import { PRISMA_COMMON_LIST_OPERATORS, PRISMA_LOGIC_OPERATORS, PRISMA_OPERATORS_BY_GROUP, PRISMA_SCALAR_OPERATORS } from '../../../../src/filters/validation/consts'
import { isValidationErr, isValidationOk } from '../../../../src/shared/validation.util'

type PrismaTypes = keyof typeof PRISMA_OPERATORS_BY_GROUP.types
  type TestParameters = Array<{ expectedType: PrismaTypes, valuesToTest: string[] }>

const logicOperatorForTests = PRISMA_LOGIC_OPERATORS.and
const singleValueOperatorForTests = PRISMA_SCALAR_OPERATORS.equals
const listValueOperatorForTests = PRISMA_COMMON_LIST_OPERATORS[0]

describe('validateValue', () => {
  test.for([
    { expectedType: 'string', valuesToTest: ['validValue', '1234', '{}'] },
    { expectedType: 'number', valuesToTest: ['23', '9999999', '0', '-3', '4o'] },
    { expectedType: 'datetime', valuesToTest: ['12-12-2024', '01-01-2020', '01-05-1999', '1932/12/12'] }
  ] satisfies TestParameters
  )('should return a successful validation if the provided value is valid for $expectedType', ({
    expectedType,
    valuesToTest
  }) => {
    valuesToTest.forEach((value) => {
      const result = validateValue(value, expectedType)

      assert(isValidationOk(result), `Expected value: "${String(value)}" to be valid.`)

      expect(result.ok).toBeDefined()
    })
  })

  test('should return a validation error if the provided string value is an empty string', () => {
    const value = ''

    const result = validateValue(value, 'string')
    assert(result._result === 'error', 'Expected result to be an Error.')

    expect(result.error).toBe(undefined)
  })

  test('should return a validation error if the provided expected type is an invalid type', () => {
    const value = 'validValue'
    const expectedType = 'invalid'

    const result = validateValue(value, expectedType as any)
    assert(result._result === 'error', 'Expected result to be an Error.')

    expect(result.error).toBe(undefined)
  })

  test.for([
    { expectedType: 'string', valuesToTest: ['  '] },
    { expectedType: 'number', valuesToTest: ['invalid', '{}', 'undefined', 'ab0123', '.33'] },
    {
      expectedType: 'datetime',
      valuesToTest: ['invalid', '{}', 'undefined', '31-31-2024', '1999-13-2',
        '2023-13-15', '2023-01-33', '15-28-2023', 'abcd-ee-fg',
        '2023-11-28T25:61:00', '2023-11-28T15:30:00+99:00', '2023/00/00'
      ]
    }
  ] satisfies TestParameters
  )('should return a validation error if the provided value is invalid for $expectedType', ({
    expectedType,
    valuesToTest
  }) => {
    valuesToTest.forEach((value) => {
      const result = validateValue(value, expectedType)

      assert(result._result === 'error', `Expected value: "${String(value)}" to be invalid.`)

      expect(result.error).toBe(undefined)
    })
  })
})

describe('checkValue', () => {
  describe('the successful path', () => {
    test.for([
      { expectedType: 'string', valuesToTest: ['validValue', '1234', '{}'] },
      { expectedType: 'number', valuesToTest: ['23', '9999999', '0', '-3', '4o'] },
      { expectedType: 'datetime', valuesToTest: ['12-12-2024', '01-01-2020', '01-05-1999', '1932/12/12'] }
    ] satisfies TestParameters
    )('should return a successful validation if the provided single value is valid for $expectedType and the operator is designed to handle a single value', ({
      expectedType,
      valuesToTest
    }) => {
      valuesToTest.forEach((value) => {
        const result = checkValue(
          {
            field: 'testField',
            logicOperator: logicOperatorForTests,
            operator: singleValueOperatorForTests,
            value
          },
          {
            expectedType,
            field: 'testField'
          }
        )

        assert(isValidationOk(result), `Expected value: ${value} to be valid for ${expectedType}.`)

        expect(result.ok).toBeDefined()
      })
    })

    test.for([
      { expectedType: 'string', valuesToTest: ['validValue', '1234', '{}'] },
      { expectedType: 'number', valuesToTest: ['23', '9999999', '0', '-3', '4o'] },
      { expectedType: 'datetime', valuesToTest: ['12-12-2024', '01-01-2020', '01-05-1999', '1932/12/12'] }
    ] satisfies TestParameters
    )('should return a successful validation if the provided list of values is valid for $expectedType and the operator is designed to handle a list', ({
      expectedType,
      valuesToTest: listOfValuesToTest
    }) => {
      const result = checkValue(
        {
          field: 'testField',
          logicOperator: logicOperatorForTests,
          operator: listValueOperatorForTests,
          value: listOfValuesToTest
        },
        {
          expectedType,
          field: 'testField'
        }
      )

      assert(isValidationOk(result), `Expected list of values: ${String(listOfValuesToTest)} to be valid for ${expectedType}.`)

      expect(result.ok).toBeDefined()
    })
  })

  describe('the errors path', () => {
    test('should return a validation error if the provided value is neither a single value (string) nor a list (array)', () => {
      const value = 23
      const result = checkValue(
        {
          field: 'testField',
          logicOperator: logicOperatorForTests,
          operator: singleValueOperatorForTests,
          value: value as any
        },
        {
          expectedType: 'number',
          field: 'testField'
        }
      )

      assert(isValidationErr(result), `Expected value: ${value} to be invalid.`)

      expect(result.error).toBe(undefined)
    })

    test('should return a validation error if the provided value is a single value (string), but the operator is designed to handle a list (array)', () => {
      const result = checkValue(
        {
          field: 'testField',
          logicOperator: logicOperatorForTests,
          operator: listValueOperatorForTests, // list value operator
          value: 'singleValue'
        },
        {
          expectedType: 'string',
          field: 'testField'
        }
      )

      assert(isValidationErr(result))

      expect(result.error).toBe(undefined)
    })

    test('should return a validation error if the provided value is a list (array), but the operator is designed to handle a single value', () => {
      const result = checkValue(
        {
          field: 'testField',
          logicOperator: logicOperatorForTests,
          operator: singleValueOperatorForTests,
          value: ['valid', 'list']
        },
        {
          field: 'testField',
          expectedType: 'string'
        }
      )

      assert(isValidationErr(result))

      expect(result.error).toBe(undefined)
    })

    test('should return a validation error if the provided value is a list (array), but contains elements that are not strings', () => {
      const invalidListValues = [
        [23, 0, 3], [{}, [], null], [undefined, undefined], Array(23)
      ]

      invalidListValues.forEach((listValue) => {
        const result = checkValue(
          {
            field: 'testField',
            logicOperator: logicOperatorForTests,
            operator: singleValueOperatorForTests,
            value: listValue
          },
          {
            expectedType: 'string',
            field: 'testField'
          }

        )

        assert(isValidationErr(result), `Expected value: ${String(listValue)} to be invalid.`)

        expect(result.error).toBe(undefined)
      })
    })

    test.for([
      { expectedType: 'string', valuesToTest: ['  '] },
      { expectedType: 'number', valuesToTest: ['invalid', '{}', 'undefined', 'ab0123', '.33'] },
      {
        expectedType: 'datetime',
        valuesToTest: ['invalid', '{}', 'undefined', '31-31-2024', '1999-13-2',
          '2023-13-15', '2023-01-33', '15-28-2023', 'abcd-ee-fg',
          '2023-11-28T25:61:00', '2023-11-28T15:30:00+99:00', '2023/00/00'
        ]
      }
    ] satisfies TestParameters)('should return a validation error if the provided single value is invalid for $expectedType', ({
      expectedType,
      valuesToTest
    }) => {
      valuesToTest.forEach((value) => {
        const result = checkValue(
          {
            field: 'testField',
            logicOperator: logicOperatorForTests,
            operator: singleValueOperatorForTests,
            value
          },
          {
            expectedType,
            field: 'testField'
          }
        )

        assert(isValidationErr(result), `Expected value: "${String(value)}" to be invalid.`)

        expect(result.error).toBe(undefined)
      })
    })

    test.for(([
      { expectedType: 'string', valuesToTest: ['  ', 'valid'] },
      { expectedType: 'number', valuesToTest: ['invalid', '{}', 'undefined', 'ab0123', '.33', '33'] },
      {
        expectedType: 'datetime',
        valuesToTest: ['invalid', '{}', 'undefined', '31-31-2024', '1999-13-2',
          '2023-13-15', '2023-01-33', '15-28-2023', 'abcd-ee-fg',
          '2023-11-28T25:61:00', '2023-11-28T15:30:00+99:00', '2023/00/00',
          '2024-11-11'
        ]
      }
    ] satisfies TestParameters))('should return a validation error if the provided list of values is invalid for $expectedType', ({
      expectedType,
      valuesToTest: listOfInvalidValues
    }) => {
      const result = checkValue(
        {
          field: 'testField',
          logicOperator: logicOperatorForTests,
          operator: singleValueOperatorForTests,
          value: listOfInvalidValues
        },
        {
          expectedType,
          field: 'testField'
        }
      )

      assert(isValidationErr(result), `Expected list of values: "${String(listOfInvalidValues)}" to be invalid for ${expectedType}.`)

      expect(result.error).toBe(undefined)
    })
  })
})
