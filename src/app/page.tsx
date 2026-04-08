"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [userProfile, setUserProfile] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const generateCoverLetter = async () => {
    if (!jobDescription.trim() || !userProfile.trim()) {
      setError("Por favor completa ambos campos antes de generar.");
      return;
    }

    setError("");
    setCoverLetter("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userProfile }),
      });

      if (!response.ok) throw new Error("Error al generar la carta");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No se pudo leer la respuesta");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setCoverLetter((prev) => prev + chunk);
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    } catch (err) {
      setError("Ocurrió un error. Verifica tu API key e intenta nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setCoverLetter("");
    setJobDescription("");
    setUserProfile("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black font-bold text-sm">
            AI
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            Cover Letter Generator
          </h1>
          <span className="ml-auto text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
            llama-3.1-8b · Groq
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Intro */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Genera tu carta de presentación{" "}
            <span className="text-emerald-400">en segundos</span>
          </h2>
          <p className="text-zinc-400 text-base">
            Pega la oferta de trabajo y tu perfil. La IA creará una carta personalizada con streaming en tiempo real.
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              📋 Oferta de trabajo
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Pega aquí la descripción completa del puesto, requisitos, responsabilidades y nombre de la empresa..."
              className="w-full h-52 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              👤 Tu perfil profesional
            </label>
            <textarea
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              placeholder="Describe tu experiencia, habilidades clave, logros destacados, tecnologías que dominas y lo que te motiva de este rol..."
              className="w-full h-52 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-950/50 border border-red-800/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex gap-3">
          <button
            onClick={generateCoverLetter}
            disabled={isGenerating}
            className="flex-1 md:flex-none md:px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black disabled:text-zinc-500 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generando...
              </>
            ) : (
              "✨ Generar carta"
            )}
          </button>

          {coverLetter && !isGenerating && (
            <button
              onClick={reset}
              className="px-4 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all text-sm"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Output */}
        {(coverLetter || isGenerating) && (
          <div className="mt-8" ref={outputRef}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-zinc-300">
                  Carta de presentación
                </h3>
                {isGenerating && (
                  <span className="text-xs text-emerald-400 animate-pulse">
                    ● generando
                  </span>
                )}
              </div>
              {coverLetter && !isGenerating && (
                <button
                  onClick={copyToClipboard}
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
        )}
      </div>
    </main>
  );
}