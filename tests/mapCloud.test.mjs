import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'

const source = await readFile('src/components/OscarMap.vue', 'utf8')
const start = source.indexOf('function buildCloud(')
const end = source.indexOf('\nfunction stationToHover', start)
const code = ts.transpileModule(source.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
const stations = Array.from({ length: 21 }, (_, index) => ({
  wigosId: `station-${index}`, lon: 1, lat: 1, domain: 'land-ocean',
}))
const context = {
  props: {},
  liveFeatures: { value: stations },
  featureToStation: station => station,
  Feature,
  Point,
  mapCoordinate: (lon, lat) => [lon, lat],
  tileStyles: {},
}
vm.createContext(context)
vm.runInContext(code, context)
for (const visibleStations of [undefined, stations]) {
  context.props.visibleStations = visibleStations
  const features = context.buildCloud()
  assert.equal(features.length, stations.length)
  assert.equal(new Set(features.map(feature => feature.get('station').wigosId)).size, stations.length)
  assert.ok(features.every(feature => feature.get('count') === undefined))
}
console.log('PASS: filtered and provided stations render individually, even at identical coordinates')
