# data-fair/processing-sirene

Load french Sirene database into a data-fair dataset.

## Release

Processing plugins are fetched from the npm registry with a filter on keyword "data-fair-processings-plugin". So publishing a plugin is as simple as publishing the npm package:

```
npm version minor
npm publish
git push && git push --tags
```

To publish a test version, use prerelease versioning with a "test" npm tag:

```
npm version preminor --preid=beta
npm publish --tag=test
git push && git push --tags
```
## Catch-up of a window

Each run restarts from the most recent `dateDernierTraitementEtablissement` already loaded. When the
INSEE publishes establishments late with an older date, they are skipped. It happened between
2025-12-05T13:05 and 2025-12-08, during an INSEE mass update (13.8 million establishments, almost all
of them already in the dataset with an older version, a few hundred missing). `scripts/catch-up.js`
reads such a window again by hand (local INSEE times, without offset) and sends only the
establishments missing from the dataset:

```
INSEE_API_KEY=... FROM=2025-12-05T13:00:00 TO=2025-12-08T00:00:00 node scripts/catch-up.js --dry-run
INSEE_API_KEY=... DATA_FAIR_API_KEY=... FROM=2025-12-05T13:00:00 TO=2025-12-08T00:00:00 node scripts/catch-up.js
```

`--dry-run` sends nothing and counts the establishments that would be sent. The script stops before
sending more than `MAX_SEND` establishments (default 5000). `FILTER` adds a Sirene API filter,
`--include-changed` also sends the establishments present with another date (beware: data-fair extends
and indexes every line of a bulk, about 23 s per 1000 lines). `DATA_FAIR_URL` (default
`https://opendata.koumoul.com/data-fair`) and `DATASET_ID` (default `sirene`) can be overridden.

A list of sirets (for instance found in the INSEE stock files) can be read instead of a window:
`SIRETS_FILE=sirets.txt` (one siret per line) replaces `FROM` and `TO`.
