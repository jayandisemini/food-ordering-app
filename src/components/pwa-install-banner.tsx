import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-2xl backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold leading-tight">Install QuickBite App</p>
            <p className="text-xs opacity-90">Add to home screen for faster ordering</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-primary transition-transform active:scale-95"
          >
            Install
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
