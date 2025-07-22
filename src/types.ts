import { PrismaFilterRule, PrismaLogicOperator } from './filters/validation/types.js'
import { XOR } from './shared/utility.types.js'

export type PrismaCriteria = {
  where?: PrismaWhereStatement
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
    filters?: PrismaWhereStatement
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

export type PrismaWhereStatement = {
  [LogOp in PrismaLogicOperator]?: PrismaWhereFilter[]
}
