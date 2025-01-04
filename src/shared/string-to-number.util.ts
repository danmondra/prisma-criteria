import { Validation, validationError, validationOk } from './validation.util'

export const stringToNumber = (
  stringProspect: string | undefined
): Validation<string, number> => {
  const numberProspect = typeof stringProspect === 'string'
    ? parseInt(stringProspect, 10)
    : NaN

  if (!isFinite(numberProspect))
    return validationError('The provided numeric value is invalid.')

  return validationOk(numberProspect)
}
