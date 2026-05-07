// Package citydata validates and generates static city artifacts.
package citydata

// Point is a normalized coordinate in browser map space.
type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

// City describes the display metadata for a generated city artifact.
type City struct {
	Slug       string     `json:"slug"`
	Name       string     `json:"name"`
	Country    string     `json:"country"`
	Bounds     [4]float64 `json:"bounds"`
	Projection string     `json:"projection"`
}

// SourceInfo records where a city artifact originated.
type SourceInfo struct {
	Name        string `json:"name"`
	Attribution string `json:"attribution"`
	License     string `json:"license"`
	URL         string `json:"url"`
}

// Node is a route graph vertex.
type Node struct {
	ID    string  `json:"id"`
	Label string  `json:"label"`
	Kind  string  `json:"kind"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
}

// Edge is an undirected route graph link.
type Edge struct {
	ID     string  `json:"id"`
	From   string  `json:"from"`
	To     string  `json:"to"`
	Mode   string  `json:"mode"`
	Name   string  `json:"name"`
	Weight float64 `json:"weight"`
}

// MapLayer is a display-only city map geometry layer.
type MapLayer struct {
	ID     string  `json:"id"`
	Label  string  `json:"label"`
	Kind   string  `json:"kind"`
	Points []Point `json:"points"`
}

// Preset is a named set of food-source node ids.
type Preset struct {
	ID      string   `json:"id"`
	Label   string   `json:"label"`
	NodeIDs []string `json:"nodeIds"`
}

// CityArtifact is the browser-facing static city data contract.
type CityArtifact struct {
	SchemaVersion string     `json:"schemaVersion"`
	City          City       `json:"city"`
	Source        SourceInfo `json:"source"`
	Nodes         []Node     `json:"nodes"`
	Edges         []Edge     `json:"edges"`
	Layers        []MapLayer `json:"layers"`
	Presets       []Preset   `json:"presets"`
}

// CityIndexEntry is one row in the published city index.
type CityIndexEntry struct {
	Slug        string `json:"slug"`
	Name        string `json:"name"`
	Country     string `json:"country"`
	DataURL     string `json:"dataUrl"`
	MetaURL     string `json:"metaUrl"`
	NodeCount   int    `json:"nodeCount"`
	EdgeCount   int    `json:"edgeCount"`
	Description string `json:"description"`
}

// CityIndex lists all city artifacts available to the frontend.
type CityIndex struct {
	SchemaVersion string           `json:"schemaVersion"`
	Cities        []CityIndexEntry `json:"cities"`
}

// ArtifactMeta records reproducibility metadata for a generated artifact.
type ArtifactMeta struct {
	GeneratedAt    string `json:"generatedAt"`
	SourceCommit   string `json:"sourceCommit"`
	InputChecksum  string `json:"inputChecksum"`
	SchemaVersion  string `json:"schemaVersion"`
	Generator      string `json:"generator"`
	SourceFile     string `json:"sourceFile"`
	ArtifactFile   string `json:"artifactFile"`
	LibosmscoutABI string `json:"libosmscoutAbi"`
}

// BuildOptions configures static city artifact generation.
type BuildOptions struct {
	SourceDir     string
	OutputDir     string
	SchemaVersion string
	SourceCommit  string
	Start         string
	End           string
	Concurrency   int
	SaveEvery     int
}

// BuildResult summarizes one generated city artifact.
type BuildResult struct {
	Slug         string `json:"slug"`
	ArtifactPath string `json:"artifactPath"`
	MetaPath     string `json:"metaPath"`
	NodeCount    int    `json:"nodeCount"`
	EdgeCount    int    `json:"edgeCount"`
}
