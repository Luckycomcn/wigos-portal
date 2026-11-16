import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import assert from 'node:assert/strict'
import ts from 'typescript'
const source = await readFile('src/data/wmdrCodes.ts', 'utf8')
const fallback = JSON.parse(await readFile('src/data/programAffiliations.json', 'utf8'))
const section = source.slice(source.indexOf('export const programAffiliations:'), source.indexOf('interface VariableNode'))
const code = ts.transpileModule(section, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText.replaceAll('export ', '')
async function scenario({ fail, invalid, small } = {}) {
  let requests = 0
  const live = [{id:'GCWCryoNet',title:'Updated CryoNet'}, ...Array.from({length: small ? 1 : 100}, (_,i)=>({id:`NEW${i}`,title:`New programme ${i}`}))]
  class Parser {
    parseFromString() { return {
      getElementsByTagName: () => invalid ? [{}] : [],
      getElementsByTagNameNS: () => live.map(c => ({ getElementsByTagNameNS: (_,name) => [{textContent:name==='notation'?c.id:c.title}] })),
    } }
  }
  const context = vm.createContext({ programAffiliationsRaw: fallback, DOMParser: Parser, AbortSignal,
    fetch: async url => { requests++; assert.ok(url.endsWith('?_format=rdf')); if(fail) throw Error('Network/CORS/timeout'); return {ok:true,text:async()=>'<rdf/>'} },
  })
  vm.runInContext(code + '\nglobalThis.api = { loadProgramAffiliations, programTitle, programIdByTitle, programAffiliations }', context)
  const api=context.api
  assert.equal(api.programAffiliations.length, fallback.length)
  const [a,b]=await Promise.all([api.loadProgramAffiliations(),api.loadProgramAffiliations()])
  assert.equal(requests,1)
  assert.equal(a.length,b.length)
  if(fail||invalid||small) assert.equal(JSON.stringify(a),JSON.stringify(fallback))
  else { assert.equal(a.length,101); assert.equal(api.programIdByTitle('NEW1 — New programme 1'),'NEW1'); assert.equal(api.programTitle('GCWCryoNet'),'GCWCryoNet — Updated CryoNet') }
}
await scenario()
await scenario({fail:true})
await scenario({invalid:true})
await scenario({small:true})
console.log('PASS: runtime update, stable IDs, shared request, network/CORS/timeout fallback and invalid/incomplete response fallback')
