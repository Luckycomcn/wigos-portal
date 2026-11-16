<template>
  <article class="about-page">
    <h1>APIs and tools</h1>
    <h2>Global Observing Facility Catalogue (GOFC)</h2>
    <p>WIGOS metadata is also available using geospatial Web Application Programming Interfaces (APIs) adhering to international standards. They are designed to support machine to machine interaction, and can be used in Web, mobile or desktop applications and tools.</p>
    <p>The WIGOS Global Observing Facility Catalogue (GOF) supports the <a href="https://ogcapi.ogc.org/records" target="_blank" rel="noopener noreferrer">OGC API - Records</a> standard which facilitates interoperable discovery of observing facility metadata. OGC standards play an important role in lowering the barrier to weather/climate/water data exchange as part of the WMO Information System and are supported by numerous off the shelf open source and commercial tools.</p>
    <p>The WIGOS GOFC API is available at <a :href="apiBase" target="_blank" rel="noopener noreferrer">{{ apiBase }}</a>. The API provides discovery, access, visualization and processing functionality to all WIGOS metadata, as well as online services processes for metadata validation, reporting and quality assessment.</p>
    <h3>Example API links</h3>
    <p>The below links and examples provide an overview of API functionality:</p>
    <p>View WIGOS metadata collection</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata</a></p>
    <p>View all WIGOS observing facility metadata</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items</a></p>
    <p>Query for all observing facilities using a bounding geometry (bbox)</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items?bbox=-142,42,-53,84'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items?bbox=-142,42,-53,84</a></p>
    <p>Query for all fixed land observing facilities</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items?facilityType.id=landFixed'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items?facilityType.id=landFixed</a></p>
    <p>Query for all observing facilities in WMO Region III (South America)</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items?wmoRegion.id=southAmerica'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items?wmoRegion.id=southAmerica</a></p>
    <p>Query for all observing facilities in Norway</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items?territories.territory.id=NOR'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items?territories.territory.id=NOR</a></p>
    <p>Query for all observing facilities affiliated with GBON</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items?observations.programAffiliations.programAffiliation.id=GBON'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items?observations.programAffiliations.programAffiliation.id=GBON</a></p>
    <p>Query for all observing facilities measuring total column ozone</p>
    <p><a :href="apiBase + '/collections/wigos-observing-facility-metadata/items?observations.observedProperty.id=263'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/collections/wigos-observing-facility-metadata/items?observations.observedProperty.id=263</a></p>
    <p>Note that the WIGOS GOFC provides search results in HTML or JSON. JSON results are made available by adding <code>f=json</code> to search queries.</p>
    <p>For developers, a Swagger interface is available at <a :href="apiBase + '/openapi'" target="_blank" rel="noopener noreferrer">{{ apiBase }}/openapi</a></p>
    <p>The WIGOS GOFC is powered by <a href="https://pygeoapi.io" target="_blank" rel="noopener noreferrer">pygeoapi</a>, a Reference Implementation of the <a href="https://ogcapi.ogc.org" target="_blank" rel="noopener noreferrer">OGC API</a> standards.</p>
    <h2>Tools</h2>
    <p>The following GitHub examples provide high level access and workflow examples of integrating WOUDC Web services:</p>
    <p><a href="https://github.com/wmo-im/pywmdr" target="_blank" rel="noopener noreferrer">pywmdr</a>: pywmdr provides validation and quality assessment capabilities for the WMO WIGOS Metadata Representation (WMDR2)</p>
  </article>
</template>

<script setup lang="ts">
import { WIGOS_API_BASE as apiBase } from '../api/wigos'
</script>

<style scoped>
.about-page { max-width: 960px; padding: 16px 24px; line-height: 1.7; overflow-wrap: anywhere; }
.about-page h2, .about-page h3 { margin-top: 24px; }
</style>
