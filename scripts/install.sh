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

detect_asset() {
  local os arch
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

ASSET="$(detect_asset)"
BIN_NAME="bloom"
if [[ "${ASSET}" == *.exe ]]; then
  BIN_NAME="bloom.exe"
fi

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT

echo "Fetching latest Bloom CLI release…"
RELEASE_JSON="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest")"

DOWNLOAD_URL="$(
  printf '%s' "${RELEASE_JSON}" \
    | grep -oE "https://[^\"]+/${ASSET}\"" \
    | head -n1 \
    | tr -d '"'
)"

if [[ -z "${DOWNLOAD_URL}" ]]; then
  TAG="$(printf '%s' "${RELEASE_JSON}" | sed -n 's/.*"tag_name": "\([^"]*\)".*/\1/p' | head -n1)"
  red "Could not find asset '${ASSET}' in the latest release${TAG:+ (${TAG})}."
  red "Available assets may not include your platform yet."
  exit 1
fi

echo "Downloading ${ASSET}…"
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
echo
dim "Override API endpoints if needed:"
dim "  API_URL=https://… APP_URL=https://… bloom"
