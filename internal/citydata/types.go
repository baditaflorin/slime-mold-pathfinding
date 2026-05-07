package citydata

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type City struct {
	Slug       string     `json:"slug"`
	Name       string     `json:"name"`
	Country    string     `json:"country"`
	Bounds     [4]float64 `json:"bounds"`
	Projection string     `json:"projection"`
}

type SourceInfo struct {
	Name        string `json:"name"`
	Attribution string `json:"attribution"`
	License     string `json:"license"`
	URL         string `json:"url"`
}

type Node struct {
	ID    string  `json:"id"`
	Label string  `json:"label"`
	Kind  string  `json:"kind"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
}

type Edge struct {
	ID     string  `json:"id"`
	From   string  `json:"from"`
	To     string  `json:"to"`
	Mode   string  `json:"mode"`
	Name   string  `json:"name"`
	Weight float64 `json:"weight"`
}

type MapLayer struct {
	ID     string  `json:"id"`
	Label  string  `json:"label"`
	Kind   string  `json:"kind"`
	Points []Point `json:"points"`
}

type Preset struct {
	ID      string   `json:"id"`
	Label   string   `json:"label"`
	NodeIDs []string `json:"nodeIds"`
}

type CityArtifact struct {
	SchemaVersion string     `json:"schemaVersion"`
	City          City       `json:"city"`
	Source        SourceInfo `json:"source"`
	Nodes         []Node     `json:"nodes"`
	Edges         []Edge     `json:"edges"`
	Layers        []MapLayer `json:"layers"`
	Presets       []Preset   `json:"presets"`
}

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

type CityIndex struct {
	SchemaVersion string           `json:"schemaVersion"`
	Cities        []CityIndexEntry `json:"cities"`
}

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

type BuildResult struct {
	Slug         string `json:"slug"`
	ArtifactPath string `json:"artifactPath"`
	MetaPath     string `json:"metaPath"`
	NodeCount    int    `json:"nodeCount"`
	EdgeCount    int    `json:"edgeCount"`
}
