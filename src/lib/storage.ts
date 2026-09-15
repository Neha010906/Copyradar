import type { WorkRecord } from "./types";

const WORKS_KEY = "copyradar_works";
const ACTIVE_KEY = "copyradar_active_work";

export function loadWorks(): WorkRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WORKS_KEY);
    return raw ? (JSON.parse(raw) as WorkRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveWorks(works: WorkRecord[]) {
  localStorage.setItem(WORKS_KEY, JSON.stringify(works));
}

export function upsertWork(work: WorkRecord) {
  const works = loadWorks().filter((w) => w.id !== work.id);
  works.unshift(work);
  saveWorks(works);
  setActiveWorkId(work.id);
}

export function getWork(id: string) {
  return loadWorks().find((w) => w.id === id);
}

export function setActiveWorkId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveWork(): WorkRecord | undefined {
  const id = localStorage.getItem(ACTIVE_KEY);
  const works = loadWorks();
  if (id) {
    const found = works.find((w) => w.id === id);
    if (found) return found;
  }
  return works[0];
}
