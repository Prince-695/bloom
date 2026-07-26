#!/usr/bin/env bash
# Build Bloom CLI standalone binary for the current host.
# OpenTUI ships platform-native packages, so cross-compile is not supported.
#
# Usage:
#   ./scripts/build-cli-release.sh              # current host
#   ./scripts/build-cli-release.sh linux-x64    # must match host or exit
#   ./scripts/build-cli-release.sh windows-x64  # must run on Windows
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT}/packages/cli/dist-release"
ENTRY="${ROOT}/packages/cli/src/index.tsx"

mkdir -p "${OUT_DIR}"

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

asset_filename() {
  local asset="$1"
  if [[ "${asset}" == windows-* ]]; then
    echo "bloom-${asset}.exe"
  else
    echo "bloom-${asset}"
  fi
}

HOST_ASSET="$(detect_host_asset)"
REQUESTED="${1:-${HOST_ASSET}}"

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

FILENAME="$(asset_filename "${HOST_ASSET}")"
OUTFILE="${OUT_DIR}/${FILENAME}"
echo "→ Compiling ${FILENAME} (native)"
# Production defaults live in packages/cli/src/lib/config.ts.
# Runtime override: API_URL=… APP_URL=… bloom
bun build --compile "${ENTRY}" --outfile "${OUTFILE}"

# Bun may append .exe on Windows even if outfile already has it; normalize.
if [[ "${HOST_ASSET}" == windows-* ]]; then
  if [[ -f "${OUTFILE}.exe" && ! -f "${OUTFILE}" ]]; then
    mv "${OUTFILE}.exe" "${OUTFILE}"
  fi
  # Prefer canonical bloom-windows-*.exe name
  if [[ -f "${OUT_DIR}/bloom-${HOST_ASSET}" && ! -f "${OUTFILE}" ]]; then
    mv "${OUT_DIR}/bloom-${HOST_ASSET}" "${OUTFILE}"
  fi
fi

chmod +x "${OUTFILE}" 2>/dev/null || true

echo "→ Writing SHA256SUMS"
(
  cd "${OUT_DIR}"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${FILENAME}" > "SHA256SUMS-${HOST_ASSET}"
  else
    shasum -a 256 "${FILENAME}" > "SHA256SUMS-${HOST_ASSET}"
  fi
)

echo "Done. Artifact: ${OUTFILE}"
ls -lh "${OUTFILE}"
