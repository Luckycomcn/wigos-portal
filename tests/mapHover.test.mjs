import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import ts from 'typescript'
const source = await readFile('src/components/OscarMap.vue', 'utf8')
const start = source.indexOf('function stationAtPixel(')
const end = source.indexOf('\nfunction clampPopup', start)
const code = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
const ref = value => ({ value })
let callback, requested, resolveDetail
const hit = {
  get: key => ({ layer: 'hits', id: '0-test', 'properties.title': 'Tile station', 'properties.facilityType.id': 'landFixed' })[key],
  getGeometry: () => ({ getFlatCoordinates: () => [103, 200] }),
}
const fartherHit = { ...hit, get: key => key === 'id' ? '0-farther' : hit.get(key),
  getGeometry: () => ({ getFlatCoordinates: () => [111, 200] }) }
const context = {
  mapRef: ref({
    getCoordinateFromPixel: () => [100, 200],
    getView: () => ({ getResolution: () => 2 }),
    forEachFeatureAtPixel() { throw Error('Unexpected canvas hit test for a vector tile') },
    getTargetElement: () => ({ style: {} }),
  }),
  drawingArea: ref(false), selectedArea: ref(undefined), isOverPopup: ref(false), pendingTimer: 0, hideTimer: 0,
  window: { setTimeout(fn) { callback = fn; return 1 }, clearTimeout() {} },
  t: (key, {count}) => `${count} stations`,
  Date, hover: ref(null), hoverKey: '', popupPos: ref({}),
  detailCache: {}, liveFeatures: ref([]), downloadError: ref(''),
  clampPopup: (x,y) => ({x,y}), facilityTypeTitle: () => 'Land fixed',
  getFeature(id) { requested = id; return new Promise(resolve => { resolveDetail = resolve }) },
  hoverFromFeature: feature => ({ title: feature.properties.title, wigosId: feature.id }),
  stationToHover() { throw Error('Unexpected branch') }, popupPinned: ref(false), locale: ref('zh'),
  stationTiles: { getFeaturesInExtent(extent) {
    assert.deepEqual(Array.from(extent), [84, 184, 116, 216])
    return [fartherHit, hit]
  } }, tilesActive: ref(true), clusterEnabled: ref(false), hoverRequestVersion: 0, vectorRef: ref({}),
}
vm.createContext(context);vm.runInContext(code,context)
context.onPointerMove({ pixel: [0,0] })
const stalePointer = callback
context.onPointerMove({ pixel: [10,20] })
stalePointer()
assert.equal(context.hover.value, null)
await callback()
assert.equal(context.hover.value.title, 'Tile station')
assert.equal(requested, '0-test')
resolveDetail({ id: '0-test', properties: {title: 'Full station'} }); await new Promise(resolve=>setImmediate(resolve))
assert.equal(context.hover.value.title, 'Full station')
console.log('PASS: uncached vector tile immediately opens summary and receives full details')

const originalGet = hit.get
hit.get = key => key === 'count' ? 42 : originalGet(key)
context.getFeature = () => { throw new Error('Aggregated points must not fetch individual station details') }
context.onPointerMove({ pixel: [30,40] }); await callback()
assert.equal(context.hover.value.count, 42)
assert.equal(context.hover.value.title, '42 stations')
assert.equal(context.hover.value.wigosId, '')
console.log('PASS: overview groups show counts without requesting individual station details')

const clusterLayer = {}
const clusterHit = {
  get: key => ({ features: [fartherHit, hit], count: 2 })[key],
}
context.clusterEnabled.value = true
context.clusterLayer = clusterLayer
context.mapRef.value.forEachFeatureAtPixel = (pixel, callback, { layerFilter }) => {
  assert.equal(layerFilter(clusterLayer), true)
  assert.equal(layerFilter(context.stationTiles), false)
  return callback(clusterHit)
}
assert.equal(context.stationAtPixel(context.mapRef.value, [30, 40]), clusterHit)
clusterHit.get = key => ({ features: [fartherHit], count: 1 })[key]
assert.equal(context.stationAtPixel(context.mapRef.value, [30, 40]), fartherHit)
console.log('PASS: cluster hit testing preserves group counts and unwraps individual stations')
