import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

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
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 cinema-panel shadow-2xl rounded-2xl p-4 text-slate-300 transition-all animate-fade-in"
      id="cookie_consent_banner"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs tracking-wide">
          <Cookie className="w-4 h-4 shrink-0" />
          <span>Çerez ve Gizlilik Tercihleri (KVKK)</span>
        </div>
        <button 
          onClick={() => handleConsent('essential')} 
          className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-3">
        CineLink; oyun skorlarını yerel belleğinizde saklamak ve Google AdSense aracılığıyla ücretsiz hizmet sunabilmek için teknik ve reklam çerezlerini kullanır.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleConsent('all')}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer"
        >
          Kabul Et
        </button>
        <button
          onClick={() => handleConsent('essential')}
          className="flex-1 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium py-2 px-3 rounded-xl border border-white/[0.1] transition cursor-pointer"
        >
          Sadece Zorunlu
        </button>
      </div>
    </div>
  );
};
