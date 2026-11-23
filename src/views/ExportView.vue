<template>
  <div class="export-page">
    <div class="export-page-header">
    <h1>{{ $t('export.title') }}</h1>
    <p class="export-sub">{{ $t('export.sub') }}</p>
    </div>
    <div class="export-grid">
      <section class="export-card">
        <h2>{{ $t('export.bulkTitle') }}</h2>
        <label class="export-label">{{ $t('export.scope') }}</label>
        <div class="form-control export-scope-readonly">{{ $t('export.scopeFiltered', { count: filteredCount.toLocaleString() }) }}</div>
        <div class="export-note export-note--inline">{{ $t('export.bulkLimitedNote', { limit: EXPORT_LIMIT.toLocaleString(), all: allCount.toLocaleString() }) }}</div>
        <label class="export-label" for="bulk-export-format">{{ $t('export.format') }}</label>
        <select id="bulk-export-format" v-model="bulkFormat" :disabled="bulkBusy" class="form-control">
          <option value="json">JSON</option>
          <option value="zip">ZIP</option>
        </select>
        <label class="export-label">{{ $t('export.fields') }}</label>
        <select v-model="fieldSet" :disabled="bulkBusy" class="form-control">
          <option value="mandatory">{{ $t('export.fieldsMandatory') }}</option>
          <option value="full">{{ $t('export.fieldsFull') }}</option>
        </select>
        <div class="export-actions">
          <button class="btn btn-export" type="button" :disabled="bulkBusy || !snapshot?.query || filteredCount > EXPORT_LIMIT" @click="genBulk">{{ $t('export.generateExport') }}</button>
          <button class="btn btn-default" type="button" :disabled="bulkBusy || !bulkBlob" @click="downloadBulk">{{ $t('export.download') }}</button>
          <span class="export-count">{{ $t('export.recordsToExport', { count: filteredCount.toLocaleString() }) }}</span>
        </div>
        <div v-if="snapshot?.query && filteredCount > EXPORT_LIMIT" class="export-hint">{{ $t('export.tooMany', { limit: EXPORT_LIMIT.toLocaleString() }) }}</div>
        <div v-else-if="!snapshot?.query" class="export-hint">{{ $t('export.noQuery') }}</div>
        <button v-if="bulkBusy" class="btn btn-default" @click="cancelBulk">{{ $t('export.cancel') }}</button>
        <div v-if="bulkHint" class="export-hint">{{ bulkHint }}</div>
        <pre class="export-preview">{{ bulkPreview }}</pre>
      </section>

      <section class="export-card">
        <h2>{{ $t('export.wmdrTitle') }}</h2>
        <div class="export-note">{{ $t('export.wmdrNote') }}</div>
        <label class="export-label">{{ $t('export.wigosStationIdentifier') }}</label>
        <input v-model="wigosId" class="form-control" placeholder="0-20000-0-89057" />
        <label class="export-label" for="single-export-format">{{ $t('export.format') }}</label>
        <select id="single-export-format" v-model="singleFormat" :disabled="singleBusy" class="form-control">
          <option value="json">JSON</option>
          <option value="zip">ZIP</option>
        </select>
        <div class="export-actions">
          <button class="btn btn-export" type="button" :disabled="singleBusy" @click="genSingle">{{ $t('export.generateExport') }}</button>
          <button class="btn btn-default" type="button" :disabled="singleBusy || !singleBlob" @click="downloadSingle">{{ $t('export.download') }}</button>
        </div>
        <div v-if="singleHint" class="export-hint">{{ singleHint }}</div>
        <pre class="export-preview">{{ singlePreview }}</pre>
      </section>
    </div>

    <section class="export-card export-guide">
      <h2>{{ $t('export.guideTitle') }}</h2>
      <div class="export-note">{{ $t('export.guideNote') }}</div>
      <pre class="export-preview">{{ guide }}</pre>
      <p class="text-muted small">{{ $t('export.demoNote') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { strToU8, zip } from 'fflate'
import { loadSearchSnapshot } from '../stores/searchExport'
import { queryFeatures, searchFacilities, WIGOS_COLLECTION_URL, WIGOS_ITEMS_URL, type WigosFeature } from '../api/wigos'
import { fetchDownloadRecord } from '../utils/catalogueDownload'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const EXPORT_LIMIT = 500
const snapshot = loadSearchSnapshot()
// The snapshot stores the catalogue match total in `total`; `filteredCount`
// is only the number of rows on the last results page and must not be used
// to decide export size or the limit.
const filteredCount = ref(snapshot?.total ?? 0)
const allCount = ref(0)
const fieldSet = ref<'mandatory' | 'full'>('mandatory')
type ExportFormat = 'json' | 'zip'
const bulkFormat = ref<ExportFormat>('json')
const singleFormat = ref<ExportFormat>('json')
const wigosId = ref('0-20000-0-89057')
const bulkBusy = ref(false)
const singleBusy = ref(false)
const loadedCount = ref(0)
const bulkPreview = ref('')
const singlePreview = ref('')
const bulkHint = ref('')
const singleHint = ref('')
const bulkBlob = ref<Blob | null>(null)
const singleBlob = ref<Blob | null>(null)
let controller: AbortController | undefined
let singleVersion = 0
const guide = computed(() => [
  `GET ${WIGOS_COLLECTION_URL}?f=json`,
  `GET ${WIGOS_ITEMS_URL}?f=json&limit=250&offset=0`,
  `GET ${WIGOS_ITEMS_URL}?f=json&territories.territory.id=CHE`,
  `GET ${WIGOS_ITEMS_URL}/{wigosId}?f=json`,
].join('\n'))

onMounted(async () => {
  try {
    allCount.value = (await queryFeatures({ limit: 1, properties: ['title'] })).numberMatched
  } catch (error) { bulkHint.value = t('export.remoteError', { message: String(error) }) }
})
watch([fieldSet, bulkFormat], () => {
  bulkBlob.value = null
  bulkPreview.value = ''
  bulkHint.value = ''
})
watch([wigosId, singleFormat], () => {
  singleVersion++
  singleBusy.value = false
  singleBlob.value = null
  singlePreview.value = ''
  singleHint.value = ''
})
onBeforeUnmount(() => { controller?.abort(); singleVersion++ })

function exportFeature(feature: WigosFeature): WigosFeature {
  if (fieldSet.value === 'full') return feature
  const { title, facilityType, wmoRegion, territories, created, updated } = feature.properties
  return { type: feature.type, id: feature.id, geometry: feature.geometry, time: feature.time,
    properties: { title, facilityType, wmoRegion, territories, created, updated } }
}
async function genBulk() {
  if (bulkBusy.value || !snapshot?.query) return
  if (filteredCount.value > EXPORT_LIMIT) {
    bulkHint.value = t('export.tooMany', { limit: EXPORT_LIMIT.toLocaleString() })
    return
  }
  bulkBusy.value = true
  bulkBlob.value = null
  bulkPreview.value = ''
  bulkHint.value = ''
  loadedCount.value = 0
  controller = new AbortController()
  const records: WigosFeature[] = []
  const seen = new Set<string>()
  try {
    let offset = 0
    let expected = Infinity
    while (offset < expected) {
      // Full WMDR2 records are large; the catalogue may need minutes per page.
      const result = await searchFacilities({ ...snapshot!.query,
        limit: 250, offset, sortby: 'title', signal: controller.signal, timeoutMs: 180000 })
      expected = result.numberMatched
      filteredCount.value = expected
      if (!result.features.length && offset < expected) throw new Error('Catalogue pagination ended before all records were received')
      for (const feature of result.features) {
        if (seen.has(feature.id)) throw new Error('Catalogue changed during pagination; retry the export')
        seen.add(feature.id)
        records.push(exportFeature(feature))
      }
      offset += result.features.length
      loadedCount.value = records.length
      bulkHint.value = t('export.progress', { count: records.length, total: expected })
      if (!result.features.length) break
    }
    const content = JSON.stringify({ type: 'FeatureCollection', features: records, numberReturned: records.length }, null, 2)
    const blob = await createExportBlob(content, 'wigos-filtered.json', bulkFormat.value)
    controller.signal.throwIfAborted()
    bulkBlob.value = blob
    bulkPreview.value = content.slice(0, 12000)
    bulkHint.value = t('export.generated', { count: records.length })
  } catch (error) {
    bulkBlob.value = null
    bulkHint.value = controller.signal.aborted ? t('export.cancelled') : t('export.remoteError', { message: String(error) })
  } finally { bulkBusy.value = false }
}
function downloadBulk() {
  if (bulkBlob.value) trigger(bulkBlob.value, `wigos-filtered.${bulkFormat.value}`)
}
function cancelBulk() { controller?.abort() }
async function genSingle() {
  const id = wigosId.value.trim()
  if (!id || singleBusy.value) return
  const version = ++singleVersion
  singleBusy.value = true
  singleBlob.value = null
  singleHint.value = ''
  singlePreview.value = ''
  try {
    const record = await fetchDownloadRecord(id)
    if (version !== singleVersion) return
    const content = JSON.stringify(record, null, 2)
    const blob = await createExportBlob(content, `${id.replace(/[^\w-]/g, '_')}.json`, singleFormat.value)
    if (version !== singleVersion) return
    singlePreview.value = content
    singleBlob.value = blob
    singleHint.value = t('export.generated', { count: 1 })
  } catch (error) {
    if (version === singleVersion) singleHint.value = t('export.remoteError', { message: String(error) })
  } finally { if (version === singleVersion) singleBusy.value = false }
}
function downloadSingle() {
  if (singleBlob.value) trigger(singleBlob.value, `${wigosId.value.trim().replace(/[^\w-]/g, '_')}.${singleFormat.value}`)
}
async function createExportBlob(content: string, jsonName: string, format: ExportFormat): Promise<Blob> {
  if (format === 'json') return new Blob([content], { type: 'application/geo+json;charset=utf-8' })
  return new Promise((resolve, reject) => {
    zip({ [jsonName]: strToU8(content) }, (error, bytes) => {
      if (error) reject(error)
      else resolve(new Blob([bytes], { type: 'application/zip' }))
    })
  })
}
function trigger(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10000)
}
</script>

<style scoped lang="scss">
.export-page-header {
  padding: 0 20px 0 20px;
}
.export-page h1 { font-size: 22px; margin: 0 0 6px; color: #1a2b26; }
.export-sub { color: #5b6f83; font-size: 12px; margin-bottom: 16px; }
.export-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.export-card { min-width: 0; background: #fff; border: 1px solid #e0e8f0; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,.04); }
.export-card h2 { font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #35536e; margin: 0 0 12px; border: 0; padding: 0; }
.export-label { display: block; font-size: 10px; letter-spacing: .05em; text-transform: uppercase; color: #778da1; margin: 10px 0 4px; }
.export-card .form-control { margin-bottom: 2px; }
.export-actions { display: flex; align-items: center; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
.btn-export { background: var(--oscar-theme); border: 1px solid var(--oscar-theme); color: #fff; border-radius: 6px; padding: 6px 14px; }
.btn-export:hover:enabled { background: var(--oscar-theme-soft); color: var(--oscar-theme); }
.export-count { background: #f1f6fb; border: 1px solid #e0e8f0; border-radius: 6px; padding: 5px 10px; font-size: 12px; color: #35536e; }
.export-note { background: #eef5fb; border-left: 3px solid var(--oscar-theme); padding: 8px 10px; font-size: 12px; color: #35536e; border-radius: 0 6px 6px 0; margin-bottom: 10px; }
.export-note--inline { margin: 4px 0 10px; }
.export-scope-readonly { color: #5b6f83; }
.export-preview { background: #f4f7fb; border: 1px solid #e0e8f0; border-radius: 6px; padding: 10px; font-size: 11px; color: #5b6f83; max-height: 220px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.export-hint { background: #fff8e6; border: 1px solid #f0d48a; color: #7a5b12; border-radius: 6px; padding: 6px 10px; font-size: 12px; margin: 8px 0; }
.export-guide { margin-bottom: 16px; }
@media (max-width: 900px) { .export-grid { grid-template-columns: 1fr; } }
</style>

