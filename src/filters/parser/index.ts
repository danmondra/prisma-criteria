import { FilterPrimitives } from '../../shared/filter.types.js'
import {
  FILTER_SEPARATOR,
  LIST_ELEMENTS_SEPARATOR,
  LIST_END,
  LIST_START,
  LOGIC_OPERATORS_WITH_SPACES_REGEX,
  RELATION_SCALAR_SEPARATOR
} from './dsl.consts.js'

const coincidentFilterToFilterPrimitives = (
  filterCoincidence: RegExpExecArray,
  index: number,
  filterIterators: RegExpExecArray[]
): FilterPrimitives => {
  const { index: startOfFilterSentence, input } = filterCoincidence

  // Where the following sentence begins
  const endOfFilterSentence = (filterIterators[index + 1]?.index) ??
      (input.length)

  const [logicOperator, field, operator, ...value] = input
    .slice(startOfFilterSentence, endOfFilterSentence)
    .trim()
    .split(FILTER_SEPARATOR)

  let scalarOperator = operator
  let relationalFilter

  if (operator?.includes(RELATION_SCALAR_SEPARATOR))
    [relationalFilter, scalarOperator] = operator.split(RELATION_SCALAR_SEPARATOR)

  let singleValueOrListValue: string | string[] = value
    .join(FILTER_SEPARATOR)

  const isValueAList = singleValueOrListValue[0] === LIST_START &&
    singleValueOrListValue[singleValueOrListValue.length - 1] === LIST_END

  if (isValueAList) {
    singleValueOrListValue = singleValueOrListValue
      .slice(LIST_START.length, -LIST_START.length)
      .split(LIST_ELEMENTS_SEPARATOR)
  }

  return {
    logicOperator,
    field,
    relationalFilter,
    operator: scalarOperator,
    value: singleValueOrListValue
  }
}

export function filtersDSLParser (filtersSentence: string | undefined): FilterPrimitives[] {
  if (filtersSentence === undefined) return []

  // TODO --- The regex should match and group all the parts of the DSL
  // to ensure the filter is valid. Then we should remove the checks for
  // each part of the DSL since it matched therefore is a valid part.

  const filterSentenceCoincidences = [
    ...filtersSentence.matchAll(LOGIC_OPERATORS_WITH_SPACES_REGEX)
  ]

  const filterPrimitives: FilterPrimitives[] = filterSentenceCoincidences
    .map(coincidentFilterToFilterPrimitives)

  return filterPrimitives
}
