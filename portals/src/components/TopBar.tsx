import React, { useState } from 'react';
import { wonderlandAudio } from '../utils/audio';
import { Volume2, VolumeX, RotateCcw, Sprout, Globe, Home } from 'lucide-react';
import { Lang, UI } from '../i18n';

interface TopBarProps {
  lang: Lang;
  onResetView: () => void;
}

// Slim header: brand (also resets the view), the two realm shortcuts, home, sound.
// Portal-by-portal navigation lives in the bottom minimap.
export const TopBar: React.FC<TopBarProps> = ({ lang, onResetView }) => {
  const [isMuted, setIsMuted] = useState(wonderlandAudio.getMuted());

  const handleAudioToggle = () => {
    setIsMuted(wonderlandAudio.toggleMute());
  };

  return (
    <header className="portal-hall-header fixed top-0 left-0 right-0 z-40 h-16 md:h-[76px] px-4 md:px-8 flex items-center justify-between gap-3 select-none">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onResetView();
        }}
        className="portal-hall-brand font-fantasy font-bold text-white hover:text-[var(--ap-accent)] transition-colors whitespace-nowrap"
        title={UI.resetView[lang]}
      >
        {UI.brand[lang]}
      </a>

      <nav className="portal-hall-nav flex items-center gap-2" aria-label="Portals">
        <a href="./realms/garden/index.html" className="ap-chip" title={UI.goGarden[lang]} aria-label={UI.goGarden[lang]}>
          <Sprout className="w-[18px] h-[18px]" aria-hidden="true" />
          <span className="hidden md:inline">{UI.garden[lang]}</span>
        </a>
        <a href="./realms/pensieve/index.html" className="ap-chip" title={UI.goPensieve[lang]} aria-label={UI.goPensieve[lang]}>
          <Globe className="w-[18px] h-[18px]" aria-hidden="true" />
          <span className="hidden md:inline">{UI.pensieve[lang]}</span>
        </a>
        <a href="../index.html" className="ap-chip ap-chip--icon" title={UI.goHome[lang]} aria-label={UI.goHome[lang]}>
          <Home className="w-[18px] h-[18px]" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onResetView}
          className="ap-chip ap-chip--icon hidden sm:inline-flex"
          title={UI.resetView[lang]}
          aria-label={UI.resetView[lang]}
        >
          <RotateCcw className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleAudioToggle}
          className="ap-chip ap-chip--icon"
          aria-pressed={!isMuted}
          title={isMuted ? UI.soundOn[lang] : UI.soundOff[lang]}
          aria-label={isMuted ? UI.soundOn[lang] : UI.soundOff[lang]}
        >
          {isMuted ? <VolumeX className="w-[18px] h-[18px]" aria-hidden="true" /> : <Volume2 className="w-[18px] h-[18px]" aria-hidden="true" />}
        </button>
      </nav>
    </header>
  );
};
