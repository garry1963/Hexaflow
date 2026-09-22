import React from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Play, Trophy, Flame, Clock } from 'lucide-react';
import { PlayerProfile, GameStats } from '../types';

interface DailyChallengeModalProps {
  profile: PlayerProfile;
  stats: GameStats;
  onStartDaily: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  profile,
  stats,
  onStartDaily,
  onClose,
}) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Calculate day of year for puzzle number
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
          Special Event
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-black text-white mt-0.5">
          TODAY'S CHALLENGE
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-5">
          {dateStr} • Puzzle #{dayOfYear}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 mb-6">
          <div className="flex flex-col items-center">
            <Trophy className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Best Score</span>
            <span className="text-sm font-display font-extrabold text-white">
              {stats.highestScore > 0 ? stats.highestScore.toLocaleString() : '---'}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-700">
            <Flame className="w-4 h-4 text-orange-400 mb-1 fill-orange-400" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Streak</span>
            <span className="text-sm font-display font-extrabold text-orange-400">
              {profile.dailyStreak} Days
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Completed</span>
            <span className="text-sm font-display font-extrabold text-white">
              {stats.dailyChallengesCompleted}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-6">
          Deterministic daily board with special target colors and combo bonus rewards!
        </p>

        <button
          onClick={onStartDaily}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-display font-black text-lg shadow-[0_6px_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition active:scale-98"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START CHALLENGE</span>
        </button>
      </motion.div>
    </div>
  );
};
