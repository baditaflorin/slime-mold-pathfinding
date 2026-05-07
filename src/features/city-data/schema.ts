import { z } from "zod";

export const pointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const citySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  bounds: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  projection: z.string().min(1),
});

export const sourceInfoSchema = z.object({
  name: z.string().min(1),
  attribution: z.string().min(1),
  license: z.string().min(1),
  url: z.string().url(),
});

export const cityNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.string().min(1),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const cityEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  mode: z.string().min(1),
  name: z.string().min(1),
  weight: z.number().positive(),
});

export const mapLayerSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.string().min(1),
  points: z.array(pointSchema).min(2),
});

export const presetSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  nodeIds: z.array(z.string().min(1)).min(2),
});

export const cityArtifactSchema = z.object({
  schemaVersion: z.string().min(1),
  city: citySchema,
  source: sourceInfoSchema,
  nodes: z.array(cityNodeSchema).min(1),
  edges: z.array(cityEdgeSchema).min(1),
  layers: z.array(mapLayerSchema),
  presets: z.array(presetSchema),
});

export const cityIndexEntrySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  dataUrl: z.string().min(1),
  metaUrl: z.string().min(1),
  nodeCount: z.number().int().nonnegative(),
  edgeCount: z.number().int().nonnegative(),
  description: z.string().min(1),
});

export const cityIndexSchema = z.object({
  schemaVersion: z.string().min(1),
  cities: z.array(cityIndexEntrySchema).min(1),
});

export const artifactMetaSchema = z.object({
  generatedAt: z.string().min(1),
  sourceCommit: z.string().min(1),
  inputChecksum: z.string().min(1),
  schemaVersion: z.string().min(1),
  generator: z.string().min(1),
  sourceFile: z.string().min(1),
  artifactFile: z.string().min(1),
  libosmscoutAbi: z.string().min(1),
});

export type Point = z.infer<typeof pointSchema>;
export type CityNode = z.infer<typeof cityNodeSchema>;
export type CityEdge = z.infer<typeof cityEdgeSchema>;
export type MapLayer = z.infer<typeof mapLayerSchema>;
export type Preset = z.infer<typeof presetSchema>;
export type CityArtifact = z.infer<typeof cityArtifactSchema>;
export type CityIndex = z.infer<typeof cityIndexSchema>;
export type CityIndexEntry = z.infer<typeof cityIndexEntrySchema>;
export type ArtifactMeta = z.infer<typeof artifactMetaSchema>;
