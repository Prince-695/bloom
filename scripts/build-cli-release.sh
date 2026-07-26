#!/usr/bin/env bash
# Build Bloom CLI standalone binary for the current host.
# OpenTUI ships platform-native packages, so cross-compile is not supported.
#
# Public artifact name: bloom-<platform>-<arch>-<version>[.exe]
#   platform: linux | macos | windows  (darwin host → macos in the filename)
#
# Usage:
#   ./scripts/build-cli-release.sh              # current host
#   ./scripts/build-cli-release.sh linux-x64    # must match host
#   BLOOM_VERSION=0.1.2 ./scripts/build-cli-release.sh
#   GITHUB_REF_NAME=v0.1.2 ./scripts/build-cli-release.sh   # CI tags
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT}/packages/cli/dist-release"
ENTRY="${ROOT}/packages/cli/src/index.tsx"
BRAND_FILE="${ROOT}/packages/cli/src/lib/brand.ts"

mkdir -p "${OUT_DIR}"

resolve_version() {
  if [[ -n "${BLOOM_VERSION:-}" ]]; then
    echo "${BLOOM_VERSION#v}"
    return
  fi
  if [[ -n "${GITHUB_REF_NAME:-}" && "${GITHUB_REF_NAME}" == v* ]]; then
    echo "${GITHUB_REF_NAME#v}"
    return
  fi
  # Fall back to PRODUCT_VERSION in brand.ts
  local from_brand
  from_brand="$(
    sed -n 's/.*PRODUCT_VERSION = "\([^"]*\)".*/\1/p' "${BRAND_FILE}" | head -n1
  )"
  if [[ -n "${from_brand}" ]]; then
    echo "${from_brand}"
    return
  fi
  echo "0.0.0"
}

detect_host_asset() {
  local os arch
  case "$(uname -s)" in
    Linux*) os="linux" ;;
    Darwin*) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *)
      echo "Unsupported OS: $(uname -s)" >&2
      exit 1
      ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64|AMD64) arch="x64" ;;
    arm64|aarch64|ARM64) arch="arm64" ;;
    *)
      echo "Unsupported arch: $(uname -m)" >&2
      exit 1
      ;;
  esac
  echo "${os}-${arch}"
}

# Internal host key (darwin-arm64) → public platform token (macos)
public_platform() {
  case "$1" in
    darwin) echo "macos" ;;
    *) echo "$1" ;;
  esac
}

asset_filename() {
  local host_asset="$1"
  local version="$2"
  local os="${host_asset%-*}"
  local arch="${host_asset#*-}"
  local platform
  platform="$(public_platform "${os}")"
  if [[ "${platform}" == "windows" ]]; then
    echo "bloom-${platform}-${arch}-${version}.exe"
  else
    echo "bloom-${platform}-${arch}-${version}"
  fi
}

HOST_ASSET="$(detect_host_asset)"
REQUESTED="${1:-${HOST_ASSET}}"
VERSION="$(resolve_version)"

if [[ "${REQUESTED}" == "all" ]]; then
  echo "OpenTUI requires native runners; use CI matrix instead of 'all'." >&2
  echo "Building host target only: ${HOST_ASSET}" >&2
  REQUESTED="${HOST_ASSET}"
fi

if [[ "${REQUESTED}" != "${HOST_ASSET}" ]]; then
  echo "Cannot build '${REQUESTED}' on host '${HOST_ASSET}' (OpenTUI native deps)." >&2
  exit 1
fi

cd "${ROOT}"
bun install --frozen-lockfile 2>/dev/null || bun install

FILENAME="$(asset_filename "${HOST_ASSET}" "${VERSION}")"
OUTFILE="${OUT_DIR}/${FILENAME}"
echo "→ Compiling ${FILENAME} (native, version ${VERSION})"
bun build --compile "${ENTRY}" --outfile "${OUTFILE}"

if [[ "${HOST_ASSET}" == windows-* ]]; then
  if [[ -f "${OUTFILE}.exe" && ! -f "${OUTFILE}" ]]; then
    mv "${OUTFILE}.exe" "${OUTFILE}"
  fi
fi

chmod +x "${OUTFILE}" 2>/dev/null || true

# Help CI upload without hardcoding the versioned name
printf '%s\n' "${FILENAME}" > "${OUT_DIR}/ARTIFACT_NAME"
printf '%s\n' "${VERSION}" > "${OUT_DIR}/VERSION"

echo "→ Writing SHA256SUMS"
(
  cd "${OUT_DIR}"
  sums="SHA256SUMS-${FILENAME}"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${FILENAME}" > "${sums}"
  else
    shasum -a 256 "${FILENAME}" > "${sums}"
  fi
)

echo "Done. Artifact: ${OUTFILE}"
ls -lh "${OUTFILE}"
