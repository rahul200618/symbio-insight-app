// FASTA File Parser and Metadata Extractor

export type { SequenceMetadata } from '../types';

/**
 * Parse FASTA file and extract metadata
 */
export function parseFastaFile(fileContent) {
  const sequences = [];
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
function extractMetadata(header, seq): SequenceMetadata {
  const nucleotideCounts = countNucleotides(seq);
  const gcContent = calculateGCPercentage(nucleotideCounts, seq.length);
  const orfs = detectORFs(seq);
  return {
    id: generateUniqueId(),
    name: header,
    sequence: seq,
    length: seq.length,
    gcContent,
    nucleotideCounts,
    orfs,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Count each nucleotide (A, T, G, C)
 */
function countNucleotides(sequence) {
  const counts = { A: 0, T: 0, G: 0, C: 0 };
  
  for (let i = 0; i < sequence.length; i++) {
    const nucleotide = sequence[i];
    if (nucleotide in counts) {
      counts[nucleotide]++;
    }
  }
  
  return counts;
}

/**
 * Calculate GC percentage
 */
function calculateGCPercentage(
  counts,
  totalLength
) {
  const gcCount = counts.G + counts.C;
  return totalLength > 0 ? Number(((gcCount / totalLength) * 100).toFixed(2)) : 0;
}

/**
 * Detect Open Reading Frames (ORFs)
 * Simple check: starts with ATG and ends with TAA/TGA/TAG
 */
function detectORFs(sequence): Array<{
  start;
  end;
  length;
  sequence;
}> {
  const orfs: Array<{ start; end; length; sequence }> = [];
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
function generateUniqueId() {
  return `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate aggregate statistics from multiple sequences
 */
export function calculateAggregateStats(sequences) {
  if (!sequences.length) return null;
  const totalSequences = sequences.length;
  const totalLength = sequences.reduce((sum, s) => sum + s.length, 0);
  const avgLength = Math.round(totalLength / totalSequences);
  const avgGC = sequences.reduce((sum, s) => sum + s.gcContent, 0) / totalSequences;
  const longestSeq = sequences.reduce((max, s) => (s.length > max.length ? s : max));
  const shortestSeq = sequences.reduce((min, s) => (s.length < min.length ? s : min));
  const totalORFs = sequences.reduce((sum, s) => sum + s.orfs.length, 0);
  const totalNucleotides = sequences.reduce(
    (acc, s) => ({
      A: acc.A + s.nucleotideCounts.A,
      T: acc.T + s.nucleotideCounts.T,
      G: acc.G + s.nucleotideCounts.G,
      C: acc.C + s.nucleotideCounts.C,
    }),
    { A: 0, T: 0, G: 0, C: 0 }
  );
  const total = totalNucleotides.A + totalNucleotides.T + totalNucleotides.G + totalNucleotides.C;
  return {
    totalSequences,
    totalLength,
    avgLength,
    avgGC(avgGC.toFixed(2)),
    longestSequence: longestSeq.length,
    shortestSequence: shortestSeq.length,
    totalORFs,
    nucleotideDistribution,
  };
}

