import type { Locale } from '../i18n'

type Expression = unknown

/**
 * OpenMapTiles keeps every translation in its own attribute: `name` is the
 * local spelling, `name:en` / `name:zh` / `name:fr` the translated ones and
 * `name:latin` the Romanised form. Any expression that reads one of those
 * attributes is a place-name label and has to follow the UI language.
 */
function readsNameField(node: unknown): boolean {
  if (!Array.isArray(node)) return false
  const operator = node[0]
  if ((operator === 'get' || operator === 'has') && typeof node[1] === 'string') {
    return /^name(:[A-Za-z-]+|_[a-z]{2,3})?$/.test(node[1])
  }
  return node.some(readsNameField)
}

/**
 * Preferred to least preferred name attribute per UI language.
 *
 * English has to stay Latin-script, so it falls back to the Romanised name
 * rather than to the local spelling. Chinese prefers `name:zh`, then the local
 * spelling (inside China that *is* the Chinese name, so towns without an
 * explicit `name:zh` tag never degrade to pinyin).
 */
export const LABEL_FIELDS: Record<Locale, readonly string[]> = {
  en: ['name:en', 'name_en', 'name:latin', 'name'],
  // `name:zh` in the tiles often holds "简体;繁體" glued together, while
  // `name:zh-Hans` is the clean simplified form — prefer it.
  zh: ['name:zh-Hans', 'name:zh', 'name', 'name:en'],
  fr: ['name:fr', 'name:latin', 'name', 'name:en'],
  es: ['name:es', 'name:latin', 'name', 'name:en'],
}

/** `coalesce` chain used as the label `text-field` for a UI language. */
export function labelExpression(locale: Locale): Expression {
  const fields = LABEL_FIELDS[locale] ?? ['name:latin', 'name']
  return ['coalesce', ...fields.map((field) => ['get', field])]
}

/**
 * Replace a style's own name picker (usually an English-first `case`/`coalesce`
 * with a bilingual variant) by the chain for the UI language. Expressions that
 * do not read a name attribute — road `ref` shields, housenumbers — are
 * returned untouched.
 */
export function localizeTextField(field: Expression, locale: Locale): Expression {
  return readsNameField(field) ? labelExpression(locale) : field
}

export interface StyleLayer {
  id?: string
  type?: string
  layout?: Record<string, unknown>
  paint?: Record<string, unknown>
}

export type LocalizedStyle = {
  layers?: StyleLayer[]
  sources?: Record<string, { attribution?: string; [key: string]: unknown }>
  [key: string]: unknown
}

/** Land/ocean base colour declared by the style's `background` layer. */
export function backgroundColour(style: LocalizedStyle): string | undefined {
  const background = (style.layers ?? []).find((layer) => layer.type === 'background')
  const colour = background?.paint?.['background-color']
  return typeof colour === 'string' ? colour : undefined
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

/** Return a copy of the style with labels in `locale` and required attribution. */
export function localizeStyle(style: LocalizedStyle, locale: Locale): LocalizedStyle {
  const layers = (style.layers ?? []).map((original) => {
    const layer = tintWater(original)
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
