import React from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Play, Trophy, Flame, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { PlayerProfile, GameStats } from '../types';
import { getTodayDailyStatus, canAttemptDaily } from '../utils/dailyPuzzle';

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

  const status = getTodayDailyStatus(profile);
  const canPlay = canAttemptDaily(profile);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden ${
          status === 'completed'
            ? 'border-emerald-500/60'
            : status === 'failed'
            ? 'border-rose-500/60'
            : 'border-amber-500/50'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 blur-3xl pointer-events-none ${
            status === 'completed'
              ? 'bg-emerald-500/25'
              : status === 'failed'
              ? 'bg-rose-500/25'
              : 'bg-amber-500/25'
          }`}
        />

        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
              status === 'completed'
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300'
                : status === 'failed'
                ? 'bg-rose-500/20 border border-rose-400/50 text-rose-300'
                : 'bg-amber-500/20 border border-amber-400/50 text-amber-300'
            }`}
          >
            {status === 'completed' ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : status === 'failed' ? (
              <XCircle className="w-8 h-8" />
            ) : (
              <Calendar className="w-7 h-7" />
            )}
          </div>
        </div>

        <span
          className={`text-xs uppercase font-bold tracking-widest ${
            status === 'completed'
              ? 'text-emerald-400'
              : status === 'failed'
              ? 'text-rose-400'
              : 'text-amber-400'
          }`}
        >
          {status === 'completed'
            ? 'COMPLETED TODAY'
            : status === 'failed'
            ? 'ATTEMPT USED'
            : '1 ATTEMPT ONLY'}
        </span>

        <h2 className="text-2xl md:text-3xl font-display font-black text-white mt-0.5">
          DAILY PUZZLE #{dayOfYear}
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1 mb-4">
          {dateStr}
        </p>

        {/* Daily Win Streak & Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700 mb-5">
          <div className="flex flex-col items-center">
            <Flame className="w-4 h-4 text-orange-400 mb-1 fill-orange-400" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Win Streak</span>
            <span className="text-sm font-display font-extrabold text-orange-400">
              {profile.dailyStreak} {profile.dailyStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-slate-700">
            <Trophy className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Best Score</span>
            <span className="text-sm font-display font-extrabold text-white">
              {stats.highestScore > 0 ? stats.highestScore.toLocaleString() : '---'}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Solved</span>
            <span className="text-sm font-display font-extrabold text-white">
              {stats.dailyChallengesCompleted}
            </span>
          </div>
        </div>

        {/* Status Message Cards */}
        {status === 'completed' && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 mb-5 text-emerald-200 text-xs">
            <div className="flex items-center justify-center gap-1.5 font-bold mb-1 text-sm text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Today's Daily Puzzle Completed!</span>
            </div>
            <p className="text-slate-300">
              You've mastered today's challenge! Daily win streak is currently{' '}
              <strong className="text-orange-400 font-bold">{profile.dailyStreak} {profile.dailyStreak === 1 ? 'day' : 'days'}</strong>.
              Come back tomorrow for the next puzzle!
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 mb-5 text-rose-200 text-xs">
            <div className="flex items-center justify-center gap-1.5 font-bold mb-1 text-sm text-rose-300">
              <XCircle className="w-4 h-4" />
              <span>Attempt Used for Today</span>
            </div>
            <p className="text-slate-300">
              Only 1 attempt is allowed per daily puzzle. Your daily streak has reset to 0. Come back tomorrow for a fresh attempt!
            </p>
          </div>
        )}

        {status === 'not_attempted' && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 mb-5 text-left text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Single Attempt Rule</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              You only get <strong>one attempt</strong> at today's daily puzzle. Complete the board to increment your <strong>Daily Win Streak</strong>! Running out of moves will mark today as failed and reset your streak.
            </p>
          </div>
        )}

        {/* Action Button */}
        {canPlay ? (
          <button
            onClick={onStartDaily}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-display font-black text-lg shadow-[0_6px_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START CHALLENGE (1 ATTEMPT)</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-base transition active:scale-98 border border-slate-700"
          >
            RETURN TO MENU
          </button>
        )}
      </motion.div>
    </div>
  );
};
