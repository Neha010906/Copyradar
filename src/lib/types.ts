export type ContentType = "image" | "audio" | "text";

export type MatchKind =
  | "Exact"
  | "Cropped 12%"
  | "Resized"
  | "Filtered"
  | "Color-graded"
  | "Remixed"
  | "Sped up 1.2x"
  | "Clipped segment"
  | "Paraphrased"
  | "Translated copy";

export type LegalStatus = "Credited" | "Licensed" | "No Credit";

export interface Fingerprint {
  algorithm: "pHash" | "SpectroPrint" | "EmbVec";
  display: string;
  id: string;
  dimensions?: number;
  /** Hardcoded mock embedding preview (Pinecone stand-in). */
  embeddingPreview: number[];
}

export interface ScanMatch {
  id: string;
  site: string;
  url: string;
  matchType: MatchKind;
  similarity: number;
  confidence: number;
  status: LegalStatus;
  illegal: boolean;
  timestamp: string;
  thumbnail?: string;
  title: string;
  host: string;
}

export interface WorkRecord {
  id: string;
  title: string;
  contentType: ContentType;
  fingerprint: Fingerprint;
  uploadedAt: string;
  /** Simulated S3 object URL */
  s3Url: string;
  previewUrl?: string;
  textExcerpt?: string;
  matches: ScanMatch[];
}

export interface ScanSummary {
  total: number;
  exact: number;
  nearDuplicates: number;
  flaggedIllegal: number;
  legal: number;
}

export type ResultFilter = "all" | "legal" | "illegal" | "near";
