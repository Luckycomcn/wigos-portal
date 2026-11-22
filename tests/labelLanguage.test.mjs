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
const { localizeStyle, localizeTextField, labelExpression, backgroundColour } = context.exports

const json = (value) => JSON.parse(JSON.stringify(value))

// 1. English keeps Latin script: name:en first, then Romanised, then local name.
const englishPicker = ['case', ['has', 'name:nonlatin'], ['concat', ['get', 'name:latin'], '\n', ['get', 'name:nonlatin']], ['coalesce', ['get', 'name_en'], ['get', 'name']]]
assert.deepEqual(json(localizeTextField(englishPicker, 'en')),
  ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']],
  'English label chain starts with name:en')

// 2. Chinese prefers name:zh and the local spelling BEFORE any transliteration,
//    so Chinese towns without a name:zh tag keep their Chinese name.
assert.deepEqual(json(localizeTextField(englishPicker, 'zh')),
  ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name'], ['get', 'name:en']],
  'Chinese label chain prefers clean simplified names over "zh;zh-Hant" joins')

// 3. Other UI languages use their own translations, then Latin.
assert.deepEqual(json(labelExpression('fr')),
  ['coalesce', ['get', 'name:fr'], ['get', 'name:latin'], ['get', 'name'], ['get', 'name:en']],
  'French label chain')

// 4. Non-name fields are untouched, so road shields keep their reference numbers.
const refField = ['to-string', ['get', 'ref']]
assert.equal(localizeTextField(refField, 'en'), refField, 'road ref untouched')

// 5. Full style: labels localized, attribution kept, input not mutated.
const style = {
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#f8f4f0' } },
    { id: 'place-city', type: 'symbol', layout: { 'text-field': englishPicker } },
    { id: 'road-shield', type: 'symbol', layout: { 'text-field': refField } },
  ],
  sources: { openmaptiles: { type: 'vector' }, satellite: { type: 'raster', url: 'https://example.com/tiles' } },
}
const out = localizeStyle(style, 'zh')
assert.deepEqual(json(out.layers[1].layout['text-field']), json(labelExpression('zh')), 'style labels localized')
assert.deepEqual(json(out.layers[2].layout['text-field']), json(refField), 'style ref labels untouched')
assert.equal(out.layers[0].paint['background-color'], '#f8f4f0', 'background untouched')
assert.match(out.sources.openmaptiles.attribution, /OpenFreeMap/, 'attribution kept')
assert.equal(out.sources.satellite.attribution, undefined, 'other sources untouched')
assert.equal(style.layers[1].layout['text-field'][0], 'case', 'original style not mutated')

// 6. The style background colour is exposed so the map container can paint land.
assert.equal(backgroundColour(style), '#f8f4f0', 'background colour readable')
assert.equal(backgroundColour({ layers: [] }), undefined, 'no background layer -> undefined')

console.log('PASS: labels follow the UI language; refs, background and attribution untouched')
