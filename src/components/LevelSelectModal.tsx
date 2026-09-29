import React from 'react';
import { motion } from 'motion/react';
import { X, Lock, Star, Play, Sparkles } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../data/levels';
import { PlayerProfile } from '../types';

interface LevelSelectModalProps {
  profile: PlayerProfile;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
  onOpenGenerator?: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  profile,
  onSelectLevel,
  onClose,
  onOpenGenerator,
}) => {
  // Group levels by World
  const worlds = [
    { id: 1, name: 'World 1: Introduction', range: [1, 5] },
    { id: 2, name: 'World 2: Fundamentals', range: [6, 10] },
    { id: 3, name: 'World 3: Strategy', range: [11, 15] },
    { id: 4, name: 'World 4: Advanced', range: [16, 20] },
    { id: 5, name: 'World 5: Crystal Caverns', range: [21, 25] },
    { id: 6, name: 'World 6: Quantum Swarm', range: [26, 30] },
    { id: 7, name: 'World 7: Grand Apex', range: [31, 35] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
              Campaign Map
            </span>
            <h2 className="text-xl md:text-2xl font-display font-black text-white">
              SELECT LEVEL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Levels Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {worlds.map((world) => {
            const worldLevels = CAMPAIGN_LEVELS.filter(
              (l) => l.id >= world.range[0] && l.id <= world.range[1]
            );

            return (
              <div key={world.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-display font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>{world.name}</span>
                  <span className="text-xs text-slate-500 font-normal">
                    Levels {world.range[0]} - {world.range[1]}
                  </span>
                </h3>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {worldLevels.map((lvl) => {
                    const isCompleted = !!profile.completedLevels[lvl.id];
                    // Unlocked if level <= currentLevel or level 1
                    const isUnlocked = lvl.id <= profile.currentLevel || isCompleted;
                    const levelData = profile.completedLevels[lvl.id];
                    const stars = levelData?.stars || 0;

                    return (
                      <button
                        key={lvl.id}
                        disabled={!isUnlocked}
                        onClick={() => onSelectLevel(lvl.id)}
                        className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center ${
                          isUnlocked
                            ? isCompleted
                              ? 'bg-slate-800/90 border-emerald-500/50 hover:border-emerald-400 hover:scale-105 active:scale-95 shadow-md'
                              : 'bg-gradient-to-b from-cyan-900/50 to-slate-800 border-cyan-500 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Level Number */}
                        <span className="text-xs font-semibold text-slate-400">Level</span>
                        <span className="text-lg font-display font-black text-white my-0.5">
                          {lvl.id}
                        </span>

                        {/* Status: Stars or Lock */}
                        {isUnlocked ? (
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600 mt-1" />
                        )}

                        {/* Best Score if completed */}
                        {levelData && (
                          <span className="text-[9px] text-cyan-300 font-mono mt-1">
                            {levelData.bestScore.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {onOpenGenerator && (
          <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400">Want custom puzzles?</span>
            <button
              onClick={() => {
                onClose();
                onOpenGenerator();
              }}
              className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-display font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Puzzle Generator & Archive</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
