import React from "react";

interface FlowerRendererProps {
  flowerName: string;
  svgColor: string;
  className?: string;
  size?: number; // width and height in px
}

export const FlowerRenderer: React.FC<FlowerRendererProps> = ({
  flowerName,
  svgColor,
  className = "",
  size = 40,
}) => {
  const normName = flowerName.trim().toLowerCase();

  // Draw the customized blooming crown based on the species
  const renderBloom = () => {
    switch (normName) {
      case "sunflower":
        return (
          <g>
            {/* Outer golden rays - 12 dense pointed petals */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <path
                  key={i}
                  d="M50,15 L53,35 L47,35 Z"
                  fill="#F59E0B"
                  transform={`rotate(${angle}, 50, 50)`}
                  opacity="0.95"
                />
              );
            })}
            {/* Outer glow aura */}
            <circle cx="50" cy="50" r="18" fill={svgColor} opacity="0.2" className="animate-pulse" />
            {/* Large rich brown textured core */}
            <circle cx="50" cy="50" r="18" fill="#451A03" stroke="#F59E0B" strokeWidth="2.5" />
            {/* Seed patterns inside core */}
            <circle cx="50" cy="50" r="12" fill="#1C1917" stroke="#78350F" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx="50" cy="50" r="6" fill="#000" />
          </g>
        );

      case "lavender":
        return (
          <g>
            {/* Dynamic vertical stacking - 5 levels of miniature violet buds */}
            <circle cx="50" cy="50" r="22" fill={svgColor} opacity="0.15" />
            {/* Level 1 Bottom */}
            <ellipse cx="40" cy="72" rx="7" ry="5" fill="#7C3AED" />
            <ellipse cx="60" cy="72" rx="7" ry="5" fill="#7C3AED" />
            <circle cx="50" cy="69" r="6" fill="#8B5CF6" />
            {/* Level 2 */}
            <ellipse cx="41" cy="57" rx="7" ry="5" fill="#8B5CF6" />
            <ellipse cx="59" cy="57" rx="7" ry="5" fill="#8B5CF6" />
            <circle cx="50" cy="54" r="6.5" fill="#A78BFA" />
            {/* Level 3 */}
            <ellipse cx="43" cy="42" rx="6.5" ry="4.5" fill="#A78BFA" />
            <ellipse cx="57" cy="42" rx="6.5" ry="4.5" fill="#A78BFA" />
            <circle cx="50" cy="39" r="6" fill="#C4B5FD" />
            {/* Level 4 */}
            <circle cx="44" cy="28" r="5" fill="#C4B5FD" />
            <circle cx="56" cy="28" r="5" fill="#C4B5FD" />
            <circle cx="50" cy="26" r="5.5" fill="#DDD6FE" />
            {/* Level 5 Top Tip */}
            <circle cx="50" cy="14" r="5" fill="#E9D5FF" />
          </g>
        );

      case "daisy":
        return (
          <g>
            {/* Outer halo */}
            <circle cx="50" cy="50" r="16" fill={svgColor} opacity="0.18" className="animate-ping" style={{ animationDuration: "4s" }} />
            {/* 10 slender white classic radiating petals */}
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i * 360) / 10;
              return (
                <ellipse
                  key={i}
                  cx="50"
                  cy="24"
                  rx="7"
                  ry="18"
                  fill="#F9FAFB"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  transform={`rotate(${angle}, 50, 50)`}
                  opacity="0.95"
                />
              );
            })}
            {/* Radiant gold textured center dome */}
            <circle cx="50" cy="50" r="12" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
            <circle cx="50" cy="50" r="6" fill="#FACC15" />
          </g>
        );

      case "lotus":
        return (
          <g>
            {/* Delicate pink/teal overlapping curved layers spreading upwards */}
            <circle cx="50" cy="50" r="23" fill={svgColor} opacity="0.15" />
            {/* Outer support petals */}
            <path d="M50,82 Q15,65 15,45 Q50,90 50,82" fill="#0D9488" opacity="0.4" />
            <path d="M50,82 Q85,65 85,45 Q50,90 50,82" fill="#0D9488" opacity="0.4" />
            {/* Back layered petals */}
            <path d="M50,80 Q25,40 30,22 Q50,55 50,80" fill="#14B8A6" opacity="0.8" />
            <path d="M50,80 Q75,40 70,22 Q50,55 50,80" fill="#14B8A6" opacity="0.8" />
            <path d="M50,80 Q50,25 50,15 Q50,55 50,80" fill="#2DD4BF" opacity="0.85" />
            {/* Inside front layers */}
            <path d="M50,80 Q35,46 41,30 Q50,62 50,80" fill="#5EEAD4" />
            <path d="M50,80 Q65,46 59,30 Q50,62 50,80" fill="#5EEAD4" />
            {/* Golden seed pod in heart */}
            <ellipse cx="50" cy="62" rx="9" ry="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          </g>
        );

      case "tulip":
        return (
          <g>
            {/* Elegant egg-shaped vector tulip goblet */}
            <circle cx="50" cy="50" r="21" fill={svgColor} opacity="0.16" />
            {/* Back petals */}
            <path d="M32,70 C24,40 40,24 50,24 C60,24 76,40 68,70 Z" fill="#E11D48" opacity="0.75" />
            {/* Left lateral petal */}
            <path d="M30,70 Q24,32 46,26 Q54,55 30,70" fill="#F43F5E" />
            {/* Right lateral petal */}
            <path d="M70,70 Q76,32 54,26 Q46,55 70,70" fill="#F43F5E" />
            {/* Center overlapping focal petal */}
            <path d="M50,72 C41,72 36,46 50,27 C64,46 59,72 50,72 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
          </g>
        );

      case "rose":
        return (
          <g>
            {/* Swirling concentric layered velvet petals */}
            <circle cx="50" cy="50" r="22" fill={svgColor} opacity="0.2" className="animate-pulse" />
            {/* Layer 1: Base outline shield */}
            <circle cx="50" cy="50" r="20" fill="#B91C1C" />
            {/* Layer 2: Major outer cradles */}
            <path d="M50,30 C32,32 28,45 32,60 C38,72 62,72 68,60 C72,45 68,32 50,30 Z" fill="#DC2626" />
            {/* Layer 3: Secondary offset whorls */}
            <path d="M50,36 C40,38 36,48 40,58 C44,66 56,66 60,58 C64,48 60,38 50,36 Z" fill="#EF4444" />
            {/* Layer 4: Tight inner rosebud cores */}
            <path d="M50,42 Q44,44 46,51 Q50,56 54,51 Q56,44 50,42" fill="#FCA5A5" />
            <path d="M50,45 Q50,52 48,51 L52,51 Z" fill="#FEF2F2" />
          </g>
        );

      case "sakura":
      case "cherry blossom":
        return (
          <g>
            <circle cx="50" cy="50" r="18" fill={svgColor} opacity="0.2" />
            {/* 5 beautifully notched cherry blossom petals */}
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = (i * 360) / 5;
              return (
                <path
                  key={i}
                  d="M50,50 C40,40 33,24 45,14 L50,19 L55,14 C67,24 60,40 50,50 Z"
                  fill="#EC4899"
                  opacity="0.9"
                  transform={`rotate(${angle}, 50, 50)`}
                />
              );
            })}
            {/* Center crown of stamens */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2="50"
                  y2="36"
                  stroke="#FBBF24"
                  strokeWidth="1.2"
                  transform={`rotate(${angle}, 50, 50)`}
                />
              );
            })}
            {/* Central core */}
            <circle cx="50" cy="50" r="4.5" fill="#F472B6" stroke="#EF4444" strokeWidth="1" />
          </g>
        );

      case "orchid":
        return (
          <g>
            {/* Dynamic, gorgeous bilaterally symmetric Orchid assembly! */}
            {/* Background glowing aura */}
            <circle cx="50" cy="50" r="24" fill={svgColor} opacity="0.18" className="animate-pulse" />
            
            {/* 1. Three wide outer sepals (one top-center, two spreading diagonally down) */}
            <ellipse cx="50" cy="26" rx="11" ry="17" fill="#818CF8" opacity="0.85" />
            <ellipse cx="33" cy="68" rx="11" ry="16" fill="#818CF8" opacity="0.85" transform="rotate(-35, 33, 68)" />
            <ellipse cx="67" cy="68" rx="11" ry="16" fill="#818CF8" opacity="0.85" transform="rotate(35, 67, 68)" />

            {/* 2. Two elegant wide horizontal lateral wings (the grand petals) */}
            <ellipse cx="26" cy="46" rx="17" ry="12" fill="#6366F1" />
            <ellipse cx="74" cy="46" rx="17" ry="12" fill="#6366F1" />
            {/* Inner highlight veins for wings */}
            <ellipse cx="28" cy="46" rx="11" ry="5" fill="#C7D2FE" opacity="0.6" />
            <ellipse cx="72" cy="46" rx="11" ry="5" fill="#C7D2FE" opacity="0.6" />

            {/* 3. The prominent lower bell-shaped Labellum (the Orchid Lip!) */}
            <path
              d="M38,54 Q50,78 62,54 Q50,60 38,54"
              fill="#F43F5E"
              stroke="#E11D48"
              strokeWidth="1.5"
            />
            {/* Orchid golden heart column */}
            <circle cx="50" cy="51" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            <circle cx="50" cy="49" r="3.5" fill="#FFF" />
          </g>
        );

      case "dandelion":
        return (
          <g>
            {/* Fluffy delicate seed bundle - fine lines and starry points */}
            <circle cx="50" cy="50" r="23" fill={svgColor} opacity="0.14" className="animate-pulse" />
            {/* Radiating seed paths */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const len = i % 2 === 0 ? 36 : 28;
              return (
                <g key={i} transform={`rotate(${angle}, 50, 50)`}>
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2={50 - len}
                    stroke="#FFF"
                    strokeWidth="1.1"
                    opacity="0.8"
                  />
                  {/* Fluff crown star */}
                  <circle cx="50" cy={50 - len} r="2.5" fill={svgColor} />
                  <line x1="47.5" y1={50 - len} x2="52.5" y2={50 - len} stroke="#FFF" strokeWidth="0.6" />
                  <line x1="50" y1={50 - len - 2.5} x2="50" y2={50 - len + 2.5} stroke="#FFF" strokeWidth="0.6" />
                </g>
              );
            })}
            {/* Miniature golden center seed cluster */}
            <circle cx="50" cy="50" r="8" fill="#10B981" />
            <circle cx="50" cy="50" r="5" fill="#34D399" />
          </g>
        );

      case "jasmine":
        return (
          <g>
            {/* Simple five-lobed delicate star-shaped pure white flower */}
            <circle cx="50" cy="50" r="16" fill={svgColor} opacity="0.2" />
            {Array.from({ length: 5 }).map((_, i) => {
              const angle = (i * 360) / 5;
              return (
                <ellipse
                  key={i}
                  cx="50"
                  cy="29"
                  rx="9"
                  ry="18"
                  fill="#FFFFFF"
                  stroke="#BAE6FD"
                  strokeWidth="1"
                  transform={`rotate(${angle}, 50, 50)`}
                />
              );
            })}
            {/* Delicate lime green center pistil */}
            <circle cx="50" cy="50" r="5.5" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
            <circle cx="50" cy="50" r="2.5" fill="#FEF08A" />
          </g>
        );

      default:
        // Elegant fallback (A beautifully styled general wild flower)
        return (
          <g>
            <circle cx="50" cy="50" r="16" fill={svgColor} opacity="0.2" className="animate-ping" style={{ animationDuration: "5s" }} />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8;
              return (
                <circle
                  key={i}
                  cx="50"
                  cy="32"
                  r="11"
                  fill={svgColor}
                  opacity="0.88"
                  transform={`rotate(${angle}, 50, 50)`}
                />
              );
            })}
            <circle cx="50" cy="50" r="11" fill="#FFFFFF" stroke={svgColor} strokeWidth="2.5" />
            <circle cx="50" cy="50" r="6" fill="#FBBF24" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`transition-all duration-300 ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {renderBloom()}
    </svg>
  );
};
