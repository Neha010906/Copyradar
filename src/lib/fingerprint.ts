import { hashString } from "./utils";
import type { ContentType, Fingerprint } from "./types";

function hexPairs(hex: string, n: number) {
  const padded = (hex + "a94f22be88c1f7b2").slice(0, 16);
  const chunks: string[] = [];
  for (let i = 0; i < n; i++) {
    chunks.push(padded.slice(i * 4, i * 4 + 4));
  }
  return chunks;
}

export function inferContentType(file: File): ContentType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "text";
}

export function generateFingerprint(
  contentType: ContentType,
  seed: string,
): Fingerprint {
  const hex = hashString(seed + contentType);
  const embeddingPreview = Array.from({ length: 12 }, (_, i) => {
    const v = parseInt(hex.slice(0, 6), 16);
    return Number((((v * (i + 3)) % 1000) / 1000 - 0.5).toFixed(4));
  });

  if (contentType === "image") {
    const [a, b, c] = hexPairs(hex, 3);
    return {
      algorithm: "pHash",
      display: `pHash: ${a}-${b}-${c}`,
      id: `phash_${hex}`,
      embeddingPreview,
    };
  }

  if (contentType === "audio") {
    const [a, b] = hexPairs(hex, 2);
    return {
      algorithm: "SpectroPrint",
      display: `SpectroPrint: F#${a.slice(0, 2).toUpperCase()}-${b.toUpperCase()}`,
      id: `spectro_${hex}`,
      embeddingPreview,
    };
  }

  return {
    algorithm: "EmbVec",
    display: `EmbVec: 768-dim · ${hex.slice(0, 6)}`,
    id: `emb_${hex}`,
    dimensions: 768,
    embeddingPreview,
  };
}

export function mockS3Url(workId: string, filename: string) {
  const safe = encodeURIComponent(filename.replace(/\s+/g, "-"));
  return `https://s3.mock.copyradar.local/creators/works/${workId}/${safe}`;
}
