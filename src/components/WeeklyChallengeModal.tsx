import React from 'react';
import { motion } from 'motion/react';
import { X, Zap, Play, Gift, Award } from 'lucide-react';
import { PlayerProfile, GameStats } from '../types';

interface WeeklyChallengeModalProps {
  profile: PlayerProfile;
  stats: GameStats;
  onStartWeekly: () => void;
  onClose: () => void;
}

export const WeeklyChallengeModal: React.FC<WeeklyChallengeModalProps> = ({
  profile,
  stats,
  onStartWeekly,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-indigo-300 shadow-inner">
            <Zap className="w-7 h-7" />
          </div>
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
          Weekly Grand Event
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-black text-white mt-0.5">
          WEEKLY MEGA PUZZLE
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-5">
          Expanded 19-cell Honeycomb • 5 Colors • High Rewards
        </p>

        {/* Rewards Preview */}
        <div className="flex items-center justify-center gap-3 bg-indigo-950/40 border border-indigo-700/60 p-3.5 rounded-2xl mb-6">
          <Gift className="w-5 h-5 text-indigo-400" />
          <div className="text-left">
            <span className="text-xs font-display font-bold text-white block">
              Rewards on Completion
            </span>
            <span className="text-[11px] text-indigo-200">
              🪙 500 Coins • ⚡ 150 XP • ⭐ +3 Stars
            </span>
          </div>
        </div>

        <button
          onClick={onStartWeekly}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-display font-black text-lg shadow-[0_6px_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 transition active:scale-98"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START WEEKLY PUZZLE</span>
        </button>
      </motion.div>
    </div>
  );
};
