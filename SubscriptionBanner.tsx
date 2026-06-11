import { Crown, Zap } from "lucide-react";

interface SubscriptionBannerProps {
  conversionsRemaining: number;
  onUpgrade: () => void;
}

export function SubscriptionBanner({ conversionsRemaining, onUpgrade }: SubscriptionBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-slate-300">
              <span className="text-amber-500 font-semibold">{conversionsRemaining} free conversions</span> remaining this month
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}