import React, { useState } from "react";
import { Writing, FLOWER_PROFILES } from "../types";
import { X, Sparkles, Sprout, Tag, Check, HelpCircle } from "lucide-react";
import { FlowerRenderer } from "./FlowerRenderer";
import { AudioEngine } from "./AudioEngine";

interface SeedPlanterProps {
  isOpen: boolean;
  onClose: () => void;
  onPlant: (article: Writing) => void;
  existingTags: string[];
}

export const SeedPlanter: React.FC<SeedPlanterProps> = ({
  isOpen,
  onClose,
  onPlant,
  existingTags,
}) => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [selectedFlower, setSelectedFlower] = useState("Daisy");
  const [imageUrl, setImageUrl] = useState("");
  
  // Custom tag input
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    AudioEngine.playChime(1.0);
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (!clean) return;
    
    AudioEngine.playChime(1.1);
    if (!selectedTags.includes(clean)) {
      setSelectedTags(prev => [...prev, clean]);
    }
    setTagInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim() || selectedTags.length === 0) {
      alert("Please fill in all notes fields and categorize with at least one Tag Sprout!");
      return;
    }

    const newWriting: Writing = {
      id: "custom-" + Date.now().toString(36),
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      tags: selectedTags,
      flowerName: selectedFlower,
      date: new Date().toISOString().split("T")[0],
      readingTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 150))} min`,
      isCustom: true,
      imageUrl: imageUrl.trim() || undefined,
    };

    AudioEngine.playPlant();
    onPlant(newWriting);
    
    // Reset state
    setTitle("");
    setSummary("");
    setContent("");
    setSelectedTags([]);
    setSelectedFlower("Daisy");
    setImageUrl("");
    onClose();
  };

  const currentProfile = FLOWER_PROFILES[selectedFlower] || FLOWER_PROFILES.Daisy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        id="seed-planter-container"
        className="relative w-full max-w-4xl h-[90vh] md:h-[84vh] rounded-3xl bg-[#08100d] border border-[#143224] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-float text-emerald-100"
      >
        {/* Left Side: Dynamic Botanical Preview Column */}
        <div className="w-full md:w-[35%] bg-gradient-to-b from-[#0b1713] to-[#040907] border-b md:border-b-0 md:border-r border-[#122e21] p-6 flex flex-col justify-between items-center text-center">
          <div className="space-y-4 w-full">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-3xs font-accent font-black tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
              <Sprout className="w-3.5 h-3.5 text-amber-500" />
              Sow Seed Preview
            </span>
            <div className="pt-4 flex flex-col items-center">
              {/* Dynamic specimen box with scale animations */}
              <div className="w-36 h-36 bg-[#040706] border border-[#1c3c30] rounded-2xl flex items-center justify-center shadow-inner relative group animate-pulse-ring">
                <span className="absolute top-2 right-2 text-yellow-500 animate-spin-slow">
                  <Sparkles className="w-4 h-4" />
                </span>
                <FlowerRenderer
                  flowerName={selectedFlower}
                  svgColor={currentProfile.svgColor}
                  size={96}
                  className="animate-sway-delayed transition-transform duration-300 hover:scale-110"
                />
              </div>
              <h3 className="font-accent font-black text-2xl text-white mt-5">
                {currentProfile.name}
              </h3>
              <p className="font-mono text-2xs italic text-emerald-600 mt-1">
                {currentProfile.botanicalName}
              </p>
            </div>
          </div>

          {/* Plant Lore */}
          <div className="p-4 rounded-xl bg-[#060c0a] border border-[#132c21] max-w-xs mt-6 md:mt-0">
            <h4 className="text-3xs font-accent font-bold text-amber-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Symbolic Lore
            </h4>
            <span className="text-xs font-bold text-[#fafafa] italic">
              "{currentProfile.language}"
            </span>
            <p className="font-sans text-3xs text-emerald-600/90 leading-relaxed mt-2 text-justify">
              {currentProfile.description}
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Wizard Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between h-full bg-[#08110e]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#142d22] bg-[#050a08]/80">
            <div className="flex items-center gap-2">
              <span className="p-1 px-3 rounded-full text-2xs font-accent font-black bg-emerald-500/10 text-[#10b981] border border-emerald-500/25 uppercase">
                🌱 Plant New Idea Sprout
              </span>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#12241f] text-emerald-400 hover:bg-rose-950 hover:text-rose-400 border border-[#163028] hover:border-rose-900 transition flex items-center justify-center cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Scrollable Form Fields */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
            {/* Thought Title */}
            <div className="space-y-2">
              <label className="block text-2xs font-accent font-bold uppercase tracking-wider text-emerald-500">
                Sprout Title:
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#040807]/90 text-emerald-100 px-4 py-3 rounded-xl border border-[#163529]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all placeholder-emerald-900"
                placeholder="Give my research or insight a short, vivid title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Specimen Selection Grid */}
            <div className="space-y-2">
              <label className="block text-2xs font-accent font-bold uppercase tracking-wider text-emerald-500">
                Select Floral Species:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {Object.keys(FLOWER_PROFILES).map((key) => {
                  const prof = FLOWER_PROFILES[key];
                  const isSelected = selectedFlower === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedFlower(key);
                        AudioEngine.playChime(1.0 + Object.keys(FLOWER_PROFILES).indexOf(key) * 0.05);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer text-center ${
                        isSelected
                          ? "bg-emerald-500/10 border-[#10b981] text-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.15)] scale-102"
                          : "bg-[#040706]/85 border-[#12281e]/80 text-emerald-700 hover:border-emerald-700/60 hover:text-emerald-300"
                      }`}
                    >
                      <span className="text-lg">{prof.emoji}</span>
                      <span className="font-accent text-3xs font-semibold mt-1 tracking-tight">{prof.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tag Selection Bed */}
            <div className="space-y-2">
              <label className="block text-2xs font-accent font-bold uppercase tracking-wider text-emerald-500">
                Tag Soil Beds (Select or add below):
              </label>
              <div className="flex flex-wrap gap-2">
                {existingTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-accent font-bold tracking-wide transition border cursor-pointer ${
                        isSelected
                          ? "bg-[#10b981] text-[#030605] border-[#10b981]"
                          : "bg-[#050a08]/80 text-emerald-600 border-[#122a20] hover:border-emerald-500/40"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2 pt-1.5">
                <input
                  type="text"
                  className="flex-1 bg-[#040807]/90 text-emerald-100 px-3.5 py-2 rounded-lg border border-[#163529]/60 text-2xs focus:outline-none focus:border-[#10b981] placeholder-emerald-950"
                  placeholder="Or define a brand new tag beds (e.g. Geophysics, UI Design)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const clean = tagInput.trim();
                      if (clean) {
                        AudioEngine.playChime(1.1);
                        if (!selectedTags.includes(clean)) {
                          setSelectedTags(prev => [...prev, clean]);
                        }
                        setTagInput("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => handleAddCustomTag(e)}
                  className="px-4 py-2 rounded-lg bg-emerald-950/50 hover:bg-[#10b981] text-emerald-400 hover:text-[#0b1310] border border-[#122e22] hover:border-[#10b981] font-accent font-bold text-2xs transition cursor-pointer"
                >
                  Add Bed
                </button>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="space-y-2">
              <label className="block text-2xs font-accent font-bold uppercase tracking-wider text-emerald-500">
                Luminous Abstract (Summary):
              </label>
              <input
                type="text"
                required
                className="w-full bg-[#040807]/90 text-emerald-100 px-4 py-3 rounded-xl border border-[#163529]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all placeholder-emerald-900"
                placeholder="Write a concise executive summary..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            {/* Custom/Selected Image URL */}
            <div className="space-y-2">
              <label className="block text-2xs font-accent font-bold uppercase tracking-wider text-emerald-500">
                Insert Cover Image (Optional):
              </label>
              <input
                type="text"
                className="w-full bg-[#040807]/90 text-emerald-100 px-4 py-3 rounded-xl border border-[#163529]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all placeholder-emerald-900"
                placeholder="Paste any image URL (e.g. from Unsplash) or choose a preset below..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { name: "森林 Forest 🌱", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600" },
                  { name: "雨露 Moss 🌿", url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600" },
                  { name: "晨曦 Dawn 🌅", url: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=600" },
                  { name: "星空 Cosmos 🌌", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600" },
                  { name: "山明 Peak 🏔️", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600" }
                ].map((preset) => {
                  const isActive = imageUrl === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        AudioEngine.playChime(1.2);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-accent font-bold transition border cursor-pointer ${
                        isActive
                          ? "bg-amber-400 text-neutral-950 border-amber-400"
                          : "bg-[#040706]/85 border-[#12281e]/80 text-emerald-600 hover:text-emerald-300"
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      AudioEngine.playChime(0.85);
                    }}
                    className="px-3 py-1.5 rounded-lg text-3xs font-accent font-bold bg-rose-950/40 text-rose-400 border border-rose-900/30 hover:bg-rose-900 transition"
                  >
                    Clear Image
                  </button>
                )}
              </div>
            </div>

            {/* Complete Content */}
            <div className="space-y-2">
              <label className="block text-2xs font-accent font-bold uppercase tracking-wider text-emerald-500">
                Detailed Thought Codex notes (Markdown supported):
              </label>
              <textarea
                required
                rows={5}
                className="w-full bg-[#040807]/90 text-emerald-100 px-4 py-3 rounded-xl border border-[#163529]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all placeholder-emerald-900 scrollbar-thin"
                placeholder="Write down the core paragraphs of my note. Supports markdown, formulas, lists..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Bottom control panel */}
          <div className="p-4 md:p-5 border-t border-[#142d22] bg-[#050a08]/80 flex items-center justify-between">
            <span className="text-3xs text-emerald-700 italic">
              * Sown seedlings are securely nurtured in my browser's persistent local loam.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-emerald-950/20 text-emerald-500 hover:text-emerald-300 text-xs font-accent font-bold tracking-wide transition cursor-pointer"
              >
                Cancel Draft
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#34d399] text-[#030605] text-xs font-accent font-black tracking-wider uppercase transition shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sprout className="w-4 h-4" />
                <span>Sow Thought Bloom</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
