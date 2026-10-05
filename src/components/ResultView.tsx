import React from 'react';
import { GameState } from '../types';

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
  return (
    <div className="glass-card p-8 md:p-10 rounded-2xl text-center space-y-6 shadow-2xl relative overflow-hidden" id="result_view">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      
      <div className="space-y-2">
        <span className="text-4xl text-emerald-400">🎉</span>
        <h2 className="text-3xl font-extrabold tracking-tight text-emerald-400">Tebrikler, Yolculuk Tamamlandı!</h2>
        <p className="text-sm text-slate-400">
          "{gameState.startNode}" ile "{gameState.endNode}" arasındaki bağlantı zincirini kurdunuz!
        </p>
      </div>

      <div className="p-6 bg-slate-900/60 rounded-xl border border-slate-800 max-w-[320px] mx-auto space-y-1">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Toplam Skor</p>
        <p className="text-5xl font-black text-slate-100 font-mono tracking-tight">
          {gameState.score}
        </p>
        <p className="text-[10px] text-slate-500 pt-1">Her adım 25 puandır. Düşük skorlar daha başarılıdır!</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs">
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <p className="text-slate-500 font-medium">Sizin Adımlarınız</p>
          <p className="font-extrabold text-lg text-emerald-400 mt-0.5">{gameState.currentChain.length - 1}</p>
        </div>
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <p className="text-slate-500 font-medium">Yapay Zeka Adımı</p>
          <p className="font-extrabold text-lg text-blue-400 mt-0.5">
            {gameState.shortestPathSteps > 0 ? gameState.shortestPathSteps : 'Hesaplanamadı'}
          </p>
        </div>
      </div>

      {gameState.shortestPathSteps > 0 && gameState.currentChain.length - 1 > gameState.shortestPathSteps && (
        <div className="p-3 bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs rounded-xl max-w-md mx-auto italic">
          💡 Gemini daha kısa bir yol buldu! Optimal yolu tamamlayamadığınız için +50 ceza puanı uygulandı.
        </div>
      )}

      {/* Display the completed chain */}
      <div className="text-left bg-slate-950/40 p-4 rounded-xl border border-slate-900 max-w-lg mx-auto">
        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tamamlanan Zincir:</p>
        <div className="flex flex-wrap gap-1.5 items-center">
          {gameState.currentChain.map((step, idx) => (
            <span key={idx} className="text-xs font-medium text-slate-300 flex items-center gap-1 bg-slate-800/50 py-1 px-2.5 rounded">
              <span>{step.type === 'PERSON' ? '👤' : '🎬'}</span>
              {step.name}
              {idx < gameState.currentChain.length - 1 && <span className="text-slate-600 font-bold">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-4 max-w-md mx-auto">
        <button 
          onClick={onPlayAgain}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold text-sm transition cursor-pointer"
          id="result_play_again_button"
        >
          Yeniden Oyna
        </button>
        <button 
          onClick={onGoLeaderboard}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl font-bold text-sm transition shadow-md shadow-emerald-500/10 cursor-pointer"
          id="result_leaderboard_button"
        >
          Lider Tablosu
        </button>
      </div>
    </div>
  );
};
