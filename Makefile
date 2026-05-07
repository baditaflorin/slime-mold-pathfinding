.DEFAULT_GOAL := help

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push docker-build docker-push compose-up compose-down

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server
	npm run dev

build: ## Build the Pages-ready frontend into docs/
	npm run build

data: ## Regenerate static city data artifacts
	go run ./cmd/build-index

test: ## Run unit tests
	go test ./cmd/... ./internal/...
	npm test

test-integration: ## Run integration tests
	@echo "No integration tests are required for Mode B v0.1.0"

smoke: ## Build, serve docs/, and run Playwright smoke tests
	npm run smoke

lint: ## Run linters and type checks
	go vet ./cmd/... ./internal/...
	npm run lint
	npm run fmt:check
	npx tsc --noEmit

fmt: ## Autoformat source files
	gofmt -w cmd internal
	npm run fmt

pages-preview: ## Serve docs/ locally with the GitHub Pages base path
	npm run pages-preview

release: ## Tag a local release after checks pass
	./scripts/release.sh

docker-build: ## Mode B has no Docker image
	@echo "Mode B: no runtime Docker image"

docker-push: ## Mode B has no Docker image
	@echo "Mode B: no runtime Docker image"

compose-up: ## Mode B has no Docker stack
	@echo "Mode B: no Docker Compose stack"

compose-down: ## Mode B has no Docker stack
	@echo "Mode B: no Docker Compose stack"

clean: ## Remove local build/test output
	rm -rf coverage playwright-report test-results dist dist-data docs/assets docs/404.html

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push
