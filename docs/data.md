# Data Contract

Schema version: `v1`

Artifact root:

`docs/data/v1/cities/`

Published files:

- `index.json`
- `<slug>.json`
- `<slug>.meta.json`

## `index.json`

```json
{
  "schemaVersion": "v1",
  "cities": [
    {
      "slug": "tokyo",
      "name": "Tokyo",
      "country": "Japan",
      "dataUrl": "tokyo.json",
      "metaUrl": "tokyo.meta.json",
      "nodeCount": 15,
      "edgeCount": 23,
      "description": "Libosmscout-compatible Tokyo rail fixture"
    }
  ]
}
```

## City Artifact

Coordinates are normalized to `[0, 1]`.

Top-level fields:

- `schemaVersion`
- `city`
- `source`
- `nodes`
- `edges`
- `layers`
- `presets`

Edges are undirected graph links. The frontend combines `weight` with sampled trail intensity to extract the route network.

## Metadata

Each city has a sibling metadata file:

- `generatedAt`
- `sourceCommit`
- `inputChecksum`
- `schemaVersion`
- `generator`
- `sourceFile`
- `artifactFile`
- `libosmscoutAbi`

## Regeneration

```sh
make data
```

The generator reads `data/source/cities/*.json` and writes deterministic artifacts except for `generatedAt`.

## Libosmscout Boundary

V1 ships small synthetic fixtures in the normalized city-export shape. For real map work, generate a local OpenStreetMap/libosmscout export, normalize it to the same node/edge/layer schema, then run `make data`.

Real OSM-derived artifacts must preserve OpenStreetMap attribution and ODbL requirements.
