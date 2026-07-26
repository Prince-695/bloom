import { chmodSync, copyFileSync, renameSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PRODUCT_VERSION } from "./brand";

const GITHUB_REPO = "Prince-695/bloom";
const RELEASES_LATEST = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export type PlatformKey = "linux" | "macos" | "windows";
export type ArchKey = "x64" | "arm64";

export type UpdateInfo = {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  tagName: string;
  assetName: string;
  downloadUrl: string;
};

type GitHubAsset = {
  name: string;
  browser_download_url: string;
};

type GitHubRelease = {
  tag_name: string;
  assets: GitHubAsset[];
};

export function updatesDisabled() {
  const flag = process.env.BLOOM_NO_UPDATE?.trim().toLowerCase();
  return flag === "1" || flag === "true" || flag === "yes";
}

export function detectPlatform(): { platform: PlatformKey; arch: ArchKey } {
  let platform: PlatformKey;
  switch (process.platform) {
    case "linux":
      platform = "linux";
      break;
    case "darwin":
      platform = "macos";
      break;
    case "win32":
      platform = "windows";
      break;
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }

  let arch: ArchKey;
  switch (process.arch) {
    case "x64":
      arch = "x64";
      break;
    case "arm64":
      arch = "arm64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${process.arch}`);
  }

  if (platform === "macos" && arch === "x64") {
    throw new Error(
      "Intel Mac builds are not published yet. Use Apple Silicon, or Linux/Windows.",
    );
  }
  if (platform === "windows" && arch === "arm64") {
    throw new Error(
      "Windows ARM64 builds are not published yet. Use an x64 machine, or WSL.",
    );
  }

  return { platform, arch };
}

/** Versioned: bloom-macos-arm64- ; legacy: bloom-darwin-arm64 */
export function assetPrefix(platform: PlatformKey, arch: ArchKey) {
  return `bloom-${platform}-${arch}-`;
}

export function legacyAssetName(platform: PlatformKey, arch: ArchKey) {
  const os = platform === "macos" ? "darwin" : platform;
  return platform === "windows"
    ? `bloom-${os}-${arch}.exe`
    : `bloom-${os}-${arch}`;
}

/** Compare semver-ish strings. Returns >0 if a>b, <0 if a<b, 0 if equal. */
export function compareSemver(a: string, b: string) {
  const parse = (v: string) =>
    v
      .replace(/^v/i, "")
      .split(".")
      .map((part) => Number.parseInt(part.replace(/[^0-9].*$/, ""), 10) || 0);

  const pa = parse(a);
  const pb = parse(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

function normalizeVersion(tag: string) {
  return tag.replace(/^v/i, "");
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  const response = await fetch(RELEASES_LATEST, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "bloom-cli",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub Releases error (${response.status})`);
  }
  return (await response.json()) as GitHubRelease;
}

function pickAsset(
  release: GitHubRelease,
  platform: PlatformKey,
  arch: ArchKey,
): GitHubAsset {
  const prefix = assetPrefix(platform, arch);
  const versioned = release.assets.find((a) => a.name.startsWith(prefix));
  if (versioned) return versioned;

  const legacy = legacyAssetName(platform, arch);
  const legacyAsset = release.assets.find((a) => a.name === legacy);
  if (legacyAsset) return legacyAsset;

  throw new Error(
    `No binary for ${platform}-${arch} in release ${release.tag_name}`,
  );
}

export async function checkForUpdate(
  currentVersion: string = PRODUCT_VERSION,
): Promise<UpdateInfo> {
  const { platform, arch } = detectPlatform();
  const release = await fetchLatestRelease();
  const latestVersion = normalizeVersion(release.tag_name);
  const asset = pickAsset(release, platform, arch);
  const available = compareSemver(latestVersion, currentVersion) > 0;

  return {
    available,
    currentVersion: normalizeVersion(currentVersion),
    latestVersion,
    tagName: release.tag_name,
    assetName: asset.name,
    downloadUrl: asset.browser_download_url,
  };
}

/**
 * Download the latest binary and replace the running executable when possible.
 */
export async function applyUpdate(info?: UpdateInfo): Promise<UpdateInfo> {
  const update = info ?? (await checkForUpdate());
  if (!update.available) {
    return update;
  }

  const response = await fetch(update.downloadUrl, {
    headers: { "User-Agent": "bloom-cli" },
  });
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const target = process.execPath;
  const staging = join(
    tmpdir(),
    `bloom-update-${update.latestVersion}-${Date.now()}`,
  );

  await Bun.write(staging, bytes);
  try {
    chmodSync(staging, 0o755);
  } catch {
    // Windows may ignore mode bits
  }

  try {
    // Atomic-ish replace: move aside, then move new into place
    const backup = `${target}.bak`;
    try {
      unlinkSync(backup);
    } catch {
      // no previous backup
    }
    try {
      renameSync(target, backup);
    } catch {
      // If rename of running binary fails, try direct overwrite via copy
      copyFileSync(staging, target);
      try {
        chmodSync(target, 0o755);
      } catch {
        // ignore
      }
      unlinkSync(staging);
      return update;
    }

    try {
      renameSync(staging, target);
    } catch {
      copyFileSync(staging, target);
      unlinkSync(staging);
    }

    try {
      chmodSync(target, 0o755);
    } catch {
      // ignore
    }

    try {
      unlinkSync(backup);
    } catch {
      // keep .bak if delete fails (Windows)
    }
  } catch (error) {
    try {
      unlinkSync(staging);
    } catch {
      // ignore
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to replace Bloom binary");
  }

  return update;
}
