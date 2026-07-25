import { Writing, FLOWER_PROFILES } from "./types";

type GardenIndexItem = {
  title: string;
  url: string;
  tags?: string[];
  summary?: string;
  content?: string;
  content_markdown?: string;
  preview_markdown?: string;
  kind?: string;
};

declare global {
  interface Window {
    SITE_SEARCH_INDEX?: GardenIndexItem[];
  }
}

const hashString = (input: string) => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const estimateReadingTime = (text: string) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min`;
};

const pickFlowerName = (seed: string): string => {
  const keys = Object.keys(FLOWER_PROFILES);
  const idx = hashString(seed) % keys.length;
  return keys[idx] || "Daisy";
};

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  return [];
};

const clampText = (text: string, limit: number) => {
  const t = String(text || "");
  if (t.length <= limit) return t;
  return `${t.slice(0, limit)}…`;
};

const toISODate = (raw: unknown) => {
  const d = raw ? new Date(String(raw)) : null;
  if (!d || Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
};

const toWriting = (item: GardenIndexItem): Writing => {
  const contentMarkdown = String(item.content_markdown || item.preview_markdown || item.content || item.summary || "");
  const content = contentMarkdown || String(item.content || item.summary || "");
  const summary = String(item.summary || clampText(content, 220));
  const date = toISODate((item as any).date);
  const tags = normalizeTags(item.tags);
  return {
    id: String(item.url || item.title),
    title: String(item.title || "Untitled"),
    summary,
    content: contentMarkdown || clampText(content, 4200),
    previewMarkdown: String(item.preview_markdown || ""),
    tags,
    flowerName: pickFlowerName(String(item.title || item.url || "")),
    date,
    readingTime: estimateReadingTime(content),
  };
};

export const INITIAL_ARTICLES: Writing[] = (() => {
  const items = (typeof window !== "undefined" && Array.isArray((window as any).SITE_SEARCH_INDEX))
    ? (window as any).SITE_SEARCH_INDEX
    : [];
  return items.filter((i) => i && i.url && i.title).map((i) => toWriting(i));
})();
