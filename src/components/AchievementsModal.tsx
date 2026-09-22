import React from 'react';
import { motion } from 'motion/react';
import { X, Award, CheckCircle, Gift } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../utils/storage';
import { GameStats, PlayerProfile } from '../types';

interface AchievementsModalProps {
  profile: PlayerProfile;
  stats: GameStats;
  unlockedIds: string[];
  onClaimReward: (achievementId: string, coins: number, xp: number) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  profile,
  stats,
  unlockedIds,
  onClaimReward,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white">ACHIEVEMENTS</h2>
              <span className="text-xs text-slate-400">
                {unlockedIds.length} of {ACHIEVEMENTS_LIST.length} Completed
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const currentVal = ach.current(stats, profile);
            const isCompleted = currentVal >= ach.target;
            const isClaimed = unlockedIds.includes(ach.id);
            const progressPercent = Math.min(100, Math.floor((currentVal / ach.target) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isClaimed
                    ? 'bg-slate-950/40 border-slate-800 opacity-70'
                    : isCompleted
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner border border-slate-700">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{ach.name}</h4>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">{ach.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-28 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentVal}/{ach.target}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1.5 rounded-xl border border-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => onClaimReward(ach.id, ach.rewardCoins, ach.rewardXP)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-display font-black text-xs shadow-md animate-bounce flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>+{ach.rewardCoins} 🪙</span>
                    </button>
                  ) : (
                    <div className="text-[11px] font-bold text-amber-300 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                      +{ach.rewardCoins} 🪙
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
