import React, { useEffect } from 'react';
import { CascadeTransfer } from '../types';
import { hexToPixel } from '../utils/hexMath';
import { HEX_COLORS } from '../data/colors';

interface CascadeStreamOverlayProps {
  transfers: CascadeTransfer[];
  hexSize: number;
  minX: number;
  minY: number;
  showSymbols?: boolean;
  onAllCompleted?: () => void;
}

export const CascadeStreamOverlay: React.FC<CascadeStreamOverlayProps> = React.memo(({
  transfers,
  hexSize,
  minX,
  minY,
  showSymbols = true,
  onAllCompleted,
}) => {
  // Ultra-snappy 85ms GPU flight duration
  useEffect(() => {
    if (!transfers || transfers.length === 0) return;
    const timer = setTimeout(() => {
      onAllCompleted?.();
    }, 88);
    return () => clearTimeout(timer);
  }, [transfers, onAllCompleted]);

  if (!transfers || transfers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {transfers.map((transfer) => {
        const fromPixel = hexToPixel(transfer.fromQ, transfer.fromR, hexSize);
        const toPixel = hexToPixel(transfer.toQ, transfer.toR, hexSize);

        const x1 = fromPixel.x - minX;
        const y1 = fromPixel.y - minY;
        const x2 = toPixel.x - minX;
        const y2 = toPixel.y - minY;

        const midX = (x1 + x2) / 2;
        const midY = Math.min(y1, y2) - 22;

        const colorDef = HEX_COLORS[transfer.color] || HEX_COLORS['ruby-red'];
        const chipRadius = hexSize * 0.44;

        // Render up to 3 visual tracer chips for maximum framerate on tablets
        const visibleChips = Math.min(Math.max(transfer.count, 1), 3);

        return (
          <React.Fragment key={transfer.id}>
            {/* Ultra-Fast Beam Zip SVG */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <path
                d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                fill="none"
                stroke={colorDef.highlight}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="24 16"
                style={{
                  animation: 'beamZip 85ms cubic-bezier(0.2, 0.9, 0.35, 1) forwards',
                  filter: `drop-shadow(0 0 6px ${colorDef.glow})`,
                }}
              />
            </svg>

            {/* Hardware-Accelerated 120fps CSS GPU Flying Chips */}
            {Array.from({ length: visibleChips }).map((_, i) => {
              const delayMs = i * 10;
              const offsetY = midY - i * 3;

              return (
                <div
                  key={`${transfer.id}-chip-${i}`}
                  className="absolute top-0 left-0 flex items-center justify-center pointer-events-none will-change-transform"
                  style={{
                    '--fly-x1': `${x1}px`,
                    '--fly-y1': `${y1}px`,
                    '--fly-midx': `${midX}px`,
                    '--fly-midy': `${offsetY}px`,
                    '--fly-x2': `${x2}px`,
                    '--fly-y2': `${y2}px`,
                    animation: `hexMergeFly 85ms cubic-bezier(0.2, 0.9, 0.35, 1) ${delayMs}ms forwards`,
                    transform: `translate3d(${x1}px, ${y1}px, 0)`,
                  } as React.CSSProperties}
                >
                  <div
                    className="relative rounded-lg flex items-center justify-center border border-white/80 shadow-md shadow-black/60 -ml-[18px] -mt-[16px]"
                    style={{
                      width: `${chipRadius * 2}px`,
                      height: `${chipRadius * 1.8}px`,
                      background: `linear-gradient(135deg, ${colorDef.highlight} 0%, ${colorDef.primary} 65%, ${colorDef.shadow} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-transparent via-white/20 to-white/40 pointer-events-none" />
                    {showSymbols && (
                      <span className="text-[11px] font-black text-white drop-shadow select-none">
                        {colorDef.symbol}
                      </span>
                    )}
                    {i === 0 && transfer.count > 1 && (
                      <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-display font-black text-[9px] px-1 rounded-full shadow border border-white">
                        +{transfer.count}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
});
