import { describe, expect, test } from 'vitest'
import { PrismaRelationFilterRule, PrismaScalarFilterRule } from '../../../../src/filters/validation/types'
import { isIntendedToBeARelationalFilter } from '../../../../src/filters/validation'

describe('isIntendedToBeARelationalFilter', () => {
  test('should return true if the provided rule contains the required properties to be a relational field', () => {
    const relationalFilterRule: PrismaRelationFilterRule = {
      expectedType: 'string',
      field: 'name',
      relation: 'user',
      relationField: 'firstName',
      relationSide: 'to-one'
    }

    const result = isIntendedToBeARelationalFilter(relationalFilterRule)

    expect(result).toBe(true)
  })

  test('should return false if the provided Filter rule doesn\'t contains the required properties to be a relational field', () => {
    const scalarFilterRule: PrismaScalarFilterRule = {
      expectedType: 'string',
      field: 'name'
    }

    const result = isIntendedToBeARelationalFilter(scalarFilterRule)

    expect(result).toBe(false)
  })
})

// describe('the relational filter', () => {
// const PRISMA_TYPES = Object.keys(
//   PRISMA_OPERATORS_BY_TYPES
// ) as PrismaTypes[]
// type PrismaTypes = keyof typeof PRISMA_OPERATORS_BY_TYPES
//
//   type CheckOperatorParameters = {
//     filterPrimitives: Parameters<typeof checkRelationalFilter>[0]
//     relationSide: Parameters<typeof checkRelationalFilter>[1]
//   }
//
//   // This is no longer relevant, the parsing of operator is done in the parsing process.
//   const createCheckRelationalFilter = (
//     relationalOperator: PrismaRelationOperator,
//     relationSide: PrismaRelationFilterRule['relationSide']
//   ): CheckOperatorParameters => {
//     const testID = `test--${crypto.randomUUID()}`
//
//     return {
//       filterPrimitives: {
//         field: testID,
//         logicOperator: PRISMA_LOGIC_OPERATORS.and,
//         operator: relationalOperator,
//         value: testID
//       },
//       relationSide
//     }
//   }
//
//   const combineRelationalFilterWithOperators = (
//     relationSide: PrismaRelationFilterRule['relationSide'],
//     expectedType: PrismaRelationFilterRule['expectedType']
//   ): PrismaRelationOperator[] => {
//     const relationFilters = Object.values(PRISMA_RELATION_FILTERS_BY_SIDE[relationSide])
//     const scalarOperators = PRISMA_OPERATORS_BY_TYPES[expectedType]
//
//     const combinedScalarOperatorsWithRelationalFilters = relationFilters
//       .flatMap(rF => {
//         return scalarOperators.map((sO): PrismaRelationOperator =>
//             `${rF}${RELATION_SCALAR_SEPARATOR}${sO}`) // false
//       })
//
//     return combinedScalarOperatorsWithRelationalFilters
//   }
//
//     type ValidRelationOperatorsByType = {
//       [Type in PrismaTypes]: PrismaRelationOperator[]
//     }
//
//     const validToOneRelationOperators = Object.fromEntries(
//       PRISMA_TYPES.map(prismaType => [
//         prismaType,
//         combineRelationalFilterWithOperators(
//           'to-one',
//           prismaType
//         )
//       ])
//     ) as ValidRelationOperatorsByType
//
//     const validToManyRelationOperators = Object.fromEntries(
//       PRISMA_TYPES.map(prismaType => [
//         prismaType,
//         combineRelationalFilterWithOperators(
//           'to-many',
//           prismaType
//         )
//       ])
//     ) as ValidRelationOperatorsByType
//
//     test.for(
//       PRISMA_TYPES
//     )('should return true if the relational operators are valid for "%s" in both relation sides', (
//       expectedType
//     ) => {
//       const testRelationOperator = (
//         relOperator: PrismaRelationOperator,
//         relSide: PrismaRelationFilterRule['relationSide']
//       ): void => {
//         const { filterPrimitives, relationSide } = createCheckRelationalFilter(
//           relOperator,
//           relSide
//         )
//
//         const result = checkRelationalFilter(filterPrimitives, relationSide)
//
//         assert(!result, `
//           The relation operator:
//             "${filterPrimitives.operator}"
//           Should be valid for the "${relSide}" relation side.
//         `)
//
//         expect(result).toBe(false)
//       }
//
//       validToOneRelationOperators[expectedType]
//         .forEach(relOperator => testRelationOperator(relOperator, 'to-one'))
//       validToManyRelationOperators[expectedType]
//         .forEach(relOperator => testRelationOperator(relOperator, 'to-many'))
//     })
//
//     test.for(
//       PRISMA_TYPES
//     )('should return false if the relational operators are invalid for "%s" in both relation sides', (
//       expectedType
//     ) => {
//       const testRelationOperator = (
//         relOperator: PrismaRelationOperator,
//         expectedType: PrismaTypes,
//         relSide: PrismaRelationFilterRule['relationSide']
//       ): void => {
//         const { filterPrimitives, relationSide } = createCheckRelationalFilter(
//           relOperator,
//           relSide
//         )
//
//         const result = checkRelationalFilter(filterPrimitives, relationSide)
//
//         assert(!result, `
//           The relation operator:
//             "${filterPrimitives.operator}"
//           Should be invalid for "${expectedType}" in the "${relSide}" relation side.
//         `)
//
//         expect(result).toBe(false)
//       }
//
//       const invalidToOneSideRelationOperators = [
//         ...validToOneRelationOperators[expectedType].map(rO => rO.toUpperCase()),
//         ...validToOneRelationOperators[expectedType].map(rO => ` ${rO} `),
//         'invalid', '', ' '
//       ]
//       const invalidToManySideRelationOperators = [
//         ...validToManyRelationOperators[expectedType].map(rO => rO.toUpperCase()),
//         ...validToManyRelationOperators[expectedType].map(rO => ` ${rO} `),
//         'invalid', '', ' '
//       ]
//
//       invalidToOneSideRelationOperators
//         .forEach(rO => testRelationOperator(rO as any, expectedType, 'to-one'))
//       invalidToManySideRelationOperators
//         .forEach(rO => testRelationOperator(rO as any, expectedType, 'to-many'))
//     })
// })
