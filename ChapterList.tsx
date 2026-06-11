import { Chapter } from "../types";

interface ChapterListProps {
  chapters: Chapter[];
  currentTime: number;
  onChapterSelect: (time: number) => void;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}`;
  }
  return `${m} min`;
}

export function ChapterList({ chapters, currentTime, onChapterSelect }: ChapterListProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Chapters
      </h3>
      <div className="space-y-1 max-h-[calc(100vh-400px)] overflow-y-auto">
        {chapters.map((chapter) => {
          const isActive = currentTime >= chapter.startTime && currentTime < chapter.startTime + chapter.duration;
          const isCompleted = currentTime >= chapter.startTime + chapter.duration;

          return (
            <button
              key={chapter.id}
              onClick={() => onChapterSelect(chapter.startTime)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isActive
                  ? "bg-amber-500/15 border border-amber-500/40"
                  : "hover:bg-slate-800"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-slate-950"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-500"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isCompleted && !isActive ? (
                  <span className="text-sm">✓</span>
                ) : (
                  <span className="text-xs font-bold">{chapters.indexOf(chapter) + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-300"}`}>
                  {chapter.title}
                </p>
                <p className="text-xs text-slate-500">{formatTime(chapter.duration)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}