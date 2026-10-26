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
    <footer className="mt-auto py-10 border-t border-white/[0.08] px-4 text-center space-y-6" id="app_footer">
      {/* Contact & Feedback Card */}
      <div className="max-w-md mx-auto cinema-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left" id="feedback_contact_card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">Görüş & İletişim</p>
            <p className="text-[11px] text-slate-400">Öneri ve geri bildirimlerinizi iletebilirsiniz</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <a
            href="mailto:ersin@ozbucak.com.tr?subject=CineLink%20%C3%96neri%2C%20%C4%B0stek%20ve%20G%C3%B6r%C3%BC%C5%9F"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition"
            id="contact_email_link"
            title="E-posta Gönder"
          >
            <span>ersin@ozbucak.com.tr</span>
          </a>
          <button
            onClick={handleCopyEmail}
            title={copiedEmail ? "Kopyalandı!" : "E-postayı Kopyala"}
            className="p-1.5 text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition cursor-pointer"
            id="copy_contact_email_button"
            type="button"
          >
            {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-500 space-y-1">
        <div>CineLink © 2026 Türkiye Sinema Bağlantı Oyunu</div>
        <div>Veri minimizasyonu ve yerel bellek güvencesiyle sunulmaktadır</div>
      </div>
    </footer>
  );
};
