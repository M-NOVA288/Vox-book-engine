import { useState } from 'react';
import { Book } from '../types';
import { Upload, File, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onAddBook: (book: Book) => void;
}

export function FileUploader({ onAddBook }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const convertFiles = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setConversionProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setConversionProgress(i);
    }

    const newBook: Book = {
      id: Date.now().toString(),
      title: files[0].name.replace(/\.[^/.]+$/, ''),
      author: 'Unknown Author',
      duration: Math.floor(Math.random() * 300) + 60,
      progress: 0,
      coverColor: ['bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600', 'bg-cyan-600'][
        Math.floor(Math.random() * 5)
      ],
    };

    onAddBook(newBook);
    setIsConverting(false);
    setFiles([]);
  };

  const supportedFormats = ['PDF', 'DOC', 'DOCX', 'EPUB', 'TXT', 'RTF'];

  return (
    <div className="relative">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-amber-500 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Drop files here</h3>
        <p className="text-slate-400 mb-4">or click to browse</p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.epub,.txt,.rtf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-wrap justify-center gap-2">
          {supportedFormats.map((format) => (
            <span key={format} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
              {format}
            </span>
          ))}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-slate-300 mb-3">
            {files.length} file{files.length > 1 ? 's' : ''} selected
          </h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button onClick={() => removeFile(index)} className="p-1 hover:bg-slate-800 rounded transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))}

          <button
            onClick={convertFiles}
            className="w-full mt-4 py-3 bg-amber-500 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
          >
            Convert to Audiobook
          </button>
        </div>
      )}

      {isConverting && (
        <div className="absolute inset-0 bg-slate-950/90 rounded-xl flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          <p className="text-white font-medium mb-2">Converting files...</p>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${conversionProgress}%` }} />
          </div>
          <p className="text-slate-400 text-sm mt-2">{conversionProgress}%</p>
        </div>
      )}
    </div>
  );
}