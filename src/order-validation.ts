import { Validation, validationError, validationOk } from './shared/validation.util.js'
import { PrismaCriteria } from './types.js'

export function validateOrder (
  orderByProspect: string | undefined,
  orderDirProspect: string | undefined,
  allowedFieldsToOrderBy: string[]
): Validation<undefined, { orderBy: PrismaCriteria['orderBy'] }> {
  if (typeof orderByProspect !== 'string' || typeof orderDirProspect !== 'string')
    return validationError(undefined)

  const isOrderByProspectAllowed =
    allowedFieldsToOrderBy.includes(orderByProspect)
  if (!isOrderByProspectAllowed) return validationError(undefined)

  const isOrderDirProspectValid =
    orderDirProspect === 'asc' || orderDirProspect === 'desc'
  if (!isOrderDirProspectValid) return validationError(undefined)

  return validationOk({ orderBy: { [orderByProspect]: orderDirProspect } })
}
