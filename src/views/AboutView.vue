<template>
  <article class="about-page">
    <h1>{{ $t('about.title') }}</h1>

    <section>
      <h2>{{ $t('about.gofcTitle') }}</h2>
      <p>{{ $t('about.intro') }}</p>
      <p>
        {{ $t('about.standardsBefore') }}
        <a href="https://ogcapi.ogc.org/records" target="_blank" rel="noopener noreferrer">{{ $t('about.ogcRecords') }}</a>
        {{ $t('about.standardsAfter') }}
      </p>
      <p>
        {{ $t('about.apiBefore') }}
        <a :href="gofcUrl" target="_blank" rel="noopener noreferrer">{{ gofcUrl }}</a>{{ $t('about.apiAfter') }}
      </p>

      <h3>{{ $t('about.examplesTitle') }}</h3>
      <p>{{ $t('about.examplesIntro') }}</p>
      <dl class="about-examples">
        <template v-for="(href, index) in exampleHrefs" :key="href">
          <dt>{{ $t(`about.example${index + 1}`) }}</dt>
          <dd><a :href="href" target="_blank" rel="noopener noreferrer">{{ href }}</a></dd>
        </template>
      </dl>

      <p>
        {{ $t('about.jsonBefore') }}
        <code>f=json</code>
        {{ $t('about.jsonAfter') }}
      </p>
      <p>
        {{ $t('about.swaggerBefore') }}
        <a :href="`${gofcUrl}/openapi`" target="_blank" rel="noopener noreferrer">{{ gofcUrl }}/openapi</a>
      </p>
      <p>
        {{ $t('about.poweredBefore') }}
        <a href="https://pygeoapi.io" target="_blank" rel="noopener noreferrer">pygeoapi</a>{{ $t('about.poweredMid') }}
        <a href="https://ogcapi.ogc.org" target="_blank" rel="noopener noreferrer">OGC API</a>{{ $t('about.poweredAfter') }}
      </p>
    </section>

    <section>
      <h2>{{ $t('about.toolsTitle') }}</h2>
      <p>{{ $t('about.toolsIntro') }}</p>
      <ul>
        <li>
          <a href="https://github.com/wmo-im/pywmdr" target="_blank" rel="noopener noreferrer">pywmdr</a>:
          {{ $t('about.pywmdrDesc') }}
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WIGOS_API_BASE } from '../api/wigos'

// Mirrors the {{ VITE_WIGOS_GOFC_URL }} placeholders in the source text, using
// the same configured catalogue host as the rest of the application.
const gofcUrl = WIGOS_API_BASE.replace(/\/+$/, '')
const collection = `${gofcUrl}/collections/wigos-observing-facility-metadata`
const items = `${collection}/items`

const exampleHrefs = computed(() => [
  collection,
  items,
  `${items}?bbox=-142,42,-53,84`,
  `${items}?facilityType.id=landFixed`,
  `${items}?wmoRegion.id=southAmerica`,
  `${items}?territories.territory.id=NOR`,
  `${items}?observations.programAffiliations.programAffiliation.id=GBON`,
  `${items}?observations.observedProperty.id=263`,
])
</script>

<style scoped lang="scss">
.about-page {
  max-width: 900px;
  padding: 8px 4px 32px;
  color: #2c3f50;
  line-height: 1.65;
  font-size: 14px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 20px;
  color: #005288;
  font-size: 26px;
  font-weight: 600;
}

h2 {
  margin: 26px 0 12px;
  color: #005288;
  font-size: 19px;
  font-weight: 600;
}

h3 {
  margin: 22px 0 10px;
  font-size: 16px;
  font-weight: 600;
}

p { margin: 0 0 12px; }

a {
  color: #005288;
  overflow-wrap: anywhere;
}

code {
  padding: 1px 5px;
  border-radius: 3px;
  background: #f1f5f9;
  font-size: 13px;
}

ul { padding-left: 22px; }

.about-examples {
  margin: 0 0 18px;

  dt { font-weight: 600; margin-top: 12px; }
  dd { margin: 2px 0 0; }
}
</style>
