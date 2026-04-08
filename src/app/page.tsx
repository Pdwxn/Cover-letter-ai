"use client";

import { useState, useEffect } from "react";
import CoverLetterForm from "../../components/CoverLetterForm";

import type { HistoryEntry } from "../../types/index";

const STORAGE_KEY = "cover-letter-history";

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 10)));
}

export default function Home() {
  const [activeTab, setActiveTab]             = useState<"editor" | "history">("editor");
  const [history, setHistory]                 = useState<HistoryEntry[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null);
  const [copied, setCopied]                   = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleNewEntry = (entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    const full: HistoryEntry = {
      ...entry,
      id:        crypto.randomUUID(),
      createdAt: new Date().toLocaleString("es-CL"),
    };
    const updated = [full, ...history];
    setHistory(updated);
    saveHistory(updated);
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter((e) => e.id !== id);
    setHistory(updated);
    saveHistory(updated);
    if (selectedHistory?.id === id) setSelectedHistory(null);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
            AI
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Cover Letter Generator</h1>
          <span className="ml-auto text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
            llama-3.1-8b · Groq
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-zinc-900 p-1 rounded-xl w-fit border border-zinc-800">
          {(["editor", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "editor"
                ? "✏️ Editor"
                : `📋 Historial${history.length > 0 ? ` (${history.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Tab: Editor */}
        {activeTab === "editor" && (
          <CoverLetterForm onNewEntry={handleNewEntry} />
        )}

        {/* Tab: Historial */}
        {activeTab === "history" && (
          <div>
            {history.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">Aún no has generado ninguna carta.</p>
                <button
                  onClick={() => setActiveTab("editor")}
                  className="mt-4 text-sm text-emerald-400 hover:underline"
                >
                  Ir al editor →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedHistory(entry)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedHistory?.id === entry.id
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500 mb-1">{entry.createdAt}</p>
                          <p className="text-sm text-zinc-200 truncate">{entry.jobSnippet}</p>
                          <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
                            {entry.tone}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                          className="text-zinc-600 hover:text-red-400 transition-colors text-xs shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-2">
                  {selectedHistory ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-xs text-zinc-500">{selectedHistory.createdAt}</p>
                          <p className="text-sm font-medium text-zinc-300 mt-0.5 capitalize">
                            Tono: {selectedHistory.tone}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(selectedHistory.coverLetter)}
                          className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg transition-all"
                        >
                          {copied ? "✓ Copiado" : "Copiar"}
                        </button>
                      </div>
                      <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-mono overflow-y-auto max-h-[500px]">
                        {selectedHistory.coverLetter}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600 text-sm py-20">
                      Selecciona una carta para verla
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}