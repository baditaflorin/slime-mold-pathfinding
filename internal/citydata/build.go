package citydata

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

func BuildAll(ctx context.Context, opts BuildOptions) ([]BuildResult, error) {
	if opts.SchemaVersion == "" {
		opts.SchemaVersion = "v1"
	}
	if opts.Concurrency <= 0 {
		opts.Concurrency = 1
	}
	if err := os.MkdirAll(opts.OutputDir, 0o755); err != nil {
		return nil, fmt.Errorf("create output dir: %w", err)
	}

	files, err := filepath.Glob(filepath.Join(opts.SourceDir, "*.json"))
	if err != nil {
		return nil, fmt.Errorf("list source files: %w", err)
	}
	sort.Strings(files)
	files = filterFiles(files, opts.Start, opts.End)

	results := make([]BuildResult, 0, len(files))
	index := CityIndex{SchemaVersion: opts.SchemaVersion, Cities: []CityIndexEntry{}}
	for _, filePath := range files {
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		default:
		}

		result, entry, err := buildOne(filePath, opts)
		if err != nil {
			return nil, err
		}
		results = append(results, result)
		index.Cities = append(index.Cities, entry)
	}

	indexPath := filepath.Join(opts.OutputDir, "index.json")
	if err := writeJSON(indexPath, index); err != nil {
		return nil, fmt.Errorf("write city index: %w", err)
	}

	return results, nil
}

func buildOne(filePath string, opts BuildOptions) (BuildResult, CityIndexEntry, error) {
	raw, err := os.ReadFile(filePath)
	if err != nil {
		return BuildResult{}, CityIndexEntry{}, fmt.Errorf("read %s: %w", filePath, err)
	}

	var city CityArtifact
	if err := json.Unmarshal(raw, &city); err != nil {
		return BuildResult{}, CityIndexEntry{}, fmt.Errorf("decode %s: %w", filePath, err)
	}
	city.SchemaVersion = opts.SchemaVersion
	normalizeCity(&city)
	if err := ValidateCity(city); err != nil {
		return BuildResult{}, CityIndexEntry{}, fmt.Errorf("validate %s: %w", filePath, err)
	}

	artifactPath := filepath.Join(opts.OutputDir, city.City.Slug+".json")
	metaPath := filepath.Join(opts.OutputDir, city.City.Slug+".meta.json")
	if err := writeJSON(artifactPath, city); err != nil {
		return BuildResult{}, CityIndexEntry{}, fmt.Errorf("write artifact: %w", err)
	}

	meta := ArtifactMeta{
		GeneratedAt:    time.Now().UTC().Format(time.RFC3339),
		SourceCommit:   opts.SourceCommit,
		InputChecksum:  checksum(raw),
		SchemaVersion:  opts.SchemaVersion,
		Generator:      "cmd/build-index",
		SourceFile:     filepath.ToSlash(filePath),
		ArtifactFile:   filepath.ToSlash(artifactPath),
		LibosmscoutABI: "normalized-city-export-v1",
	}
	if err := writeJSON(metaPath, meta); err != nil {
		return BuildResult{}, CityIndexEntry{}, fmt.Errorf("write meta: %w", err)
	}

	result := BuildResult{
		Slug:         city.City.Slug,
		ArtifactPath: filepath.ToSlash(artifactPath),
		MetaPath:     filepath.ToSlash(metaPath),
		NodeCount:    len(city.Nodes),
		EdgeCount:    len(city.Edges),
	}
	entry := CityIndexEntry{
		Slug:        city.City.Slug,
		Name:        city.City.Name,
		Country:     city.City.Country,
		DataURL:     city.City.Slug + ".json",
		MetaURL:     city.City.Slug + ".meta.json",
		NodeCount:   len(city.Nodes),
		EdgeCount:   len(city.Edges),
		Description: city.Source.Name,
	}

	return result, entry, nil
}

func normalizeCity(city *CityArtifact) {
	sort.Slice(city.Nodes, func(i, j int) bool { return city.Nodes[i].ID < city.Nodes[j].ID })
	sort.Slice(city.Edges, func(i, j int) bool { return city.Edges[i].ID < city.Edges[j].ID })
	sort.Slice(city.Layers, func(i, j int) bool { return city.Layers[i].ID < city.Layers[j].ID })
	sort.Slice(city.Presets, func(i, j int) bool { return city.Presets[i].ID < city.Presets[j].ID })
}

func writeJSON(path string, value any) error {
	var buffer bytes.Buffer
	encoder := json.NewEncoder(&buffer)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(value); err != nil {
		return fmt.Errorf("encode json: %w", err)
	}
	return os.WriteFile(path, buffer.Bytes(), 0o644)
}

func checksum(raw []byte) string {
	sum := sha256.Sum256(raw)
	return hex.EncodeToString(sum[:])
}

func filterFiles(files []string, start string, end string) []string {
	if start == "" && end == "" {
		return files
	}

	filtered := make([]string, 0, len(files))
	for _, file := range files {
		slug := strings.TrimSuffix(filepath.Base(file), filepath.Ext(file))
		if start != "" && slug < start {
			continue
		}
		if end != "" && slug > end {
			continue
		}
		filtered = append(filtered, file)
	}
	return filtered
}
