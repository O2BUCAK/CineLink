import React from 'react';
import { GameState } from '../types';
import { ArrowRight, User, Clapperboard, CheckCircle2, AlertCircle, HelpCircle, RotateCcw } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  inputVal: string;
  loading: boolean;
  errorMsg: string;
  infoMsg: string;
  onChangeInput: (val: string) => void;
  onAddLink: () => void;
  onDirectFinish: () => void;
  onGiveUp?: () => void;
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
  onGiveUp,
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
        <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-blue-400" />
          <span>{gameState.warning}</span>
        </div>
      )}

      {/* Target & Start Nodes Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="cinema-panel p-4 rounded-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Başlangıç Sanatçısı
            </span>
            <p className="text-lg font-bold text-white font-[family-name:var(--font-display)]">
              {gameState.startNode}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
        </div>

        <div className="cinema-panel p-4 rounded-xl flex items-center justify-between gap-3 border-amber-500/30 bg-amber-500/[0.03]">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-amber-400/90 uppercase tracking-wider">
              Hedeflenen Sanatçı
            </span>
            <p className="text-lg font-bold text-amber-400 font-[family-name:var(--font-display)]">
              {gameState.endNode}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clapperboard className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Connection Chain: Cinema Film Strip */}
      <div className="cinema-panel p-5 sm:p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <span>Bağlantı Şeridi</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400 font-normal">
              Şu ana kadar <strong className="text-white font-mono tabular-nums">{gameState.currentChain.length - 1}</strong> adım atıldı
            </span>
          </div>
          {onGiveUp && (
            <button
              onClick={onGiveUp}
              disabled={loading}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition flex items-center gap-1 cursor-pointer"
              title="Bu oyundan çık ve ana menüye dön"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Yeniden Başla</span>
            </button>
          )}
        </div>
        
        {/* Film Strip Nodes */}
        <div className="cinema-panel-subtle p-4 rounded-xl flex flex-wrap gap-2.5 items-center min-h-[80px]">
          {gameState.currentChain.map((step, i) => {
            const isPerson = step.type === 'PERSON';
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition ${
                  isPerson 
                    ? 'bg-white/[0.06] text-slate-200 border border-white/[0.1]' 
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}>
                  {isPerson ? (
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <Clapperboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span>{step.name}</span>
                </div>
                {i < gameState.currentChain.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="next_step_input" className="block text-xs font-semibold text-slate-300">
              {isNextMovie ? (
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span>Son sanatçının oynadığı veya yönettiği bir <strong>Film / Dizi</strong> yazın:</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bu yapımda yer alan başka bir <strong>Sanatçı (Oyuncu / Yönetmen)</strong> yazın:</span>
                </span>
              )}
            </label>
            
            <div className="flex gap-2">
              <input 
                type="text"
                id="next_step_input"
                value={inputVal}
                onChange={(e) => onChangeInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isNextMovie ? "Örn: Av Mevsimi, Kış Uykusu, Eşkıya..." : "Örn: Cem Yılmaz, Haluk Bilginer, Şener Şen..."}
                className="flex-1 bg-[#0d121c] border border-white/[0.08] px-3.5 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition text-sm"
                disabled={loading}
              />
              <button 
                onClick={onAddLink}
                disabled={loading || !inputVal.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 rounded-xl transition disabled:opacity-50 text-xs tracking-wide cursor-pointer shrink-0 shadow-sm"
                id="submit_step_button"
              >
                {loading ? 'Kontrol Ediliyor...' : 'Bağla'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2 justify-between items-center text-xs">
            <span className="text-[11px] text-slate-500">
              Zincirdeki son isim hedefe doğrudan bağlıysa ara adım girmeden bitirebilirsiniz.
            </span>
            <button 
              onClick={onDirectFinish}
              disabled={loading}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline focus:outline-none shrink-0 cursor-pointer"
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
