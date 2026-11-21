import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import ts from 'typescript'

const source = await readFile('src/utils/localizeStyle.ts', 'utf8')
// Drop the i18n type-only import so the transpiled CJS has no external require.
const stripped = source.replace(/^import type .*$/m, '')
const context = { exports: {} }
vm.runInNewContext(ts.transpileModule(stripped, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context)
const { localizeStyle, tintWater, WATER_FILL_COLOR, WATERWAY_LINE_COLOR } = context.exports

// 1. tintWater only touches the two water layers, keeps other paint keys.
const originalWater = { id: 'water', type: 'fill', paint: { 'fill-antialias': true, 'fill-color': 'rgb(194, 200, 202)' } }
const tintedWater = tintWater(originalWater)
assert.equal(tintedWater.paint['fill-color'], WATER_FILL_COLOR)
assert.equal(tintedWater.paint['fill-antialias'], true, 'unrelated paint key preserved')
assert.equal(originalWater.paint['fill-color'], 'rgb(194, 200, 202)', 'input not mutated')

const originalWay = { id: 'waterway', type: 'line', paint: { 'line-color': 'hsl(195,17%,78%)', 'line-width': 1 } }
const tintedWay = tintWater(originalWay)
assert.equal(tintedWay.paint['line-color'], WATERWAY_LINE_COLOR)
assert.equal(tintedWay.paint['line-width'], 1, 'unrelated paint key preserved')

const land = { id: 'landcover', paint: { 'fill-color': '#eee' } }
assert.deepEqual(tintWater(land), land, 'non-water layer returned untouched')

// 2. Full style: water tinted AND labels still localized (both features coexist).
const nameField = ['case', ['has', 'name:nonlatin'], ['coalesce', ['get', 'name_en'], ['get', 'name']], ['get', 'name:latin']]
const style = {
  layers: [
    { id: 'water', paint: { 'fill-color': 'rgb(194, 200, 202)' } },
    { id: 'waterway', paint: { 'line-color': 'hsl(195,17%,78%)' } },
    { id: 'place-label', layout: { 'text-field': nameField } },
    { id: 'road-ref', layout: { 'text-field': ['to-string', ['get', 'ref']] } },
  ],
  sources: { openmaptiles: { type: 'vector' }, other: { type: 'raster' } },
}
const out = localizeStyle(style, 'zh-CN')
assert.equal(out.layers[0].paint['fill-color'], WATER_FILL_COLOR, 'water tinted in full style')
assert.equal(out.layers[1].paint['line-color'], WATERWAY_LINE_COLOR, 'waterway tinted in full style')
// JSON round-trip avoids cross-realm prototype mismatch from vm.runInNewContext.
const json = (v) => JSON.parse(JSON.stringify(v))
assert.deepEqual(json(out.layers[2].layout['text-field']), ['coalesce', ['get', 'name:zh-CN'], ['get', 'name:latin'], ['get', 'name:en'], ['get', 'name']], 'label still localized')
assert.deepEqual(json(out.layers[3].layout['text-field']), ['to-string', ['get', 'ref']], 'non-name field untouched')
assert.match(out.sources.openmaptiles.attribution, /OpenFreeMap/, 'attribution preserved')
assert.equal(out.sources.other.attribution, undefined, 'other source untouched')
assert.equal(style.layers[0].paint['fill-color'], 'rgb(194, 200, 202)', 'original style not mutated')

console.log('PASS: water layers tinted blue; labels/attribution unchanged; no mutation')
