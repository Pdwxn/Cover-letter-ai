"use client";

interface Props {
  coverLetter: string;
  isGenerating: boolean;
  onCopy: () => void;
  copied: boolean;
}

export default function StreamingOutput({ coverLetter, isGenerating, onCopy, copied }: Props) {
  if (!coverLetter && !isGenerating) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-300">Carta de presentación</h3>
          {isGenerating && (
            <span className="text-xs text-emerald-400 animate-pulse">● generando</span>
          )}
        </div>
        {coverLetter && !isGenerating && (
          <button
            onClick={onCopy}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg"
          >
            {copied ? "✓ Copiado" : "Copiar texto"}
          </button>
        )}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-mono">
          {coverLetter}
          {isGenerating && (
            <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}