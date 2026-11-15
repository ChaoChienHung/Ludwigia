export interface PortalSignpost {
  label: string;
  destination: string;
  subtext: string;
  material: 'mossy-wood' | 'floating-stone' | 'carved-river-rock' | 'amethyst-spire' | 'fungal-bark' | 'ruin-marble';
  offsetX: number; // offset from portal center in px
  offsetY: number; // offset from portal center in px
  statusText: string;
  runeSymbol: string;
}

export interface PortalWorldDetails {
  realmName: string;
  realmType: string;
  climate: string;
  energySource: string;
  guardian: string;
  lore: string;
  visualPreviewPrompt: string;
  audioPreset: 'wood' | 'astral' | 'water' | 'crystal' | 'spore' | 'moon';
  keyFeatures: string[];
  travelCaution: string;
}

export interface PortalItem {
  id: string;
  name: string;
  shape: 'organic-oval' | 'celestial-circle' | 'water-oval' | 'crystal-geode' | 'spore-dome' | 'lunar-arch';
  natureContext: string;
  x: number; // horizontal coordinate in panorama (px, 0 ~ 3400)
  yPercent: number; // vertical percentage (0% = top, 100% = bottom)
  width: number;
  height: number;
  rotation?: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    vortexGradient: string[];
    shadowColor: string;
  };
  signpost: PortalSignpost;
  worldDetails: PortalWorldDetails;
  targetUrl?: string; // Direct link to site surface (e.g. ../garden/index.html or ../labs/world/index.html)
  targetLabel?: string;
  /**
   * Optional hover thumbnail (relative to portals/index.html), e.g. './realms/garden/preview.webp'.
   * Shown on the signpost only while hovered and only if the image actually loads.
   */
  previewImage?: string;
  badgeText?: string;
}
