export const PRISMA_LOGIC_OPERATORS = Object.freeze({
  and: 'AND',
  or: 'OR',
  not: 'NOT'
} as const)

export const PRISMA_RELATION_FILTERS_BY_SIDE = Object.freeze({
  'to-one': {
    is: 'is',
    isNot: 'isNot'
  },
  'to-many': {
    every: 'every',
    some: 'some',
    none: 'none'
  }
} as const)

export const PRISMA_SCALAR_OPERATORS = Object.freeze({
  equals: 'equals',
  in: 'in',
  notIn: 'notIn'
} as const)

export const PRISMA_COMMON_LIST_OPERATORS = Object.freeze([
  PRISMA_SCALAR_OPERATORS.in,
  PRISMA_SCALAR_OPERATORS.notIn
] as const)

export const PRISMA_COMMON_SCALAR_OPERATORS = Object.freeze([
  PRISMA_SCALAR_OPERATORS.equals,
  ...PRISMA_COMMON_LIST_OPERATORS
] as const)

export const PRISMA_OPERATORS_BY_GROUP = Object.freeze({
  types: {
    string: [
      ...PRISMA_COMMON_SCALAR_OPERATORS
    ],
    number: [
      ...PRISMA_COMMON_SCALAR_OPERATORS
    ],
    datetime: [
      ...PRISMA_COMMON_SCALAR_OPERATORS
    ]
  }
} as const)
