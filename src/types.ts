export interface Chapter {
  id: string;
  title: string;
  startTime: number;
  duration: number;
}

export interface Bookmark {
  id: string;
  time: number;
  note: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  duration: number;
  progress: number;
  cover: string;
  status: "new" | "in-progress" | "completed";
  chapters: Chapter[];
  bookmarks: Bookmark[];
}

export interface UserSubscription {
  isPremium: boolean;
  plan: "free" | "premium" | null;
  conversionsRemaining: number;
  conversionsLimit: number;
  billingCycleEnd: Date | null;
}

export type UserRole = "listener" | "publisher" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  subscription: UserSubscription;
}

export interface PayoutMethod {
  type: "bank_account" | "debit_card";
  last4: string;
  bankName?: string;
  isVerified: boolean;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  subscriber: string;
  status: "completed" | "pending" | "refunded";
  plan?: "monthly" | "yearly";
}

export interface CreatorEarnings {
  totalEarnings: number;
  pendingPayout: number;
  lastPayout: number;
  lastPayoutDate: Date;
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRecurringRevenue: number;
  payoutMethod: PayoutMethod | null;
  payoutStatus: "pending" | "connected" | "processing" | "paid";
  nextPayoutDate: Date;
  recentTransactions: Transaction[];
}