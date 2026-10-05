import React from 'react';
import { User } from 'firebase/auth';

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
    <div className="glass-card p-6 md:p-10 rounded-2xl space-y-8 shadow-2xl relative overflow-hidden" id="home_view">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-teal-400 to-blue-500" />
      
      <div className="space-y-3">
        <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Sürüm 2026 Yasalarına Uygun
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
          Sinema Hafızanı Birleştir!
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Size sunulan iki sinema figürünü (aktör, aktris veya yönetmen) ortak yapımlarıyla birbirine bağla. Amacınız en az adımla hedefe ulaşmaktır!
        </p>
      </div>

      <div className="space-y-2 text-xs bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-slate-400 leading-relaxed space-y-1.5">
        <p className="font-bold text-slate-300 flex items-center gap-1">
          <span>⚡</span> Nasıl Oynanır?
        </p>
        <p>• Başlangıç isminden yola çıkarak onun oynadığı veya yönettiği bir film yazın.</p>
        <p>• Ardından o filmde yer alan başka bir sanatçı ismi girin.</p>
        <p>• Adım adım devam ederek hedeflenen kişiye ulaştığınızda bağlantıyı tamamlayın!</p>
        <p className="text-[11px] text-teal-400 font-medium">Büyük-küçük harf duyarlı değildir. Her adım 25 puan değerindedir.</p>
      </div>

      {/* KVKK / Privacy Notice */}
      <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-900/30 text-[11px] text-slate-400 space-y-2">
        <p className="font-semibold text-blue-300 flex items-center gap-1">
          <span>🔒</span> Bilgi Güvenliği & KVKK Bilgilendirmesi
        </p>
        <p>
          2026 Türkiye yasalarına ve verilerin yerelliği prensibine uygun olarak; belirlediğiniz takma ad (nickname) ve oyun skorlarınız sunucularımızda size ait isim/IP gibi kimlik bilgileriyle ilişkilendirilmeden <strong>tamamen yerel tarayıcı belleğinizde (localStorage)</strong> saklanır. Hiçbir kişisel veri izinsiz üçüncü şahıslara aktarılmaz.
        </p>
        {!acceptedKVKK && (
          <button
            onClick={onAcceptKVKK}
            className="w-full mt-1.5 py-1.5 px-3 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold tracking-wide transition text-xs cursor-pointer"
          >
            Okudum, Onaylıyorum
          </button>
        )}
      </div>

      {/* Google Login block */}
      {!user ? (
        <div className="p-4 bg-gradient-to-r from-blue-950/20 to-indigo-950/20 rounded-xl border border-blue-500/20 text-xs space-y-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-blue-300 flex items-center justify-center sm:justify-start gap-1">
              <span>🌟</span> Skorunu Kaybetmek İstemiyor Musun?
            </p>
            <p className="text-slate-400 text-[11px]">
              Google ile giriş yaparak rekorlarınızı onur tablosunda kalıcı hale getirebilir, kaçıncı oynayışınızda o puanı aldığınızı saklayabilirsiniz! Giriş yapılmadığında rekorlar sadece bu oturumda listelenir ve sonraki oturumda silinir.
            </p>
          </div>
          <button
            onClick={onGoogleSignIn}
            className="w-full sm:w-auto shrink-0 bg-white hover:bg-slate-100 text-slate-900 font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-1.14 2.76-2.4 3.6l3.7 2.87c2.16-2 3.835-4.94 3.835-8.32z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.05 0-5.63-2.06-6.55-4.83L1.935 17.3A11.96 11.96 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.45 14.49a7.12 7.12 0 0 1 0-4.5l-3.82-2.96a11.96 11.96 0 0 0 0 10.42l3.82-2.96z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.955 1.19 15.24 0 12 0A11.96 11.96 0 0 0 1.935 5.5l3.82 2.96c.92-2.77 3.5-4.83 6.55-4.83z"/>
            </svg>
            Google ile Giriş
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-950/10 rounded-xl border border-emerald-500/15 text-xs flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-bold text-emerald-400">Google Hesabı Bağlandı</p>
            <p className="text-slate-400 text-[11px]">
              Rekorlarınız kalıcı olarak saklanacaktır. Şu anki denemeniz sizin <strong>{playCount}. oynayışınız</strong> olacaktır.
            </p>
          </div>
        </div>
      )}

      {!user && (
        <div className="p-4 bg-amber-950/10 rounded-xl border border-amber-500/15 text-xs flex items-center gap-3">
          <span className="text-xl">👤</span>
          <div>
            <p className="font-bold text-amber-400">Misafir Modu</p>
            <p className="text-slate-400 text-[11px]">
              Bu deneme sizin <strong>{playCount}. oynayışınız</strong> olacaktır. Skorunuz sadece listede geçici olarak yer alacak ve sonraki oturumda silinecektir.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-between">
            <span>Takma Ad (Nickname)</span>
            {user ? (
              <span className="text-teal-400 font-semibold">Google Profilinden Alındı</span>
            ) : (
              <span className="text-slate-500">Yerel Kaydedilir</span>
            )}
          </label>
          <input 
            type="text"
            placeholder="Örn: SinemaBüyücüsü"
            maxLength={22}
            value={nickname}
            onChange={(e) => onChangeNickname(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-slate-200 placeholder:text-slate-600 transition"
            id="nickname_input"
          />
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        <button 
          onClick={onStartNewGame}
          disabled={loading}
          className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-extrabold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-950/20 disabled:opacity-50 cursor-pointer"
          id="start_game_button"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? 'Yükleniyor...' : 'Meydan Okumayı Başlat 🚀'}
          </span>
        </button>
      </div>
    </div>
  );
};
