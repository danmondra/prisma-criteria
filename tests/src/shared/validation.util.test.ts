import { describe, expect, test } from 'vitest'
import { isValidationErr, isValidationOk, validationError, validationOk } from '../../../src/shared/validation.util'

describe('validation utility', () => {
  describe('validationError', () => {
    test('should return an object with the value of the _result property as "error"', () => {
      const result = validationError(undefined)

      expect(result._result).toBe('error')
    })

    test('should return the provided value in the property "error"', () => {
      const providedError = 'This is an error for the test!'

      const result = validationError(providedError)

      expect(result.error).toBe(providedError)
    })
  })

  describe('validationOk', () => {
    test('should return an object with the value of the _result property as "ok"', () => {
      const result = validationOk(undefined)

      expect(result._result).toBe('ok')
    })

    test('should return the provided value in the property "ok"', () => {
      const providedOk = 'This is successful value!'

      const result = validationOk(providedOk)

      expect(result.ok).toBe(providedOk)
    })
  })

  describe('isValidationOk', () => {
    test('should return false if the property _result of the provided object is different than "ok"', () => {
      const result = isValidationOk({ _result: 'error', error: undefined })

      expect(result).toBe(false)
    })

    test('should return true if the property _result of the provided object is "ok"', () => {
      const result = isValidationOk({ _result: 'ok', ok: undefined })

      expect(result).toBe(true)
    })
  })

  describe('isValidationErr', () => {
    test('should return false if the property _result of the provided object is different than "error"', () => {
      const result = isValidationErr({ _result: 'ok', ok: undefined })

      expect(result).toBe(false)
    })

    test('should return true if the property _result of the provided object is "error"', () => {
      const result = isValidationErr({ _result: 'error', error: undefined })

      expect(result).toBe(true)
    })
  })
})
