import type { Locale } from '../i18n'

type Expression = unknown

function isNamePicker(node: unknown): boolean {
  return (
    Array.isArray(node) &&
    node[0] === 'coalesce' &&
    Array.isArray(node[1]) && node[1][1] === 'name_en'
  )
}

/**
 * Localize a MapLibre `text-field` expression so the place name follows the
 * UI language. OpenMapTiles stores translations as `name:<locale>`; we prefer
 * that field, then fall back through the Latin/international/local names.
 * Non-name fields (e.g. road `ref` via `to-string`) are returned untouched.
 */
export function localizeTextField(field: Expression, locale: Locale): Expression {
  if (!Array.isArray(field) || field[0] !== 'case') return field
  if (!field.some(isNamePicker)) return field
  return [
    'coalesce',
    ['get', `name:${locale}`],
    ['get', 'name:latin'],
    ['get', 'name:en'],
    ['get', 'name'],
  ]
}

interface StyleLayer {
  id?: string
  layout?: Record<string, unknown>
}

export type LocalizedStyle = {
  layers?: StyleLayer[]
  sources?: Record<string, { attribution?: string; [key: string]: unknown }>
  [key: string]: unknown
}

const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> © '
  + '<a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> '
  + 'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'

/** Return a shallow copy of the style with localized labels and required attribution. */
export function localizeStyle(style: LocalizedStyle, locale: Locale): LocalizedStyle {
  const layers = (style.layers ?? []).map((layer) => {
    const field = layer.layout?.['text-field']
    if (field === undefined) return layer
    return {
      ...layer,
      layout: { ...layer.layout, 'text-field': localizeTextField(field, locale) },
    }
  })
  const sources = Object.fromEntries(
    Object.entries(style.sources ?? {}).map(([name, source]) => [
      name,
      name === 'openmaptiles' ? { ...source, attribution: OPENFREEMAP_ATTRIBUTION } : source,
    ]),
  )
  return { ...style, layers, sources }
}
