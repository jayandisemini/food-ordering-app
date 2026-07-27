import { useState } from "react";
import { Users, Copy, Check, QrCode, X } from "lucide-react";
import { toast } from "sonner";

export function GroupCartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/cart?group=${Math.random().toString(36).substring(7)}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Group cart link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl border border-border">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground leading-tight">Start Group Order</h3>
              <p className="text-xs text-muted-foreground">Order together with friends</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 text-center">
          <div className="mx-auto mb-3 flex h-32 w-32 items-center justify-center rounded-2xl bg-white p-2 shadow-inner">
            <QrCode className="h-28 w-28 text-black" />
          </div>
          <p className="text-xs text-muted-foreground px-4">
            Scan QR code or share the link below to let anyone add items directly to this cart!
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/50 p-2 text-xs">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent px-2 font-mono text-muted-foreground outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-bold text-primary-foreground transition-transform active:scale-95 shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
