import { useState } from "react";
import { Bookmark, Trash2, Plus } from "lucide-react";
import { Bookmark as BookmarkType } from "../types";

interface BookmarksPanelProps {
  bookmarks: BookmarkType[];
  currentTime: number;
  onJumpToBookmark: (time: number) => void;
  onDeleteBookmark: (id: string) => void;
  onAddBookmark: (note: string) => void;
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

export function BookmarksPanel({
  bookmarks,
  currentTime,
  onJumpToBookmark,
  onDeleteBookmark,
}: BookmarksPanelProps) {
  const sortedBookmarks = [...bookmarks].sort((a, b) => a.time - b.time);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
      <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1">BOOKMARKS</h3>

      {sortedBookmarks.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No bookmarks yet</p>
          <p className="text-xs text-slate-600 mt-1">Add bookmarks while listening</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedBookmarks.map((bookmark) => {
            const isActive = Math.abs(currentTime - bookmark.time) < 5;

            return (
              <div
                key={bookmark.id}
                className={`group flex items-start gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-amber-500/15 border border-amber-500/40"
                    : "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
                }`}
              >
                <button
                  onClick={() => onJumpToBookmark(bookmark.time)}
                  className="flex-1 text-left"
                >
                  <p className="text-amber-500 font-mono text-sm mb-1">
                    {formatTime(bookmark.time)}
                  </p>
                  <p className="text-white text-sm">{bookmark.note}</p>
                </button>
                <button
                  onClick={() => onDeleteBookmark(bookmark.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}