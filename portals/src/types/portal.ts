import type { LocalizedText } from '../i18n';

export type PortalShape =
  | 'organic-oval'
  | 'celestial-circle'
  | 'water-oval'
  | 'crystal-geode'
  | 'spore-dome'
  | 'lunar-arch';

export type SignpostMaterial =
  | 'mossy-wood'
  | 'floating-stone'
  | 'carved-river-rock'
  | 'amethyst-spire'
  | 'fungal-bark'
  | 'ruin-marble';

export type AudioPreset = 'wood' | 'astral' | 'water' | 'crystal' | 'spore' | 'moon';

/**
 * One portal in the lobby. Kept deliberately small (see docs/specs/realm-spec.md §4):
 * placement + artwork style + two short localized strings + an optional destination.
 */
export interface PortalItem {
  id: string;
  /** Short portal name, e.g. "古樹之門" / "Rootweave Gate" */
  name: LocalizedText;
  /** Destination realm name; only needed when targetUrl is set */
  destination?: LocalizedText;
  /** Relative to portals/index.html, e.g. './realms/garden/index.html'. Omit = sealed portal. */
  targetUrl?: string;
  /**
   * Optional hover thumbnail (relative to portals/index.html), e.g. './realms/garden/preview.webp'.
   * Shown on the signpost only while hovered and only if the image actually loads.
   */
  previewImage?: string;

  // --- Placement on the 3400px panorama ---
  x: number; // horizontal centre (px, 0 ~ 3400)
  yPercent: number; // vertical centre (0% = top, 100% = bottom)
  width: number;
  height: number;
  rotation?: number;

  // --- Artwork ---
  shape: PortalShape;
  colors: {
    primary: string;
    accent: string;
    glow: string; // rgba() used for the soft halo
    vortexGradient: [string, string, string, string];
  };
  signpost: {
    material: SignpostMaterial;
    offsetX: number; // px from portal centre
    offsetY: number;
    runeSymbol: string;
  };
  audioPreset: AudioPreset;
}
