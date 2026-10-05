import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';

export const AppFooter: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('ersin@ozbucak.com.tr');
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <footer className="mt-auto py-8 text-center text-slate-500 text-xs border-t border-slate-900/80 px-4 space-y-5" id="app_footer">
      {/* Feedback / Contact Email Card */}
      <div className="max-w-md mx-auto bg-slate-900/60 border border-slate-800/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-lg backdrop-blur-xs" id="feedback_contact_card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">Öneri, İstek ve Görüşler</p>
            <p className="text-[11px] text-slate-400">Geri bildirimlerinizi bizimle paylaşabilirsiniz</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
          <a
            href="mailto:ersin@ozbucak.com.tr?subject=CineLink%20%C3%96neri%2C%20%C4%B0stek%20ve%20G%C3%B6r%C3%BC%C5%9F"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-700/40 rounded-lg transition"
            id="contact_email_link"
            title="E-posta Gönder"
          >
            <span>ersin@ozbucak.com.tr</span>
          </a>
          <button
            onClick={handleCopyEmail}
            title={copiedEmail ? "Kopyalandı!" : "E-postayı Kopyala"}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition cursor-pointer"
            id="copy_contact_email_button"
            type="button"
          >
            {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-600 space-y-1">
        <div>CineLink © 2026 Türkiye Sinema Bağlantı Oyunu</div>
        <div>Yerel Veri Koruma Standartları ile Tarayıcı Tabanlı Güvenceli Altyapı</div>
      </div>
    </footer>
  );
};
