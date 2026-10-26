import React from 'react';
import { User } from 'firebase/auth';
import { Film, Sparkles, Shield, UserCheck } from 'lucide-react';

interface HomeViewProps {
  user: User | null;
  nickname: string;
  playCount: number;
  loading: boolean;
  errorMsg: string;
  acceptedKVKK: boolean;
  onChangeNickname: (val: string) => void;
  onAcceptKVKK: () => void;
  onGoogleSignIn: () => void;
  onStartNewGame: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  nickname,
  playCount,
  loading,
  errorMsg,
  acceptedKVKK,
  onChangeNickname,
  onAcceptKVKK,
  onGoogleSignIn,
  onStartNewGame,
}) => {
  return (
    <div className="cinema-panel p-6 sm:p-10 rounded-2xl space-y-8" id="home_view">
      {/* Editorial Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-400 tracking-wide">
          <Film className="w-3.5 h-3.5" />
          <span>Yeşilçam & Dünya Sineması</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">Altı Derece Bağlantı Bulmacası</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-[family-name:var(--font-display)] [text-wrap:balance]">
          İki Sinema Efsanesini Birbirine Bağla
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
          Başlangıç ve hedef sanatçıları ortak filmleriyle adım adım eşleştirin. 
          En kısa zinciri kurarak sinema hafızanızı onur tablosuna yazdırın.
        </p>
      </div>

      {/* Rules sequence: Editorial 3-Step Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="cinema-panel-subtle p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-amber-400 font-semibold">01. Başlangıç</span>
          <p className="text-xs font-semibold text-slate-200">İlk Sanatçı</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Size verilen sanatçının yer aldığı veya yönettiği bir filmi yazın.
          </p>
        </div>

        <div className="cinema-panel-subtle p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-amber-400 font-semibold">02. Köprü</span>
          <p className="text-xs font-semibold text-slate-200">Ortak Yapım</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            O filmde rol almış başka bir aktör veya yönetmen girin.
          </p>
        </div>

        <div className="cinema-panel-subtle p-3.5 rounded-xl space-y-1">
          <span className="text-[11px] font-mono text-amber-400 font-semibold">03. Hedef</span>
          <p className="text-xs font-semibold text-slate-200">Zinciri Tamamla</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Hedeflenen isme ulaştığınızda yolculuğunuz puanlanır.
          </p>
        </div>
      </div>

      {/* Nickname & Action Form */}
      <div className="space-y-4 pt-2 border-t border-white/[0.06]">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="nickname_input" className="font-semibold text-slate-300">
              Takma Adınız (Oyuncu Adı)
            </label>
            <span className="text-[11px] text-slate-500">
              {user ? 'Google profilinizden hazırlandı' : 'Yerel olarak kaydedilir'}
            </span>
          </div>

          <input 
            type="text"
            id="nickname_input"
            placeholder="Örn: SinemaTutkunu"
            maxLength={22}
            value={nickname}
            onChange={(e) => onChangeNickname(e.target.value)}
            className="w-full bg-[#0d121c] border border-white/[0.08] px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none text-slate-100 placeholder:text-slate-600 transition text-sm"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <button 
          onClick={onStartNewGame}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 px-6 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          id="start_game_button"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? 'Meydan Okuma Hazırlanıyor...' : 'Meydan Okumayı Başlat'}</span>
        </button>
      </div>

      {/* Account & KVKK Footnotes */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06] text-xs">
        {/* Google status */}
        {!user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-200">Kalıcı Onur Tablosu Kaydı</p>
              <p className="text-[11px] text-slate-400">
                Misafir skorları oturum kapanınca sıfırlanır. Kalıcı rekor için Google ile giriş yapabilirsiniz.
              </p>
            </div>
            <button
              onClick={onGoogleSignIn}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 text-xs font-medium transition cursor-pointer shrink-0"
            >
              Giriş Yap
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Google hesabınız bağlı. Rekorlarınız onur tablosuna kalıcı kaydedilecektir.</span>
          </div>
        )}

        {/* KVKK Affirmation */}
        <div className="flex items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              2026 KVKK gereği takma adınız ve skorlarınız sunucuya kimlik bilgisi aktarılmadan yerel belleğinizde saklanır.
            </span>
          </div>
          {!acceptedKVKK && (
            <button
              onClick={onAcceptKVKK}
              className="text-amber-400 hover:text-amber-300 font-semibold underline shrink-0 cursor-pointer"
            >
              Onayla
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
