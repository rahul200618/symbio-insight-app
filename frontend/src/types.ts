export type ViewType = "upload" | "recent" | "metadata" | "report";

export interface SequenceMetadata {
  id: string;
  name: string; // FASTA header
  sequence: string; // nucleotide sequence
  length: number; // number of bases
  gcContent: number; // GC percentage
  nucleotideCounts: { A: number; T: number; G: number; C: number };
  orfs: Array<{ start: number; end: number; length: number; sequence: string }>;
  createdAt: string; // ISO timestamp
  description?: string;
}
