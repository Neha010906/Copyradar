"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ResultsTable } from "@/components/results-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeMatches } from "@/lib/simulate-scan";
import { getWork, setActiveWorkId } from "@/lib/storage";
import type { ResultFilter, WorkRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function WorkReportPage() {
  const params = useParams<{ id: string }>();
  const [work, setWork] = useState<WorkRecord | null>(null);
  const [filter, setFilter] = useState<ResultFilter>("all");

  useEffect(() => {
    const found = getWork(params.id);
    if (found) {
      setActiveWorkId(found.id);
      setWork(found);
    }
  }, [params.id]);

  if (!work) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-zinc-400">Work not found in local storage.</p>
        <Button asChild className="mt-4">
          <Link href="/works">Back to works</Link>
        </Button>
      </div>
    );
  }

  const summary = summarizeMatches(work.matches);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/works" className="text-sm text-cyan-300">
        ← My Works
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">{work.title}</h1>
      <p className="mt-1 font-mono text-sm text-cyan-300">{work.fingerprint.display}</p>
      <p className="mt-1 text-xs text-zinc-500">
        Uploaded {formatDate(work.uploadedAt)} · S3 {work.s3Url}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {[
          ["Total", summary.total],
          ["Exact", summary.exact],
          ["Near-dup", summary.nearDuplicates],
          ["Illegal", summary.flaggedIllegal],
          ["Legal", summary.legal],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <div className="text-xl font-semibold">{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
          </Card>
        ))}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as ResultFilter)} className="mt-8">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="illegal">Illegal</TabsTrigger>
          <TabsTrigger value="near">Near-Duplicates</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mt-4">
        <ResultsTable work={work} filter={filter} />
      </div>
    </div>
  );
}
