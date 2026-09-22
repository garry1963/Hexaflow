import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ArrowLeft, Wand2, PlusCircle, AlertCircle } from 'lucide-react';
import { LevelData, BoosterInventory } from '../types';

interface LevelFailedModalProps {
  level: LevelData;
  score: number;
  boosters: BoosterInventory;
  canUndo: boolean;
  onUndo: () => void;
  onUseExtraMoves: () => void;
  onUseShuffle: () => void;
  onRetry: () => void;
  onLevelSelect: () => void;
}

export const LevelFailedModal: React.FC<LevelFailedModalProps> = ({
  level,
  score,
  boosters,
  canUndo,
  onUndo,
  onUseExtraMoves,
  onUseShuffle,
  onRetry,
  onLevelSelect,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 md:p-8 border-2 border-indigo-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
      >
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
          Almost Had It!
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-black text-white mt-0.5 mb-2">
          NO MORE MOVES
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          Don't worry! You can undo, use a booster to keep going, or restart with a fresh board.
        </p>

        {/* Score Card */}
        <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 mb-5">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Current Score
          </div>
          <div className="text-xl font-display font-extrabold text-amber-300">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Booster Assistance Options */}
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

        {/* Standard Actions */}
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
      </motion.div>
    </div>
  );
};
