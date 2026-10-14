import { FileAudio, Loader2 } from "lucide-react";

interface ConversionProgressProps {
  progress: number;
}

export function ConversionProgress({ progress }: ConversionProgressProps) {
  const stages = [
    { threshold: 10, label: "Analyzing document..." },
    { threshold: 30, label: "Extracting text..." },
    { threshold: 50, label: "Processing chapters..." },
    { threshold: 70, label: "Generating audio..." },
    { threshold: 90, label: "Finalizing..." },
    { threshold: 100, label: "Complete!" },
  ];

  const currentStage = stages.find((s) => progress <= s.threshold) || stages[stages.length - 1];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-800 shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <FileAudio className="w-8 h-8 text-amber-500" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">Converting to Audiobook</h3>
        <p className="text-slate-400 mb-6">{currentStage.label}</p>

        {/* Progress Bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-2xl font-bold text-white">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}