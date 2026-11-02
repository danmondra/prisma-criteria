import { PrismaFilterRule, PrismaLogicOperator } from './filters/validation/types.js'
import { XOR } from './shared/utility.types.js'

export type PrismaCriteria = {
  where?: NewPrismaWhereStatement3['where']
  orderBy: Record<string, 'asc' | 'desc'> | undefined
  take?: number
  skip?: number
}

export type UserInputCriteria = Partial<{
  filters: string
  orderBy: string
  orderDir: string
  pageNumber: string
  pageSize: string
}> & { [k: string]: string | undefined }

export type PrismaCriteriaOptions = {
  rules: {
    allowedFilters: PrismaFilterRule[]
    allowedFieldsToOrderBy: string[]
    pageSizeMax: number
  }
  defaults?: {
    filters?: PrismaIndividualCondition[]
    orderBy?: PrismaCriteria['orderBy']
    pagination?: { pageSize: number, pageNumber: number }
  }
}

export type PrismaWhereSelfStatement = {
  [x: string]: {
    [x: string]: unknown
  }
}

export type PrismaWhereRelationStatement = {
  [x: string]: {
    [x: string]: {
      [x: string]: unknown
    }
  }
}

export type PrismaWhereFilter = XOR<PrismaWhereSelfStatement, PrismaWhereRelationStatement>

/** @internal */
type PrismaIndividualConditionDistributed<T extends PrismaLogicOperator> = T extends T
  ? { [LogOp in T]: PrismaWhereFilter }
  : never

export type PrismaIndividualCondition = PrismaIndividualConditionDistributed<PrismaLogicOperator>

/**
  If no filter provided: returns all items ({ OR: [] })
  All invalid filter provided: all items ({ AND: [] })
  Some filter provided: matched items ({ AND: [...conditions] })

  {@link https://github.com/prisma/prisma/issues/4784#issuecomment-779845616 | Prisma Empty conditionals}
*/
export type NewPrismaWhereStatement = { OR: [] } | {
  AND: PrismaIndividualCondition[]
}

// For prisma "OR" needs to be always an array. I suppose this
// behavior is intended to be like that to enforce you to think
// in OR as a list of possible conditions, and not a single condition.
export type NewPrismaWhereStatement2 = {
  [LO in PrismaLogicOperator]?: PrismaIndividualCondition[]
}

export type NewPrismaWhereStatement3 = {
  where: {
    [LogicOperator in PrismaLogicOperator]?: PrismaWhereFilter[]
  }
}

export type PrismaWhereStatement = {
  [LogOp in PrismaLogicOperator]?: PrismaWhereFilter[]
}
