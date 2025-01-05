import { assert, describe, expect, test } from 'vitest'
import { validateOrder } from '../../src/order-validation.js'
import { isValidationErr, isValidationOk } from '../../src/shared/validation.util.js'

describe('validateOrder', () => {
  describe('should return a successful validation and an object containing the generated orderBy if the field is included in the allowed list', () => {
    test.for([
      [['name', 'asc', ['name']], { name: 'asc' }],
      [['age', 'desc', ['age', 'name']], { age: 'desc' }],
      [['createdAt', 'asc', ['createdAt', 'name', 'age']], { createdAt: 'asc' }]
    ] as Array<[[string, string, string[]], object]>)('%o -> { orderBy: %o }', ([
      [orderByProspect, orderDirProspect, allowedFieldsToOrderBy],
      orderByExpected
    ]) => {
      const result = validateOrder(orderByProspect, orderDirProspect, allowedFieldsToOrderBy)
      assert(isValidationOk(result), 'Expected validation to be successful.')

      expect(result.ok).toEqual({ orderBy: orderByExpected })
    })
  })

  test('should return a validation error if the orderByProspect is undefined', () => {
    const result = validateOrder(undefined, 'asc', ['test'])
    assert(isValidationErr(result), 'Expected validation to be successful.')

    expect(result).toHaveProperty('error')
  })

  describe('should return a validation error if the field is not included in the allowed list', () => {
    test.for([
      ['name', 'asc', []],
      ['age', 'desc', ['name']],
      ['createdAt', 'asc', ['name', 'age']]
    ] as Array<[string, string, string[]]>)('{ %o: %o } not in %o', ([
      orderByProspect,
      orderDirProspect,
      allowedFieldsToOrderBy
    ]) => {
      const result = validateOrder(orderByProspect, orderDirProspect, allowedFieldsToOrderBy)
      assert(isValidationErr(result), 'Expected validation to be an error.')

      expect(result).toHaveProperty('error')
    })
  })

  describe('should return a validation error if the provided orderDir is neither "asc" nor "desc"', () => {
    test.for([
      ['name', 'ascc', ['name']],
      ['age', '   desc', ['age']],
      ['createdAt', '  asc   ', ['createdAt']]
    ] as Array<[string, string, string[]]>)('value of { %o: %o } is neither "asc" nor "desc"', ([
      orderByProspect,
      orderDirProspect,
      allowedFieldsToOrderBy
    ]) => {
      const result = validateOrder(orderByProspect, orderDirProspect, allowedFieldsToOrderBy)
      assert(isValidationErr(result), 'Expected validation to be an error.')

      expect(result).toHaveProperty('error')
    })
  })
})
