"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Flag,
  Mail,
  MoreHorizontal,
  Scale,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildContactEmail, buildDmcaNotice } from "@/lib/dmca";
import type { ResultFilter, ScanMatch, WorkRecord } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 95) return "bg-emerald-400";
  if (score >= 85) return "bg-amber-400";
  return "bg-rose-400";
}

function filterMatches(matches: ScanMatch[], filter: ResultFilter) {
  if (filter === "legal") return matches.filter((m) => !m.illegal);
  if (filter === "illegal") return matches.filter((m) => m.illegal);
  if (filter === "near") return matches.filter((m) => m.matchType !== "Exact");
  return matches;
}

type SortKey = "site" | "similarity" | "status" | "matchType";

export function ResultsTable({
  work,
  filter,
}: {
  work: WorkRecord;
  filter: ResultFilter;
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "similarity",
    dir: "desc",
  });
  const [active, setActive] = useState<{ kind: "contact" | "dmca" | "claim"; match: ScanMatch } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const rows = useMemo(() => {
    const list = [...filterMatches(work.matches, filter)];
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "similarity") return (a.similarity - b.similarity) * dir;
      if (sort.key === "site") return a.site.localeCompare(b.site) * dir;
      if (sort.key === "status") return (Number(a.illegal) - Number(b.illegal)) * dir;
      return a.matchType.localeCompare(b.matchType) * dir;
    });
    return list;
  }, [work.matches, filter, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );
  }

  const body =
    active?.kind === "contact"
      ? buildContactEmail(work, active.match)
      : active?.kind === "dmca"
        ? buildDmcaNotice(work, active.match)
        : "";

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadTxt(text: string, name: string) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.03] text-zinc-400">
            <tr>
              <th className="px-3 py-3 font-medium">Preview</th>
              <th className="px-3 py-3 font-medium">
                <button onClick={() => toggleSort("site")}>Site</button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button onClick={() => toggleSort("matchType")}>Match Type</button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button onClick={() => toggleSort("similarity")}>Similarity</button>
              </th>
              <th className="px-3 py-3 font-medium">
                <button onClick={() => toggleSort("status")}>Status</button>
              </th>
              <th className="px-3 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="px-3 py-3">
                    {row.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.thumbnail}
                        alt=""
                        className="h-12 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 items-center justify-center rounded-md bg-white/5 text-[10px] text-zinc-500">
                        {work.contentType}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-zinc-100">{row.site}</div>
                    <div className="max-w-[220px] truncate text-xs text-zinc-500">
                      {row.url}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                      {row.matchType}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 min-w-[140px]">
                    <div className="mb-1 flex justify-between text-xs text-zinc-400">
                      <span>{row.similarity}%</span>
                      <span>{row.confidence}% conf.</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn("h-full", scoreColor(row.similarity))}
                        style={{ width: `${row.similarity}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {row.illegal ? (
                      <span className="text-rose-400">❌ Illegal (No Credit)</span>
                    ) : (
                      <span className="text-emerald-400">
                        ✅ Legal ({row.status})
                      </span>
                    )}
                    <div className="text-[11px] text-zinc-500">{formatDate(row.timestamp)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="mr-1 h-4 w-4" />
                          Action
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setActive({ kind: "contact", match: row })}>
                          <Mail className="mr-2 h-4 w-4" /> Contact Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActive({ kind: "dmca", match: row })}>
                          <Flag className="mr-2 h-4 w-4" /> Generate DMCA Takedown
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActive({ kind: "claim", match: row })}>
                          <Scale className="mr-2 h-4 w-4" /> Register Copyright Claim
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {active?.kind === "contact" && "Contact Owner"}
              {active?.kind === "dmca" && "Generate DMCA Takedown"}
              {active?.kind === "claim" && "Register Copyright Claim"}
            </DialogTitle>
            <DialogDescription>
              {active?.kind === "claim"
                ? "Evidence packet ready for a copyright claim filing."
                : "Review, copy, or download before sending."}
            </DialogDescription>
          </DialogHeader>

          {active?.kind === "claim" ? (
            <ul className="space-y-3 text-sm text-zinc-300">
              {[
                `Fingerprint ${work.fingerprint.display}`,
                `Scan report (${work.matches.length} matches, ${work.matches.filter((m) => m.illegal).length} flagged)`,
                `Original upload timestamp ${formatDate(work.uploadedAt)}`,
                `Infringing URL ${active.match.url}`,
                `Simulated S3 object ${work.s3Url}`,
                "Chain of custody log (CopyRadar prototype)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <pre className="max-h-[46vh] overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-4 font-mono text-xs text-zinc-300">
              {body}
            </pre>
          )}

          {active?.kind !== "claim" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => copyText(body)}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadTxt(
                    body,
                    active!.kind === "dmca"
                      ? `dmca-${active!.match.id}.txt`
                      : `contact-${active!.match.id}.txt`,
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" /> Download as .txt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
