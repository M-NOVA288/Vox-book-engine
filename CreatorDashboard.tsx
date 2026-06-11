import { CreatorEarnings } from "../types";
import {
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

interface CreatorDashboardProps {
  earnings: CreatorEarnings;
  onNavigateToPayouts: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatGrowth(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function CreatorDashboard({ earnings, onNavigateToPayouts }: CreatorDashboardProps) {
  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(earnings.totalEarnings),
      change: 12.5,
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Active Subscribers",
      value: earnings.activeSubscribers.toString(),
      change: 8.3,
      icon: Users,
      color: "blue",
    },
    {
      label: "Monthly Recurring",
      value: formatCurrency(earnings.monthlyRecurringRevenue),
      change: 15.2,
      icon: TrendingUp,
      color: "violet",
    },
    {
      label: "Pending Payout",
      value: formatCurrency(earnings.pendingPayout),
      change: 0,
      icon: Clock,
      color: "amber",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-500", iconBg: "bg-emerald-500/20" },
    blue: { bg: "bg-blue-500/20", text: "text-blue-500", iconBg: "bg-blue-500/20" },
    violet: { bg: "bg-violet-500/20", text: "text-violet-500", iconBg: "bg-violet-500/20" },
    amber: { bg: "bg-amber-500/20", text: "text-amber-500", iconBg: "bg-amber-500/20" },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Creator Dashboard</h2>
          <p className="text-slate-400 mt-1">Track your earnings and subscriber growth</p>
        </div>
        <button
          onClick={onNavigateToPayouts}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl transition-colors"
        >
          <span>View Payouts</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const colors = colorClasses[stat.color];
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-slate-900 rounded-2xl p-5 border border-slate-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                {stat.change > 0 && (
                  <div className={`flex items-center gap-1 text-sm ${colors.text}`}>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{formatGrowth(stat.change)}</span>
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Subscribers</h3>
        <div className="space-y-3">
          {earnings.recentTransactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {tx.subscriber.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{tx.subscriber.split("@")[0]}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 font-semibold">+{formatCurrency(tx.amount)}</p>
                {tx.plan && (
                  <p className="text-xs text-slate-500 capitalize">{tx.plan}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-2">Payout Status</h3>
          <p className="text-slate-400 mb-4">
            {earnings.payoutMethod
              ? "Your payout method is connected and verified."
              : "Connect your bank account to receive payouts."}
          </p>
          <button
            onClick={onNavigateToPayouts}
            className="text-amber-500 font-medium hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            Manage Payout Settings
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-2">Share Your Content</h3>
          <p className="text-slate-400 mb-4">
            Share your audiobooks and earn more subscribers.
          </p>
          <button className="text-amber-500 font-medium hover:text-amber-400 transition-colors flex items-center gap-1">
            Get Share Links
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}