import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cinelink_cookie_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // Ignore localStorage errors in private browsing
    }
  }, []);

  const handleConsent = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('cinelink_cookie_consent', type);
    } catch {
      // Ignore
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-md z-50 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl p-4 text-slate-300 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
      id="cookie_consent_banner"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Cookie className="w-4 h-4" />
          <span>Çerez ve Gizlilik Tercihleri (KVKK 2026)</span>
        </div>
        <button 
          onClick={() => handleConsent('essential')} 
          className="text-slate-400 hover:text-slate-200 transition p-1"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">
        CineLink; oyun skorlarınızı yerel belleğinizde (localStorage) tutmak için zorunlu teknik verileri ve Google AdSense aracılığıyla ücretsiz hizmet sunabilmek için reklam çerezlerini kullanır.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleConsent('all')}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer"
        >
          Tümünü Kabul Et
        </button>
        <button
          onClick={() => handleConsent('essential')}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl border border-slate-700 transition cursor-pointer"
        >
          Sadece Zorunlu
        </button>
      </div>
    </div>
  );
};
