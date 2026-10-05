import React from 'react';
import { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  inputVal: string;
  loading: boolean;
  errorMsg: string;
  infoMsg: string;
  onChangeInput: (val: string) => void;
  onAddLink: () => void;
  onDirectFinish: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  inputVal,
  loading,
  errorMsg,
  infoMsg,
  onChangeInput,
  onAddLink,
  onDirectFinish,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && inputVal.trim()) {
      onAddLink();
    }
  };

  const isNextMovie = gameState.currentChain.length % 2 !== 0;

  return (
    <div className="space-y-6" id="playing_view">
      {gameState.warning && (
        <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300">
          ℹ️ {gameState.warning}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Node Panel */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-1 bg-slate-800 text-[9px] text-slate-500 rounded-bl font-mono">
            #BAŞLANGIÇ
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">BAŞLANGIÇ FİGÜRÜ</p>
            <p className="text-lg font-black text-emerald-400 mt-1">{gameState.startNode}</p>
          </div>
        </div>

        {/* End Node Panel */}
        <div className="glass-card p-4 rounded-xl border-l-2 border-l-blue-500 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-1 bg-blue-950 text-[9px] text-blue-400 rounded-bl font-mono">
            #HEDEF
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">HEDEFLENEN FİGÜR</p>
            <p className="text-lg font-black text-blue-400 mt-1">{gameState.endNode}</p>
          </div>
        </div>
      </div>

      {/* Current Chain Presentation */}
      <div className="glass-card p-6 rounded-2xl space-y-5 shadow-xl relative">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>🔗 Mevcut Bağlantı Zinciri:</span>
          <span className="text-[11px] text-teal-400 font-mono font-medium">
            {gameState.currentChain.length - 1} Adım Atıldı
          </span>
        </h3>
        
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 min-h-[90px] flex flex-wrap gap-2 items-center">
          {gameState.currentChain.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                step.type === 'PERSON' 
                  ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/15' 
                  : 'bg-blue-950/30 text-blue-300 border border-blue-500/15'
              }`}>
                <span>{step.type === 'PERSON' ? '👤' : '🎬'}</span>
                {step.name}
              </span>
              {i < gameState.currentChain.length - 1 && (
                <span className="text-slate-600 font-bold">→</span>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              {isNextMovie ? (
                <span className="flex items-center gap-1 text-blue-300">
                  🎬 Bir Sonraki Bağı Bir <strong>Film/Dizi</strong> Olarak Yazın:
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-300">
                  👤 Bir Sonraki Bağı Bir <strong>Sanatçı (Oyuncu/Yönetmen)</strong> Olarak Yazın:
                </span>
              )}
            </label>
            
            <div className="flex gap-2">
              <input 
                type="text"
                value={inputVal}
                onChange={(e) => onChangeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isNextMovie ? "Örn: G.O.R.A." : "Örn: Cem Yılmaz"}
                className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-200 placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 transition"
                disabled={loading}
                id="next_step_input"
              />
              <button 
                onClick={onAddLink}
                disabled={loading || !inputVal.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold px-6 rounded-lg transition disabled:opacity-50 text-xs tracking-wide cursor-pointer"
                id="submit_step_button"
              >
                {loading ? 'Kontrol...' : 'Bağla'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs animate-fade-in">
              ⚠️ {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-500/20 text-teal-300 text-xs animate-fade-in">
              ✅ {infoMsg}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row gap-2 justify-between items-center">
            <span className="text-[11px] text-slate-500">
              Cevabı bulamadınız mı? Zincirinizdeki son ismi doğrudan hedefe bağlamayı deneyebilirsin.
            </span>
            <button 
              onClick={onDirectFinish}
              disabled={loading}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline focus:outline-none shrink-0 cursor-pointer"
              id="direct_finish_button"
            >
              Hedefe Doğrudan Bağla?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
