#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-v0.1.0}"

make test
make build
make smoke

git tag "$VERSION"
printf 'Tagged %s\n' "$VERSION"
