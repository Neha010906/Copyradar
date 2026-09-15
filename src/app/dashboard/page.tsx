"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Copy, Layers, ShieldAlert } from "lucide-react";
import { ResultsTable } from "@/components/results-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { summarizeMatches } from "@/lib/simulate-scan";
import { getActiveWork } from "@/lib/storage";
import type { ResultFilter, WorkRecord } from "@/lib/types";

export default function DashboardPage() {
  const [work, setWork] = useState<WorkRecord | null>(null);
  const [filter, setFilter] = useState<ResultFilter>("all");

  useEffect(() => {
    setWork(getActiveWork() ?? null);
  }, []);

  if (!work || work.matches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">No scan report yet</h1>
        <p className="mt-2 text-zinc-400">Upload a work and run a live web scan to populate this dashboard.</p>
        <Button asChild className="mt-6">
          <Link href="/upload">Start Protecting</Link>
        </Button>
      </div>
    );
  }

  const summary = summarizeMatches(work.matches);
  const cards = [
    { label: "Total Matches", value: summary.total, icon: Layers, color: "text-cyan-300" },
    { label: "Exact Matches", value: summary.exact, icon: Copy, color: "text-cyan-200" },
    { label: "Near-Duplicates", value: summary.nearDuplicates, icon: Copy, color: "text-amber-300" },
    { label: "Flagged Illegal", value: summary.flaggedIllegal, icon: ShieldAlert, color: "text-rose-400" },
    { label: "Legal / Credited", value: summary.legal, icon: CheckCircle2, color: "text-emerald-400" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Scan report</p>
          <h1 className="text-3xl font-semibold tracking-tight">{work.title}</h1>
          <p className="mt-1 font-mono text-sm text-cyan-300">{work.fingerprint.display}</p>
        </div>
        {summary.flaggedIllegal > 0 ? (
          <span className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-4 w-4" /> At risk — {summary.flaggedIllegal} uncredited copies
          </span>
        ) : (
          <span className="flex items-center gap-2 text-emerald-400">Protected</span>
        )}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="p-4">
              <c.icon className={`mb-2 h-4 w-4 ${c.color}`} />
              <div className="text-2xl font-semibold">{c.value}</div>
              <div className="text-xs text-zinc-500">{c.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as ResultFilter)}
        className="mt-8"
      >
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
