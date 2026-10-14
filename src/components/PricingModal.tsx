import { X, Check, Crown, Zap } from "lucide-react";

interface PricingModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

export function PricingModal({ onClose, onSubscribe }: PricingModalProps) {
  const features = [
    "Unlimited file conversions",
    "Unlimited bookmarks",
    "High-quality AI voices",
    "Priority conversion speed",
    "Offline downloads",
    "Sleep timer & speed control",
    "Early access to new features",
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-6 px-6 text-center border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h2>
          <p className="text-slate-400">Unlock the full potential of Alexandra Nova Novels</p>
        </div>

        {/* Pricing */}
        <div className="p-6">
          <div className="flex items-end justify-center gap-1 mb-6">
            <span className="text-5xl font-bold text-white">$9.99</span>
            <span className="text-slate-400 mb-2">/month</span>
          </div>

          {/* Features List */}
          <ul className="space-y-3 mb-6">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-500" />
                </div>
                <span className="text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Subscribe Button */}
          <button
            onClick={onSubscribe}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Zap className="w-5 h-5" />
            Subscribe Now
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Cancel anytime. No hidden fees.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}