import React from 'react';
import { GameState } from '../types';
import { Trophy, ArrowRight, User, Clapperboard, CheckCircle2, RotateCcw } from 'lucide-react';

interface ResultViewProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onGoLeaderboard: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  gameState,
  onPlayAgain,
  onGoLeaderboard,
}) => {
  const userSteps = gameState.currentChain.length - 1;
  const isOptimal = gameState.shortestPathSteps > 0 && userSteps <= gameState.shortestPathSteps;

  return (
    <div className="cinema-panel p-6 sm:p-10 rounded-2xl text-center space-y-6 max-w-xl mx-auto" id="result_view">
      {/* Icon & Title */}
      <div className="space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm">
          <Trophy className="w-7 h-7" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)]">
          Tebrikler, Bağlantı Kuruldu!
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          <strong className="text-slate-200">{gameState.startNode}</strong> ile <strong className="text-amber-400">{gameState.endNode}</strong> arasındaki sinema bağını başarıyla tamamladınız.
        </p>
      </div>

      {/* Score Card */}
      <div className="cinema-panel-subtle p-5 rounded-2xl max-w-xs mx-auto space-y-1">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          Toplam Puan
        </span>
        <p className="text-5xl font-black text-amber-400 font-mono tabular-nums tracking-tight">
          {gameState.score}
        </p>
        <p className="text-[11px] text-slate-500 pt-1">
          Her adım 25 puandır. Düşük puan daha kısa zinciri simgeler.
        </p>
      </div>

      {/* Steps Comparison Strip */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs">
        <div className="cinema-panel-subtle p-3 rounded-xl">
          <span className="text-[11px] text-slate-400">Sizin Adımlarınız</span>
          <p className="font-bold text-lg text-white font-mono tabular-nums mt-0.5">
            {userSteps}
          </p>
        </div>
        <div className="cinema-panel-subtle p-3 rounded-xl">
          <span className="text-[11px] text-slate-400">Yapay Zeka Yolu</span>
          <p className="font-bold text-lg text-amber-400 font-mono tabular-nums mt-0.5">
            {gameState.shortestPathSteps > 0 ? gameState.shortestPathSteps : 'Hesaplandı'}
          </p>
        </div>
      </div>

      {gameState.shortestPathSteps > 0 && userSteps > gameState.shortestPathSteps && (
        <div className="p-3 bg-amber-500/[0.04] border border-amber-500/20 text-amber-300/90 text-xs rounded-xl max-w-md mx-auto leading-relaxed">
          💡 Gemini bu iki isim arasında daha kısa bir alternatif yol hesapladı. Optimal yoldan uzun olduğu için +50 ceza puanı uygulandı.
        </div>
      )}

      {isOptimal && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl max-w-md mx-auto flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Mükemmel! Mümkün olan en kısa optimal zinciri yakaladınız!</span>
        </div>
      )}

      {/* Completed Chain Breakdown */}
      <div className="text-left cinema-panel-subtle p-4 rounded-xl space-y-2.5 max-w-md mx-auto">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Tamamlanan Film Şeridi:
        </span>
        <div className="flex flex-wrap gap-2 items-center">
          {gameState.currentChain.map((step, idx) => {
            const isPerson = step.type === 'PERSON';
            return (
              <span key={idx} className="text-xs font-medium text-slate-300 flex items-center gap-1.5 bg-white/[0.04] py-1 px-2.5 rounded-lg border border-white/[0.06]">
                {isPerson ? (
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                ) : (
                  <Clapperboard className="w-3 h-3 text-amber-400 shrink-0" />
                )}
                <span>{step.name}</span>
                {idx < gameState.currentChain.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
        <button 
          onClick={onPlayAgain}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          id="result_play_again_button"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Yeni Meydan Okuma</span>
        </button>
        <button 
          onClick={onGoLeaderboard}
          className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 py-3 rounded-xl font-semibold text-sm transition cursor-pointer"
          id="result_leaderboard_button"
        >
          Onur Tablosu
        </button>
      </div>
    </div>
  );
};
