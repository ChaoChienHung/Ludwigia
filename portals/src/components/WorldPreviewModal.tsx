import React, { useState } from 'react';
import { PortalItem } from '../types/portal';
import { wonderlandAudio } from '../utils/audio';
import {
  X,
  Compass,
  Sparkles,
  Shield,
  SunMedium,
  Wind,
  AlertCircle,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

interface WorldPreviewModalProps {
  portal: PortalItem | null;
  onClose: () => void;
}

export const WorldPreviewModal: React.FC<WorldPreviewModalProps> = ({ portal, onClose }) => {
  const [hasEntered, setHasEntered] = useState(false);
  const [collectedRune, setCollectedRune] = useState(false);

  if (!portal) return null;

  const handleEnterRealm = () => {
    wonderlandAudio.playPortalWarp();
    setHasEntered(true);
    if (portal.targetUrl) {
      setTimeout(() => {
        window.location.href = portal.targetUrl!;
      }, 1400);
    } else {
      setTimeout(() => {
        setHasEntered(false);
      }, 3200);
    }
  };

  const handleCollectRune = () => {
    wonderlandAudio.playNavClick();
    setCollectedRune(true);
    setTimeout(() => {
      setCollectedRune(false);
    }, 2800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-950/95 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl animate-modal-in"
        style={{
          boxShadow: `0 0 60px ${portal.colors.glow}, 0 25px 50px -12px rgba(0, 0, 0, 0.7)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Banner with Animated Mini Portal Glow */}
        <div
          className="relative h-44 w-full overflow-hidden flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at 50% 120%, ${portal.colors.primary}44 0%, #030712 100%)`,
          }}
        >
          {/* Animated Ambient Light Rings */}
          <div
            className="w-32 h-32 rounded-full border border-white/20 animate-portal-cw flex items-center justify-center"
            style={{
              borderColor: portal.colors.accent,
              boxShadow: `0 0 40px ${portal.colors.glow}`,
            }}
          >
            <div
              className="w-20 h-20 rounded-full animate-portal-ccw"
              style={{
                background: `conic-gradient(from 180deg, ${portal.colors.vortexGradient[0]}, ${portal.colors.vortexGradient[2]}, ${portal.colors.vortexGradient[0]})`,
              }}
            />
          </div>

          {/* Rune Glyph Emblem */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-4xl font-fantasy font-black opacity-30 select-none"
              style={{ color: portal.colors.accent }}
            >
              {portal.signpost.runeSymbol}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="關閉預覽卡片"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Portal Nature Tag */}
          <div className="absolute bottom-3 left-6 flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-slate-300">
              {portal.name}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300">
              {portal.signpost.label}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Realm Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>目的地維度探索檔案</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-fantasy font-bold text-white tracking-wide">
              {portal.worldDetails.realmName}
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {portal.worldDetails.lore}
            </p>
          </div>

          {/* Environmental Attributes Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                <span>界域形態</span>
              </div>
              <div className="text-xs font-semibold text-slate-100">
                {portal.worldDetails.realmType}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>大氣氣候</span>
              </div>
              <div className="text-xs font-semibold text-slate-100">
                {portal.worldDetails.climate}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>領域守護者</span>
              </div>
              <div className="text-xs font-semibold text-slate-100">
                {portal.worldDetails.guardian}
              </div>
            </div>
          </div>

          {/* Key Features List */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5">
              界域奇觀特徵
            </h4>
            <div className="space-y-2">
              {portal.worldDetails.keyFeatures.map((feat, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 text-xs text-slate-200 p-2 rounded-xl bg-slate-900/40 border border-slate-800/50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Caution Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold mr-1">穿越警示:</span>
              <span>{portal.worldDetails.travelCaution}</span>
            </div>
          </div>

          {/* Direct site surface gateway indicator */}
          {portal.targetUrl && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-purple-950/60 border border-emerald-500/40 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-slate-200">
                  維度門戶與站內界域 <strong className="text-emerald-300 font-semibold">{portal.targetLabel}</strong> 深度連通
                </span>
              </div>
              <a
                href={portal.targetUrl}
                className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-semibold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                直接進入 &rarr;
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            <button
              onClick={handleCollectRune}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              {collectedRune ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">已銘刻此界符文印記！</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>採集界石符文 ({portal.signpost.runeSymbol})</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                返回仙境全景
              </button>

              <button
                onClick={handleEnterRealm}
                disabled={hasEntered}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${portal.colors.accent}, ${portal.colors.primary})`,
                  boxShadow: `0 0 20px ${portal.colors.glow}`,
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {hasEntered
                    ? portal.targetUrl
                      ? '維度躍遷中...'
                      : '以太穿梭中...'
                    : portal.targetUrl
                    ? `躍遷前往 ${portal.targetLabel || portal.name}`
                    : '深度穿梭該界域'}
                </span>
              </button>
            </div>
          </div>

          {/* Feedback warp screen overlay */}
          {hasEntered && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-3xl animate-pulse">
              <div
                className="w-24 h-24 rounded-full border-4 border-white/60 animate-spin flex items-center justify-center mb-4"
                style={{
                  borderColor: portal.colors.accent,
                  borderTopColor: 'transparent',
                }}
              >
                <span className="text-3xl font-fantasy text-white">
                  {portal.signpost.runeSymbol}
                </span>
              </div>
              <p className="text-base font-fantasy font-bold text-white tracking-widest">
                維度諧振啟動 · 即將抵達 {portal.signpost.destination}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
