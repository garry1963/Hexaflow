import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Eye,
  Zap,
  RefreshCw,
  User,
  Shield,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import { GameSettings, PlayerProfile } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  profile: PlayerProfile;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onUpdateProfileName: (name: string) => void;
  onResetProgress: () => void;
  onOpenDevTools: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  profile,
  onUpdateSettings,
  onUpdateProfileName,
  onResetProgress,
  onOpenDevTools,
  onClose,
}) => {
  const [editingName, setEditingName] = useState(profile.name);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim()) {
      onUpdateProfileName(editingName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-xl font-display font-black text-white">SETTINGS</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Account Profile Name */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Player Name</span>
            <form onSubmit={handleNameSave} className="flex gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                maxLength={20}
                className="flex-1 bg-slate-800 px-3 py-2 rounded-xl text-sm font-display font-bold text-white border border-slate-700 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold text-xs rounded-xl transition"
              >
                Save
              </button>
            </form>
          </div>

          {/* Audio Toggles */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider block">
              Audio
            </span>

            {/* Sound FX */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm text-slate-200 font-medium">Sound Effects</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Ambient Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className={`w-4 h-4 ${settings.musicEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-sm text-slate-200 font-medium">Zen Ambient Music</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ musicEnabled: !settings.musicEnabled })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  settings.musicEnabled ? 'bg-indigo-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Tile Stack Display */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3.5">
            <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider block">
              Tile Stack Display
            </span>

            {/* Tile Count Numbers */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-200 font-medium block">Tile Stack Count</span>
                <span className="text-[11px] text-slate-400">Display number of tiles on each stack</span>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ showTileCount: !settings.showTileCount })
                }
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  settings.showTileCount ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
                title="Toggle tile count on stacks"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Accessibility Color Symbols */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-200 font-medium block">Colour & Shape Symbols</span>
                <span className="text-[11px] text-slate-400">Display colour-blind symbols on tile stacks</span>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({ showAccessibilitySymbols: !settings.showAccessibilitySymbols })
                }
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  settings.showAccessibilitySymbols ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
                title="Toggle colour symbols on stacks"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Info notice when both are hidden */}
            {!settings.showTileCount && !settings.showAccessibilitySymbols && (
              <div className="text-[11px] text-cyan-300/80 bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-2.5 flex items-center gap-1.5">
                <span>Minimalist Zen Mode: All overlay badges removed for pure tactile 3D tile stacks.</span>
              </div>
            )}
          </div>

          {/* Gameplay & Motion */}
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-wider block">
              Gameplay & Motion
            </span>

            {/* Animation Speed */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-200 font-medium block">Animation Speed</span>
                <span className="text-[11px] text-slate-400">Tile slide and cascade pace</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl">
                <button
                  onClick={() => onUpdateSettings({ animationSpeed: 'normal' })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    settings.animationSpeed === 'normal'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => onUpdateSettings({ animationSpeed: 'fast' })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    settings.animationSpeed === 'fast'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fast
                </button>
              </div>
            </div>

            {/* Confirm Restart */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200 font-medium">Confirm Level Restart</span>
              <button
                onClick={() => onUpdateSettings({ confirmRestart: !settings.confirmRestart })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  settings.confirmRestart ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Dev Mode Trigger */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenDevTools();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 font-mono transition"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Developer Admin Tools</span>
            </button>
          </div>

          {/* Danger Zone: Reset Progress */}
          <div className="pt-2 border-t border-slate-800">
            {isConfirmingReset ? (
              <div className="bg-rose-950/40 p-3 rounded-2xl border border-rose-600/50 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Are you sure you want to reset all progress?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onResetProgress();
                      setIsConfirmingReset(false);
                      onClose();
                    }}
                    className="py-2 bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs rounded-xl"
                  >
                    Yes, Reset All
                  </button>
                  <button
                    onClick={() => setIsConfirmingReset(false)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingReset(true)}
                className="w-full py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/30 border border-rose-900/50 font-display font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Player Progress</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
