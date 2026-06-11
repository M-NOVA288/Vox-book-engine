import { UserRole } from "../types";
import { Lock, Shield, Crown, BookOpen } from "lucide-react";

interface AccessDeniedProps {
  feature: string;
  requiredRole: UserRole;
  currentRole: UserRole;
}

export function AccessDenied({ feature, requiredRole, currentRole }: AccessDeniedProps) {
  const roleInfo: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    listener: { label: "Listener", icon: <BookOpen className="w-6 h-6" />, color: "text-blue-500" },
    publisher: { label: "Publisher", icon: <Crown className="w-6 h-6" />, color: "text-amber-500" },
    admin: { label: "Admin", icon: <Shield className="w-6 h-6" />, color: "text-emerald-500" },
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center">
        <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-slate-400 mb-6">
          The <span className="text-white font-medium">{feature}</span> is only available to{" "}
          <span className={`font-medium ${roleInfo[requiredRole].color}`}>
            {roleInfo[requiredRole].label}s
          </span>.
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-400 mb-3">Your current role:</p>
          <div className="flex items-center justify-center gap-2">
            <div className={`${roleInfo[currentRole].color}`}>
              {roleInfo[currentRole].icon}
            </div>
            <span className="text-white font-medium">{roleInfo[currentRole].label}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            To access this feature, you need to:
          </p>
          <div className="text-left space-y-2">
            {requiredRole === "publisher" && (
              <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
                <Crown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Become a Publisher</p>
                  <p className="text-xs text-slate-400">Apply to become a content publisher to access earnings and payouts.</p>
                </div>
              </div>
            )}
            {requiredRole === "admin" && (
              <div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Admin Access Required</p>
                  <p className="text-xs text-slate-400">This feature is restricted to platform administrators only.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Switch roles using the user menu in the header to explore different access levels.
        </p>
      </div>
    </div>
  );
}