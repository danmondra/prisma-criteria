import {
  PrismaFilterRule,
  PrismaLogicOperator,
  PrismaRelationFilter,
  PrismaRelationFilterRule,
  PrismaScalarOperator
} from '../filters/validation/types'

export type FilterPrimitives = {
  field: string | undefined
  logicOperator: string | undefined
  relationalFilter?: string | undefined
  operator: string | undefined
  value: string | string[] | undefined
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
