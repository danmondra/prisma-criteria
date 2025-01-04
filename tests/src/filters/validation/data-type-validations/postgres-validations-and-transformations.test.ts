import { describe, expect, test } from 'vitest'
import { isValidationErr, isValidationOk, Validation } from '../../../../../src/shared/validation.util'
import assert from 'assert'
import {
  POSTGRES_VALIDATIONS_AND_TRANSFORMATIONS as P
} from '../../../../../src/filters/validation/data-type-validations/postgres-validations-and-transformations'

const shouldReturnValidationErrorIfParameterIsNotString = (
  validationFn: (v: string) => Validation<undefined, unknown>
): void => {
  describe('should return a validation error if the provided property isn\'t a string', () => {
    test.for([
      BigInt(23),
      {},
      Symbol('test'),
      null,
      undefined
    ])('(%s)', (prospect) => {
      const result = validationFn(prospect as any)

      expect(isValidationErr(result)).toBe(true)
    })
  })
}

describe('Postgres Type Validation and Transformations', () => {
  describe('string', () => {
    shouldReturnValidationErrorIfParameterIsNotString(P.string)

    test('should return the same provided string', () => {
      const providedString = 'test'
      const result = P.string(providedString)

      assert(isValidationOk(result), 'Expected validation to be successful.')

      expect(result.ok).toBe(providedString)
    })
  })

  describe('number', () => {
    shouldReturnValidationErrorIfParameterIsNotString(P.number)

    describe('should return a successful validation with the provided string transformed to number with the base 10', () => {
      test.for([
        ['10', 10], ['20', 20], ['32333', 32333], ['1010', 1010], ['12', 12],
        ['1.33', 1], ['0', 0], ['0x33', 0], ['   23   ', 23], ['0xff', 0]
      ] as Array<[string, number]>)('%s -> %d', ([prospect, expected]) => {
        const result = P.number(prospect)
        assert(isValidationOk(result), 'Expected to be a successful validation.')

        expect(result.ok).toBe(expected)
      })
    })

    describe('should return an validation error if the provided string isn\'t a number', () => {
      test.for(['string', '', '    '])('"%s"', (prospect) => {
        const result = P.number(prospect as any)
        assert(isValidationErr(result), 'Expected to be a validation error.')

        expect(result.error).toBe(undefined)
      })
    })
  })

  describe('datetime', () => {
    shouldReturnValidationErrorIfParameterIsNotString(P.datetime)

    describe('should return a successful validation with the provided Date time in string format transformed to a Date object.', () => {
      test.for([
        ['2022-01-01', new Date('2022-01-01')],
        ['1980-12-12', new Date('1980-12-12')],
        ['2030-12-31', new Date('2030-12-31')],
        ['11/28/2023', new Date('11/28/2023')],
        ['2011-10-10T14:48:00.000+09:00', new Date('2011-10-10T14:48:00.000+09:00')],
        ['11/28/2023', new Date('11-28-2023')],
        ['9999-12-31', new Date('9999-12-31')]
      ] as Array<[string, Date]>)('%s -> %s', ([prospectDate, expectedDate]) => {
        const result = P.datetime(prospectDate)
        assert(isValidationOk(result), 'Expected validation to be successful.')

        expect(result.ok).toEqual(expectedDate)
      })
    })

    describe('should return a validation error if the provided Date time in string format is invalid.', () => {
      test.for([
        '2023-13-15', '2023-01-33', '15-28-2023',
        'abcd-ee-fg', '2023-11-28T25:61:00',
        '2023-11-28T15:30:00+99:00', '2023/00/00'
      ])('%s', (prospectDate) => {
        const result = P.datetime(prospectDate)
        assert(isValidationErr(result), 'Expected validation to be error.')

        expect(result.error).toEqual(undefined)
      })
    })
  })
})
