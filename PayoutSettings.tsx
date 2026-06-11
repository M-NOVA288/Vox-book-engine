import { useState } from "react";
import { CreatorEarnings } from "../types";
import {
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Calendar,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

interface PayoutSettingsProps {
  earnings: CreatorEarnings;
  onConnectStripe: () => void;
  onRequestPayout: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function PayoutSettings({
  earnings,
  onConnectStripe,
  onRequestPayout,
}: PayoutSettingsProps) {
  const [showBankForm, setShowBankForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    routingNumber: "",
    accountNumber: "",
  });

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      onConnectStripe();
      setIsConnecting(false);
      setShowBankForm(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Payout Settings</h2>
        <p className="text-slate-400 mt-1">Manage how you receive your earnings</p>
      </div>

      {/* Payout Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Available Balance</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(earnings.pendingPayout)}</p>
            </div>
          </div>
          <button
            onClick={onRequestPayout}
            disabled={earnings.pendingPayout === 0 || !earnings.payoutMethod}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Instant Payout
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Next Scheduled Payout</p>
              <p className="text-lg font-bold text-white">{formatDate(earnings.nextPayoutDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Automatic payout every week</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Last Payout</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(earnings.lastPayout)}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">{formatDate(earnings.lastPayoutDate)}</p>
        </div>
      </div>

      {/* Payout Method */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Payout Method</h3>

        {earnings.payoutMethod ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-medium">{earnings.payoutMethod.bankName}</p>
                  <p className="text-sm text-slate-400">****{earnings.payoutMethod.last4}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-500">Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Shield className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-slate-300">
                Your banking information is encrypted and secure. We use Stripe Connect for safe payouts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-slate-300">
                Connect your bank account to start receiving payouts
              </p>
            </div>

            {!showBankForm ? (
              <button
                onClick={() => setShowBankForm(true)}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.976 9.15c-2.5-.625-4.076-1.5-4.076-2.7 0-1.35 1.35-2.25 3.6-2.25 2.4 0 3.6 1.05 3.75 2.7h3.15c-.15-2.55-2.1-4.5-5.25-4.95V0h-3v2.85c-3 .375-5.25 2.1-5.25 4.8 0 3.15 2.7 4.35 6.3 5.1 2.85.675 4.05 1.5 4.05 2.85 0 1.35-1.35 2.25-3.6 2.25-2.55 0-3.9-1.2-4.05-2.85H4.5c.15 2.7 2.25 4.95 5.25 5.4V24h3v-3.45c3-.45 5.25-2.25 5.25-5.1 0-3.15-2.7-4.35-6.025-5.3z" />
                </svg>
                Connect with Stripe
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Routing Number</label>
                    <input
                      type="text"
                      value={bankDetails.routingNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                      placeholder="021000021"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      placeholder="123456789"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBankForm(false)}
                    className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting || !bankDetails.accountHolder || !bankDetails.routingNumber || !bankDetails.accountNumber}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
        <div className="space-y-3">
          {earnings.recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-white font-medium capitalize">{tx.subscriber.split("@")[0]}</p>
                  <p className="text-sm text-slate-400">{formatDate(tx.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 font-semibold">+{formatCurrency(tx.amount)}</p>
                <p className="text-xs text-slate-500 capitalize">{tx.plan || "monthly"} plan</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}