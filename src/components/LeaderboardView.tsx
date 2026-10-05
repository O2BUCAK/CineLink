import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  tempEntries: LeaderboardEntry[];
  nickname: string;
  onBackToHome: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  tempEntries,
  nickname,
  onBackToHome,
}) => {
  const displayedLeaderboard = [...leaderboard, ...tempEntries]
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  return (
    <div className="glass-card p-6 md:p-8 rounded-2xl shadow-2xl space-y-6" id="leaderboard_view">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2 tracking-tight">
          <span className="text-3xl text-yellow-500">🏆</span> Onur Tablosu
        </h2>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">TOP 10 LİSTESİ</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Oyun puanları her bir bağlantı adımını temsil etmektedir. Puanı daha düşük olan oyuncular daha kısa zincirlerle sonuca ulaşan ustaları gösterir.
      </p>

      <div className="space-y-3">
        {displayedLeaderboard.length > 0 ? (
          displayedLeaderboard.map((item, i) => (
            <div 
              key={i} 
              className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border transition ${
                item.nickname === nickname 
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md' 
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black w-6 text-center ${
                  i === 0 ? 'text-yellow-500 text-lg' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-extrabold text-slate-200">{item.nickname}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({item.playCount || 1}. oynayışta)
                    </span>
                    {item.isTemporary && (
                      <span className="text-[9px] bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase font-mono px-1.5 rounded">Geçici</span>
                    )}
                    {item.nickname === nickname && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono px-1.5 rounded">Siz</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">{item.date}</p>
                </div>
              </div>
              
              <div className="text-left sm:text-right mt-2 sm:mt-0 flex sm:flex-col justify-between items-center sm:items-end gap-1 border-t border-slate-800/50 sm:border-0 pt-2 sm:pt-0">
                <p className="text-sm font-mono text-emerald-400 font-black">{item.score} <span className="text-xs text-slate-500 font-normal">puan</span></p>
                <p className="text-[9px] text-slate-500 italic max-w-xs truncate">
                  {item.chain ? item.chain.join(" → ") : ""}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-16 bg-slate-900/20 rounded-xl border border-slate-900">
            <span className="text-3xl block mb-2">🎬</span>
            Henüz bir rekor kaydedilmedi. İlk kazanan sen ol!
          </div>
        )}
      </div>

      <button 
        onClick={onBackToHome}
        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition text-sm cursor-pointer"
        id="back_to_homepage_button"
      >
        Ana Sayfaya Dön
      </button>
    </div>
  );
};
