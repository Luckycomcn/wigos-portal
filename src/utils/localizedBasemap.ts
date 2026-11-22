import LayerGroup from 'ol/layer/Group'
import { apply } from 'ol-mapbox-style'
import type { Locale } from '../i18n'
import { backgroundColour, localizeStyle, type LocalizedStyle } from './localizeStyle'

export type WorldStyleKey = 'osm'

/**
 * Free, key-less vector style (OpenMapTiles schema, OpenStreetMap data).
 *
 * `bright` is the classic coloured cartography the portal asks for: beige land,
 * green vegetation, blue water, orange trunk roads. The grey `positron` style
 * is deliberately not used, and the two former world entries (bright + liberty)
 * are collapsed into this single OpenFreeMap basemap.
 */
export const WORLD_STYLE_URLS: Record<WorldStyleKey, string> = {
  osm: 'https://tiles.openfreemap.org/styles/bright',
}

const styleCache = new Map<WorldStyleKey, Promise<LocalizedStyle>>()

function loadStyle(key: WorldStyleKey): Promise<LocalizedStyle> {
  let pending = styleCache.get(key)
  if (!pending) {
    pending = fetch(WORLD_STYLE_URLS[key]).then((response) => {
      if (!response.ok) throw new Error(`Basemap style HTTP ${response.status}`)
      return response.json() as Promise<LocalizedStyle>
    }).catch((error) => {
      styleCache.delete(key)
      throw error
    })
    styleCache.set(key, pending)
  }
  return pending
}

export interface LocalizedBasemap {
  group: LayerGroup
  /** Base land colour declared by the style, used as the container backdrop. */
  background?: string
}

/**
 * Build an OpenLayers layer group whose place-name labels follow `locale`.
 * A fresh group is returned on every call so switching language can replace
 * the old group atomically on the basemap.
 */
export async function createLocalizedLayer(
  locale: Locale,
  key: WorldStyleKey = 'osm',
): Promise<LocalizedBasemap> {
  const style = await loadStyle(key)
  const group = new LayerGroup()
  try {
    await apply(group, localizeStyle(style, locale))
  } catch (error) {
    group.dispose()
    throw error
  }
  return { group, background: backgroundColour(style) }
}
