/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { CosmicCanvas } from './components/CosmicCanvas';
import { useGameStore } from './store/useGameStore';
import { Users } from 'lucide-react';

export default function App() {
  const connect = useGameStore((state) => state.connect);
  const disconnect = useGameStore((state) => state.disconnect);
  const players = useGameStore((state) => state.players);
  const myColor = useGameStore((state) => state.myColor);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const playerCount = Object.keys(players).length + 1;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans">
      <CosmicCanvas />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex justify-between items-start z-10">
        <div className="space-y-3 pointer-events-auto">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-100/80">
            <span className="rounded-full border border-fuchsia-400/60 bg-fuchsia-500/15 px-3 py-1 text-fuchsia-300">
              Work in Progress
            </span>
            <a
              href="../../labs/index.html"
              className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-300 transition hover:bg-cyan-400/20"
            >
              Labs
            </a>
            <a
              href="../../labs/shooting-mode/index.html"
              className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-300 transition hover:bg-cyan-400/20"
            >
              Shooting Mode Brief
            </a>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Cosmic Flow
          </h1>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Move cursor to spawn particles.<br/>
            <span className="text-white font-medium">Left click</span> to place an attractor.<br/>
            <span className="text-white font-medium">Spacebar</span> to place a repulsor.
          </p>
          <p className="text-xs text-cyan-100/70 max-w-sm leading-relaxed">
            Current prototype focus: ambient motion, shared presence, and a softer alternative to the shooter path.
            Scope, progression, and site-level framing are still in flux.
          </p>
          
          {myColor && (
            <div className="flex items-center gap-2 mt-4">
              <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: myColor }} />
              <span className="text-xs text-gray-400 uppercase tracking-wider">Your Color</span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Users size={16} className="text-cyan-400" />
            <span className="text-sm font-medium">{playerCount} {playerCount === 1 ? 'Player' : 'Players'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
