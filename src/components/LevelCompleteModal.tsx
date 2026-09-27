import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, Play, Grid, Flame, Home, ArrowLeft } from 'lucide-react';
import { LevelData } from '../types';
import { soundManager } from '../audio/soundManager';

interface LevelCompleteModalProps {
  level: LevelData;
  score: number;
  bestScore: number;
  movesMade: number;
  stars: number; // 1, 2, or 3
  coinsAwarded: number;
  xpAwarded: number;
  isDaily?: boolean;
  dailyStreak?: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  onQuitToMenu?: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  bestScore,
  movesMade,
  stars,
  coinsAwarded,
  xpAwarded,
  isDaily = false,
  dailyStreak = 1,
  onNextLevel,
  onReplay,
  onLevelSelect,
  onQuitToMenu,
  hasNextLevel,
}) => {
  useEffect(() => {
    soundManager.playLevelComplete();

    // Trigger celebratory confetti burst
    const end = Date.now() + 1000;
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0.15, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 0.85, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 border-2 border-amber-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
          {isDaily ? "Today's Daily Challenge Solved" : `Level ${level.id} Complete`}
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-black text-white mt-0.5 mb-3">
          {isDaily ? 'DAILY PUZZLE WON!' : 'PUZZLE COMPLETE!'}
        </h2>

        {/* Daily Streak Highlight Banner */}
        {isDaily ? (
          <div className="bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 border border-orange-500/50 rounded-2xl p-3 mb-5 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-6 h-6 fill-orange-400" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-orange-300 uppercase font-black tracking-wider">
                Daily Win Streak Increased!
              </div>
              <div className="text-lg font-display font-black text-white">
                {dailyStreak} {dailyStreak === 1 ? 'Day' : 'Days'} In A Row 🔥
              </div>
            </div>
          </div>
        ) : (
          /* 3-Star Rating Animation for Campaign */
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3].map((starIndex) => {
              const isEarned = starIndex <= stars;
              return (
                <motion.div
                  key={starIndex}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: isEarned ? 1.15 : 0.95, rotate: 0 }}
                  transition={{ delay: 0.15 * starIndex, type: 'spring', stiffness: 400 }}
                  className={`p-2 rounded-2xl border transition-all ${
                    isEarned
                      ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-yellow-200 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-800/80 border-slate-700 text-slate-600'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 md:w-10 md:h-10 ${isEarned ? 'fill-current' : ''}`}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Score & Moves Metric Card */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/80 mb-5 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</div>
            <div className="text-lg font-display font-extrabold text-amber-300">
              {score.toLocaleString()}
            </div>
          </div>
          <div className="border-x border-slate-700/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best</div>
            <div className="text-lg font-display font-extrabold text-cyan-300">
              {Math.max(score, bestScore).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Moves</div>
            <div className="text-lg font-display font-extrabold text-slate-100">{movesMade}</div>
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-base">🪙</span>
            <span className="text-xs md:text-sm font-bold text-amber-300">+{coinsAwarded} Coins</span>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
            <span className="text-base">⚡</span>
            <span className="text-xs md:text-sm font-bold text-indigo-300">+{xpAwarded} XP</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        {isDaily ? (
          <button
            onClick={onQuitToMenu || onLevelSelect}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-slate-950 font-display font-black text-base shadow-[0_6px_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>RETURN TO MENU</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            {hasNextLevel && (
              <button
                onClick={onNextLevel}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-display font-black text-base shadow-[0_6px_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>NEXT LEVEL</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onReplay}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-600 font-display font-bold text-sm flex items-center justify-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>REPLAY</span>
              </button>
              <button
                onClick={onLevelSelect}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-600 font-display font-bold text-sm flex items-center justify-center gap-1.5 transition"
              >
                <Grid className="w-4 h-4" />
                <span>LEVELS</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
