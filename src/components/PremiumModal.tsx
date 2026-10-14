import { Crown, Zap, X } from "lucide-react";

interface PremiumModalProps {
  feature: string;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PremiumModal({ feature, onClose, onUpgrade }: PremiumModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
          <p className="text-slate-400 mb-6">
            <span className="text-white font-medium">{feature}</span> is only available with a Premium subscription.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}