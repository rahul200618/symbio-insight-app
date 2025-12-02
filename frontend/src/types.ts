export type ViewType = "upload" | "recent" | "metadata" | "report";

export interface SequenceMetadata {
  id: string;
  name: string;
  description?: string;
  length: number;
  gcContent: number;
  sequence?: string;
  createdAt?: string;
  sequenceName?: string;
  sequenceLength?: number;
  gcPercentage?: number;
  nucleotideCounts?: {
    A: number;
    T: number;
    G: number;
    C: number;
  };
  orfs?: Array<{
    start: number;
    end: number;
    length: number;
    sequence: string;
  }>;
  rawSequence?: string;
  timestamp?: string;
}
