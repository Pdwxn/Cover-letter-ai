export type Tone = "formal" | "creativo" | "conciso";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  tone: Tone;
  jobSnippet: string;
  coverLetter: string;
}