import LayerGroup from 'ol/layer/Group'
import { apply } from 'ol-mapbox-style'
import type { Locale } from '../i18n'
import { localizeStyle, type LocalizedStyle } from './localizeStyle'

/** Free, key-less vector basemap (OpenMapTiles schema) for the locale-aware layer. */
export const LOCALIZED_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

let cachedStyle: LocalizedStyle | null = null

async function fetchStyle(): Promise<LocalizedStyle> {
  if (cachedStyle) return cachedStyle
  const response = await fetch(LOCALIZED_STYLE_URL)
  if (!response.ok) throw new Error(`Basemap style HTTP ${response.status}`)
  cachedStyle = await response.json() as LocalizedStyle
  return cachedStyle
}

/**
 * Build an OpenLayers layer group whose place-name labels follow `locale`.
 * A fresh group is returned on every call so switching language can replace
 * the old group atomically on the basemap.
 */
export async function createLocalizedLayer(locale: Locale): Promise<LayerGroup> {
  const style = await fetchStyle()
  const group = new LayerGroup()
  await apply(group, localizeStyle(style, locale))
  return group
}
