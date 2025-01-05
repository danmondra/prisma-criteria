import { assert, describe, expect, test } from 'vitest'
import { stringToNumber } from '../../../src/shared/string-to-number.util.js'
import { isValidationErr, isValidationOk } from '../../../src/shared/validation.util.js'
import { format } from 'util'

describe('stringToNumber', () => {
  format('%s', [23, 23])

  describe('should convert a numeric string to a number with the base 10', () => {
    test.for([
      ['10', 10], ['20', 20], ['33333', 33333], ['1010', 1010], ['12', 12],
      ['1.33', 1], ['0', 0], ['0x33', 0], ['   23   ', 23], ['0xff', 0],
      ['-1.33', -1], ['-0', -0], ['-0x33', -0], ['   -23   ', -23], ['-0xff', -0]
    ] as Array<[string, number]>)('should convert (%s) to (%i)', ([
      prospect,
      expectedNumber
    ]) => {
      const result = stringToNumber(prospect)
      assert(isValidationOk(result), 'Expected to be a successful validation.')

      expect(result.ok).toBe(expectedNumber)
    })
  })

  describe('should return a validation error if the provided property isn\'t a numeric string', () => {
    test.for([
      'notAString',
      BigInt(23),
      {},
      Symbol('test'),
      null,
      undefined
    ])('(%s)', (prospect) => {
      const result = stringToNumber(prospect as any)

      expect(isValidationErr(result)).toBe(true)
    })
  })

  describe('should return an validation error if the provided numeric string isn\'t a finite number', () => {
    test.for(['string', '', '    '])('(%s)', (prospect) => {
      const result = stringToNumber(prospect as any)

      expect(isValidationErr(result)).toBe(true)
    })
  })
})
