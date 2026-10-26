import React from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, ArrowLeft } from 'lucide-react';

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
    <div className="cinema-panel p-6 sm:p-8 rounded-2xl space-y-6 max-w-2xl mx-auto" id="leaderboard_view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-display)]">
              Onur Tablosu
            </h2>
            <p className="text-xs text-slate-400">
              En kısa zincirlerle sonuca ulaşan sinema ustaları
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-500 font-mono self-start sm:self-auto">
          İLK 10 SIRALAMASI
        </span>
      </div>

      {/* Leaderboard entries */}
      <div className="space-y-2.5">
        {displayedLeaderboard.length > 0 ? (
          displayedLeaderboard.map((item, i) => {
            const isCurrentUser = item.nickname.toLowerCase() === nickname.toLowerCase().trim();
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

            return (
              <div 
                key={i} 
                className={`p-3.5 sm:p-4 rounded-xl border transition ${
                  isCurrentUser 
                    ? 'bg-amber-500/[0.06] border-amber-500/30 shadow-sm' 
                    : 'cinema-panel-subtle border-white/[0.05]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-bold w-6 text-center font-mono tabular-nums shrink-0 text-slate-400">
                      {rankEmoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100">
                          {item.nickname}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            (Siz)
                          </span>
                        )}
                        {item.isTemporary && (
                          <span className="text-[10px] text-slate-400">
                            (Geçici)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        <span>{item.playCount || 1}. deneme</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-0">
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                      <span className="text-base font-extrabold text-amber-400 font-mono tabular-nums">
                        {item.score} <span className="text-xs font-normal text-slate-400">puan</span>
                      </span>
                      {item.chain && item.chain.length > 0 && (
                        <p className="text-[10px] text-slate-400 truncate max-w-xs sm:max-w-xs">
                          {item.chain.join(" → ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-500 py-12 cinema-panel-subtle rounded-xl">
            Henüz bir rekor kaydedilmedi. İlk kazanan siz olun!
          </div>
        )}
      </div>

      <button 
        onClick={onBackToHome}
        className="w-full py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
        id="back_to_homepage_button"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ana Sayfaya Dön</span>
      </button>
    </div>
  );
};
