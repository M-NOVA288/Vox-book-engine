import { Book } from "../types";
import { Clock, Play, Crown } from "lucide-react";

interface LibraryProps {
  books: Book[];
  currentBook: Book | null;
  onSelectBook: (book: Book) => void;
  isPremium: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function Library({ books, currentBook, onSelectBook, isPremium }: LibraryProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">Your Library</h2>
        <div className="flex items-center gap-2">
          {isPremium && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full">
              <Crown className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-400">Premium</span>
            </div>
          )}
          <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
            {books.length} books
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
              currentBook?.id === book.id
                ? "bg-amber-500/15 border border-amber-500/40"
                : "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
            }`}
          >
            {/* Book Cover */}
            <div
              className={`w-12 h-12 rounded-lg ${book.cover} flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <span className="text-white text-lg font-bold">
                {book.title.charAt(0)}
              </span>
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate text-sm">{book.title}</h3>
              <p className="text-xs text-slate-400">{book.author}</p>

              {/* Progress Bar */}
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      currentBook?.id === book.id ? "bg-amber-500" : "bg-slate-500"
                    }`}
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-8">{book.progress}%</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{formatDuration(book.duration)}</span>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Play className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400">No audiobooks yet</p>
          <p className="text-sm text-slate-500 mt-1">Upload a file to get started</p>
        </div>
      )}
    </div>
  );
}