import React, { memo, useEffect, useRef, useState } from 'react';
import { PortalItem } from '../types/portal';
import { wonderlandAudio } from '../utils/audio';
import { Lock, ArrowRight } from 'lucide-react';
import { fmt, Lang, UI } from '../i18n';

interface PortalComponentProps {
  portal: PortalItem;
  onSelect: (portal: PortalItem) => void;
  isHovered: boolean;
  onHoverChange: (portalId: string | null) => void;
  lang: Lang;
}

// Memoised: the stage re-renders on every spring-camera frame while panning, but a portal
// only needs to re-render when its own hover state or the language changes.
const PortalComponentImpl: React.FC<PortalComponentProps> = ({
  portal,
  onSelect,
  isHovered,
  onHoverChange,
  lang,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Pause this portal's infinite CSS animations (vortex spin, ping, pulse, dash flow) while it
  // is scrolled out of view. Written straight to the DOM attribute so it never re-renders React.
  // Keeps per-frame animation cost proportional to *visible* portals as more realms are added.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          el.dataset.offscreen = entry.isIntersecting ? 'false' : 'true';
        }
      },
      { rootMargin: '0px 200px 0px 200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [internalHover, setInternalHover] = useState(false);
  const activeHover = isHovered || internalHover;
  // Portals without a destination are "sealed": dimmed, animations frozen, click shows a notice
  const isSealed = !portal.targetUrl;
  // Hover thumbnail: requested only while hovered; hidden for good if the image is missing
  const [thumbState, setThumbState] = useState<'unknown' | 'ok' | 'missing'>('unknown');
  const showThumb = !!portal.previewImage && activeHover && thumbState !== 'missing';

  const handleMouseEnter = () => {
    setInternalHover(true);
    onHoverChange(portal.id);
    wonderlandAudio.playPortalHover(portal.audioPreset);
  };

  const handleMouseLeave = () => {
    setInternalHover(false);
    onHoverChange(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(portal); // App plays the warp / sealed sound and decides what happens
  };

  // High-detail SVG nature frames with delicate aesthetic
  const renderNaturalFrame = () => {
    switch (portal.shape) {
      case 'organic-oval':
        // 1. Majestic Sacred World Tree (萬年神木): intricate gnarled roots, spreading branches, lush bioluminescent foliage & glowing vines
        return (
          <g className="transition-opacity duration-300">
            {/* Ground Moss & Base Root Knolls */}
            <ellipse cx="150" cy="355" rx="145" ry="24" fill="#061a12" opacity="0.8" />
            <path
              d="M -35 365 Q 40 335, 150 345 Q 260 335, 335 365 C 290 380, 10 380, -35 365 Z"
              fill="#0a2318"
            />
            {/* Ground Moss Patches */}
            <ellipse cx="30" cy="355" rx="35" ry="12" fill="#047857" opacity="0.4" />
            <ellipse cx="270" cy="355" rx="38" ry="14" fill="#047857" opacity="0.4" />

            {/* --- MASSIVE GNARLED ROOT BUTTRESSES (Root Framework) --- */}
            {/* Deep Under-Roots (Left & Right Anchors) */}
            <path
              d="M -25 365 C 10 310, 20 220, 45 160 C 70 100, 100 65, 150 50 C 200 65, 230 100, 255 160 C 280 220, 290 310, 325 365"
              fill="none"
              stroke="#071710"
              strokeWidth="42"
              strokeLinecap="round"
            />

            {/* Main Ancient Heartwood Arch */}
            <path
              d="M -15 360 C 15 305, 25 210, 52 155 C 78 98, 108 60, 150 48 C 192 60, 222 98, 248 155 C 275 210, 285 305, 315 360"
              fill="none"
              stroke="#132c1f"
              strokeWidth="30"
              strokeLinecap="round"
            />

            {/* Intertwining Secondary Roots (Twisting Helical Root Braid) */}
            <path
              d="M -30 365 C -10 330, 8 280, 12 220 C 16 160, 42 110, 95 65 C 125 40, 175 40, 205 65 C 258 110, 284 160, 288 220 C 292 280, 310 330, 330 365"
              fill="none"
              stroke="#1f4431"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Third Intertwined Root Strands (Fine Vine-Roots) */}
            <path
              d="M 5 350 C 25 290, 32 240, 28 180 C 24 120, 65 75, 120 52 M 295 350 C 275 290, 268 240, 272 180 C 276 120, 235 75, 180 52"
              fill="none"
              stroke="#2d5e44"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {/* Ancient Bark Fissures & Woodgrain Grooves */}
            <path
              d="M 22 330 C 35 270, 38 200, 55 140 M 36 310 C 46 250, 52 180, 72 120 M 278 330 C 265 270, 262 200, 245 140 M 264 310 C 254 250, 248 180, 228 120"
              fill="none"
              stroke="#0a1a12"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Gnarled Tree Burls (樹瘤) */}
            <circle cx="38" cy="235" r="14" fill="#152f22" stroke="#0d2117" strokeWidth="3" />
            <circle cx="38" cy="235" r="8" fill="#1c3e2d" />
            <circle cx="262" cy="210" r="16" fill="#152f22" stroke="#0d2117" strokeWidth="3" />
            <circle cx="262" cy="210" r="9" fill="#1c3e2d" />

            {/* Bioluminescent Tree Shelf Fungi (發光靈芝/蕈菇) */}
            <path d="M 12 245 C -8 242, -22 250, -18 258 C 4 262, 22 254, 26 248 Z" fill="#059669" stroke="#6ee7b7" strokeWidth="1.2" />
            <path d="M 16 225 C 2 222, -10 228, -6 234 C 8 238, 22 232, 26 228 Z" fill="#10b981" stroke="#a7f3d0" strokeWidth="1" />
            <path d="M 282 195 C 302 192, 318 198, 314 206 C 298 210, 282 204, 278 198 Z" fill="#059669" stroke="#6ee7b7" strokeWidth="1.2" />

            {/* Sacred Ancient Runes Carved into Bark */}
            <g opacity={activeHover ? 1 : 0.75} className="transition-opacity">
              <text x="35" y="195" fill="#6ee7b7" fontSize="13" fontFamily="serif" fontWeight="bold" opacity="0.85">ᚠ</text>
              <text x="48" y="130" fill="#a7f3d0" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.85">ᚱ</text>
              <text x="245" y="175" fill="#6ee7b7" fontSize="13" fontFamily="serif" fontWeight="bold" opacity="0.85">ᛟ</text>
              <text x="235" y="120" fill="#a7f3d0" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.85">ᛚ</text>
            </g>

            {/* --- SPREADING CANOPY BRANCHES (樹枝枝椏系統) --- */}
            {/* Left Primary Spreading Bough */}
            <path
              d="M 110 55 C 65 20, 20 -15, -45 -25 M 65 30 C 25 -10, -10 -45, -35 -75 M 10 -22 C -18 -45, -55 -60, -85 -55"
              fill="none"
              stroke="#132c1f"
              strokeWidth="15"
              strokeLinecap="round"
            />
            {/* Left Secondary Twigs */}
            <path
              d="M 50 15 C 30 -20, 15 -60, -10 -85 M -15 -48 C -38 -70, -70 -85, -95 -75 M -48 -26 C -75 -35, -110 -30, -125 -15"
              fill="none"
              stroke="#1a3d2b"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Right Primary Spreading Bough */}
            <path
              d="M 190 55 C 235 20, 280 -15, 345 -25 M 235 30 C 275 -10, 310 -45, 335 -75 M 290 -22 C 318 -45, 355 -60, 385 -55"
              fill="none"
              stroke="#132c1f"
              strokeWidth="15"
              strokeLinecap="round"
            />
            {/* Right Secondary Twigs */}
            <path
              d="M 250 15 C 270 -20, 285 -60, 310 -85 M 315 -48 C 338 -70, 370 -85, 395 -75 M 348 -26 C 375 -35, 410 -30, 425 -15"
              fill="none"
              stroke="#1a3d2b"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Center Crown Bough (Rising towards Heaven) */}
            <path
              d="M 150 48 C 145 10, 140 -25, 135 -65 M 150 25 C 160 -10, 170 -40, 185 -75 M 138 -20 C 120 -45, 110 -75, 105 -95"
              fill="none"
              stroke="#183827"
              strokeWidth="11"
              strokeLinecap="round"
            />

            {/* --- LUSH BIOLUMINESCENT SACRED FOLIAGE (樹葉繁茂層) --- */}
            {/* Top Center Crown Foliage Cluster */}
            <g filter="drop-shadow(0 0 12px rgba(16, 185, 129, 0.4))">
              {/* Deep base leaves */}
              <ellipse cx="145" cy="-45" rx="55" ry="32" fill="#064e3b" opacity="0.9" />
              <ellipse cx="165" cy="-60" rx="42" ry="28" fill="#047857" opacity="0.9" />
              <ellipse cx="120" cy="-65" rx="38" ry="26" fill="#047857" opacity="0.85" />
              {/* Midtone vibrant leaves */}
              <ellipse cx="148" cy="-55" rx="36" ry="22" fill="#059669" />
              <ellipse cx="170" cy="-40" rx="30" ry="18" fill="#10b981" />
              <ellipse cx="125" cy="-42" rx="32" ry="19" fill="#10b981" />
              {/* Highlight leaf clusters */}
              <circle cx="152" cy="-62" r="16" fill="#34d399" opacity="0.9" />
              <circle cx="135" cy="-52" r="14" fill="#6ee7b7" opacity="0.85" />
              <circle cx="168" cy="-54" r="13" fill="#6ee7b7" opacity="0.85" />
            </g>

            {/* Left Canopy Foliage Cluster */}
            <g filter="drop-shadow(0 0 14px rgba(16, 185, 129, 0.35))">
              <ellipse cx="-45" cy="-40" rx="60" ry="38" fill="#064e3b" opacity="0.9" />
              <ellipse cx="-75" cy="-60" rx="46" ry="32" fill="#047857" opacity="0.85" />
              <ellipse cx="-15" cy="-68" rx="42" ry="28" fill="#059669" opacity="0.9" />
              <ellipse cx="-50" cy="-55" rx="38" ry="24" fill="#10b981" />
              <circle cx="-35" cy="-48" r="18" fill="#34d399" />
              <circle cx="-65" cy="-52" r="15" fill="#6ee7b7" opacity="0.9" />
              <circle cx="-85" cy="-42" r="14" fill="#a7f3d0" opacity="0.8" />
            </g>

            {/* Right Canopy Foliage Cluster */}
            <g filter="drop-shadow(0 0 14px rgba(16, 185, 129, 0.35))">
              <ellipse cx="345" cy="-40" rx="60" ry="38" fill="#064e3b" opacity="0.9" />
              <ellipse cx="375" cy="-60" rx="46" ry="32" fill="#047857" opacity="0.85" />
              <ellipse cx="315" cy="-68" rx="42" ry="28" fill="#059669" opacity="0.9" />
              <ellipse cx="350" cy="-55" rx="38" ry="24" fill="#10b981" />
              <circle cx="335" cy="-48" r="18" fill="#34d399" />
              <circle cx="365" cy="-52" r="15" fill="#6ee7b7" opacity="0.9" />
              <circle cx="385" cy="-42" r="14" fill="#a7f3d0" opacity="0.8" />
            </g>

            {/* --- INDIVIDUAL SACRED LEAVES (精緻神木葉片) --- */}
            <g fill="#34d399" stroke="#064e3b" strokeWidth="0.8">
              {/* Left bough leaves */}
              <path d="M -30 -15 Q -45 -30, -32 -45 Q -20 -30, -30 -15 Z" />
              <path d="M 5 -5 Q -10 -20, 2 -35 Q 15 -20, 5 -5 Z" fill="#6ee7b7" />
              <path d="M 45 10 Q 30 -5, 42 -20 Q 55 -5, 45 10 Z" />
              <path d="M -60 -45 Q -75 -60, -62 -75 Q -50 -60, -60 -45 Z" fill="#a7f3d0" />
              <path d="M -10 -75 Q -25 -90, -12 -105 Q 0 -90, -10 -75 Z" fill="#6ee7b7" />

              {/* Right bough leaves */}
              <path d="M 330 -15 Q 345 -30, 332 -45 Q 320 -30, 330 -15 Z" />
              <path d="M 295 -5 Q 310 -20, 298 -35 Q 285 -20, 295 -5 Z" fill="#6ee7b7" />
              <path d="M 255 10 Q 270 -5, 258 -20 Q 245 -5, 255 10 Z" />
              <path d="M 360 -45 Q 375 -60, 362 -75 Q 350 -60, 360 -45 Z" fill="#a7f3d0" />
              <path d="M 310 -75 Q 325 -90, 312 -105 Q 300 -90, 310 -75 Z" fill="#6ee7b7" />

              {/* Top crest leaves */}
              <path d="M 125 15 Q 115 -5, 128 -20 Q 140 -5, 125 15 Z" />
              <path d="M 175 15 Q 185 -5, 172 -20 Q 160 -5, 175 15 Z" />
              <path d="M 150 0 Q 138 -20, 150 -35 Q 162 -20, 150 0 Z" fill="#6ee7b7" />
            </g>

            {/* --- CASCADING HANGING WILLOW-VINES (垂懸靈藤與葉串) --- */}
            {/* Left Hanging Vine 1 */}
            <path
              d="M 68 55 Q 45 120, 58 180 Q 66 220, 52 255"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.4"
            />
            {/* Dangling vine leaves */}
            <ellipse cx="52" cy="110" rx="5" ry="8" transform="rotate(-25 52 110)" fill="#6ee7b7" />
            <ellipse cx="60" cy="155" rx="5" ry="8" transform="rotate(20 60 155)" fill="#34d399" />
            <ellipse cx="58" cy="205" rx="4.5" ry="7" transform="rotate(-15 58 205)" fill="#6ee7b7" />
            <circle cx="52" cy="255" r="3.5" fill="#a7f3d0" />

            {/* Left Hanging Vine 2 (Shorter) */}
            <path
              d="M 102 48 Q 90 95, 98 145"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
            />
            <ellipse cx="92" cy="90" rx="4" ry="7" transform="rotate(-20 92 90)" fill="#34d399" />
            <ellipse cx="98" cy="135" rx="4.5" ry="7" transform="rotate(25 98 135)" fill="#6ee7b7" />

            {/* Right Hanging Vine 1 */}
            <path
              d="M 232 55 Q 255 120, 242 180 Q 234 220, 248 255"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.4"
            />
            <ellipse cx="248" cy="110" rx="5" ry="8" transform="rotate(25 248 110)" fill="#6ee7b7" />
            <ellipse cx="240" cy="155" rx="5" ry="8" transform="rotate(-20 240 155)" fill="#34d399" />
            <ellipse cx="242" cy="205" rx="4.5" ry="7" transform="rotate(15 242 205)" fill="#6ee7b7" />
            <circle cx="248" cy="255" r="3.5" fill="#a7f3d0" />

            {/* Right Hanging Vine 2 (Shorter) */}
            <path
              d="M 198 48 Q 210 95, 202 145"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
            />
            <ellipse cx="208" cy="90" rx="4" ry="7" transform="rotate(20 208 90)" fill="#34d399" />
            <ellipse cx="202" cy="135" rx="4.5" ry="7" transform="rotate(-25 202 135)" fill="#6ee7b7" />

            {/* --- PULSING SAP BIO-CHANNELS (神木靈脈流光) --- */}
            <path
              d="M 18 310 C 35 240, 48 180, 85 110 C 112 65, 135 52, 150 50 C 165 52, 188 65, 215 110 C 252 180, 265 240, 282 310"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.8"
              strokeDasharray="8 14"
              className={activeHover ? 'opacity-100' : 'opacity-70'}
              style={{ filter: 'drop-shadow(0 0 6px #10b981)' }}
            />

            {/* Glowing Golden Sap Beads & Floating Spores */}
            <circle cx="150" cy="46" r="5" fill="#a7f3d0" />
            <circle cx="-10" cy="-30" r="3.5" fill="#6ee7b7" />
            <circle cx="310" cy="-30" r="3.5" fill="#6ee7b7" />
            <circle cx="35" cy="285" r="4" fill="#34d399" />
            <circle cx="265" cy="285" r="4" fill="#34d399" />
          </g>
        );

      case 'celestial-circle':
        // 2. Pure circle floating stones with delicate arcane arcs
        return (
          <g>
            {/* Outer delicate energy orbit */}
            {/* Outer delicate energy orbit - strictly concentric */}
            <circle
              cx="135"
              cy="135"
              r="126"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.2"
              strokeDasharray="6 10"
              className="animate-dash-flow"
              style={{ transformOrigin: '135px 135px' }}
            />
            <circle
              cx="135"
              cy="135"
              r="114"
              fill="none"
              stroke="rgba(125, 211, 252, 0.5)"
              strokeWidth="2.5"
            />
            {/* Floating Top Megalith */}
            <polygon
              points="110,12 160,12 145,-15 125,-15"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
              className="animate-float"
            />
            {/* Floating Bottom Megalith */}
            <polygon
              points="105,258 165,258 150,285 120,285"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
              className="animate-float"
              style={{ animationDelay: '1.5s' }}
            />
            {/* Floating Left Megalith */}
            <polygon
              points="12,110 12,160 -15,145 -15,125"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
              className="animate-float"
              style={{ animationDelay: '2.5s' }}
            />
            {/* Floating Right Megalith */}
            <polygon
              points="258,110 258,160 285,145 285,125"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2"
              className="animate-float"
              style={{ animationDelay: '3.5s' }}
            />
            {/* Rune dots */}
            <circle cx="135" cy="5" r="3" fill="#7dd3fc" />
            <circle cx="135" cy="265" r="3" fill="#7dd3fc" />
            <circle cx="5" cy="135" r="3" fill="#7dd3fc" />
            <circle cx="265" cy="135" r="3" fill="#7dd3fc" />
          </g>
        );

      case 'water-oval':
        // 3. Low waterfall pool with basalt rocks, water ripples, and glowing lotus flowers
        return (
          <g>
            {/* Outer Water Mist Ring */}
            <ellipse
              cx="160"
              cy="105"
              rx="155"
              ry="98"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="1.8"
              strokeDasharray="12 16"
              className="animate-dash-flow"
              style={{ transformOrigin: '160px 105px' }}
            />
            {/* Secondary Concentric Wave Ripple */}
            <ellipse
              cx="160"
              cy="105"
              rx="138"
              ry="86"
              fill="none"
              stroke="#5eead4"
              strokeWidth="1"
              strokeDasharray="6 10"
              opacity="0.6"
            />

            {/* Deep River Basalt Stones Rim */}
            <ellipse cx="25" cy="115" rx="20" ry="12" fill="#091419" stroke="#14b8a6" strokeWidth="1.5" />
            <ellipse cx="65" cy="180" rx="26" ry="16" fill="#091419" stroke="#0d9488" strokeWidth="1.5" />
            <ellipse cx="160" cy="195" rx="34" ry="15" fill="#091419" stroke="#14b8a6" strokeWidth="1.5" />
            <ellipse cx="260" cy="175" rx="25" ry="15" fill="#091419" stroke="#0d9488" strokeWidth="1.5" />
            <ellipse cx="298" cy="100" rx="18" ry="12" fill="#091419" stroke="#14b8a6" strokeWidth="1.5" />
            <ellipse cx="228" cy="25" rx="22" ry="11" fill="#091419" stroke="#0d9488" strokeWidth="1.5" />
            <ellipse cx="80" cy="30" rx="24" ry="12" fill="#091419" stroke="#14b8a6" strokeWidth="1.5" />

            {/* Glowing Water Lily Pads */}
            <circle cx="50" cy="70" r="11" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
            <circle cx="51" cy="69" r="4" fill="#6ee7b7" />
            {/* Glowing Lotus Flower (Left) */}
            <path d="M 48 62 C 45 54, 52 50, 52 58 Z" fill="#f472b6" />
            <path d="M 52 62 C 55 54, 48 50, 48 58 Z" fill="#fb7185" />
            <circle cx="50" cy="60" r="2" fill="#fef08a" />

            {/* Right Lily Pad & Lotus */}
            <circle cx="272" cy="138" r="13" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
            <circle cx="274" cy="136" r="4.5" fill="#6ee7b7" />
            <path d="M 270 130 C 267 122, 274 118, 274 126 Z" fill="#f472b6" />
            <path d="M 274 130 C 277 122, 270 118, 270 126 Z" fill="#fb7185" />
            <circle cx="272" cy="128" r="2.2" fill="#fef08a" />

            {/* Water Spray Sparkles */}
            <circle cx="95" cy="55" r="2.5" fill="#a7f3d0" />
            <circle cx="215" cy="165" r="2.5" fill="#a7f3d0" />
            <circle cx="160" cy="40" r="2" fill="#6ee7b7" />
          </g>
        );

      case 'crystal-geode':
        // 4. Authentic Multi-Faceted Amethyst Geode Cavern (紫晶地脈裂隙): towering crystal pillars, obsidian cave rock, and sparkling prismatic facets
        return (
          <g className="transition-opacity duration-300">
            {/* Ground Ledge & Basalt Pedestal Shadow */}
            <ellipse cx="150" cy="340" rx="145" ry="24" fill="#080210" opacity="0.95" />
            <path
              d="M -25 350 Q 50 325, 150 330 Q 250 325, 325 350 C 280 370, 20 370, -25 350 Z"
              fill="#0d0417"
            />

            {/* --- CRAGGY OBSIDIAN & BASALT GEODE ROCK HOLLOW SHELL (母岩崖壁環框) --- */}
            {/* Using fillRule="evenodd" to create a true hollow cavern opening framing the vortex */}
            <path
              fillRule="evenodd"
              d="
                M -15 345 
                L -10 245 
                L 12 145 
                L 35 70 
                L 90 18 
                L 150 6 
                L 210 18 
                L 265 70 
                L 288 145 
                L 310 245 
                L 315 345 
                L 260 355 
                L 150 346 
                L 40 355 Z
                M 70 180 
                C 70 115, 105 72, 150 72 
                C 195 72, 230 115, 230 180 
                C 230 250, 195 292, 150 292 
                C 105 292, 70 250, 70 180 Z
              "
              fill="#120524"
              stroke="#080212"
              strokeWidth="5"
            />

            {/* Inner Rock Stratum Layer with Mineral Sheen */}
            <path
              fillRule="evenodd"
              d="
                M 10 330 
                L 28 225 
                L 45 140 
                L 68 75 
                L 115 30 
                L 150 24 
                L 185 30 
                L 232 75 
                L 255 140 
                L 272 225 
                L 290 330 
                L 235 340 
                L 150 332 
                L 65 340 Z
                M 72 180 
                C 72 118, 106 76, 150 76 
                C 194 76, 228 118, 228 180 
                C 228 248, 194 288, 150 288 
                C 106 288, 72 248, 72 180 Z
              "
              fill="#200a3b"
              opacity="0.85"
            />

            {/* Glowing Geode Mineral Energy Veins (地脈能量紫光熔岩紋路) */}
            <path
              d="M -2 290 C 16 220, 22 170, 42 110 M 302 290 C 284 220, 278 170, 258 110 M 105 28 Q 150 12, 195 28 M 28 180 Q 42 205, 52 250 M 272 180 Q 258 205, 248 250"
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.2"
              strokeDasharray="6 8"
              className={activeHover ? 'opacity-100' : 'opacity-70'}
              style={{ filter: 'drop-shadow(0 0 6px #a855f7)' }}
            />
            {/* Secondary Finer Neon Violet Fissures */}
            <path
              d="M 12 130 Q 30 95, 60 65 M 288 130 Q 270 95, 240 65 M 125 32 Q 150 20, 175 32"
              fill="none"
              stroke="#f0abfc"
              strokeWidth="1.2"
              strokeDasharray="3 4"
              opacity="0.8"
            />

            {/* --- DRUZY CRYSTAL BED LINING INNER APERTURE (晶洞口緣細碎紫晶芽群) --- */}
            <g fill="#9333ea" stroke="#c084fc" strokeWidth="0.8">
              {/* Left rim teeth */}
              <polygon points="68,140 58,144 69,150" />
              <polygon points="67,160 56,166 68,172" />
              <polygon points="68,185 57,192 70,198" />
              <polygon points="71,210 60,217 73,224" />
              <polygon points="76,235 66,243 80,250" />
              {/* Right rim teeth */}
              <polygon points="232,140 242,144 231,150" />
              <polygon points="233,160 244,166 232,172" />
              <polygon points="232,185 243,192 230,198" />
              <polygon points="229,210 240,217 227,224" />
              <polygon points="224,235 234,243 220,250" />
              {/* Top rim teeth */}
              <polygon points="120,74 125,64 130,73" />
              <polygon points="138,72 143,62 148,72" />
              <polygon points="152,72 157,62 162,72" />
              <polygon points="170,74 175,64 180,73" />
            </g>

            {/* --- LEFT FLANK: TOWERING FACETED AMETHYST CRYSTAL SPIRES (左翼紫晶巨柱群) --- */}
            {/* Pillar 1: Giant Outermost Titan Amethyst (Left Base to Upper Peak) */}
            <g className="transition-transform duration-300">
              {/* Deep Shadow Facet (Rear Side) */}
              <polygon points="12,335 8,145 32,70 38,335" fill="#3b0764" stroke="#581c87" strokeWidth="1" />
              {/* Mid Body Facet (Inner Side) */}
              <polygon points="38,335 32,70 54,105 60,335" fill="#7e22ce" stroke="#9333ea" strokeWidth="1" />
              {/* Rhombohedral Pyramidal Apex (Top Facets) */}
              <polygon points="8,145 32,70 54,105" fill="#a855f7" stroke="#e9d5ff" strokeWidth="1.2" />
              <polygon points="32,70 42,92 54,105" fill="#d8b4fe" />
              {/* Brilliant Razor White Glint along Main Edge */}
              <line x1="32" y1="70" x2="38" y2="335" stroke="#ffffff" strokeWidth="1.6" opacity="0.9" />
              <line x1="32" y1="70" x2="8" y2="145" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            </g>

            {/* Pillar 2: Inward-Leaning Sentinel Amethyst (Mid-Left) */}
            <g>
              {/* Shadow Facet */}
              <polygon points="42,330 38,180 65,115 72,330" fill="#4c1d95" stroke="#6b21a8" strokeWidth="1" />
              {/* Highlight Front Facet */}
              <polygon points="72,330 65,115 84,150 88,330" fill="#9333ea" stroke="#c084fc" strokeWidth="1" />
              {/* Apex Pyramid Cap */}
              <polygon points="38,180 65,115 84,150" fill="#c084fc" stroke="#f3e8ff" strokeWidth="1.2" />
              <polygon points="65,115 72,135 84,150" fill="#e9d5ff" />
              {/* Edge Glint */}
              <line x1="65" y1="115" x2="72" y2="330" stroke="#ffffff" strokeWidth="1.4" opacity="0.9" />
            </g>

            {/* Pillar 3: Third Foreground Crystal Needle (Left Inner) */}
            <g>
              <polygon points="68,335 66,225 82,175 90,335" fill="#581c87" stroke="#7e22ce" strokeWidth="0.8" />
              <polygon points="90,335 82,175 98,202 102,335" fill="#a855f7" stroke="#c084fc" strokeWidth="0.8" />
              <polygon points="66,225 82,175 98,202" fill="#d8b4fe" stroke="#ffffff" strokeWidth="1" />
              <line x1="82" y1="175" x2="90" y2="335" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
            </g>

            {/* Pillar 4: Low Crystal Cluster Shoot (Left Ground) */}
            <g>
              <polygon points="86,335 84,270 96,240 102,335" fill="#6b21a8" />
              <polygon points="102,335 96,240 108,258 112,335" fill="#c084fc" />
              <polygon points="84,270 96,240 108,258" fill="#f3e8ff" />
            </g>

            {/* --- RIGHT FLANK: TOWERING FACETED AMETHYST CRYSTAL SPIRES (右翼紫晶巨柱群) --- */}
            {/* Pillar 1: Giant Outermost Titan Amethyst (Right Base to Upper Peak) */}
            <g className="transition-transform duration-300">
              {/* Deep Shadow Facet (Rear Side) */}
              <polygon points="288,335 292,145 268,70 262,335" fill="#3b0764" stroke="#581c87" strokeWidth="1" />
              {/* Mid Body Facet (Inner Side) */}
              <polygon points="262,335 268,70 246,105 240,335" fill="#7e22ce" stroke="#9333ea" strokeWidth="1" />
              {/* Rhombohedral Pyramidal Apex (Top Facets) */}
              <polygon points="292,145 268,70 246,105" fill="#a855f7" stroke="#e9d5ff" strokeWidth="1.2" />
              <polygon points="268,70 258,92 246,105" fill="#d8b4fe" />
              {/* Brilliant Razor White Glint along Main Edge */}
              <line x1="268" y1="70" x2="262" y2="335" stroke="#ffffff" strokeWidth="1.6" opacity="0.9" />
              <line x1="268" y1="70" x2="292" y2="145" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
            </g>

            {/* Pillar 2: Inward-Leaning Sentinel Amethyst (Mid-Right) */}
            <g>
              {/* Shadow Facet */}
              <polygon points="258,330 262,180 235,115 228,330" fill="#4c1d95" stroke="#6b21a8" strokeWidth="1" />
              {/* Highlight Front Facet */}
              <polygon points="228,330 235,115 216,150 212,330" fill="#9333ea" stroke="#c084fc" strokeWidth="1" />
              {/* Apex Pyramid Cap */}
              <polygon points="262,180 235,115 216,150" fill="#c084fc" stroke="#f3e8ff" strokeWidth="1.2" />
              <polygon points="235,115 228,135 216,150" fill="#e9d5ff" />
              {/* Edge Glint */}
              <line x1="235" y1="115" x2="228" y2="330" stroke="#ffffff" strokeWidth="1.4" opacity="0.9" />
            </g>

            {/* Pillar 3: Third Foreground Crystal Needle (Right Inner) */}
            <g>
              <polygon points="232,335 234,225 218,175 210,335" fill="#581c87" stroke="#7e22ce" strokeWidth="0.8" />
              <polygon points="210,335 218,175 202,202 198,335" fill="#a855f7" stroke="#c084fc" strokeWidth="0.8" />
              <polygon points="234,225 218,175 202,202" fill="#d8b4fe" stroke="#ffffff" strokeWidth="1" />
              <line x1="218" y1="175" x2="210" y2="335" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />
            </g>

            {/* Pillar 4: Low Crystal Cluster Shoot (Right Ground) */}
            <g>
              <polygon points="214,335 216,270 204,240 198,335" fill="#6b21a8" />
              <polygon points="198,335 204,240 192,258 188,335" fill="#c084fc" />
              <polygon points="216,270 204,240 192,258" fill="#f3e8ff" />
            </g>

            {/* --- TOP ARCHWAY: HANGING AMETHYST STALACTITES (頂部倒垂天然晶簇錐) --- */}
            {/* Left Hanging Crystal Spear */}
            <g>
              <polygon points="80,32 94,26 106,90" fill="#6b21a8" stroke="#a855f7" strokeWidth="0.8" />
              <polygon points="94,26 114,28 106,90" fill="#a855f7" stroke="#e9d5ff" strokeWidth="0.8" />
              <polygon points="80,32 106,90 98,102 80,32" fill="#d8b4fe" />
              <line x1="94" y1="26" x2="98" y2="102" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
            </g>

            {/* Center Dominant Stalactite Cluster */}
            <g>
              <polygon points="130,18 148,15 146,78" fill="#581c87" stroke="#9333ea" strokeWidth="0.8" />
              <polygon points="148,15 166,18 146,78" fill="#9333ea" stroke="#c084fc" strokeWidth="0.8" />
              <polygon points="135,22 146,78 150,88" fill="#e9d5ff" />
              <line x1="148" y1="15" x2="150" y2="88" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
            </g>

            {/* Right Hanging Crystal Spear */}
            <g>
              <polygon points="220,32 206,26 194,90" fill="#6b21a8" stroke="#a855f7" strokeWidth="0.8" />
              <polygon points="206,26 186,28 194,90" fill="#a855f7" stroke="#e9d5ff" strokeWidth="0.8" />
              <polygon points="220,32 194,90 202,102 220,32" fill="#d8b4fe" />
              <line x1="206" y1="26" x2="202" y2="102" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
            </g>

            {/* Intermediate Ceiling Crystal Daggers */}
            <polygon points="62,50 70,45 66,78" fill="#c084fc" stroke="#f3e8ff" strokeWidth="0.8" />
            <polygon points="118,25 126,22 122,54" fill="#a855f7" stroke="#e9d5ff" strokeWidth="0.8" />
            <polygon points="174,22 182,25 178,55" fill="#a855f7" stroke="#e9d5ff" strokeWidth="0.8" />
            <polygon points="236,46 244,42 238,76" fill="#c084fc" stroke="#f3e8ff" strokeWidth="0.8" />

            {/* --- BOTTOM BASIN: CRAGGED GEODE BASE CRYSTAL BED (底部晶床晶簇) --- */}
            <g>
              <polygon points="115,335 124,298 134,335" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="1" />
              <polygon points="136,332 148,285 160,332" fill="#9333ea" stroke="#e9d5ff" strokeWidth="1.2" />
              <polygon points="162,335 174,292 184,335" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="1" />
            </g>

            {/* --- RESONANCE IONIC ARCS & LIGHTNING (晶簇共振離子光弧) --- */}
            <g className={activeHover ? 'opacity-100' : 'opacity-65'}>
              {/* Cross-flank high resonance arc */}
              <path
                d="M 54 105 Q 98 85, 146 78 M 246 105 Q 202 85, 146 78 M 65 115 Q 150 140, 235 115"
                fill="none"
                stroke="#e9d5ff"
                strokeWidth="1.5"
                strokeDasharray="4 6"
               
                style={{ filter: 'drop-shadow(0 0 5px #a855f7)' }}
              />
              {/* Lower threshold arc */}
              <path
                d="M 82 175 Q 150 205, 218 175"
                fill="none"
                stroke="#d8b4fe"
                strokeWidth="1.2"
                strokeDasharray="3 5"
                opacity="0.8"
              />
            </g>

            {/* --- SPECULAR STARBURST FLARES (晶尖折射璀璨鑽石星芒) --- */}
            {/* Left Apex Titan Star */}
            <g transform="translate(32, 70)">
              <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#ffffff" />
              <circle cx="0" cy="0" r="3.5" fill="#f3e8ff" />
            </g>

            {/* Right Apex Titan Star */}
            <g transform="translate(268, 70)">
              <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#ffffff" />
              <circle cx="0" cy="0" r="3.5" fill="#f3e8ff" />
            </g>

            {/* Mid-Left Sentinel Apex Star */}
            <g transform="translate(65, 115)">
              <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill="#ffffff" />
              <circle cx="0" cy="0" r="2.5" fill="#f3e8ff" />
            </g>

            {/* Mid-Right Sentinel Apex Star */}
            <g transform="translate(235, 115)">
              <polygon points="0,-8 2.5,-2.5 8,0 2.5,2.5 0,8 -2.5,2.5 -8,0 -2.5,-2.5" fill="#ffffff" />
              <circle cx="0" cy="0" r="2.5" fill="#f3e8ff" />
            </g>

            {/* Top Center Stalactite Star */}
            <g transform="translate(150, 88)">
              <polygon points="0,-9 2.5,-2.5 9,0 2.5,2.5 0,9 -2.5,2.5 -9,0 -2.5,-2.5" fill="#ffffff" />
              <circle cx="0" cy="0" r="2.8" fill="#f3e8ff" />
            </g>

            {/* Left Hanging Spear Tip Star */}
            <g transform="translate(98, 102)">
              <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#ffffff" />
            </g>

            {/* Right Hanging Spear Tip Star */}
            <g transform="translate(202, 102)">
              <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#ffffff" />
            </g>

            {/* Floating Ion Particles & Amethyst Stardust */}
            <circle cx="150" cy="62" r="3.5" fill="#e9d5ff" />
            <circle cx="92" cy="215" r="2.5" fill="#c084fc" />
            <circle cx="208" cy="215" r="2.5" fill="#c084fc" />
            <circle cx="150" cy="275" r="2.8" fill="#f3e8ff" />
          </g>
        );

      case 'spore-dome':
        // 5. Giant bioluminescent mushroom dome with fairy ladders, glowing spore clusters, and radial gills
        return (
          <g>
            {/* Mushroom Stem Base Shadow */}
            <ellipse cx="140" cy="275" rx="55" ry="12" fill="#1c0e04" opacity="0.8" />

            {/* Ancient Mushroom Stalk / Stem Support */}
            <path
              d="M 105 280 C 112 240, 118 200, 122 170 M 175 280 C 168 240, 162 200, 158 170"
              fill="none"
              stroke="#2e1405"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Fairy Spiraling Wooden Steps on Stem */}
            <line x1="102" y1="262" x2="128" y2="258" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="152" y1="242" x2="178" y2="238" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="106" y1="222" x2="132" y2="218" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
            <line x1="148" y1="202" x2="174" y2="198" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

            {/* Massive Spore Mushroom Cap (Outer Arch) */}
            <path
              d="M 22 225 C 10 110, 68 18, 140 18 C 212 18, 270 110, 258 225 C 210 244, 70 244, 22 225 Z"
              fill="none"
              stroke="#542407"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Inner Cap Rim Highlight */}
            <path
              d="M 28 220 C 18 116, 72 26, 140 26 C 208 26, 262 116, 252 220"
              fill="none"
              stroke="#92400e"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Glowing Golden Bioluminescent Cap Spots */}
            <g fill="#fef08a" opacity="0.85" filter="drop-shadow(0 0 6px #f59e0b)">
              <ellipse cx="140" cy="40" rx="14" ry="9" />
              <ellipse cx="90" cy="65" rx="12" ry="8" transform="rotate(-20 90 65)" />
              <ellipse cx="190" cy="65" rx="12" ry="8" transform="rotate(20 190 65)" />
              <ellipse cx="55" cy="115" rx="10" ry="7" transform="rotate(-35 55 115)" />
              <ellipse cx="225" cy="115" rx="10" ry="7" transform="rotate(35 225 115)" />
              <ellipse cx="40" cy="175" rx="8" ry="6" />
              <ellipse cx="240" cy="175" rx="8" ry="6" />
            </g>

            {/* Delicate Radiating Fungal Gills */}
            <path
              d="M 140 34 L 54 195 M 140 34 L 88 212 M 140 34 L 140 224 M 140 34 L 192 212 M 140 34 L 226 195"
              stroke="rgba(251, 191, 36, 0.4)"
              strokeWidth="1.8"
              strokeDasharray="4 4"
            />

            {/* Spore Berries Along Rim */}
            <g>
              <circle cx="58" cy="235" r="6" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
              <circle cx="100" cy="246" r="6.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              <circle cx="140" cy="250" r="7" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
              <circle cx="180" cy="246" r="6.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              <circle cx="222" cy="235" r="6" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            </g>

            {/* Drifting Golden Spores */}
            <circle cx="140" cy="100" r="2.5" fill="#fef08a" />
          </g>
        );

      case 'lunar-arch':
        // 6. Elven marble ruin pillars with delicate moon crest and starlight wisteria
        return (
          <g>
            {/* Plinth Base Pedestals */}
            <rect x="10" y="325" width="34" height="14" rx="2" fill="#0f0e26" stroke="#4338ca" strokeWidth="1.2" />
            <rect x="226" y="325" width="34" height="14" rx="2" fill="#0f0e26" stroke="#4338ca" strokeWidth="1.2" />

            {/* Left Elven Fluted Marble Column */}
            <rect x="16" y="58" width="22" height="268" rx="2" fill="#17153b" stroke="#818cf8" strokeWidth="1.8" />
            <line x1="22" y1="62" x2="22" y2="322" stroke="#312e81" strokeWidth="1.5" />
            <line x1="27" y1="62" x2="27" y2="322" stroke="#a5b4fc" strokeWidth="1" opacity="0.6" />
            <line x1="32" y1="62" x2="32" y2="322" stroke="#312e81" strokeWidth="1.5" />
            <rect x="12" y="44" width="30" height="16" rx="2" fill="#242054" stroke="#c7d2fe" strokeWidth="1.5" />

            {/* Right Elven Fluted Marble Column */}
            <rect x="232" y="58" width="22" height="268" rx="2" fill="#17153b" stroke="#818cf8" strokeWidth="1.8" />
            <line x1="238" y1="62" x2="238" y2="322" stroke="#312e81" strokeWidth="1.5" />
            <line x1="243" y1="62" x2="243" y2="322" stroke="#a5b4fc" strokeWidth="1" opacity="0.6" />
            <line x1="248" y1="62" x2="248" y2="322" stroke="#312e81" strokeWidth="1.5" />
            <rect x="228" y="44" width="30" height="16" rx="2" fill="#242054" stroke="#c7d2fe" strokeWidth="1.5" />

            {/* Sacred High Gothic Elven Arch */}
            <path
              d="M 20 52 Q 135 -14, 250 52"
              fill="none"
              stroke="#312e81"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M 24 52 Q 135 -4, 246 52"
              fill="none"
              stroke="#c7d2fe"
              strokeWidth="2.5"
            />
            {/* Constellation filigree across arch */}
            <path
              d="M 45 42 Q 135 12, 225 42"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="1"
              strokeDasharray="4 6"
              opacity="0.8"
            />

            {/* Sacred Moon Crest & Lunar Ring */}
            <circle cx="135" cy="18" r="16" fill="#1e1b4b" stroke="#e0e7ff" strokeWidth="2" />
            <path
              d="M 135 6 A 12 12 0 1 0 145 26 A 9 9 0 1 1 135 6 Z"
              fill="#e0e7ff"
              filter="drop-shadow(0 0 6px #818cf8)"
            />
            <circle cx="135" cy="18" r="22" fill="none" stroke="#a5b4fc" strokeWidth="0.8" strokeDasharray="3 4" />

            {/* Cascading Starlight Wisteria Vines on Left Column */}
            <path d="M 36 75 Q 45 130, 38 185 Q 46 225, 39 265" fill="none" stroke="#818cf8" strokeWidth="1.4" />
            <circle cx="43" cy="115" r="3.5" fill="#c7d2fe" />
            <circle cx="36" cy="155" r="3" fill="#e0e7ff" />
            <circle cx="44" cy="200" r="3.5" fill="#c7d2fe" />
            <circle cx="38" cy="245" r="2.8" fill="#e0e7ff" />

            {/* Cascading Starlight Wisteria Vines on Right Column */}
            <path d="M 234 75 Q 225 130, 232 185 Q 224 225, 231 265" fill="none" stroke="#818cf8" strokeWidth="1.4" />
            <circle cx="227" cy="115" r="3.5" fill="#c7d2fe" />
            <circle cx="234" cy="155" r="3" fill="#e0e7ff" />
            <circle cx="226" cy="200" r="3.5" fill="#c7d2fe" />
            <circle cx="232" cy="245" r="2.8" fill="#e0e7ff" />
          </g>
        );
      default:
        return null;
    }
  };

  // Ultra-smooth, GPU-friendly rotating vortex (zero heavy CSS blur)
  const renderInnerVortex = () => {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden will-change-transform"
        style={{
          borderRadius:
            portal.shape === 'celestial-circle'
              ? '50%'
              : portal.shape === 'spore-dome'
              ? '50% 50% 40% 40%'
              : portal.shape === 'lunar-arch'
              ? '50% 50% 15% 15%'
              : portal.shape === 'crystal-geode'
              ? '45% 55% 50% 50%'
              : '50%',
          clipPath:
            portal.shape === 'organic-oval'
              ? 'ellipse(44% 46% at 50% 50%)'
              : portal.shape === 'water-oval'
              ? 'ellipse(46% 40% at 50% 50%)'
              : portal.shape === 'crystal-geode'
              ? 'ellipse(36% 40% at 50% 50%)'
              : undefined,
        }}
      >
        {/* Layer 1: Core cosmic deep void */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${portal.colors.vortexGradient[0]} 0%, #030712 90%)`,
          }}
        />

        {/* Layer 2: Clockwise spinning spiral (native gradients without expensive blur filters) */}
        <div
          className="absolute w-[160%] h-[160%] animate-portal-cw opacity-80 will-change-transform"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, 
              transparent 0deg, 
              ${portal.colors.vortexGradient[1]} 60deg, 
              transparent 120deg, 
              ${portal.colors.vortexGradient[2]} 180deg, 
              transparent 240deg, 
              ${portal.colors.vortexGradient[3]} 300deg, 
              transparent 360deg)`,
          }}
        />

        {/* Layer 3: Counter-clockwise spinning ring */}
        <div
          className="absolute w-[130%] h-[130%] animate-portal-ccw opacity-60 will-change-transform"
          style={{
            background: `radial-gradient(circle, transparent 35%, ${portal.colors.primary} 55%, transparent 75%)`,
          }}
        />

        {/* Layer 4: Delicate inner energy filament ring */}
        <div
          className={`absolute rounded-full border transition-all duration-500 ${
            activeHover ? 'w-3/4 h-3/4 scale-105 opacity-90' : 'w-1/2 h-1/2 opacity-50'
          }`}
          style={{
            borderColor: portal.colors.accent,
            borderStyle: 'dashed',
          }}
        />

        {/* Layer 5: Singularity dark eye at center */}
        <div
          className={`rounded-full transition-all duration-300 z-10 ${
            activeHover ? 'w-10 h-10 scale-90' : 'w-14 h-14'
          }`}
          style={{
            background: 'radial-gradient(circle, #020617 40%, transparent 100%)',
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      data-sealed={isSealed ? 'true' : 'false'}
      className="portal-root absolute cursor-pointer transition-transform duration-300 ease-out select-none"
      style={{
        left: `${portal.x}px`,
        top: `${portal.yPercent}%`,
        width: `${portal.width}px`,
        height: `${portal.height}px`,
        transform: `translate3d(-50%, -50%, 0) rotate(${portal.rotation || 0}deg) ${
          activeHover ? 'scale(1.04)' : 'scale(1)'
        }`,
        zIndex: activeHover ? 40 : 20,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={
        isSealed
          ? fmt(UI.portalSealedAria[lang], { name: portal.name[lang] })
          : fmt(UI.portalAria[lang], { name: portal.name[lang], dest: portal.destination?.[lang] ?? '' })
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
    >
      {/* Soft halo: quiet at rest, a little stronger on hover (no pulsing) */}
      <div
        className="absolute inset-0 rounded-full transition-[opacity,box-shadow] duration-300 pointer-events-none"
        style={{
          boxShadow: activeHover ? `0 0 56px 12px ${portal.colors.glow}` : `0 0 32px 4px ${portal.colors.glow}`,
          opacity: activeHover ? 0.7 : 0.35,
        }}
      />

      {/* SVG Container for Natural Frame */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-20"
        viewBox={`0 0 ${portal.width} ${portal.height}`}
      >
        {renderNaturalFrame()}
      </svg>

      {/* Inner Vortex */}
      <div className="absolute inset-4 z-10">{renderInnerVortex()}</div>

      {/* Centre hover label */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-200 ${
          activeHover ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <span className="ap-chip pointer-events-none !bg-[var(--ap-surface)]">
          {isSealed ? <Lock className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          <span>{isSealed ? UI.sealed[lang] : UI.clickToEnter[lang]}</span>
        </span>
      </div>

      {/* Signpost: one neutral card for every portal (rune · destination / status) */}
      <div
        className="absolute z-30 pointer-events-auto"
        style={{
          left: `calc(50% + ${portal.signpost.offsetX}px)`,
          top: `calc(50% + ${portal.signpost.offsetY}px)`,
          width: '184px',
        }}
        onClick={handleClick}
      >
        <div
          className={`ap-panel p-2 transition-colors duration-150 ${
            activeHover ? '!border-[var(--ap-border-strong)]' : ''
          }`}
        >
          {/* Hover-only preview thumbnail (optional; only rendered when the image exists) */}
          {showThumb && (
            <img
              src={portal.previewImage}
              alt=""
              aria-hidden="true"
              decoding="async"
              onLoad={() => setThumbState('ok')}
              onError={() => setThumbState('missing')}
              className={`w-full aspect-video object-cover rounded-[var(--ap-radius-sm)] transition-opacity duration-200 ${
                thumbState === 'ok' ? 'opacity-100 mb-2' : 'opacity-0 h-0'
              }`}
            />
          )}

          <div className="flex items-center gap-2 px-1">
            <span className="font-fantasy text-sm text-[var(--ap-text-muted)] shrink-0" aria-hidden="true">
              {portal.signpost.runeSymbol}
            </span>
            <div className="flex-1 min-w-0">
              <div className="ap-body font-semibold text-white truncate">
                {isSealed ? portal.name[lang] : portal.destination?.[lang]}
              </div>
              <div className="ap-caption truncate">{isSealed ? UI.sealed[lang] : portal.name[lang]}</div>
            </div>
            {!isSealed && (
              <ArrowRight
                className={`w-4 h-4 shrink-0 transition-colors ${
                  activeHover ? 'text-[var(--ap-accent)]' : 'text-[var(--ap-text-dim)]'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PortalComponent = memo(PortalComponentImpl);
