import {
  artifactMetaSchema,
  cityArtifactSchema,
  cityIndexSchema,
  type ArtifactMeta,
  type CityArtifact,
  type CityIndex,
  type CityIndexEntry,
} from "./schema";

const DATA_ROOT = `${import.meta.env.BASE_URL}data/v1/cities/`;

async function fetchJSON(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

export async function fetchCityIndex(): Promise<CityIndex> {
  return cityIndexSchema.parse(await fetchJSON(`${DATA_ROOT}index.json`));
}

export async function fetchCity(entry: CityIndexEntry): Promise<CityArtifact> {
  return cityArtifactSchema.parse(await fetchJSON(`${DATA_ROOT}${entry.dataUrl}`));
}

export async function fetchCityMeta(entry: CityIndexEntry): Promise<ArtifactMeta> {
  return artifactMetaSchema.parse(await fetchJSON(`${DATA_ROOT}${entry.metaUrl}`));
}
