# APIs and tools

## Global Observing Facility Catalogue (GOFC)

WIGOS metadata is also available using geospatial Web Application Programming Interfaces (APIs) adhering to international standards. They are designed to support machine to machine interaction, and can be used in Web, mobile or desktop applications and tools.

The WIGOS Global Observing Facility Catalogue (GOF) supports the [OGC API - Records](https://ogcapi.ogc.org/records) standard which facilitates interoperable discovery of observing facility metadata. OGC standards play an important role in lowering the barrier to weather/climate/water data exchange as part of the WMO Information System and are supported by numerous off the shelf open source and commercial tools.

The WIGOS GOFC API is available at {{ VITE_WIGOS_GOFC_URL }}. The API provides discovery, access, visualization and processing functionality to all WIGOS metadata, as well as online services processes for metadata validation, reporting and quality assessment.

### Example API links

The below links and examples provide an overview of API functionality:

View WIGOS metadata collection

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata

View all WIGOS observing facility metadata

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items

Query for all observing facilities using a bounding geometry (bbox)

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items?bbox=-142,42,-53,84

Query for all fixed land observing facilities

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items?facilityType.id=landFixed

Query for all observing facilities in WMO Region III (South America)

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items?wmoRegion.id=southAmerica

Query for all observing facilities in Norway

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items?territories.territory.id=NOR

Query for all observing facilities affiliated with GBON

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items?observations.programAffiliations.programAffiliation.id=GBON

Query for all observing facilities measuring total column ozone

{{ VITE_WIGOS_GOFC_URL }}/collections/wigos-observing-facility-metadata/items?observations.observedProperty.id=263

Note that the WIGOS GOFC provides search results in HTML or JSON. JSON results are made available by adding `f=json` to search queries.

For developers, a Swagger interface is available at {{ VITE_WIGOS_GOFC_URL }}/openapi 

The WIGOS GOFC is powered by [pygeoapi](https://pygeoapi.io), a Reference Implementation of the [OGC API](https://ogcapi.ogc.org) standards.

## Tools

The following GitHub examples provide high level access and workflow examples of integrating WOUDC Web services:

- [pywmdr](https://github.com/wmo-im/pywmdr): pywmdr provides validation and quality assessment capabilities for the WMO WIGOS Metadata Representation (WMDR2)
