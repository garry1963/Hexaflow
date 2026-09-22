import React from 'react';
import { motion } from 'motion/react';
import { X, BarChart2, Zap, Trophy, Flame, CheckCircle, Clock } from 'lucide-react';
import { GameStats, PlayerProfile } from '../types';

interface StatsModalProps {
  profile: PlayerProfile;
  stats: GameStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ profile, stats, onClose }) => {
  const completedCount = Object.keys(profile.completedLevels).length;
  const avgMoves =
    completedCount > 0 ? (stats.totalMoves / completedCount).toFixed(1) : '0';

  const statItems = [
    { label: 'Levels Completed', value: `${completedCount} / 20`, icon: '🏆', color: 'text-amber-400' },
    { label: 'Total Stars Earned', value: profile.stars, icon: '⭐', color: 'text-yellow-400' },
    { label: 'Total Merges Performed', value: stats.totalMerges.toLocaleString(), icon: '🔄', color: 'text-cyan-400' },
    { label: 'Stacks Completed (10/10)', value: stats.totalCompletedStacks.toLocaleString(), icon: '✨', color: 'text-emerald-400' },
    { label: 'Highest Combo', value: `${stats.highestCombo}x`, icon: '🔥', color: 'text-orange-400' },
    { label: 'Highest Score', value: stats.highestScore.toLocaleString(), icon: '💎', color: 'text-indigo-400' },
    { label: 'Total Moves', value: stats.totalMoves.toLocaleString(), icon: '🎯', color: 'text-slate-300' },
    { label: 'Avg Moves / Level', value: avgMoves, icon: '📊', color: 'text-slate-300' },
    { label: 'Daily Challenges Done', value: stats.dailyChallengesCompleted, icon: '📅', color: 'text-amber-400' },
    { label: 'Daily Streak', value: `${profile.dailyStreak} Days`, icon: '⚡', color: 'text-orange-400' },
    { label: 'Endless High Score', value: stats.endlessHighScore.toLocaleString(), icon: '♾️', color: 'text-rose-400' },
    {
      label: 'Total Play Time',
      value: `${Math.floor(stats.totalPlayTimeSeconds / 60)}m ${stats.totalPlayTimeSeconds % 60}s`,
      icon: '⏱️',
      color: 'text-cyan-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white">STATISTICS</h2>
              <span className="text-xs text-slate-400">Tactical Performance Overview</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {statItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{item.icon}</span>
                  <span className={`text-base font-display font-extrabold ${item.color}`}>
                    {item.value}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
