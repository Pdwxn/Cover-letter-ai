"use client";

import { useState, useRef } from "react";
import StreamingOutput from "./StreamingOutput";

import type { Tone } from "../types/index";

const MIN_LENGTH = 50;

const TONES: { value: Tone; label: string; description: string }[] = [
  { value: "formal",   label: "Formal",   description: "Clásico y profesional" },
  { value: "creativo", label: "Creativo",  description: "Memorable y con personalidad" },
  { value: "conciso",  label: "Conciso",   description: "Directo y sin relleno" },
];

const EXAMPLES = [
  {
    label: "Desarrollador Full Stack",
    jobDescription: `Empresa: TechStartup SPA
Puesto: Desarrollador Full Stack Senior
Requisitos: 4+ años de experiencia con React y Node.js, TypeScript, bases de datos relacionales (PostgreSQL), experiencia con APIs REST y GraphQL, trabajo en equipo ágil (Scrum).
Responsabilidades: Diseñar y desarrollar nuevas funcionalidades, participar en code reviews, colaborar con diseño y producto.
Ofrecemos: Trabajo remoto 100%, salario competitivo, stock options.`,
    userProfile: `Soy desarrollador Full Stack con 5 años de experiencia. Trabajo principalmente con React, Next.js, Node.js y TypeScript. He liderado el desarrollo de una plataforma SaaS que pasó de 0 a 10.000 usuarios activos. Tengo experiencia con PostgreSQL, Redis y despliegues en AWS. Me apasiona el código limpio y la experiencia de usuario. Busco unirme a un equipo donde pueda crecer y tener impacto real.`,
  },
  {
    label: "Diseñadora UX",
    jobDescription: `Empresa: Fintech Latam
Puesto: UX Designer
Requisitos: Experiencia en diseño de productos digitales, dominio de Figma, conocimiento de research cualitativo, capacidad para trabajar con equipos de desarrollo, portfolio de proyectos.
Responsabilidades: Diseñar flujos e interfaces, realizar entrevistas a usuarios, iterar prototipos, trabajar en estrecha colaboración con producto e ingeniería.`,
    userProfile: `Diseñadora UX con 3 años de experiencia en productos digitales para banca y fintech. Manejo Figma, Maze y Notion como herramientas principales. He rediseñado el onboarding de una app móvil reduciendo la tasa de abandono en un 34%. Me especializo en research cualitativo y diseño orientado a datos. Tengo portfolio disponible y gran capacidad de comunicación con equipos técnicos.`,
  },
];

function validationMessage(text: string, fieldName: string) {
  const len = text.trim().length;
  if (len === 0) return null;
  if (len < MIN_LENGTH) return `${MIN_LENGTH - len} caracteres más para ${fieldName}`;
  return null;
}

interface Props {
  onNewEntry: (entry: { tone: Tone; jobSnippet: string; coverLetter: string }) => void;
}

export default function CoverLetterForm({ onNewEntry }: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [userProfile, setUserProfile]       = useState("");
  const [tone, setTone]                     = useState<Tone>("formal");
  const [coverLetter, setCoverLetter]       = useState("");
  const [isGenerating, setIsGenerating]     = useState(false);
  const [error, setError]                   = useState("");
  const [copied, setCopied]                 = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  const jobWarning     = validationMessage(jobDescription, "la oferta");
  const profileWarning = validationMessage(userProfile, "tu perfil");
  const canGenerate    =
    jobDescription.trim().length >= MIN_LENGTH &&
    userProfile.trim().length >= MIN_LENGTH &&
    !isGenerating;

  const loadExample = (index: number) => {
    const ex = EXAMPLES[index];
    setJobDescription(ex.jobDescription);
    setUserProfile(ex.userProfile);
    setError("");
  };

  const generateCoverLetter = async () => {
    setError("");
    setCoverLetter("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, userProfile, tone }),
      });

      if (response.status === 429) {
        setError("Alcanzaste el límite de 5 cartas por minuto. Espera un momento.");
        return;
      }
      if (response.status === 422) {
        setError(await response.text());
        return;
      }
      if (!response.ok) throw new Error();

      const reader  = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error();

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        setCoverLetter(fullText);
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }

      onNewEntry({
        tone,
        jobSnippet:  jobDescription.slice(0, 60) + "…",
        coverLetter: fullText,
      });
    } catch {
      setError("Error inesperado. Verifica tu API key e intenta nuevamente.");
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
    <div>
      {/* Intro + ejemplos */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">
            Genera tu carta{" "}
            <span className="text-emerald-400">en segundos</span>
          </h2>
          <p className="text-zinc-400 text-sm">
            Pega la oferta y tu perfil, elige el tono y listo.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-zinc-500">Ejemplos:</span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => loadExample(i)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-emerald-500/50 hover:text-emerald-400 text-zinc-400 transition-all"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de tono */}
      <div className="mb-5">
        <label className="text-sm font-medium text-zinc-300 block mb-2">
          🎨 Tono de la carta
        </label>
        <div className="flex gap-3 flex-wrap">
          {TONES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`px-4 py-2.5 rounded-xl border text-sm transition-all flex flex-col items-start gap-0.5 ${
                tone === t.value
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <span className="font-medium">{t.label}</span>
              <span className="text-xs opacity-70">{t.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-zinc-300">📋 Oferta de trabajo</label>
            {jobWarning && <span className="text-xs text-amber-400">{jobWarning}</span>}
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Pega la descripción del puesto, requisitos y nombre de la empresa..."
            className="w-full h-52 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-zinc-300">👤 Tu perfil profesional</label>
            {profileWarning && <span className="text-xs text-amber-400">{profileWarning}</span>}
          </div>
          <textarea
            value={userProfile}
            onChange={(e) => setUserProfile(e.target.value)}
            placeholder="Describe tu experiencia, logros y habilidades clave..."
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

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={generateCoverLetter}
          disabled={!canGenerate}
          className="flex-1 md:flex-none md:px-8 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:cursor-not-allowed text-black disabled:text-zinc-500 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </>
          ) : "✨ Generar carta"}
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
      <div ref={outputRef}>
        <StreamingOutput
          coverLetter={coverLetter}
          isGenerating={isGenerating}
          onCopy={copyToClipboard}
          copied={copied}
        />
      </div>
    </div>
  );
}