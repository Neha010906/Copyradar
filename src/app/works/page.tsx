"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AudioLines, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadWorks, setActiveWorkId } from "@/lib/storage";
import type { WorkRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function WorksPage() {
  const [works, setWorks] = useState<WorkRecord[]>([]);

  useEffect(() => {
    setWorks(loadWorks());
  }, []);

  if (works.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">No works yet</h1>
        <p className="mt-2 text-zinc-400">Fingerprint your first file to start monitoring the web.</p>
        <Button asChild className="mt-6">
          <Link href="/upload">Upload a work</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">My Works</h1>
      <p className="mt-2 text-zinc-400">Every indexed asset and its latest scan.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {works.map((w, i) => {
          const illegal = w.matches.filter((m) => m.illegal).length;
          const atRisk = illegal > 0;
          const Icon = w.contentType === "audio" ? AudioLines : w.contentType === "text" ? FileText : ImageIcon;
          return (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/works/${w.id}`} onClick={() => setActiveWorkId(w.id)}>
                <Card className="overflow-hidden">
                  <div className="flex h-36 items-center justify-center bg-white/[0.03]">
                    {w.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={w.previewUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Icon className="h-10 w-10 text-cyan-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="truncate font-medium">{w.title}</h2>
                      <Badge
                        className={
                          atRisk
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        }
                      >
                        {atRisk ? "🔴 At Risk" : "🟢 Protected"}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate font-mono text-xs text-cyan-300">{w.fingerprint.display}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatDate(w.uploadedAt)} · {w.matches.length} matches
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
