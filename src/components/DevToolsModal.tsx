import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Terminal, CheckCircle2, ShieldCheck, Zap, Coins } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../data/levels';
import { generateProceduralLevel, validatePuzzle } from '../utils/levelGenerator';
import { LevelData } from '../types';

interface DevToolsModalProps {
  currentLevelId: number;
  onJumpToLevel: (levelId: number) => void;
  onAddCurrency: (coins: number, xp: number) => void;
  onUnlockAllLevels: () => void;
  onClose: () => void;
  activeLevelData?: LevelData;
}

export const DevToolsModal: React.FC<DevToolsModalProps> = ({
  currentLevelId,
  onJumpToLevel,
  onAddCurrency,
  onUnlockAllLevels,
  onClose,
  activeLevelData,
}) => {
  const [testSeed, setTestSeed] = useState<number>(12345);
  const [validationResult, setValidationResult] = useState<string>('');
  const [jsonExport, setJsonExport] = useState<string>('');

  const runValidation = () => {
    const levelToTest = activeLevelData || CAMPAIGN_LEVELS[currentLevelId - 1] || CAMPAIGN_LEVELS[0];
    const res = validatePuzzle(levelToTest);
    setValidationResult(
      `STATUS: ${res.isValid ? 'LEVEL VALID (PASSED)' : 'INVALID'}\n${res.message}\nLegal moves estimate: ${res.legalMovesEstimate}`
    );
  };

  const handleGenerate = () => {
    const gen = generateProceduralLevel(999, 'Dev Test Level', 3, testSeed, 'daily');
    const res = validatePuzzle(gen);
    setValidationResult(
      `GENERATED TEST PUZZLE (Seed ${testSeed}):\n${res.message}\nObjective: ${gen.objective.description}\nColors: ${gen.availableColors.join(', ')}`
    );
  };

  const handleExportJson = () => {
    const levelToExport = activeLevelData || CAMPAIGN_LEVELS[currentLevelId - 1];
    setJsonExport(JSON.stringify(levelToExport, null, 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Terminal className="w-5 h-5" />
            <h2 className="text-base font-bold uppercase tracking-wider">HEXAFLOW DEV CONSOLE</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {/* Level Jumper */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-2 font-bold">Jump To Campaign Level:</span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {CAMPAIGN_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    onJumpToLevel(lvl.id);
                    onClose();
                  }}
                  className={`py-1.5 rounded text-center font-bold transition ${
                    lvl.id === currentLevelId
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {lvl.id}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Cheats */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-2 font-bold">Profile Cheats:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAddCurrency(1000, 200)}
                className="px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500 text-amber-300 rounded font-bold flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>+1,000 Coins & +200 XP</span>
              </button>
              <button
                onClick={onUnlockAllLevels}
                className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500 text-emerald-300 rounded font-bold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Unlock All 20 Levels</span>
              </button>
            </div>
          </div>

          {/* Solver & Validator */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-2 font-bold">Solver & Puzzle Validator:</span>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={runValidation}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded font-bold"
              >
                Validate Current Level ({currentLevelId})
              </button>
              <button
                onClick={handleGenerate}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
              >
                Test Generator (Seed {testSeed})
              </button>
            </div>
            {validationResult && (
              <pre className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-400 text-[11px] whitespace-pre-wrap">
                {validationResult}
              </pre>
            )}
          </div>

          {/* Level JSON Export */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-bold">Export Level JSON:</span>
              <button
                onClick={handleExportJson}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                View JSON
              </button>
            </div>
            {jsonExport && (
              <textarea
                readOnly
                value={jsonExport}
                rows={5}
                className="w-full bg-slate-900 p-2 rounded text-[10px] text-slate-300 border border-slate-800 font-mono"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
