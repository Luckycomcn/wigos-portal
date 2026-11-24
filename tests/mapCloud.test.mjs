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

const groupingStart = source.indexOf('function createStationCluster(')
const groupingEnd = source.indexOf('\nfunction tilePointsInExtent', groupingStart)
const groupingCode = ts.transpileModule(source.slice(groupingStart, groupingEnd), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText
context.DEFAULT_WORLD_RESOLUTION = 31250
context.WORLD_EXTENT = [-180, -90, 180, 90]
vm.runInContext(groupingCode, context)
const points = context.buildCloud()
for (const [step, expected] of [[0, [20, 1]], [1, [10, 10, 1]], [2, [5, 5, 5, 5, 1]], [3, Array(21).fill(1)]]) {
  const groupSize = context.clusterGroupSize(context.DEFAULT_WORLD_RESOLUTION / 2 ** step)
  const groups = Array.from(context.groupStationPoints(points, groupSize))
  assert.deepEqual(groups.map(group => group.get('count')), expected)
  assert.deepEqual(groups.flatMap(group => Array.from(group.get('features'))), points)
}
console.log('PASS: zoom levels group distinct stations in batches of 20, 10, 5, then 1')
