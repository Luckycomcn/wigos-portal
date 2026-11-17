import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import ts from 'typescript'
import { baseCompile } from '@intlify/message-compiler'

async function messages(locale) {
  const source = await readFile(`src/i18n/locales/${locale}.ts`, 'utf8')
  const context = { exports: {} }
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, context)
  return flatten(context.exports.default)
}

function flatten(object, prefix = '', result = {}) {
  for (const [key, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result[path] = value
    else flatten(value, path, result)
  }
  return result
}

const english = await messages('en')
const parameters = (message) => [...message.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
for (const locale of ['fr', 'es']) {
  const translated = await messages(locale)
  assert.deepEqual(Object.keys(translated).sort(), Object.keys(english).sort(), `${locale}: message keys`)
  for (const [key, message] of Object.entries(translated)) {
    assert.ok(message.trim(), `${locale}.${key}: empty translation`)
    assert.deepEqual(parameters(message), parameters(english[key]), `${locale}.${key}: parameters`)
    baseCompile(message, { onError(error) { throw new Error(`${locale}.${key}: ${error.message}`) } })
  }
  console.log(`PASS: ${locale}: ${Object.keys(translated).length} messages, matching parameters and valid syntax`)
}
