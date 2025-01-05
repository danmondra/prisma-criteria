import { describe, expect, test } from 'vitest'
import { checkLogicOperator } from '../../../../src/filters/validation/logic-operator-check.js'
import { PRISMA_LOGIC_OPERATORS } from '../../../../src/filters/validation/consts.js'

const LOGIC_OPERATORS = Object.values(PRISMA_LOGIC_OPERATORS)

describe('checkLogicOperator', () => {
  describe('should return true if the provided object has a "logicOperator" property, and its value is a valid logic operator', () => {
    test.for(
      LOGIC_OPERATORS
    )('%s', (logicOperatorProspect) => {
      const filterPrimitives: Parameters<typeof checkLogicOperator>[0] = {
        field: 'test',
        relationalFilter: undefined,
        logicOperator: logicOperatorProspect,
        operator: 'eq',
        value: 'test'
      }

      const result = checkLogicOperator(filterPrimitives)

      expect(result).toBe(true)
    })
  })

  describe('should return false if the "logicOperator" property of the provided object, is an invalid logic operator', () => {
    test.for([
      23, 'invalid', NaN, '', '   ',
      '  AND  ', 'OOR', undefined, null,
      {}, [], 'ANDNOT', 'and', 'or', 'not'
    ])('%s', (logicOperatorProspect) => {
      const filterPrimitives: Parameters<typeof checkLogicOperator>[0] = {
        field: 'test',
        relationalFilter: 'in',
        logicOperator: logicOperatorProspect as any,
        operator: 'eq',
        value: 'test'
      }

      const result = checkLogicOperator(filterPrimitives)

      expect(result).toBe(false)
    })
  })
})
