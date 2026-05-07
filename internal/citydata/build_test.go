package citydata

import (
	"context"
	"os"
	"path/filepath"
	"testing"
)

func TestBuildAllWritesArtifacts(t *testing.T) {
	sourceDir := t.TempDir()
	outputDir := t.TempDir()
	source := `{
  "schemaVersion": "v1",
  "city": {"slug": "testopolis", "name": "Testopolis", "country": "Testland", "bounds": [0, 0, 1, 1], "projection": "normalized"},
  "source": {"name": "fixture", "attribution": "fixture", "license": "MIT", "url": "https://example.com"},
  "nodes": [
    {"id": "b", "label": "B", "kind": "station", "x": 0.8, "y": 0.8},
    {"id": "a", "label": "A", "kind": "station", "x": 0.2, "y": 0.2}
  ],
  "edges": [
    {"id": "ab", "from": "a", "to": "b", "mode": "rail", "name": "A-B", "weight": 1.2}
  ],
  "layers": [],
  "presets": [{"id": "pair", "label": "Pair", "nodeIds": ["a", "b"]}]
}`
	if err := os.WriteFile(filepath.Join(sourceDir, "testopolis.json"), []byte(source), 0o644); err != nil {
		t.Fatalf("write source: %v", err)
	}

	results, err := BuildAll(context.Background(), BuildOptions{
		SourceDir:     sourceDir,
		OutputDir:     outputDir,
		SchemaVersion: "v1",
		SourceCommit:  "test",
	})
	if err != nil {
		t.Fatalf("BuildAll() error = %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("len(results) = %d, want 1", len(results))
	}
	if _, err := os.Stat(filepath.Join(outputDir, "testopolis.json")); err != nil {
		t.Fatalf("artifact missing: %v", err)
	}
	if _, err := os.Stat(filepath.Join(outputDir, "testopolis.meta.json")); err != nil {
		t.Fatalf("meta missing: %v", err)
	}
	if _, err := os.Stat(filepath.Join(outputDir, "index.json")); err != nil {
		t.Fatalf("index missing: %v", err)
	}
}

func TestValidateCityRejectsMissingEdgeNode(t *testing.T) {
	city := CityArtifact{
		SchemaVersion: "v1",
		City:          City{Slug: "bad"},
		Nodes:         []Node{{ID: "a", X: 0.1, Y: 0.2}},
		Edges:         []Edge{{ID: "missing", From: "a", To: "z", Weight: 1}},
	}
	if err := ValidateCity(city); err == nil {
		t.Fatal("ValidateCity() error = nil, want missing node error")
	}
}
