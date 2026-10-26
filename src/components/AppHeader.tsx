import React from 'react';
import { User } from 'firebase/auth';
import { GameStage } from '../types';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundMuted, setSoundMuted } from '../services/soundFx';

interface AppHeaderProps {
  user: User | null;
  loading: boolean;
  stage: GameStage;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSignOut: () => void;
  onGoogleSignIn: () => void;
  onGoHome: () => void;
  onGoLeaderboard: () => void;
  onOpenRules?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  loading,
  stage,
  soundEnabled,
  onToggleSound,
  onSignOut,
  onGoogleSignIn,
  onGoHome,
  onGoLeaderboard,
  onOpenRules,
}) => {
  return (
    <header className="w-full border-b border-white/[0.08] bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-sm">
            🎬
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)]">
            CineLink
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={onGoHome}
            className={`transition-colors hover:text-white cursor-pointer whitespace-nowrap ${
              stage === GameStage.HOME ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Bulmaca
          </button>
          <button
            onClick={() => {
              if (stage !== GameStage.HOME) onGoHome();
              onOpenRules?.();
            }}
            className="transition-colors hover:text-white cursor-pointer whitespace-nowrap"
          >
            Nasıl Oynanır
          </button>
          <button
            onClick={onGoLeaderboard}
            className={`transition-colors hover:text-white cursor-pointer whitespace-nowrap ${
              stage === GameStage.LEADERBOARD ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Onur Tablosu
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Sound Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.05] cursor-pointer"
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            aria-label={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* User auth action */}
          {user ? (
            <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs">
              {user.photoURL ? (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || ''} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
              <span className="text-slate-200 font-medium truncate max-w-[100px]">{user.displayName}</span>
              <button 
                onClick={onSignOut}
                className="text-slate-400 hover:text-red-400 ml-1 transition cursor-pointer"
                title="Çıkış Yap"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              id="google_signin_button"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.564-4.445 10.564-10.74 0-.726-.08-1.282-.175-1.975H12.24z"/>
              </svg>
              <span>Giriş Yap</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
