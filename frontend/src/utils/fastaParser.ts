// FASTA File Parser and Metadata Extractor

export interface SequenceMetadata {
  id: string;
  sequenceName: string;
  sequenceLength: number;
  gcPercentage: number;
  nucleotideCounts: {
    A: number;
    T: number;
    G: number;
    C: number;
  };
  orfs: Array<{
    start: number;
    end: number;
    length: number;
    sequence: string;
  }>;
  rawSequence: string;
  timestamp: string;
}

/**
 * Parse FASTA file and extract metadata
 */
export function parseFastaFile(fileContent: string): SequenceMetadata[] {
  const sequences: SequenceMetadata[] = [];
  const lines = fileContent.split('\n');
  
  let currentHeader = '';
  let currentSequence = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('>')) {
      // Save previous sequence if exists
      if (currentHeader && currentSequence) {
        sequences.push(extractMetadata(currentHeader, currentSequence));
      }
      
      // Start new sequence
      currentHeader = line.substring(1).trim();
      currentSequence = '';
    } else if (line.length > 0) {
      // Append to current sequence
      currentSequence += line.toUpperCase();
    }
  }
  
  // Don't forget the last sequence
  if (currentHeader && currentSequence) {
    sequences.push(extractMetadata(currentHeader, currentSequence));
  }
  
  return sequences;
}

/**
 * Extract all metadata from a single sequence
 */
function extractMetadata(header: string, sequence: string): SequenceMetadata {
  const nucleotideCounts = countNucleotides(sequence);
  const gcPercentage = calculateGCPercentage(nucleotideCounts, sequence.length);
  const orfs = detectORFs(sequence);
  
  return {
    id: generateUniqueId(),
    sequenceName: header,
    sequenceLength: sequence.length,
    gcPercentage,
    nucleotideCounts,
    orfs,
    rawSequence: sequence,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Count each nucleotide (A, T, G, C)
 */
function countNucleotides(sequence: string): { A: number; T: number; G: number; C: number } {
  const counts = { A: 0, T: 0, G: 0, C: 0 };
  
  for (let i = 0; i < sequence.length; i++) {
    const nucleotide = sequence[i];
    if (nucleotide in counts) {
      counts[nucleotide as keyof typeof counts]++;
    }
  }
  
  return counts;
}

/**
 * Calculate GC percentage
 */
function calculateGCPercentage(
  counts: { A: number; T: number; G: number; C: number },
  totalLength: number
): number {
  const gcCount = counts.G + counts.C;
  return totalLength > 0 ? Number(((gcCount / totalLength) * 100).toFixed(2)) : 0;
}

/**
 * Detect Open Reading Frames (ORFs)
 * Simple check: starts with ATG and ends with TAA/TGA/TAG
 */
function detectORFs(sequence: string): Array<{
  start: number;
  end: number;
  length: number;
  sequence: string;
}> {
  const orfs: Array<{ start: number; end: number; length: number; sequence: string }> = [];
  const stopCodons = ['TAA', 'TGA', 'TAG'];
  
  // Search for ORFs in all three reading frames
  for (let frame = 0; frame < 3; frame++) {
    for (let i = frame; i < sequence.length - 5; i += 3) {
      const codon = sequence.substring(i, i + 3);
      
      // Found start codon (ATG)
      if (codon === 'ATG') {
        // Look for stop codon
        for (let j = i + 3; j < sequence.length - 2; j += 3) {
          const stopCodon = sequence.substring(j, j + 3);
          
          if (stopCodons.includes(stopCodon)) {
            const orfSequence = sequence.substring(i, j + 3);
            orfs.push({
              start: i,
              end: j + 3,
              length: j + 3 - i,
              sequence: orfSequence,
            });
            break;
          }
        }
      }
    }
  }
  
  return orfs;
}

/**
 * Generate unique ID
 */
function generateUniqueId(): string {
  return `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate aggregate statistics from multiple sequences
 */
export function calculateAggregateStats(sequences: SequenceMetadata[]) {
  if (sequences.length === 0) {
    return null;
  }
  
  const totalSequences = sequences.length;
  const totalLength = sequences.reduce((sum, seq) => sum + seq.sequenceLength, 0);
  const avgLength = Math.round(totalLength / totalSequences);
  
  const avgGC = sequences.reduce((sum, seq) => sum + seq.gcPercentage, 0) / totalSequences;
  
  const longestSeq = sequences.reduce((max, seq) => 
    seq.sequenceLength > max.sequenceLength ? seq : max
  );
  
  const shortestSeq = sequences.reduce((min, seq) => 
    seq.sequenceLength < min.sequenceLength ? seq : min
  );
  
  const totalORFs = sequences.reduce((sum, seq) => sum + seq.orfs.length, 0);
  
  // Aggregate nucleotide counts
  const totalNucleotides = sequences.reduce((acc, seq) => {
    acc.A += seq.nucleotideCounts.A;
    acc.T += seq.nucleotideCounts.T;
    acc.G += seq.nucleotideCounts.G;
    acc.C += seq.nucleotideCounts.C;
    return acc;
  }, { A: 0, T: 0, G: 0, C: 0 });
  
  const total = totalNucleotides.A + totalNucleotides.T + totalNucleotides.G + totalNucleotides.C;
  
  return {
    totalSequences,
    totalLength,
    avgLength,
    avgGC: Number(avgGC.toFixed(2)),
    longestSequence: longestSeq.sequenceLength,
    shortestSequence: shortestSeq.sequenceLength,
    totalORFs,
    nucleotideDistribution: {
      A: Number(((totalNucleotides.A / total) * 100).toFixed(2)),
      T: Number(((totalNucleotides.T / total) * 100).toFixed(2)),
      G: Number(((totalNucleotides.G / total) * 100).toFixed(2)),
      C: Number(((totalNucleotides.C / total) * 100).toFixed(2)),
    },
  };
}
