package citydata

import (
	"fmt"
	"strings"
)

func ValidateCity(city CityArtifact) error {
	if strings.TrimSpace(city.SchemaVersion) == "" {
		return fmt.Errorf("schemaVersion is required")
	}
	if strings.TrimSpace(city.City.Slug) == "" {
		return fmt.Errorf("city.slug is required")
	}
	if len(city.Nodes) == 0 {
		return fmt.Errorf("%s has no nodes", city.City.Slug)
	}
	if len(city.Edges) == 0 {
		return fmt.Errorf("%s has no edges", city.City.Slug)
	}

	nodes := make(map[string]Node, len(city.Nodes))
	for _, node := range city.Nodes {
		if strings.TrimSpace(node.ID) == "" {
			return fmt.Errorf("%s contains a node with empty id", city.City.Slug)
		}
		if _, exists := nodes[node.ID]; exists {
			return fmt.Errorf("%s contains duplicate node id %q", city.City.Slug, node.ID)
		}
		if node.X < 0 || node.X > 1 || node.Y < 0 || node.Y > 1 {
			return fmt.Errorf("%s node %q is outside normalized bounds", city.City.Slug, node.ID)
		}
		nodes[node.ID] = node
	}

	for _, edge := range city.Edges {
		if strings.TrimSpace(edge.ID) == "" {
			return fmt.Errorf("%s contains an edge with empty id", city.City.Slug)
		}
		if _, exists := nodes[edge.From]; !exists {
			return fmt.Errorf("%s edge %q references missing from node %q", city.City.Slug, edge.ID, edge.From)
		}
		if _, exists := nodes[edge.To]; !exists {
			return fmt.Errorf("%s edge %q references missing to node %q", city.City.Slug, edge.ID, edge.To)
		}
		if edge.Weight <= 0 {
			return fmt.Errorf("%s edge %q must have a positive weight", city.City.Slug, edge.ID)
		}
	}

	for _, preset := range city.Presets {
		if len(preset.NodeIDs) < 2 {
			return fmt.Errorf("%s preset %q needs at least two node ids", city.City.Slug, preset.ID)
		}
		for _, nodeID := range preset.NodeIDs {
			if _, exists := nodes[nodeID]; !exists {
				return fmt.Errorf("%s preset %q references missing node %q", city.City.Slug, preset.ID, nodeID)
			}
		}
	}

	return nil
}
