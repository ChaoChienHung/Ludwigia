export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimePhaseConfig {
  id: TimePhase;
  name: string;
  subname: string;
  description: string;
  skyBackground: string;
  skyFilter: string;
  mountainGrad: {
    stop0: string;
    stop60: string;
    stop100: string;
    rimGlow: string;
  };
  forestGrad: {
    stop0: string;
    stop50: string;
    stop100: string;
  };
  glowIntensity: number; // 0.6 ~ 1.5 multiplier
  sunOpacity: number;
  sunPosition: { x: number; y: number };
  moonOpacity: number;
  fogGradient: string;
  auroraMist: string;
  ambientTint: string;
  particleColors: string[];
}

export const TIME_PHASE_CONFIGS: Record<TimePhase, TimePhaseConfig> = {
  dawn: {
    id: 'dawn',
    name: '晨曦破曉',
    subname: 'Golden Aurora Dawn',
    description: '暖金朝霞初染林冠，夜霧泛起琥珀光華，微光古木漸次甦醒。',
    skyBackground: 'radial-gradient(ellipse at 50% 25%, #2a1b2d 0%, #1a1528 50%, #0d121f 100%)',
    skyFilter: 'saturate(1.2) brightness(1.1) sepia(0.15)',
    mountainGrad: {
      stop0: '#2d1f30',
      stop60: '#1c1626',
      stop100: '#0c0f18',
      rimGlow: 'rgba(251, 146, 60, 0.65)',
    },
    forestGrad: {
      stop0: '#1b2a26',
      stop50: '#12201d',
      stop100: '#07100e',
    },
    glowIntensity: 0.85,
    sunOpacity: 0.85,
    sunPosition: { x: 580, y: 130 },
    moonOpacity: 0.2,
    fogGradient: 'linear-gradient(to top, rgba(20, 16, 28, 0.95) 0%, rgba(45, 27, 40, 0.5) 50%, transparent 100%)',
    auroraMist: 'radial-gradient(circle at 25% 30%, rgba(251, 146, 60, 0.28) 0%, transparent 55%), radial-gradient(circle at 65% 25%, rgba(244, 63, 94, 0.22) 0%, transparent 50%), radial-gradient(circle at 85% 40%, rgba(253, 224, 71, 0.2) 0%, transparent 45%)',
    ambientTint: 'rgba(251, 146, 60, 0.08)',
    particleColors: [
      'rgba(251, 191, 36, ', // gold
      'rgba(251, 146, 60, ', // warm amber
      'rgba(253, 230, 138, ', // pale gold
      'rgba(52, 211, 153, ', // leaf green
    ],
  },
  day: {
    id: 'day',
    name: '翡翠正午',
    subname: 'Verdant Solar Zenith',
    description: '穿透蒼穹的精靈烈陽普照，翡翠樹海與瀑布折射璀璨光暈。',
    skyBackground: 'radial-gradient(ellipse at 50% 20%, #133a4a 0%, #0c2633 55%, #05141c 100%)',
    skyFilter: 'saturate(1.25) brightness(1.25)',
    mountainGrad: {
      stop0: '#163b45',
      stop60: '#0e2933',
      stop100: '#05161d',
      rimGlow: 'rgba(56, 189, 248, 0.8)',
    },
    forestGrad: {
      stop0: '#16433b',
      stop50: '#0f312c',
      stop100: '#061917',
    },
    glowIntensity: 0.75,
    sunOpacity: 1.0,
    sunPosition: { x: 1200, y: 70 },
    moonOpacity: 0.05,
    fogGradient: 'linear-gradient(to top, rgba(6, 26, 28, 0.92) 0%, rgba(13, 56, 54, 0.45) 50%, transparent 100%)',
    auroraMist: 'radial-gradient(circle at 35% 25%, rgba(56, 189, 248, 0.25) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(52, 211, 153, 0.3) 0%, transparent 55%)',
    ambientTint: 'rgba(56, 189, 248, 0.06)',
    particleColors: [
      'rgba(52, 211, 153, ', // emerald
      'rgba(56, 189, 248, ', // sky cyan
      'rgba(110, 231, 183, ', // light green
      'rgba(254, 240, 138, ', // sun dust
    ],
  },
  dusk: {
    id: 'dusk',
    name: '暮色紫霞',
    subname: 'Twilight Amethyst Mist',
    description: '夕陽沒入遠山，紫霞與以太離子交織，晶礦裂隙開始散發異彩。',
    skyBackground: 'radial-gradient(ellipse at 50% 25%, #2b1138 0%, #190a26 50%, #0a0614 100%)',
    skyFilter: 'saturate(1.3) brightness(0.95)',
    mountainGrad: {
      stop0: '#291136',
      stop60: '#1c0a26',
      stop100: '#0c0512',
      rimGlow: 'rgba(216, 70, 239, 0.75)',
    },
    forestGrad: {
      stop0: '#23142e',
      stop50: '#170c20',
      stop100: '#09040d',
    },
    glowIntensity: 1.25,
    sunOpacity: 0.45,
    sunPosition: { x: 2600, y: 150 },
    moonOpacity: 0.65,
    fogGradient: 'linear-gradient(to top, rgba(16, 6, 24, 0.96) 0%, rgba(42, 14, 56, 0.55) 50%, transparent 100%)',
    auroraMist: 'radial-gradient(circle at 30% 35%, rgba(216, 70, 239, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(168, 85, 247, 0.35) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.2) 0%, transparent 45%)',
    ambientTint: 'rgba(168, 85, 247, 0.1)',
    particleColors: [
      'rgba(192, 132, 252, ', // purple
      'rgba(244, 114, 182, ', // pink
      'rgba(147, 51, 234, ', // deep violet
      'rgba(251, 146, 60, ', // sunset amber
    ],
  },
  night: {
    id: 'night',
    name: '幽夜極光',
    subname: 'Bioluminescent Midnight',
    description: '深邃夜幕降臨，雙生月輝照耀，整座仙境進入全螢光極限共振。',
    skyBackground: 'radial-gradient(ellipse at 50% 15%, #0d1e33 0%, #06111f 55%, #030710 100%)',
    skyFilter: 'saturate(1.15) brightness(1.0)',
    mountainGrad: {
      stop0: '#0c2338',
      stop60: '#081726',
      stop100: '#030911',
      rimGlow: 'rgba(56, 189, 248, 0.6)',
    },
    forestGrad: {
      stop0: '#0a2624',
      stop50: '#061b1b',
      stop100: '#020a0b',
    },
    glowIntensity: 1.45,
    sunOpacity: 0.0,
    sunPosition: { x: 0, y: 0 },
    moonOpacity: 0.95,
    fogGradient: 'linear-gradient(to top, rgba(2, 6, 13, 0.95) 0%, rgba(4, 11, 20, 0.6) 50%, transparent 100%)',
    auroraMist: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.22) 0%, transparent 45%), radial-gradient(circle at 60% 25%, rgba(6, 182, 212, 0.25) 0%, transparent 50%), radial-gradient(circle at 85% 35%, rgba(168, 85, 247, 0.24) 0%, transparent 45%)',
    ambientTint: 'rgba(6, 182, 212, 0.08)',
    particleColors: [
      'rgba(52, 211, 153, ', // emerald
      'rgba(56, 189, 248, ', // sky cyan
      'rgba(192, 132, 252, ', // purple
      'rgba(20, 184, 166, ', // teal
      'rgba(251, 191, 36, ', // gold spore
    ],
  },
};
