import {
  PrismaFilterRule,
  PrismaLogicOperator,
  PrismaRelationFilter,
  PrismaRelationFilterRule,
  PrismaScalarOperator
} from '../filters/validation/types'

export type FilterPrimitives = {
  field: string
  logicOperator: string
  relationalFilter?: string | undefined
  operator: string
  value: string | string[]
}

export type Filter<PR extends PrismaFilterRule = PrismaFilterRule> = {
  field: string
  logicOperator: PrismaLogicOperator
  operator: PrismaScalarOperator
  value: unknown
  prismaRules: PR
} & (PR extends PrismaRelationFilterRule
  ? { relationFilter: PrismaRelationFilter }
  : { relationFilter?: undefined }
)
