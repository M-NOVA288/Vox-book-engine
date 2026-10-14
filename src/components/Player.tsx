import { useState } from "react";
import { Book } from "../types";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Bookmark,
  Crown,
  Lock,
} from "lucide-react";

interface PlayerProps {
  book: Book | null;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (seconds: number) => void;
  sleepTimer: number | null;
  sleepTimerRemaining: number | null;
  onSetSleepTimer: (minutes: number | null) => void;
  onAddBookmark: (note: string) => void;
  isPremium: boolean;
  onUpgradeClick: (feature: string) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function Player({
  book,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
  onSkip,
  sleepTimer,
  sleepTimerRemaining,
  onSetSleepTimer,
  onAddBookmark,
  isPremium,
  onUpgradeClick,
}: PlayerProps) {
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const sleepOptions = [
    { label: "5 minutes", value: 5 },
    { label: "10 minutes", value: 10 },
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "45 minutes", value: 45 },
    { label: "1 hour", value: 60 },
    { label: "End of chapter", value: -1 },
    { label: "Off", value: null },
  ];

  if (!book) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400">Select a book to start listening</p>
        </div>
      </div>
    );
  }

  const progress = (currentTime / book.duration) * 100;
  const currentChapter = book.chapters.find(
    (ch) => currentTime >= ch.startTime && currentTime < ch.startTime + ch.duration
  );

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * book.duration);
  };

  const handleAddBookmark = () => {
    if (bookmarkNote.trim()) {
      onAddBookmark(bookmarkNote.trim());
      setBookmarkNote("");
      setShowBookmarkMenu(false);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!isPremium && rate > 2) {
      onUpgradeClick("faster playback speeds");
      return;
    }
    setPlaybackRate(rate);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      {/* Book Cover */}
      <div
        className={`w-full aspect-square rounded-2xl ${book.cover} flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10" />
        <span className="text-7xl font-bold text-white/90 relative z-10">
          {book.title.charAt(0)}
        </span>

        {/* Animated waves when playing */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center gap-0.5 px-4">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/30 rounded-t animate-pulse"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: "0.5s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">{book.title}</h3>
        <p className="text-slate-400 mt-1">{book.author}</p>
        {currentChapter && (
          <p className="text-sm text-amber-500 mt-2">{currentChapter.title}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="h-2 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatDuration(book.duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button
          onClick={() => onSkip(-30)}
          className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Back 30s"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSkip(-10)}
          className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Back 10s"
        >
          <span className="text-xs font-bold">10</span>
        </button>
        <button
          onClick={onPlayPause}
          className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-slate-950 transition-all duration-200 shadow-lg shadow-amber-500/30"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </button>
        <button
          onClick={() => onSkip(10)}
          className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Forward 10s"
        >
          <span className="text-xs font-bold">10</span>
        </button>
        <button
          onClick={() => onSkip(30)}
          className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Forward 30s"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 80 : 0)}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer"
          />
        </div>

        {/* Playback Speed */}
        <div className="relative">
          <button
            onClick={() => setPlaybackRate(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Sleep Timer */}
        <div className="relative">
          <button
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              sleepTimer ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>
          {showSleepMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 min-w-[140px] z-10">
              {sleepOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => {
                    onSetSleepTimer(option.value);
                    setShowSleepMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors ${
                    sleepTimer === option.value ? "text-amber-500" : "text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => setShowBookmarkMenu(!showBookmarkMenu)}
          className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmark Menu */}
      {showBookmarkMenu && (
        <div className="mt-4 p-4 bg-slate-800 rounded-xl">
          <input
            type="text"
            value={bookmarkNote}
            onChange={(e) => setBookmarkNote(e.target.value)}
            placeholder="Add a note for this bookmark..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowBookmarkMenu(false)}
              className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBookmark}
              disabled={!bookmarkNote.trim()}
              className="flex-1 py-2 bg-amber-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
            >
              Save Bookmark
            </button>
          </div>
        </div>
      )}
    </div>
  );
}