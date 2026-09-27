import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowLeft, Wand2, PlusCircle, AlertCircle, XCircle } from 'lucide-react';
import { LevelData, BoosterInventory } from '../types';

interface LevelFailedModalProps {
  level: LevelData;
  score: number;
  boosters: BoosterInventory;
  canUndo: boolean;
  isDaily?: boolean;
  onUndo: () => void;
  onUseExtraMoves: () => void;
  onUseShuffle: () => void;
  onRetry: () => void;
  onLevelSelect: () => void;
  onQuitToMenu?: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  score,
  boosters,
  canUndo,
  isDaily = false,
  onUndo,
  onUseExtraMoves,
  onUseShuffle,
  onRetry,
  onLevelSelect,
  onQuitToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={`w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 border-2 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-center relative overflow-hidden ${
          isDaily ? 'border-rose-500/50' : 'border-indigo-500/40'
        }`}
      >
        <div className="flex items-center justify-center mb-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
              isDaily
                ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                : 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-300'
            }`}
          >
            {isDaily ? <XCircle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
          </div>
        </div>

        <span
          className={`text-xs uppercase font-bold tracking-widest ${
            isDaily ? 'text-rose-400' : 'text-indigo-400'
          }`}
        >
          {isDaily ? '1 Attempt Used • Streak Reset' : 'Almost Had It!'}
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-black text-white mt-0.5 mb-2">
          {isDaily ? 'DAILY PUZZLE FAILED' : 'NO MORE MOVES'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {isDaily
            ? 'Only one attempt is allowed per daily puzzle. Your daily win streak has ended and reset to 0. Come back tomorrow!'
            : "Don't worry! You can undo, use a booster to keep going, or restart with a fresh board."}
        </p>

        {/* Score Card */}
        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 mb-5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Final Score
          </div>
          <div className="text-xl font-display font-extrabold text-amber-300">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Standard Level: Booster Assistance Options */}
        {!isDaily && (
          <div className="flex flex-col gap-2 mb-6">
            {canUndo && (
              <button
                onClick={onUndo}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700 text-indigo-200 font-display font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Undo Last Move</span>
              </button>
            )}

            {boosters.extra_moves > 0 && (
              <button
                onClick={onUseExtraMoves}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700 text-emerald-200 font-display font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Use +5 Extra Moves Booster ({boosters.extra_moves} left)</span>
              </button>
            )}

            {boosters.shuffle > 0 && (
              <button
                onClick={onUseShuffle}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700 text-amber-200 font-display font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Wand2 className="w-4 h-4" />
                <span>Shuffle Incoming Stacks ({boosters.shuffle} left)</span>
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        {isDaily ? (
          <button
            onClick={onQuitToMenu || onLevelSelect}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-100 font-display font-bold text-base transition border border-slate-600 shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>RETURN TO MENU</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onRetry}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-98 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-1.5 shadow-md transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </button>
            <button
              onClick={onLevelSelect}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-600 font-display font-bold text-sm flex items-center justify-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>LEVEL SELECT</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
