"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FileAudio, FileText, ImageIcon, ScanSearch, UploadCloud } from "lucide-react";
import { ScanGlobe } from "@/components/scan-globe";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generateFingerprint, inferContentType, mockS3Url } from "@/lib/fingerprint";
import { SCAN_LOG_LINES, simulateScan } from "@/lib/simulate-scan";
import { upsertWork } from "@/lib/storage";
import type { ContentType, Fingerprint, WorkRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type Phase = "idle" | "extract" | "fingerprint" | "index" | "ready" | "scanning";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string>();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [fp, setFp] = useState<Fingerprint | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<WorkRecord | null>(null);

  const contentType: ContentType | null = useMemo(() => {
    if (file) return inferContentType(file);
    if (text.trim()) return "text";
    return null;
  }, [file, text]);

  const onDrop = useCallback((accepted: File[]) => {
    const next = accepted[0];
    if (!next) return;
    setPhase("idle");
    setProgress(0);
    setFp(null);
    setLogs([]);
    workRef.current = null;
    setFile(next);
    setText("");
    if (next.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(String(reader.result));
      reader.readAsDataURL(next);
    } else if (next.type === "text/plain") {
      next.text().then(setText);
      setPreview(undefined);
    } else {
      setPreview(undefined);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav", ".wave"],
      "text/plain": [".txt"],
    },
  });

  useEffect(() => {
    if (!file || phase !== "idle") return;
    const content = inferContentType(file);
    const seed = `${file.name}-${file.size}`;
    const title = file.name;
    const id = `work_${Date.now().toString(36)}`;
    const fingerprint = generateFingerprint(content, seed);
    setFp(fingerprint);
    setPhase("extract");
    setProgress(8);

    const work: WorkRecord = {
      id,
      title,
      contentType: content,
      fingerprint,
      uploadedAt: new Date().toISOString(),
      s3Url: mockS3Url(id, title),
      previewUrl: preview,
      textExcerpt: content === "text" ? text.slice(0, 280) : undefined,
      matches: [],
    };
    workRef.current = work;
  }, [file, phase, preview, text]);

  useEffect(() => {
    if (workRef.current && preview) {
      workRef.current = { ...workRef.current, previewUrl: preview };
    }
  }, [preview]);

  function fingerprintText() {
    if (!text.trim()) return;
    setPhase("idle");
    setProgress(0);
    setLogs([]);
    const id = `work_${Date.now().toString(36)}`;
    const fingerprint = generateFingerprint("text", text.slice(0, 80));
    setFp(fingerprint);
    const work: WorkRecord = {
      id,
      title: "Pasted manuscript",
      contentType: "text",
      fingerprint,
      uploadedAt: new Date().toISOString(),
      s3Url: mockS3Url(id, "manuscript.txt"),
      textExcerpt: text.slice(0, 280),
      matches: [],
    };
    workRef.current = work;
    setPhase("extract");
    setProgress(8);
  }

  useEffect(() => {
    if (phase !== "extract" && phase !== "fingerprint" && phase !== "index") return;
    const timers: number[] = [];
    if (phase === "extract") {
      timers.push(
        window.setInterval(() => {
          setProgress((p) => {
            if (p >= 34) {
              setPhase("fingerprint");
              return 38;
            }
            return p + 2;
          });
        }, 40),
      );
    }
    if (phase === "fingerprint") {
      timers.push(
        window.setInterval(() => {
          setProgress((p) => {
            if (p >= 72) {
              setPhase("index");
              return 76;
            }
            return p + 2;
          });
        }, 45),
      );
    }
    if (phase === "index") {
      timers.push(
        window.setInterval(() => {
          setProgress((p) => {
            if (p >= 100) {
              setPhase("ready");
              return 100;
            }
            return p + 2;
          });
        }, 35),
      );
    }
    return () => timers.forEach(clearInterval);
  }, [phase]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  async function runScan() {
    const work = workRef.current;
    if (!work) return;
    setPhase("scanning");
    setLogs([]);

    for (let i = 0; i < SCAN_LOG_LINES.length; i++) {
      await new Promise((r) => setTimeout(r, 380));
      setLogs((l) => [...l, SCAN_LOG_LINES[i]]);
    }

    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: work.contentType, seed: work.id }),
    });
    const data = res.ok
      ? await res.json()
      : { matches: simulateScan(work.contentType, work.id) };

    const complete: WorkRecord = { ...work, previewUrl: preview, matches: data.matches };
    upsertWork(complete);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/dashboard");
  }

  const stepLabel =
    phase === "extract"
      ? "Extracting features..."
      : phase === "fingerprint"
        ? "Generating unique fingerprint..."
        : phase === "index"
          ? "Indexing to vector database..."
          : phase === "ready"
            ? "Fingerprint indexed"
            : phase === "scanning"
              ? "Live web scan"
              : "Awaiting upload";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Upload & fingerprint</h1>
      <p className="mt-2 text-zinc-400">
        Drop an image, audio file, or text. We simulate perceptual hashing, spectrograms, and embeddings.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card
          {...getRootProps()}
          className={cn(
            "cursor-pointer p-8 text-center",
            isDragActive && "border-cyan-400/60 shadow-[0_0_32px_rgba(34,211,238,0.2)]",
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-10 w-10 text-cyan-300" />
          <p className="mt-3 text-sm text-zinc-300">
            Drag & drop JPG, PNG, WEBP, MP3, WAV, or TXT
          </p>
          <p className="mt-1 text-xs text-zinc-500">or click to browse</p>
          {file && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-cyan-200">
              {contentType === "image" && <ImageIcon className="h-4 w-4" />}
              {contentType === "audio" && <FileAudio className="h-4 w-4" />}
              {contentType === "text" && <FileText className="h-4 w-4" />}
              {file.name}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <label className="text-sm text-zinc-400">Or paste text</label>
          <textarea
            value={file && file.type !== "text/plain" ? "" : text}
            onChange={(e) => {
              setText(e.target.value);
              setFile(null);
              setPreview(undefined);
              setPhase("idle");
              setFp(null);
              setProgress(0);
            }}
            placeholder="Paste article, lyrics, or manuscript..."
            className="mt-2 h-36 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-zinc-200 outline-none focus:border-cyan-400/40"
          />
          <Button
            className="mt-3"
            variant="outline"
            disabled={!text.trim() || !!file}
            onClick={fingerprintText}
          >
            Fingerprint text
          </Button>
        </Card>
      </div>

      {phase !== "idle" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-cyan-200">{stepLabel}</span>
              <span className="text-zinc-500">{progress}%</span>
            </div>
            <Progress value={progress} />
            <div className="mt-6 grid gap-3 text-xs md:grid-cols-3">
              {["Extracting features...", "Generating unique fingerprint...", "Indexing to vector database..."].map(
                (label, i) => {
                  const done =
                    (i === 0 && progress >= 34) ||
                    (i === 1 && progress >= 72) ||
                    (i === 2 && phase === "ready") ||
                    phase === "scanning";
                  const active =
                    (i === 0 && phase === "extract") ||
                    (i === 1 && phase === "fingerprint") ||
                    (i === 2 && phase === "index");
                  return (
                    <div
                      key={label}
                      className={cn(
                        "rounded-lg border px-3 py-2",
                        done || active
                          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                          : "border-white/10 text-zinc-500",
                      )}
                    >
                      {i + 1}. {label.replace("...", "")}
                    </div>
                  );
                },
              )}
            </div>
            {fp && (phase === "fingerprint" || phase === "index" || phase === "ready" || phase === "scanning") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 rounded-lg border border-cyan-400/20 bg-black/40 p-4 font-mono text-cyan-200"
              >
                <div className="text-[11px] uppercase tracking-widest text-zinc-500">
                  {fp.algorithm} · mock Pinecone vector
                </div>
                <div className="mt-1 text-lg">{fp.display}</div>
                <div className="mt-2 truncate text-[11px] text-zinc-500">
                  [{fp.embeddingPreview.join(", ")} …]
                </div>
              </motion.div>
            )}
            {(phase === "ready" || phase === "scanning") && (
              <Button className="mt-6" size="lg" disabled={phase === "scanning"} onClick={runScan}>
                <ScanSearch className="mr-2 h-4 w-4" /> Scan the Web
              </Button>
            )}
          </Card>
        </motion.div>
      )}

      {phase === "scanning" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 grid gap-6 md:grid-cols-2">
          <ScanGlobe />
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-white/10 px-4 py-2 text-xs text-zinc-500">
              copyradar-scan — zsh
            </div>
            <div
              ref={logRef}
              className="h-64 overflow-auto bg-black/50 p-4 font-mono text-xs leading-6 text-emerald-300"
            >
              {logs.map((line) => (
                <div key={line}>{line}</div>
              ))}
              <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
