import { useState, useEffect } from "react";
import { Library } from "./components/Library";
import { Player } from "./components/Player";
import { FileUploader } from "./components/FileUploader";
import { ConversionProgress } from "./components/ConversionProgress";
import { ChapterList } from "./components/ChapterList";
import { BookmarksPanel } from "./components/BookmarksPanel";
import { PricingModal } from "./components/PricingModal";
import { SubscriptionBanner } from "./components/SubscriptionBanner";
import { PremiumModal } from "./components/PremiumModal";
import { CreatorDashboard } from "./components/CreatorDashboard";
import { PayoutSettings } from "./components/PayoutSettings";
import { AccessDenied } from "./components/AccessDenied";
import { UserMenu } from "./components/UserMenu";
import { Book, UserSubscription, CreatorEarnings, User, UserRole } from "./types";
import { Headphones, Crown, Clock, DollarSign, LayoutDashboard, Lock, Globe } from "lucide-react";

export default function App() {
  // Current user - In production, this would come from authentication
  const [currentUser, setCurrentUser] = useState<User>({
    id: "user-1",
    email: "publisher@alexandranovanovels.com",
    name: "Alexandra Nova",
    role: "publisher", // Change to "listener" to test access restriction
    subscription: {
      isPremium: false,
      plan: null,
      conversionsRemaining: 3,
      conversionsLimit: 3,
      billingCycleEnd: null,
    },
  });

  const [subscription, setSubscription] = useState<UserSubscription>(currentUser.subscription);

  const [creatorEarnings, setCreatorEarnings] = useState<CreatorEarnings>({
    totalEarnings: 247.50,
    pendingPayout: 89.91,
    lastPayout: 157.59,
    lastPayoutDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    totalSubscribers: 25,
    activeSubscribers: 23,
    monthlyRecurringRevenue: 229.77,
    payoutMethod: null,
    payoutStatus: "pending",
    nextPayoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    recentTransactions: [
      { id: "1", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), amount: 9.99, subscriber: "john.doe@email.com", status: "completed" },
      { id: "2", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), amount: 9.99, subscriber: "jane.smith@email.com", status: "completed" },
      { id: "3", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), amount: 9.99, subscriber: "mike.wilson@email.com", status: "completed" },
      { id: "4", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), amount: 95.88, subscriber: "sarah.jones@email.com", status: "completed", plan: "yearly" },
      { id: "5", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), amount: 9.99, subscriber: "tom.brown@email.com", status: "completed" },
    ],
  });

  const [books, setBooks] = useState<Book[]>([
    {
      id: "1",
      title: "The Art of Programming",
      author: "Donald Knuth",
      duration: 45600,
      progress: 65,
      cover: "bg-amber-600",
      status: "in-progress",
      chapters: [
        { id: "1-1", title: "Introduction to Algorithms", startTime: 0, duration: 1800 },
        { id: "1-2", title: "Basic Data Structures", startTime: 1800, duration: 2400 },
        { id: "1-3", title: "Trees and Graphs", startTime: 4200, duration: 3600 },
        { id: "1-4", title: "Sorting Algorithms", startTime: 7800, duration: 2700 },
        { id: "1-5", title: "Searching Techniques", startTime: 10500, duration: 2100 },
        { id: "1-6", title: "Dynamic Programming", startTime: 12600, duration: 4200 },
        { id: "1-7", title: "Advanced Topics", startTime: 16800, duration: 5400 },
      ],
      bookmarks: [
        { id: "bm1", time: 2500, note: "Important concept about trees" },
        { id: "bm2", time: 8900, note: "Review sorting complexity" },
      ],
    },
    {
      id: "2",
      title: "Deep Work",
      author: "Cal Newport",
      duration: 30000,
      progress: 32,
      cover: "bg-emerald-600",
      status: "in-progress",
      chapters: [
        { id: "2-1", title: "The Problem with Shallow Work", startTime: 0, duration: 2400 },
        { id: "2-2", title: "Deep Work Hypothesis", startTime: 2400, duration: 3000 },
        { id: "2-3", title: "Focus Strategies", startTime: 5400, duration: 3600 },
        { id: "2-4", title: "The 4 Disciplines", startTime: 9000, duration: 4200 },
        { id: "2-5", title: "Execution Excellence", startTime: 13200, duration: 4800 },
      ],
      bookmarks: [],
    },
    {
      id: "3",
      title: "Atomic Habits",
      author: "James Clear",
      duration: 20100,
      progress: 0,
      cover: "bg-violet-600",
      status: "new",
      chapters: [
        { id: "3-1", title: "The Surprising Power of Habits", startTime: 0, duration: 2100 },
        { id: "3-2", title: "The 1% Rule", startTime: 2100, duration: 2400 },
        { id: "3-3", title: "Identity-Based Habits", startTime: 4500, duration: 2700 },
        { id: "3-4", title: "The Four Laws", startTime: 7200, duration: 3600 },
      ],
      bookmarks: [],
    },
  ]);

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [showUploader, setShowUploader] = useState(false);
  const [activeTab, setActiveTab] = useState<"chapters" | "bookmarks">("chapters");
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<string>("");
  const [activeView, setActiveView] = useState<"player" | "dashboard" | "payouts">("player");

  // Check if user can access payouts
  const canAccessPayouts = currentUser.role === "admin" || currentUser.role === "publisher";
  const canAccessDashboard = currentUser.role === "admin" || currentUser.role === "publisher";

  // Audio playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentBook) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentBook.duration) {
            setIsPlaying(false);
            return currentBook.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentBook]);

  // Sleep timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepTimerRemaining !== null && sleepTimerRemaining > 0 && isPlaying) {
      interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsPlaying(false);
            setSleepTimerRemaining(null);
            setSleepTimer(null);
            return null;
          }
          return prev - 60;
        });
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [sleepTimerRemaining, isPlaying]);

  // Update book progress
  useEffect(() => {
    if (currentBook && currentTime > 0) {
      const progressPercent = Math.round((currentTime / currentBook.duration) * 100);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === currentBook.id
            ? { ...b, progress: Math.max(b.progress, progressPercent) }
            : b
        )
      );
    }
  }, [currentTime, currentBook]);

  const handleFileUpload = (files: File[]) => {
    if (!subscription.isPremium && subscription.conversionsRemaining <= 0) {
      setPremiumFeature("unlimited conversions");
      setShowPremiumModal(true);
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);
    setShowUploader(false);

    const interval = setInterval(() => {
      setConversionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConverting(false);

          const newBook: Book = {
            id: Date.now().toString(),
            title: files[0].name.replace(/\.[^/.]+$/, ""),
            author: "Unknown Author",
            duration: Math.floor(Math.random() * 20000) + 10000,
            progress: 0,
            cover: "bg-rose-600",
            status: "new",
            chapters: [
              { id: `${Date.now()}-1`, title: "Chapter 1", startTime: 0, duration: 3600 },
              { id: `${Date.now()}-2`, title: "Chapter 2", startTime: 3600, duration: 4200 },
              { id: `${Date.now()}-3`, title: "Chapter 3", startTime: 7800, duration: 3900 },
            ],
            bookmarks: [],
          };
          setBooks((prev) => [newBook, ...prev]);

          if (!subscription.isPremium) {
            setSubscription((prev) => ({
              ...prev,
              conversionsRemaining: prev.conversionsRemaining - 1,
            }));
          }

          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 400);
  };

  const handleSelectBook = (book: Book) => {
    setCurrentBook(book);
    setCurrentTime(Math.round((book.progress / 100) * book.duration));
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, currentBook?.duration || 0)));
  };

  const handleAddBookmark = (note: string) => {
    if (!currentBook) return;

    if (!subscription.isPremium && currentBook.bookmarks.length >= 3) {
      setPremiumFeature("unlimited bookmarks");
      setShowPremiumModal(true);
      return;
    }

    const newBookmark = {
      id: `bm${Date.now()}`,
      time: currentTime,
      note,
    };
    setBooks((prev) =>
      prev.map((b) =>
        b.id === currentBook.id
          ? { ...b, bookmarks: [...b.bookmarks, newBookmark] }
          : b
      )
    );
    setCurrentBook((prev) =>
      prev ? { ...prev, bookmarks: [...prev.bookmarks, newBookmark] } : prev
    );
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    if (!currentBook) return;
    setBooks((prev) =>
      prev.map((b) =>
        b.id === currentBook.id
          ? { ...b, bookmarks: b.bookmarks.filter((bm) => bm.id !== bookmarkId) }
          : b
      )
    );
    setCurrentBook((prev) =>
      prev
        ? { ...prev, bookmarks: prev.bookmarks.filter((bm) => bm.id !== bookmarkId) }
        : prev
    );
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimer(minutes);
    setSleepTimerRemaining(minutes ? minutes * 60 : null);
  };

  const handleSubscribe = () => {
    setSubscription({
      isPremium: true,
      plan: "premium",
      conversionsRemaining: Infinity,
      conversionsLimit: Infinity,
      billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    setShowPricing(false);

    // Simulate adding to creator earnings (only for publishers/admins)
    if (canAccessPayouts) {
      setCreatorEarnings((prev) => ({
        ...prev,
        totalEarnings: prev.totalEarnings + 9.99,
        pendingPayout: prev.pendingPayout + 9.99,
        totalSubscribers: prev.totalSubscribers + 1,
        activeSubscribers: prev.activeSubscribers + 1,
        monthlyRecurringRevenue: prev.monthlyRecurringRevenue + 9.99,
        recentTransactions: [
          { id: Date.now().toString(), date: new Date(), amount: 9.99, subscriber: "you@email.com", status: "completed" },
          ...prev.recentTransactions,
        ],
      }));
    }
  };

  const handleUpgradeClick = (feature: string) => {
    setPremiumFeature(feature);
    setShowPricing(true);
  };

  const handleConnectStripe = () => {
    // Simulate Stripe Connect onboarding
    setCreatorEarnings((prev) => ({
      ...prev,
      payoutMethod: {
        type: "bank_account",
        last4: "4242",
        bankName: "Chase Bank",
        isVerified: true,
      },
      payoutStatus: "connected",
    }));
  };

  const handleRequestPayout = () => {
    // Simulate instant payout
    setCreatorEarnings((prev) => ({
      ...prev,
      lastPayout: prev.pendingPayout,
      lastPayoutDate: new Date(),
      pendingPayout: 0,
      payoutStatus: "processing",
      nextPayoutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    }));
  };

  const handleSwitchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    setActiveView("player");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Headphones className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Alexandra Nova Novels</h1>
                <div className="flex items-center gap-2">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <p className="text-xs text-slate-400">alexandranovanovels.com</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveView("player")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeView === "player"
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Player
                </button>
                <button
                  onClick={() => setActiveView("dashboard")}
                  disabled={!canAccessDashboard}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeView === "dashboard"
                      ? "bg-slate-700 text-white"
                      : canAccessDashboard
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                  {!canAccessDashboard && <Lock className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => setActiveView("payouts")}
                  disabled={!canAccessPayouts}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeView === "payouts"
                      ? "bg-slate-700 text-white"
                      : canAccessPayouts
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Payouts
                  {!canAccessPayouts && <Lock className="w-3 h-3" />}
                </button>
              </div>

              {sleepTimerRemaining && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-300">
                    {Math.floor(sleepTimerRemaining / 60)} min left
                  </span>
                </div>
              )}

              {subscription.isPremium && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-lg">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-400 font-medium">Premium</span>
                </div>
              )}

              {/* User Menu */}
              <UserMenu
                user={currentUser}
                onSwitchRole={handleSwitchRole}
                onUpgrade={() => setShowPricing(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Role Badge for Admin/Publisher */}
      {(currentUser.role === "admin" || currentUser.role === "publisher") && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium capitalize">
                {currentUser.role} Access Enabled
              </span>
              <span className="text-xs text-slate-500">• Full dashboard and payout features unlocked</span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Banner for Free Users */}
      {!subscription.isPremium && activeView === "player" && (
        <SubscriptionBanner
          conversionsRemaining={subscription.conversionsRemaining}
          onUpgrade={() => setShowPricing(true)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "player" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Library Section */}
            <div className="lg:col-span-4">
              <Library
                books={books}
                currentBook={currentBook}
                onSelectBook={handleSelectBook}
                isPremium={subscription.isPremium}
              />
            </div>

            {/* Player Section */}
            <div className="lg:col-span-5">
              <Player
                book={currentBook}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onSeek={handleSeek}
                onSkip={(seconds) => handleSeek(currentTime + seconds)}
                sleepTimer={sleepTimer}
                sleepTimerRemaining={sleepTimerRemaining}
                onSetSleepTimer={handleSetSleepTimer}
                onAddBookmark={handleAddBookmark}
                isPremium={subscription.isPremium}
                onUpgradeClick={handleUpgradeClick}
              />
            </div>

            {/* Chapters & Bookmarks */}
            <div className="lg:col-span-3">
              {currentBook && (
                <>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveTab("chapters")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        activeTab === "chapters"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Chapters
                    </button>
                    <button
                      onClick={() => setActiveTab("bookmarks")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        activeTab === "bookmarks"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Bookmarks
                    </button>
                  </div>

                  {activeTab === "chapters" ? (
                    <ChapterList
                      chapters={currentBook.chapters}
                      currentTime={currentTime}
                      onChapterSelect={(time) => {
                        handleSeek(time);
                        setIsPlaying(true);
                      }}
                    />
                  ) : (
                    <BookmarksPanel
                      bookmarks={currentBook.bookmarks}
                      currentTime={currentTime}
                      onJumpToBookmark={(time) => {
                        handleSeek(time);
                        setIsPlaying(true);
                      }}
                      onDeleteBookmark={handleDeleteBookmark}
                      onAddBookmark={handleAddBookmark}
                      isPremium={subscription.isPremium}
                      onUpgradeClick={handleUpgradeClick}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeView === "dashboard" && (
          canAccessDashboard ? (
            <CreatorDashboard
              earnings={creatorEarnings}
              onNavigateToPayouts={() => setActiveView("payouts")}
            />
          ) : (
            <AccessDenied
              feature="Creator Dashboard"
              requiredRole="publisher"
              currentRole={currentUser.role}
            />
          )
        )}

        {activeView === "payouts" && (
          canAccessPayouts ? (
            <PayoutSettings
              earnings={creatorEarnings}
              onConnectStripe={handleConnectStripe}
              onRequestPayout={handleRequestPayout}
            />
          ) : (
            <AccessDenied
              feature="Payout Settings"
              requiredRole="publisher"
              currentRole={currentUser.role}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Alexandra Nova Novels</p>
                <p className="text-xs text-slate-500">alexandranovanovels.com</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Alexandra Nova Novels. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Convert Button */}
      {activeView === "player" && (
        <button
          onClick={() => setShowUploader(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-xl shadow-amber-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
        >
          <span className="text-2xl">+</span>
        </button>
      )}

      {/* File Uploader Modal */}
      {showUploader && (
        <FileUploader
          onUpload={handleFileUpload}
          onClose={() => setShowUploader(false)}
          isPremium={subscription.isPremium}
          conversionsRemaining={subscription.conversionsRemaining}
        />
      )}

      {/* Conversion Progress Overlay */}
      {isConverting && <ConversionProgress progress={conversionProgress} />}

      {/* Pricing Modal */}
      {showPricing && (
        <PricingModal
          onClose={() => setShowPricing(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      {/* Premium Gate Modal */}
      {showPremiumModal && (
        <PremiumModal
          feature={premiumFeature}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            setShowPremiumModal(false);
            setShowPricing(true);
          }}
        />
      )}
    </div>
  );
}