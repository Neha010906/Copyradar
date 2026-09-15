import type { ScanMatch, WorkRecord } from "./types";

export function buildContactEmail(work: WorkRecord, match: ScanMatch) {
  return `Subject: Credit / removal request for unauthorized use of "${work.title}"

Hello,

I am the rights holder of the original work titled "${work.title}" (fingerprint ${work.fingerprint.display}).

I located a copy of this work at:
${match.url}

The match was classified as ${match.matchType} with ${match.similarity}% similarity (${match.confidence}% confidence) on ${new Date(match.timestamp).toUTCString()}.

This use does not include credit or a license that I have granted. Please either:
1. Add clear, visible credit to me as the creator and a link to the original, or
2. Remove the material within 48 hours.

I am happy to discuss a license if you would like to keep using the work.

Thank you,
[Your name]
[Your email]
CopyRadar case ID: ${work.id}
`;
}

export function buildDmcaNotice(work: WorkRecord, match: ScanMatch) {
  const today = new Date().toUTCString();
  return `DMCA TAKEDOWN NOTICE
Digital Millennium Copyright Act, 17 U.S.C. § 512(c)

TO: Designated Copyright Agent
Host / Service: ${match.host}
Infringing location: ${match.site}
URL: ${match.url}

DATE: ${today}

I, the undersigned, certify under penalty of perjury that I am the owner (or authorized to act on behalf of the owner) of the exclusive copyright in the material described below.

1. Identification of copyrighted work
   Title: ${work.title}
   Content type: ${work.contentType}
   Unique fingerprint: ${work.fingerprint.display}
   Fingerprint ID: ${work.fingerprint.id}
   Original object (simulated S3): ${work.s3Url}
   Date first indexed: ${new Date(work.uploadedAt).toUTCString()}

2. Identification of infringing material
   URL: ${match.url}
   Match type: ${match.matchType}
   Similarity score: ${match.similarity}%
   Detection confidence: ${match.confidence}%
   Observed: ${new Date(match.timestamp).toUTCString()}
   Status: ${match.status} (${match.illegal ? "unauthorized" : "review"})

3. Contact information of complaining party
   Name: [Copyright Owner]
   Email: owner@copyradar.demo
   Address: [Street, City, Country]
   Phone: [Phone]

4. Statement
   I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

5. Accuracy / perjury
   The information in this notification is accurate, and under penalty of perjury I am the owner, or authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.

6. Signature
   /s/ [Copyright Owner]
   Generated with CopyRadar (prototype notice — review with counsel before sending)

Case ID: ${work.id}
Match ID: ${match.id}
`;
}
