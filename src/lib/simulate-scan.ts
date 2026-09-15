import type { ContentType, MatchKind, ScanMatch, ScanSummary } from "./types";
import { seededRandom } from "./utils";

const IMAGE_THUMBS = [
  "https://picsum.photos/id/1015/160/120",
  "https://picsum.photos/id/1016/160/120",
  "https://picsum.photos/id/1025/160/120",
  "https://picsum.photos/id/1035/160/120",
  "https://picsum.photos/id/1043/160/120",
  "https://picsum.photos/id/106/160/120",
  "https://picsum.photos/id/237/160/120",
  "https://picsum.photos/id/433/160/120",
  "https://picsum.photos/id/582/160/120",
  "https://picsum.photos/id/628/160/120",
  "https://picsum.photos/id/659/160/120",
  "https://picsum.photos/id/674/160/120",
  "https://picsum.photos/id/718/160/120",
  "https://picsum.photos/id/823/160/120",
];

type Template = Omit<ScanMatch, "id" | "similarity" | "confidence" | "timestamp" | "matchType" | "thumbnail"> & {
  matchByType: Record<ContentType, MatchKind>;
};

const TEMPLATES: Template[] = [
  {
    site: "instagram.com",
    url: "https://instagram.com/p/credited_repost",
    status: "Credited",
    illegal: false,
    title: "Credited creator repost",
    host: "Meta Platforms, Inc.",
    matchByType: { image: "Exact", audio: "Exact", text: "Exact" },
  },
  {
    site: "pinterest.com",
    url: "https://pinterest.com/pin/48291033",
    status: "Credited",
    illegal: false,
    title: "Moodboard pin with attribution",
    host: "Pinterest, Inc.",
    matchByType: { image: "Cropped 12%", audio: "Clipped segment", text: "Paraphrased" },
  },
  {
    site: "stock.adobe.com",
    url: "https://stock.adobe.com/license/441882",
    status: "Licensed",
    illegal: false,
    title: "Adobe Stock licensed listing",
    host: "Adobe Inc.",
    matchByType: { image: "Exact", audio: "Exact", text: "Exact" },
  },
  {
    site: "behance.net",
    url: "https://behance.net/gallery/credited-study",
    status: "Credited",
    illegal: false,
    title: "Portfolio study with credit",
    host: "Adobe Inc.",
    matchByType: { image: "Resized", audio: "Remixed", text: "Translated copy" },
  },
  {
    site: "flickr.com",
    url: "https://flickr.com/photos/licensed-use",
    status: "Licensed",
    illegal: false,
    title: "Licensed Creative Commons reuse",
    host: "SmugMug, Inc.",
    matchByType: { image: "Filtered", audio: "Sped up 1.2x", text: "Paraphrased" },
  },
  {
    site: "x.com",
    url: "https://x.com/artist/status/credited",
    status: "Credited",
    illegal: false,
    title: "Quoted post with credit",
    host: "X Corp.",
    matchByType: { image: "Resized", audio: "Clipped segment", text: "Exact" },
  },
  {
    site: "artstation.com",
    url: "https://artstation.com/artwork/licensed",
    status: "Licensed",
    illegal: false,
    title: "Licensed reference board",
    host: "Epic Games, Inc.",
    matchByType: { image: "Color-graded", audio: "Remixed", text: "Paraphrased" },
  },
  {
    site: "shady-blog.net",
    url: "https://shady-blog.net/posts/hot-steal",
    status: "No Credit",
    illegal: true,
    title: "Uncredited blog scrape",
    host: "Cloudflare, Inc. (hosting)",
    matchByType: { image: "Exact", audio: "Exact", text: "Exact" },
  },
  {
    site: "etsy.com/listing/8832",
    url: "https://etsy.com/listing/8832/print-pack",
    status: "No Credit",
    illegal: true,
    title: "Prints sold without license",
    host: "Etsy, Inc.",
    matchByType: { image: "Cropped 12%", audio: "Remixed", text: "Paraphrased" },
  },
  {
    site: "tiktok.com/@user",
    url: "https://tiktok.com/@user/video/uncredited",
    status: "No Credit",
    illegal: true,
    title: "TikTok repost without credit",
    host: "ByteDance Ltd.",
    matchByType: { image: "Filtered", audio: "Sped up 1.2x", text: "Translated copy" },
  },
  {
    site: "medium.com/@copycat",
    url: "https://medium.com/@copycat/rewritten-piece",
    status: "No Credit",
    illegal: true,
    title: "Paraphrased article",
    host: "A Medium Corporation",
    matchByType: { image: "Resized", audio: "Clipped segment", text: "Paraphrased" },
  },
  {
    site: "instagram.com",
    url: "https://instagram.com/p/copycatshop",
    status: "No Credit",
    illegal: true,
    title: "Shop account using original",
    host: "Meta Platforms, Inc.",
    matchByType: { image: "Color-graded", audio: "Remixed", text: "Translated copy" },
  },
  {
    site: "reddit.com/r/freebies",
    url: "https://reddit.com/r/freebies/comments/dump",
    status: "No Credit",
    illegal: true,
    title: "File dump thread",
    host: "Reddit, Inc.",
    matchByType: { image: "Cropped 12%", audio: "Clipped segment", text: "Exact" },
  },
  {
    site: "cdn-mirror.xyz",
    url: "https://cdn-mirror.xyz/hotlink/asset",
    status: "No Credit",
    illegal: true,
    title: "Hotlinked CDN copy",
    host: "DigitalOcean, LLC",
    matchByType: { image: "Exact", audio: "Exact", text: "Exact" },
  },
];

function scoreFor(rand: () => number, illegal: boolean, exact: boolean) {
  if (exact) return 95 + Math.floor(rand() * 6);
  if (illegal) return 78 + Math.floor(rand() * 17);
  return 85 + Math.floor(rand() * 11);
}

export function simulateScan(contentType: ContentType, seed = "copyradar"): ScanMatch[] {
  const rand = seededRandom(`${seed}:${contentType}`);
  const now = Date.now();

  return TEMPLATES.map((tpl, i) => {
    const matchType = tpl.matchByType[contentType];
    const exact = matchType === "Exact";
    const similarity = scoreFor(rand, tpl.illegal, exact);
    const confidence = Math.min(99, similarity - 2 + Math.floor(rand() * 5));
    const hoursAgo = 4 + Math.floor(rand() * 240);

    return {
      id: `m_${contentType}_${i}_${seed.slice(0, 6)}`,
      site: tpl.site,
      url: tpl.url,
      matchType,
      similarity,
      confidence,
      status: tpl.status,
      illegal: tpl.illegal,
      timestamp: new Date(now - hoursAgo * 3600_000).toISOString(),
      thumbnail: contentType === "image" ? IMAGE_THUMBS[i % IMAGE_THUMBS.length] : undefined,
      title: tpl.title,
      host: tpl.host,
    };
  });
}

export function summarizeMatches(matches: ScanMatch[]): ScanSummary {
  const exactKinds = new Set<MatchKind>(["Exact"]);
  const near = matches.filter((m) => !exactKinds.has(m.matchType)).length;
  return {
    total: matches.length,
    exact: matches.filter((m) => exactKinds.has(m.matchType)).length,
    nearDuplicates: near,
    flaggedIllegal: matches.filter((m) => m.illegal).length,
    legal: matches.filter((m) => !m.illegal).length,
  };
}

export const SCAN_LOG_LINES = [
  "> boot CopyRadar crawler v0.9.4",
  "> Querying Google Image API...",
  "> Querying audio fingerprint mirrors...",
  "> Crawling indexed pages...",
  "> Hydrating Pinecone mock index `copyradar-prod`...",
  "> Comparing embeddings (cosine + perceptual hash)...",
  "> Checking licensing databases (Adobe Stock, Getty, CC)...",
  "> Cross-referencing social CDNs...",
  "> Ranking near-duplicates...",
  "> Flagging uncredited commercial use...",
  "> Scan complete. Writing report → /dashboard",
];
