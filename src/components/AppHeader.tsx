import React from 'react';
import { User } from 'firebase/auth';
import { GameStage } from '../types';

interface AppHeaderProps {
  user: User | null;
  loading: boolean;
  stage: GameStage;
  onSignOut: () => void;
  onGoogleSignIn: () => void;
  onGoHome: () => void;
  onGoLeaderboard: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  loading,
  stage,
  onSignOut,
  onGoogleSignIn,
  onGoHome,
  onGoLeaderboard,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800/60">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onGoHome}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
          🎬
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight gradient-title">CineLink</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Yeşilçam & Dünya Sineması</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
        {/* User auth badge */}
        {user ? (
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 py-1.5 px-2.5 rounded-lg text-xs animate-fade-in">
            {user.photoURL ? (
              <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || ''} className="w-5 h-5 rounded-full" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
            <span className="text-slate-300 font-medium truncate max-w-[120px]">{user.displayName}</span>
            <button 
              onClick={onSignOut}
              className="text-red-400 hover:text-red-300 ml-1 font-semibold focus:outline-none cursor-pointer"
              title="Çıkış Yap"
            >
              🚪
            </button>
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            disabled={loading}
            className="px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition flex items-center gap-1.5 shadow cursor-pointer"
            id="google_signin_button"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.564-4.445 10.564-10.74 0-.726-.08-1.282-.175-1.975H12.24z"/>
            </svg>
            Google Giriş
          </button>
        )}

        {stage !== GameStage.HOME && (
          <button
            onClick={onGoHome}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
            id="header_home_button"
          >
            Ana Sayfa
          </button>
        )}
        <button 
          onClick={onGoLeaderboard}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500/10 to-blue-500/10 hover:from-teal-500/20 hover:to-blue-500/20 border border-teal-500/20 text-teal-300 transition flex items-center gap-1.5 shadow cursor-pointer"
          id="header_leaderboard_button"
        >
          🏆 Liderler
        </button>
      </div>
    </header>
  );
};
