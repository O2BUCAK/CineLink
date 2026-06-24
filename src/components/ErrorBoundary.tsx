import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  
  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    try {
      const msg = (error.message || "").toLowerCase();
      const stk = (error.stack || errorInfo.componentStack || "").toLowerCase();
      const isBenign = 
        msg.includes("websocket") || 
        msg.includes("connection") || 
        msg.includes("hmr") || 
        msg.includes("vite") || 
        msg.includes("script error") ||
        stk.includes("websocket") || 
        stk.includes("connection") || 
        stk.includes("hmr");

      if (isBenign) {
        return;
      }

      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message || "ErrorBoundary error",
          stack: error.stack || errorInfo.componentStack || "",
          url: window.location.href,
        }),
      }).catch(() => {});
    } catch (e) {}
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-slate-100 p-6 font-sans">
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl text-center space-y-6">
            <span className="text-5xl">⚠️</span>
            <h2 className="text-xl font-extrabold text-red-400">Bir Hata Oluştu</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uygulama çalıştırılırken beklenmeyen bir hata tespit edildi. Tarayıcı önbelleğindeki veya yerel depolamadaki uyumsuz bir veri buna sebep olmuş olabilir.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-left font-mono text-[10px] text-red-300 overflow-auto max-h-[100px] whitespace-pre-wrap">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition text-sm shadow-md shadow-emerald-500/10"
              >
                Oyunu Yeniden Yükle
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition text-xs"
              >
                Verileri Sıfırla ve Yeniden Başlat
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
