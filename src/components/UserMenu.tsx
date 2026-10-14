import { useState } from "react";
import { User, UserRole } from "../types";
import { User as UserIcon, Settings, Crown, Shield, BookOpen, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  user: User;
  onSwitchRole: (role: UserRole) => void;
  onUpgrade: () => void;
}

export function UserMenu({ user, onSwitchRole, onUpgrade }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    listener: "Listener",
    publisher: "Publisher",
    admin: "Admin",
  };

  const roleIcons: Record<UserRole, React.ReactNode> = {
    listener: <BookOpen className="w-4 h-4" />,
    publisher: <Crown className="w-4 h-4" />,
    admin: <Shield className="w-4 h-4" />,
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50">
            {/* User Info */}
            <div className="p-4 border-b border-slate-700">
              <p className="font-medium text-white">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">
                  {roleLabels[user.role]}
                </span>
                {user.subscription.isPremium && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Role Switcher (for demo purposes) */}
            <div className="p-3 border-b border-slate-700">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 px-1">Switch Role (Demo)</p>
              <div className="space-y-1">
                {(["listener", "publisher", "admin"] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onSwitchRole(role);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      user.role === role
                        ? "bg-amber-500/20 text-amber-400"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {roleIcons[role]}
                    <span>{roleLabels[role]}</span>
                    {user.role === role && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              {!user.subscription.isPremium && (
                <button
                  onClick={() => {
                    onUpgrade();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Premium</span>
                </button>
              )}
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}