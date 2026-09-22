import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, Settings, Home, AlertTriangle, HelpCircle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onQuitToMenu: () => void;
  onOpenTutorial?: () => void;
  confirmRestart: boolean;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onQuitToMenu,
  onOpenTutorial,
  confirmRestart,
}) => {
  const [isConfirmingRestart, setIsConfirmingRestart] = useState(false);

  const handleRestartClick = () => {
    if (confirmRestart && !isConfirmingRestart) {
      setIsConfirmingRestart(true);
    } else {
      onRestart();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center"
      >
        <h2 className="text-xl md:text-2xl font-display font-black text-white mb-6">
          GAME PAUSED
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-98 text-slate-950 font-display font-black text-base shadow-md flex items-center justify-center gap-2 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>RESUME</span>
          </button>

          {isConfirmingRestart ? (
            <div className="p-3 bg-rose-950/40 border border-rose-600/60 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Restart this level?</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onRestart}
                  className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs"
                >
                  Yes, Restart
                </button>
                <button
                  onClick={() => setIsConfirmingRestart(false)}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleRestartClick}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 font-display font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART LEVEL</span>
            </button>
          )}

          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 active:scale-98 text-cyan-300 border border-cyan-800/60 font-display font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>HOW TO PLAY (TUTORIAL)</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 font-display font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Settings className="w-4 h-4" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-rose-400 border border-slate-800 font-display font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO MENU</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
