import programAffiliationsRaw from './programAffiliations.json'
import type { StationDomain } from './stations'
import variableTreeRaw from './variableTree.json'
import { findTerritoryId, territories, territoryById, type WmdrTerritory } from './wmdrTerritories'

export { findTerritoryId, territories, territoryById }
export type { WmdrTerritory }

export interface WmdrCode {
  id: string
  title: string
}

export interface FacilityTypeCode extends WmdrCode {
  domain: StationDomain
}

/**
 * WMDR2 FacilityType code list (https://codes.wmo.int/wmdr/FacilityType).
 * `domain` maps the code to the colour buckets used by the OpenLayers map.
 */
export const facilityTypes: FacilityTypeCode[] = [
  { id: 'landFixed', title: 'Land (fixed)', domain: 'land-ocean' },
  { id: 'landMobile', title: 'Land (mobile)', domain: 'land-ocean' },
  { id: 'landOnIce', title: 'Land (on ice)', domain: 'land-ocean' },
  { id: 'seaFixed', title: 'Sea (fixed)', domain: 'land-ocean' },
  { id: 'seaMobile', title: 'Sea (mobile)', domain: 'land-ocean' },
  { id: 'seaOnIce', title: 'Sea (on ice)', domain: 'land-ocean' },
  { id: 'lakeRiverFixed', title: 'Lake/River (fixed)', domain: 'lake' },
  { id: 'lakeRiverMobile', title: 'Lake/River (mobile)', domain: 'lake' },
  { id: 'underwaterFixed', title: 'Underwater (fixed)', domain: 'subsurface' },
  { id: 'underwaterMobile', title: 'Underwater (mobile)', domain: 'subsurface' },
  { id: 'airFixed', title: 'Air (fixed)', domain: 'air' },
  { id: 'airMobile', title: 'Air (mobile)', domain: 'air' },
  { id: 'spaceBased', title: 'Space-based', domain: 'air' },
  { id: 'unknown', title: 'unknown', domain: 'land-ocean' },
]

const facilityTypeIndex = new Map(facilityTypes.map((t) => [t.id.toLowerCase(), t]))

export function facilityTypeCode(id?: string | null): FacilityTypeCode | undefined {
  if (!id) return undefined
  return facilityTypeIndex.get(id.toLowerCase())
}

export function facilityTypeTitle(id?: string | null): string {
  return facilityTypeCode(id)?.title ?? ''
}

export function facilityTypeDomain(id?: string | null): StationDomain {
  return facilityTypeCode(id)?.domain ?? 'land-ocean'
}

export function facilityTypeIdByTitle(title: string): string | undefined {
  const needle = title.trim().toLowerCase()
  return facilityTypes.find((t) => t.title.toLowerCase() === needle || t.id.toLowerCase() === needle)?.id
}

export const wmoRegions: WmdrCode[] = [
  { id: 'africa', title: 'Africa' },
  { id: 'asia', title: 'Asia' },
  { id: 'europe', title: 'Europe' },
  { id: 'northCentralAmericaCaribbean', title: 'North America, Central America and the Caribbean' },
  { id: 'southAmerica', title: 'South America' },
  { id: 'southWestPacific', title: 'South-West Pacific' },
  { id: 'antarctica', title: 'Antarctica' },
  { id: 'inapplicable', title: 'inapplicable' },
  { id: 'unknown', title: 'unknown' },
]

const wmoRegionIndex = new Map(wmoRegions.map((r) => [r.id.toLowerCase(), r.title]))

export function wmoRegionTitle(id?: string | null): string {
  if (!id) return ''
  return wmoRegionIndex.get(id.toLowerCase()) ?? id
}

/**
 * All programme / network affiliations published by the WMDR code list at
 * https://codes.wmo.int/wmdr/ProgramAffiliation. The bundled JSON is generated
 * by `npm run refresh:wmdr-codes` so advanced-search options always cover every
 * valid affiliation (including GCW CryoNet) without a runtime dependency on
 * codes.wmo.int or browser CORS. `loadProgramAffiliations()` may refresh the
 * list at runtime; this snapshot stays as the offline fallback.
 *
 * Titles are the plain register labels: the identifier is kept in `id` and is
 * never prefixed onto the label, which is what users see in the filter.
 */
export const programAffiliations: WmdrCode[] = [...programAffiliationsRaw]

/** Codes retained for catalogue records that still reference them. */
const LEGACY_PROGRAMMES: WmdrCode[] = [{ id: 'OceanSITES', title: 'OceanSITES' }]

const programIndex = new Map(programAffiliations.map((p) => [p.id.toLowerCase(), p.title]))

const PROGRAM_REGISTER_URL = 'https://codes.wmo.int/wmdr/ProgramAffiliation?_format=rdf'
let programRequest: Promise<WmdrCode[]> | undefined

/** Fetch once per page session. Offline, timeout, CORS and invalid responses retain the bundled list. */
export function loadProgramAffiliations(): Promise<WmdrCode[]> {
  return programRequest ??= (async () => {
    try {
      const response = await fetch(PROGRAM_REGISTER_URL, {
        headers: { Accept: 'application/rdf+xml' },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error('WMO register request failed')
      const document = new DOMParser().parseFromString(await response.text(), 'application/xml')
      if (document.getElementsByTagName('parsererror').length) throw new Error('Invalid WMO XML')
      const skos = 'http://www.w3.org/2004/02/skos/core#'
      const rdfs = 'http://www.w3.org/2000/01/rdf-schema#'
      const codes = new Map<string, WmdrCode>()
      for (const member of Array.from(document.getElementsByTagNameNS(skos, 'member'))) {
        const id = member.getElementsByTagNameNS(skos, 'notation')[0]?.textContent?.trim()
        const label = member.getElementsByTagNameNS(rdfs, 'label')[0]?.textContent?.trim()
        if (id) codes.set(id, { id, title: label || id })
      }
      // Reject error pages and truncated responses before replacing the fallback.
      if (codes.size < 100 || !codes.has('GCWCryoNet')) throw new Error('Incomplete WMO register')
      // Keep legacy codes the current register no longer publishes.
      for (const code of LEGACY_PROGRAMMES) if (!codes.has(code.id)) codes.set(code.id, { ...code })
      const updated = [...codes.values()].sort((a, b) => a.id.localeCompare(b.id))
      programAffiliations.splice(0, programAffiliations.length, ...updated)
      programIndex.clear()
      for (const code of updated) programIndex.set(code.id.toLowerCase(), code.title)
    } catch {
      // The initial local snapshot remains usable throughout the request and on failure.
    }
    return [...programAffiliations]
  })()
}

export function programTitle(id?: string | null): string {
  if (!id) return ''
  return programIndex.get(id.toLowerCase()) ?? id
}

export function programIdByTitle(title: string): string | undefined {
  const needle = title.trim().toLowerCase()
  return programAffiliations.find((p) => p.id.toLowerCase() === needle)?.id
    ?? programAffiliations.find((p) => p.title.toLowerCase() === needle)?.id
}

interface VariableNode {
  id: number
  text: string
  children?: VariableNode[]
}

export interface VariableInfo {
  id: number
  name: string
  category: string
  path: string
}

let variableIndex: Map<number, VariableInfo> | null = null

function walkVariables(nodes: VariableNode[], path: string[], category: string, out: Map<number, VariableInfo>) {
  for (const node of nodes) {
    const nextPath = [...path, node.text]
    const nextCategory = category || node.text
    if (!out.has(node.id)) {
      out.set(node.id, { id: node.id, name: node.text, category: nextCategory, path: nextPath.join(' > ') })
    }
    if (node.children?.length) walkVariables(node.children, nextPath, nextCategory, out)
  }
}

/** Observed-property ids (WMDR) resolved to names via the bundled OSCAR variable tree. */
export function variableIndexMap(): Map<number, VariableInfo> {
  if (!variableIndex) {
    variableIndex = new Map()
    walkVariables(variableTreeRaw as VariableNode[], [], '', variableIndex)
  }
  return variableIndex
}

export function variableInfo(id?: string | number | null): VariableInfo | undefined {
  if (id == null || id === '') return undefined
  const numeric = Number(id)
  if (!Number.isFinite(numeric)) return undefined
  return variableIndexMap().get(numeric)
}

export function variableName(id?: string | number | null): string {
  return variableInfo(id)?.name ?? ''
}
