# Globe boundary data

The compact JSON files in this directory are simplified, browser-ready derivatives used for local point-in-polygon lookups.

- `countries.json` is derived from Natural Earth 1:10m Admin 0 country boundaries, a public-domain dataset: <https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/>. Country geometry is simplified at approximately 0.012 degrees and coordinates are rounded to four decimal places.
- `timezones.json` is derived from the comprehensive Timezone Boundary Builder `timezones.geojson` release 2026f: <https://github.com/evansiroky/timezone-boundary-builder/releases/tag/2026f>. Its boundaries are assembled from OpenStreetMap data and the output is licensed under ODbL 1.0. The geometry in this project is simplified at approximately 0.012 degrees and coordinates are rounded to four decimal places. © OpenStreetMap contributors.

The timezone file preserves the comprehensive geographic IANA zone boundaries. `Intl.DateTimeFormat` applies current rules, including daylight-saving offsets, to the timezone identifier at the hovered coordinate.
