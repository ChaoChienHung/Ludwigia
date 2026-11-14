import React, { useState, useEffect } from "react";
import { Writing, FLOWER_PROFILES } from "../types";
import { AudioEngine } from "./AudioEngine";
import { ArrowLeft, ArrowRight, RefreshCw, Layers, Sparkles, Heart, Info, X, Zap, Clock } from "lucide-react";
import { FlowerRenderer } from "./FlowerRenderer";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface PatchViewProps {
  selectedTag: string;
  writing: Writing[];
  onBackToGarden: () => void;
  initialWritingIdToExpand?: string;
}

export const PatchView: React.FC<PatchViewProps> = ({
  selectedTag,
  writing,
  onBackToGarden,
  initialWritingIdToExpand,
}) => {
  // Filter writing belonging to this specific tag
  const patchWriting = writing.filter((a) => a.tags.includes(selectedTag));

  // Flip state map: ID to isFlipped
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  
  // Expand state: holds the Writing object to be magnified and type "article" or "flower"
  const [expandedContent, setExpandedContent] = useState<{
    article: Writing;
    type: "article" | "flower";
  } | null>(null);

  // Auto-expand card if redirected directly from a flower hover click in the garden
  useEffect(() => {
    if (initialWritingIdToExpand) {
      const art = patchWriting.find((a) => a.id === initialWritingIdToExpand);
      if (art) {
        setExpandedContent({ article: art, type: "article" });
      }
    }
  }, [initialWritingIdToExpand, patchWriting]);

  // Flip a single card
  const handleFlipCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click expansion
    AudioEngine.playFlip();
    setFlippedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Flip all cards in this cluster
  const handleFlipAll = () => {
    AudioEngine.playFlip();
    const anyUnflipped = patchWriting.some((a) => !flippedMap[a.id]);
    const nextMap: Record<string, boolean> = {};
    patchWriting.forEach((a) => {
      nextMap[a.id] = anyUnflipped;
    });
    setFlippedMap(nextMap);
  };

  const handleExpandCard = (art: Writing, type: "article" | "flower") => {
    AudioEngine.playChime(1.15);
    setExpandedContent({ article: art, type });
  };

  const currentExpandedIndex = expandedContent
    ? patchWriting.findIndex((a) => a.id === expandedContent.article.id)
    : -1;
  const canGoPrev = expandedContent ? currentExpandedIndex > 0 : false;
  const canGoNext = expandedContent
    ? currentExpandedIndex >= 0 && currentExpandedIndex < patchWriting.length - 1
    : false;
  const stripLeadingTitleHeading = (markdown: string, title: string) => {
    const text = String(markdown || "").replace(/\r\n?/g, "\n");
    const lines = text.split("\n");
    const firstNonEmpty = lines.findIndex((line) => line.trim() !== "");
    if (firstNonEmpty < 0) return text.trim();
    const first = lines[firstNonEmpty].trim();
    const normalizedTitle = String(title || "").trim().toLowerCase();
    if (first.startsWith("# ")) {
      const headingTitle = first.slice(2).trim().toLowerCase();
      if (headingTitle === normalizedTitle) {
        lines.splice(firstNonEmpty, 1);
      }
    }
    while (lines.length && lines[0].trim() === "") lines.shift();
    return lines.join("\n").trim();
  };
  const previewContent = (art: Writing) => stripLeadingTitleHeading(String(art.previewMarkdown || art.summary || ""), art.title);
  const previewSummary = (art: Writing) => String(art.summary || "").trim();
  const fullContent = (art: Writing) => stripLeadingTitleHeading(String(art.content || ""), art.title);

  const goPrev = () => {
    if (!expandedContent) return;
    if (currentExpandedIndex <= 0) return;
    const nextWriting = patchWriting[currentExpandedIndex - 1];
    if (!nextWriting) return;
    AudioEngine.playChime(1.05);
    setExpandedContent({ article: nextWriting, type: expandedContent.type });
  };

  const goNext = () => {
    if (!expandedContent) return;
    if (currentExpandedIndex < 0 || currentExpandedIndex >= patchWriting.length - 1) return;
    const nextWriting = patchWriting[currentExpandedIndex + 1];
    if (!nextWriting) return;
    AudioEngine.playChime(1.05);
    setExpandedContent({ article: nextWriting, type: expandedContent.type });
  };

  useEffect(() => {
    const isEditableTarget = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget()) return;

      if (e.key === "Escape" && expandedContent) {
        e.preventDefault();
        AudioEngine.playChime(0.9);
        setExpandedContent(null);
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleFlipAll();
        return;
      }

      if (!expandedContent) return;
      if (e.key === "ArrowLeft") {
        if (!canGoPrev) return;
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        if (!canGoNext) return;
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expandedContent, canGoNext, canGoPrev, currentExpandedIndex, patchWriting, flippedMap]);

  const formatTag = (value: string) => {
    const v = String(value || "").trim();
    if (!v) return "";
    return v
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ");
  };

  const getDocType = (art: Writing) => {
    const id = String((art as any).id || "");
    if (id.startsWith("writing/") || id.includes("/writing/")) return "Writing";
    if (id.startsWith("canvas/") || id.includes("/canvas/")) return "Canvas";
    return "Note";
  };

  return (
    <div className="space-y-8 animate-fade-in text-emerald-100">
      {/* Top Banner Cluster Description */}
      <div className="relative p-6 md:p-8 rounded-3xl border border-[#142d22] bg-[#0c1411]/80 backdrop-blur-sm overflow-hidden shadow-xl min-h-[160px] flex flex-col justify-between">
        {/* Background decorative leaf */}
        <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-emerald-950/25 w-36 h-36 select-none pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            <path d="M50,90 C30,70 10,50 10,30 C10,15 25,5 40,5 C45,5 50,10 50,10 C50,10 55,5 60,5 C75,5 90,15 90,30 C90,50 70,70 50,90 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-accent font-bold text-emerald-400">
              <span>GARDEN PATCH</span>
            </div>
            <h2 className="font-accent font-black text-[#10b981] mt-2">
              <span className="italic font-normal bg-[#05110d]/90 px-4 py-2 rounded-xl border border-[#1c3c31]/50 inline-block max-w-full text-lg sm:text-xl md:text-2xl lg:text-3xl break-words leading-normal">
                {formatTag(selectedTag)}
              </span>
            </h2>
            <p className="font-sans text-sm md:text-[15px] text-emerald-600/90 mt-3 leading-7">
              You are exploring this dedicated botanical bed. There are <strong>{patchWriting.length}</strong> mental sprout{patchWriting.length === 1 ? "" : "s"} thriving here. Click on any specimen card to magnify the notes or flip them to read their symbolic definitions.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-end mt-2 md:mt-0">
            <button
              onClick={handleFlipAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981]/15 hover:bg-[#10b981]/35 text-[#10b981] border border-[#10b981]/35 text-sm font-accent font-bold transition shadow-md cursor-pointer"
              title="Flip all specimen card states"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip Cluster Cards</span>
            </button>

            <button
              onClick={() => {
                AudioEngine.playChime(0.9);
                onBackToGarden();
              }}
              className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-[#047857]/45 bg-[#10b981] hover:bg-[#34d399] text-[#030605] text-sm font-accent font-black transition cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.25)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Garden</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Dual-Sided Specimen Cards */}
      {patchWriting.length > 0 ? (
        <div id="patch-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {patchWriting.map((art) => {
            const isFlipped = !!flippedMap[art.id];
            const fk = art.flowerName || "Daisy";
            const p = FLOWER_PROFILES[fk] || FLOWER_PROFILES.Daisy;

            return (
              <div
                key={art.id}
                className="group relative h-[420px] w-full perspective-1000"
              >
                {/* Luminous neon back glow on card hover */}
                <div 
                  className={`absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition duration-500 pointer-events-none bg-gradient-to-tr from-[#10b981]/15 to-transparent`}
                ></div>

                {/* THE 3D FLIPPING CARD CORE */}
                <div
                  className={`relative w-full h-full duration-700 preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
                  
                  {/* FACE A: ARTICLE FRONT (0 DEGREES ROTATION) */}
                  <div 
                    onClick={() => handleExpandCard(art, "article")}
                    className={`absolute inset-0 w-full h-full rounded-2xl border border-[#163529]/60 bg-[#070f0c] backface-hidden flex flex-col justify-between p-6 shadow-xl hover:border-[#10b981]/50 transition duration-350 cursor-pointer ${
                      isFlipped ? "pointer-events-none" : "pointer-events-auto"
                    }`}
                  >
                    <div>
                      {/* Content */}
                      <div className="space-y-4.5">
                        {/* Little geometric leaf detail */}
                        <div className="text-emerald-900/40 w-8 h-8">
                          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                            <path d="M50,10 Q65,40 50,70 Q35,40 50,10" fill={p.svgColor} opacity="0.3" />
                          </svg>
                        </div>

                        <h4 className="font-accent font-bold text-[22px] md:text-[25px] text-white leading-[1.18] tracking-tight group-hover:text-[#10b981] transition-colors">
                          {art.title}
                        </h4>
                        
                        <div className="pt-1.5 max-h-[9.75rem] overflow-hidden">
                          <p className="font-sans text-[14px] sm:text-[15px] leading-7 text-emerald-200/88 my-0">
                            {previewSummary(art) || previewContent(art)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Flip trigger */}
                    <div className="border-t border-[#122b21] pt-4 flex items-center justify-between relative z-20">
                      <span className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#10b981] uppercase">
                        <Clock className="w-4 h-4 text-[#10b981] stroke-[2.5]" />
                        <span>{art.readingTime}</span>
                      </span>

                      <button
                        onClick={(e) => handleFlipCard(art.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#091511] hover:bg-[#10b981] text-emerald-400 hover:text-[#0b1310] border border-[#143025] hover:border-[#10b981] font-accent font-bold text-3xs transition duration-200 cursor-pointer relative z-30"
                        title="Rotate to inspect flora card"
                      >
                        <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-18" />
                        <span>Inspect Flora</span>
                      </button>
                    </div>
                  </div>

                  {/* FACE B: FLOWER BACK (180 DEGREES ROTATION) */}
                  <div 
                    onClick={() => handleExpandCard(art, "flower")}
                    className={`absolute inset-0 w-full h-full rounded-2xl border border-[#1c382b] bg-[#0c1411] rotate-y-180 backface-hidden flex flex-col justify-between p-6 shadow-xl hover:border-amber-500/50 transition duration-350 cursor-pointer ${
                      isFlipped ? "pointer-events-auto" : "pointer-events-none"
                    }`}
                  >
                    <div>
                      {/* Top Rib */}
                      <div className="flex items-center justify-between border-b border-[#142e23] pb-3">
                        <span className="flex items-center gap-1 text-[13px] font-accent font-black text-amber-400 uppercase">
                          {p.emoji} <span className="tracking-tight">{p.name} Specimen</span>
                        </span>
                        <span className="font-mono text-3xs italic text-emerald-700">
                          {p.botanicalName}
                        </span>
                      </div>

                      {/* Unique Flower Render & Symbolism */}
                      <div className="mt-5 flex flex-col items-center text-center space-y-4">
                        {/* Dynamic Species Flower Render inside card back */}
                        <div className="relative w-24 h-24 bg-[#050a08] border border-[#153428] rounded-2xl flex items-center justify-center p-3.5 shadow-inner">
                          <FlowerRenderer
                            flowerName={fk}
                            svgColor={p.svgColor}
                            size={72}
                            className="transition-transform duration-300 hover:scale-110"
                          />
                        </div>

                        <div>
                          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-accent font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
                            Symbolism: {p.language}
                          </div>
                          
                          <p className="font-sans text-xs text-emerald-600/90 leading-relaxed font-light mt-3 line-clamp-3">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Flip back */}
                    <div className="border-t border-[#142d23] pt-4 flex items-center justify-between relative z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandCard(art, "flower");
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-400 text-amber-400 hover:text-[#0b1310] border border-amber-500/20 hover:border-amber-400 font-accent font-bold text-3xs transition duration-200 cursor-pointer relative z-30"
                        title="View detailed botanical lore"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>Flora Lore</span>
                      </button>

                      <button
                        onClick={(e) => handleFlipCard(art.id, e)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0d211a] hover:bg-[#10b981] text-emerald-400 hover:text-[#0b1310] border border-[#143025] hover:border-[#10b981] font-accent font-bold text-3xs transition duration-200 cursor-pointer relative z-30"
                        title="Rotate to read content"
                      >
                        <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-18" />
                        <span>Back</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div id="patch-empty" className="flex flex-col items-center justify-center py-16 px-6 rounded-2xl border border-dashed border-[#163024] bg-[#07100d] text-center">
          <Layers className="w-8 h-8 text-emerald-800 animate-pulse-ring" />
          <h3 className="font-accent font-bold text-lg text-emerald-100 mt-4">This Cluster is Empty</h3>
          <p className="font-sans text-xs text-emerald-700 mt-1 max-w-sm">
            No thoughts are located in this soil patch boundary yet.
          </p>
        </div>
      )}

      {/* DETAIL OVERLAY SCREEN (CARD CONTEXT MAGNIFICATION MODAL) */}
      {expandedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          {/* Scrollable Container Box with smooth gradual rising animate-slide-up */}
          <div className="relative w-full max-w-3xl h-[88vh] md:h-[82vh] rounded-3xl bg-[#09100e] border border-[#163529] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Ribbon Header */}
            <div className="flex items-center justify-between p-4.5 md:p-5 border-b border-[#142e22] bg-[#050a08]/80">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 rounded-full text-2xs font-accent font-black bg-emerald-500/10 text-[#10b981] border border-emerald-500/25 uppercase">
                  {expandedContent.type === "article" ? getDocType(expandedContent.article) : "Flora Codex"}
                </span>
                <span className="text-emerald-850">•</span>
                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest font-bold">
                  {expandedContent.article.tags.slice(0, 3).map(formatTag).join(" , ")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={!canGoPrev}
                  className="p-1.5 rounded-full bg-[#12241f] text-emerald-400 hover:bg-[#1b2f28] border border-[#163028] transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  disabled={!canGoNext}
                  className="p-1.5 rounded-full bg-[#12241f] text-emerald-400 hover:bg-[#1b2f28] border border-[#163028] transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    AudioEngine.playChime(0.9);
                    setExpandedContent(null);
                  }}
                  className="p-1.5 rounded-full bg-[#12241f] text-emerald-400 hover:bg-rose-950 hover:text-rose-400 border border-[#163028] hover:border-rose-900 transition flex items-center justify-center cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* EXPANDED CONTENT VIEWPORT */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-thin">
              {expandedContent.type === "article" ? (
                /* --- FULL ARTICLE VIEWPORT --- */
                <article className="max-w-none focus:outline-none space-y-7">
                  {/* Banner detail */}
                  <div className="border-b border-[#142d23] pb-5">
                    <h1 className="font-accent font-black text-[2rem] md:text-[2.45rem] text-white leading-[1.08] tracking-tight">
                      {expandedContent.article.title}
                    </h1>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 font-bold mt-3.5">
                      <Clock className="w-4 h-4 text-[#10b981] stroke-[2.5]" />
                      <span>Reading Duration: {expandedContent.article.readingTime}</span>
                    </div>
                  </div>

                  {/* Optional Custom Cover Image */}
                  {expandedContent.article.imageUrl && (
                    <div className="w-full aspect-[21/9] overflow-hidden rounded-2xl border border-[#153428] bg-black shadow-lg relative my-2">
                      <img
                        src={expandedContent.article.imageUrl}
                        alt={expandedContent.article.title}
                        className="w-full h-full object-cover opacity-85 hover:opacity-100 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Summary Abstract Banner */}
                  <div className="p-5 rounded-2xl border border-dashed border-[#10b981]/25 bg-[#071310]/80 text-[#a7f3d0] text-sm leading-7 font-sans font-light italic">
                    <strong className="text-[#10b981] font-accent font-bold block mb-1.5 text-[12px] uppercase tracking-[0.18em]">Summary</strong>
                    <p className="mt-1 leading-7">{expandedContent.article.summary}</p>
                  </div>

                  {/* Full body markdown text content */}
                  <div className="pt-2">
                    <MarkdownRenderer content={fullContent(expandedContent.article)} />
                  </div>
                </article>
              ) : (
                /* --- FULL BOTANICAL SPECIMEN VIEWPORT --- */
                <div className="space-y-6">
                  {(() => {
                    const fk = expandedContent.article.flowerName || "Daisy";
                    const p = FLOWER_PROFILES[fk] || FLOWER_PROFILES.Daisy;
                    return (
                      <div className="space-y-6">
                        {/* Botanical header sheet */}
                        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-[#142d23]">
                          {/* Giant decorative swaying vector flower in specimen modal */}
                          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#050a08]/50 border border-[#163529] rounded-2xl flex items-center justify-center p-4 relative flex-shrink-0 animate-pulse-ring">
                            <span className="absolute top-2 right-2 text-yellow-500 animate-bounce">
                              <Sparkles className="w-4 h-4" />
                            </span>
                            <FlowerRenderer
                              flowerName={fk}
                              svgColor={p.svgColor}
                              size={80}
                              className="transition-transform duration-300 hover:scale-110"
                            />
                          </div>

                          <div className="text-center md:text-left space-y-1.5">
                            <span className="px-3 py-1 rounded-full text-3xs font-accent font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              BOTANICAL CATALOG
                            </span>
                            <h2 className="font-accent font-black text-3xl text-white mt-1.5">
                              {p.name} <span className="normal-case italic text-emerald-500 text-lg md:text-xl ml-1">({p.botanicalName})</span>
                            </h2>
                            <p className="font-mono text-xs italic text-emerald-600 font-light pt-0.5">
                              Taxon classification: {p.botanicalName}
                            </p>
                          </div>
                        </div>

                        {/* Interactive details section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                            <span className="flex items-center gap-1.5 text-xs font-accent font-bold text-amber-400 uppercase">
                              <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
                              Flower Symbolism (Language)
                            </span>
                            <p className="font-accent text-[16px] font-bold text-amber-300 pt-1">
                              "{p.language}"
                            </p>
                            <p className="font-sans text-xs text-emerald-700/90 leading-relaxed pt-2">
                              Passed down generations, this botanical language whispers deep feelings of loyalty and life. In this Garden of Ludwigia, it grows alongside my intellectual notebook.
                            </p>
                          </div>

                          <div className="p-5 rounded-2xl bg-[#10b981]/5 border border-[#10b981]/10 space-y-2">
                            <span className="flex items-center gap-1.5 text-xs font-accent font-bold text-emerald-400 uppercase">
                              <Zap className="w-4 h-4 text-[#10b981]" />
                              Watering & Care Guide
                            </span>
                            <div className="text-2xs space-y-1.5 font-sans text-emerald-680 pt-1 leading-relaxed">
                              <p>⚡ <strong>Luminosity</strong>: Prospers well in digital biophilic zones under the soft ambient chimes.</p>
                              <p>💧 <strong>Watering Strategy</strong>: Every time you review, highlight, or ponder on this cluster, you supply key moisture to prevent wilting.</p>
                              <p>🌱 <strong>Connection</strong>: Dynamically coordinates with the cognitive paper: <em>{expandedContent.article.title}</em>.</p>
                            </div>
                          </div>
                        </div>

                        {/* Botanical sheet lore detailed paragraphs */}
                        <div className="space-y-3.5 pt-3">
                          <h4 className="font-sub font-bold text-base text-white">
                            Taxonomical Lore & Chronology
                          </h4>
                          <p className="font-sans text-xs md:text-sm text-emerald-600/95 leading-relaxed text-left">
                            {p.description} Structurally resilient under various environmental budgets, the {p.name} blooms gracefully throughout all digital seasons. It represents a highly delicate fusion of geometry and human introspection.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Bottom control panel */}
            <div className="p-4 md:p-5 border-t border-[#142d22] bg-[#050a08]/80 flex items-center justify-between">
              {/* Toggle switch between Writing and Specimen within Modal */}
              <button
                onClick={() => {
                  AudioEngine.playFlip();
                  setExpandedContent({
                    article: expandedContent.article,
                    type: expandedContent.type === "article" ? "flower" : "article",
                  });
                }}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 hover:text-amber-300 font-accent font-bold text-xs tracking-wide transition duration-150 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch to {expandedContent.type === "article" ? "【Flora Catalog】" : `【Read ${getDocType(expandedContent.article)}】`}</span>
              </button>

              <button
                onClick={() => {
                  AudioEngine.playChime(0.9);
                  setExpandedContent(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#12241f] hover:bg-[#10b981] border border-[#163228] text-emerald-300 hover:text-[#0b1310] text-xs font-accent font-bold tracking-wide transition cursor-pointer"
              >
                Close Specimen
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
