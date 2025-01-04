import { PRISMA_LOGIC_OPERATORS } from '../validation/consts'

export const FILTER_SEPARATOR = ' '
export const LIST_START = '['
export const LIST_END = ']'
export const LIST_ELEMENTS_SEPARATOR = ';'
export const RELATION_SCALAR_SEPARATOR = '-'

const LOGIC_OPERATORS_JOINED = Object.values(PRISMA_LOGIC_OPERATORS).join('|')
export const LOGIC_OPERATORS_WITH_SPACES_REGEX = new RegExp(
  String.raw`^(?:${LOGIC_OPERATORS_JOINED}) |(?: (?:${LOGIC_OPERATORS_JOINED}) )`,
  'g'
)
