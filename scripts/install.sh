#!/usr/bin/env bash
# Install Bloom CLI from the latest GitHub Release (Linux / macOS / Git Bash on Windows).
# Usage:
#   curl -fsSL https://bloom-web-amber.vercel.app/install.sh | bash
#
# On native Windows PowerShell:
#   irm https://bloom-web-amber.vercel.app/install.ps1 | iex
set -euo pipefail

REPO="Prince-695/bloom"
INSTALL_DIR="${BLOOM_INSTALL_DIR:-${HOME}/.local/bin}"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
dim() { printf '\033[2m%s\033[0m\n' "$*"; }

# Prefix for versioned assets, e.g. bloom-macos-arm64-
detect_asset_prefix() {
  local os arch platform
  case "$(uname -s)" in
    Linux*) os="linux" ;;
    Darwin*) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *)
      red "Unsupported OS: $(uname -s). Bloom CLI supports Linux, macOS, and Windows."
      exit 1
      ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64|AMD64) arch="x64" ;;
    arm64|aarch64|ARM64) arch="arm64" ;;
    *)
      red "Unsupported architecture: $(uname -m)."
      exit 1
      ;;
  esac

  if [[ "${os}" == "darwin" && "${arch}" == "x64" ]]; then
    red "Intel Mac builds are not published yet. Use an Apple Silicon Mac, or Linux/Windows."
    exit 1
  fi

  if [[ "${os}" == "windows" && "${arch}" == "arm64" ]]; then
    red "Windows ARM64 builds are not published yet. Use an x64 machine, or WSL."
    exit 1
  fi

  platform="${os}"
  if [[ "${os}" == "darwin" ]]; then
    platform="macos"
  fi

  echo "bloom-${platform}-${arch}-"
}

# Legacy unversioned names from v0.1.0
legacy_asset_name() {
  local os arch
  case "$(uname -s)" in
    Linux*) os="linux" ;;
    Darwin*) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64|AMD64) arch="x64" ;;
    arm64|aarch64|ARM64) arch="arm64" ;;
  esac
  if [[ "${os}" == "windows" ]]; then
    echo "bloom-${os}-${arch}.exe"
  else
    echo "bloom-${os}-${arch}"
  fi
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "Missing required command: $1"
    exit 1
  fi
}

need_cmd curl
need_cmd mkdir
need_cmd mktemp

PREFIX="$(detect_asset_prefix)"
LEGACY="$(legacy_asset_name)"
BIN_NAME="bloom"
if [[ "${PREFIX}" == bloom-windows-* ]]; then
  BIN_NAME="bloom.exe"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT

echo "Fetching latest Bloom CLI release…"
RELEASE_JSON="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest")"

# Prefer versioned asset: bloom-macos-arm64-0.1.2
DOWNLOAD_URL="$(
  printf '%s' "${RELEASE_JSON}" \
    | grep -oE "\"browser_download_url\":[[:space:]]*\"https://[^\"]+/${PREFIX}[^\"]+\"" \
    | head -n1 \
    | sed -E 's/.*"browser_download_url":[[:space:]]*"([^"]+)".*/\1/'
)"

# Fall back to legacy unversioned name (v0.1.0)
if [[ -z "${DOWNLOAD_URL}" ]]; then
  DOWNLOAD_URL="$(
    printf '%s' "${RELEASE_JSON}" \
      | grep -oE "\"browser_download_url\":[[:space:]]*\"https://[^\"]+/${LEGACY}\"" \
      | head -n1 \
      | sed -E 's/.*"browser_download_url":[[:space:]]*"([^"]+)".*/\1/'
  )"
fi

if [[ -z "${DOWNLOAD_URL}" ]]; then
  TAG="$(printf '%s' "${RELEASE_JSON}" | sed -n 's/.*"tag_name": "\([^"]*\)".*/\1/p' | head -n1)"
  red "Could not find a Bloom binary for this platform in the latest release${TAG:+ (${TAG})}."
  red "Looked for prefix '${PREFIX}' (or legacy '${LEGACY}')."
  exit 1
fi

ASSET_NAME="$(basename "${DOWNLOAD_URL}")"
echo "Downloading ${ASSET_NAME}…"
curl -fsSL "${DOWNLOAD_URL}" -o "${TMP}/${BIN_NAME}"

mkdir -p "${INSTALL_DIR}"
if command -v install >/dev/null 2>&1 && [[ "${BIN_NAME}" != *.exe ]]; then
  install -m 755 "${TMP}/${BIN_NAME}" "${INSTALL_DIR}/${BIN_NAME}"
else
  cp "${TMP}/${BIN_NAME}" "${INSTALL_DIR}/${BIN_NAME}"
  chmod +x "${INSTALL_DIR}/${BIN_NAME}" 2>/dev/null || true
fi

green "Installed Bloom CLI → ${INSTALL_DIR}/${BIN_NAME}"

case ":${PATH}:" in
  *":${INSTALL_DIR}:"*) ;;
  *)
    echo
    dim "Add ${INSTALL_DIR} to your PATH, e.g.:"
    if [[ "${BIN_NAME}" == *.exe ]]; then
      echo "  setx PATH \"%PATH%;%USERPROFILE%\\.local\\bin\""
    else
      echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc && source ~/.bashrc"
    fi
    ;;
esac

echo
echo "Next steps:"
if [[ "${BIN_NAME}" == *.exe ]]; then
  echo "  bloom.exe"
else
  echo "  bloom"
fi
echo "  /login"
echo "  /update   # when a newer release is available"
echo
dim "Override API endpoints if needed:"
dim "  API_URL=https://… APP_URL=https://… bloom"
