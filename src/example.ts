import { inspect } from 'util'
import { createPrismaCriteria } from './'

const filtersFromRequest = 'AND mx_state equals 3 OR tag in [museo;catedral] AND category equals Museos AND tag in [jardin;historia;arquitectura]'

const validFilters = createPrismaCriteria(
  { filters: filtersFromRequest },
  {
    rules: {
      allowedFilters: [
        { field: 'mx_state', expectedType: 'number' },
        { field: 'category', expectedType: 'string' },
        { field: 'tag', expectedType: 'string' },
        { field: 'name', expectedType: 'string' },
        { field: 'latitude', expectedType: 'number' }
      ],
      allowedFieldsToOrderBy: ['id', 'createdAt', 'updatedAt', 'status'],
      pageSizeMax: 30
    },
    defaults: { pagination: { pageNumber: 1, pageSize: 20 } }
  }
)

const consoleLogPrettified = (outputId: string, output: any): void => {
  const r = (n: number): string => '#'.repeat(n)
  console.log(`
    ${r(outputId.length * 3)}
    ${r(outputId.length - 1)} ${outputId} ${r(outputId.length - 1)}
    ${r(outputId.length * 3)}
  `)

  console.log(
    inspect(output, { colors: true, depth: null, compact: false })
  )
}

consoleLogPrettified('prisma where', validFilters)
