package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/baditaflorin/slime-mold-pathfinding/internal/citydata"
	"github.com/baditaflorin/slime-mold-pathfinding/internal/utils"
)

func main() {
	sourceDir := flag.String("source_dir", "data/source/cities", "directory containing normalized city source JSON")
	outputDir := flag.String("output_dir", "docs/data/v1/cities", "directory for generated browser artifacts")
	schemaVersion := flag.String("schema_version", "v1", "static data schema version")
	start := flag.String("start", "", "optional first city slug to process")
	end := flag.String("end", "", "optional last city slug to process")
	concurrency := flag.Int("concurrency", 1, "reserved worker count for batch extraction")
	saveEvery := flag.Int("save_every", 1, "reserved checkpoint interval for batch extraction")
	flag.Parse()

	results, err := citydata.BuildAll(context.Background(), citydata.BuildOptions{
		SourceDir:     *sourceDir,
		OutputDir:     *outputDir,
		SchemaVersion: *schemaVersion,
		SourceCommit:  gitCommit(),
		Start:         *start,
		End:           *end,
		Concurrency:   *concurrency,
		SaveEvery:     *saveEvery,
	})
	if err == nil {
		encoder := json.NewEncoder(os.Stdout)
		encoder.SetIndent("", "  ")
		err = encoder.Encode(results)
	}
	utils.HandleErrorOrLogWithMessages(err, "data generation failed", "")
}

func gitCommit() string {
	output, err := exec.Command("git", "rev-parse", "--short", "HEAD").Output()
	if err != nil {
		return "unknown"
	}
	commit := strings.TrimSpace(string(output))
	if commit == "" {
		return "unknown"
	}
	return commit
}

func init() {
	flag.Usage = func() {
		_, _ = fmt.Fprintf(flag.CommandLine.Output(), "Usage: build-index [flags]\n")
		flag.PrintDefaults()
	}
}
