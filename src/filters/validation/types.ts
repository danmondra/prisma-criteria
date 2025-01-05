import { XOR, ObjectValues } from '../../shared/utility.types.js'
import { RELATION_SCALAR_SEPARATOR } from '../parser/dsl.consts.js'
import {
  PRISMA_RELATION_FILTERS_BY_SIDE,
  PRISMA_LOGIC_OPERATORS,
  PRISMA_SCALAR_OPERATORS,
  PRISMA_OPERATORS_BY_GROUP
} from './consts.js'

export type PrismaLogicOperator = ObjectValues<
  typeof PRISMA_LOGIC_OPERATORS
>

export type PrismaScalarOperator = ObjectValues<
  typeof PRISMA_SCALAR_OPERATORS
>

export type PrismaRelationFilter = ObjectValues<
    typeof PRISMA_RELATION_FILTERS_BY_SIDE,
'to-one'
>
| ObjectValues<
    typeof PRISMA_RELATION_FILTERS_BY_SIDE,
'to-many'
>

export type PrismaRelationOperator =
  `${PrismaRelationFilter}${typeof RELATION_SCALAR_SEPARATOR}${PrismaScalarOperator}`

export type PrismaScalarType = keyof typeof PRISMA_OPERATORS_BY_GROUP['types']

export type PrismaScalarFilterRule = {
  field: string
  expectedType: PrismaScalarType
  mapFieldTo?: string
}

export type PrismaRelationFilterRule = {
  field: string
  expectedType: PrismaScalarType
  relation: string
  relationField: string
  relationSide: keyof typeof PRISMA_RELATION_FILTERS_BY_SIDE
}

export type PrismaFilterRule = XOR<PrismaScalarFilterRule, PrismaRelationFilterRule>
