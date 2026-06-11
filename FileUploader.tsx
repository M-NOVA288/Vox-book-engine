import { useState, useRef } from "react";
import { Upload, File, X, Crown } from "lucide-react";

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  onClose: () => void;
  isPremium: boolean;
  conversionsRemaining: number;
}

export function FileUploader({ onUpload, onClose, isPremium, conversionsRemaining }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const canConvert = isPremium || conversionsRemaining > 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Convert to Audiobook</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversion Limit Warning */}
        {!isPremium && (
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">
                <span className="text-amber-500 font-semibold">{conversionsRemaining}</span> free conversions remaining
              </span>
              <span className="text-xs text-slate-500">Upgrade for unlimited</span>
            </div>
          </div>
        )}

        {/* Drop Zone */}
        <div className="p-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-amber-500 bg-amber-500/10"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.epub,.txt,.rtf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">Drop files here or click to browse</p>
            <p className="text-sm text-slate-500 mt-1">PDF, DOC, EPUB, TXT supported</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg"
                >
                  <File className="w-5 h-5 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => files.length > 0 && onUpload(files)}
            disabled={files.length === 0 || !canConvert}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isPremium ? (
              <>
                <Crown className="w-4 h-4" />
                <span>Convert ({files.length})</span>
              </>
            ) : (
              <span>Convert ({Math.min(files.length, conversionsRemaining)} available)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}