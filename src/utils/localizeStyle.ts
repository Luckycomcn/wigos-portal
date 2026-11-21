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
  paint?: Record<string, unknown>
}

export type LocalizedStyle = {
  layers?: StyleLayer[]
  sources?: Record<string, { attribution?: string; [key: string]: unknown }>
  [key: string]: unknown
}

/** Soft blue for the positron water layers (otherwise a flat grey). */
export const WATER_FILL_COLOR = 'rgb(160, 205, 230)'
export const WATERWAY_LINE_COLOR = 'hsl(200, 55%, 72%)'

/**
 * Tint the grey water layers blue so oceans read as water at a glance.
 * Only the `water` fill and `waterway` line are touched; all other layers
 * (and their labels) are returned unchanged.
 */
export function tintWater(layer: StyleLayer): StyleLayer {
  if (layer.id === 'water') {
    return { ...layer, paint: { ...layer.paint, 'fill-color': WATER_FILL_COLOR } }
  }
  if (layer.id === 'waterway') {
    return { ...layer, paint: { ...layer.paint, 'line-color': WATERWAY_LINE_COLOR } }
  }
  return layer
}

const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> © '
  + '<a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> '
  + 'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'

/** Return a shallow copy of the style with localized labels and required attribution. */
export function localizeStyle(style: LocalizedStyle, locale: Locale): LocalizedStyle {
  const layers = (style.layers ?? []).map((layer) => {
    const tinted = tintWater(layer)
    const field = tinted.layout?.['text-field']
    if (field === undefined) return tinted
    return {
      ...tinted,
      layout: { ...tinted.layout, 'text-field': localizeTextField(field, locale) },
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
