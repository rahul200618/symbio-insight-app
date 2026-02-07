// FASTA File Parser and Metadata Extractor

/**
 * Codon to Amino Acid mapping table
 */
const CODON_TABLE = {
    // Phenylalanine (F)
    'TTT': { aminoAcid: 'Phe', symbol: 'F', type: 'nonpolar' },
    'TTC': { aminoAcid: 'Phe', symbol: 'F', type: 'nonpolar' },
    // Leucine (L)
    'TTA': { aminoAcid: 'Leu', symbol: 'L', type: 'nonpolar' },
    'TTG': { aminoAcid: 'Leu', symbol: 'L', type: 'nonpolar' },
    'CTT': { aminoAcid: 'Leu', symbol: 'L', type: 'nonpolar' },
    'CTC': { aminoAcid: 'Leu', symbol: 'L', type: 'nonpolar' },
    'CTA': { aminoAcid: 'Leu', symbol: 'L', type: 'nonpolar' },
    'CTG': { aminoAcid: 'Leu', symbol: 'L', type: 'nonpolar' },
    // Isoleucine (I)
    'ATT': { aminoAcid: 'Ile', symbol: 'I', type: 'nonpolar' },
    'ATC': { aminoAcid: 'Ile', symbol: 'I', type: 'nonpolar' },
    'ATA': { aminoAcid: 'Ile', symbol: 'I', type: 'nonpolar' },
    // Methionine (M) - Start codon
    'ATG': { aminoAcid: 'Met', symbol: 'M', type: 'nonpolar', isStart: true },
    // Valine (V)
    'GTT': { aminoAcid: 'Val', symbol: 'V', type: 'nonpolar' },
    'GTC': { aminoAcid: 'Val', symbol: 'V', type: 'nonpolar' },
    'GTA': { aminoAcid: 'Val', symbol: 'V', type: 'nonpolar' },
    'GTG': { aminoAcid: 'Val', symbol: 'V', type: 'nonpolar' },
    // Serine (S)
    'TCT': { aminoAcid: 'Ser', symbol: 'S', type: 'polar' },
    'TCC': { aminoAcid: 'Ser', symbol: 'S', type: 'polar' },
    'TCA': { aminoAcid: 'Ser', symbol: 'S', type: 'polar' },
    'TCG': { aminoAcid: 'Ser', symbol: 'S', type: 'polar' },
    'AGT': { aminoAcid: 'Ser', symbol: 'S', type: 'polar' },
    'AGC': { aminoAcid: 'Ser', symbol: 'S', type: 'polar' },
    // Proline (P)
    'CCT': { aminoAcid: 'Pro', symbol: 'P', type: 'nonpolar' },
    'CCC': { aminoAcid: 'Pro', symbol: 'P', type: 'nonpolar' },
    'CCA': { aminoAcid: 'Pro', symbol: 'P', type: 'nonpolar' },
    'CCG': { aminoAcid: 'Pro', symbol: 'P', type: 'nonpolar' },
    // Threonine (T)
    'ACT': { aminoAcid: 'Thr', symbol: 'T', type: 'polar' },
    'ACC': { aminoAcid: 'Thr', symbol: 'T', type: 'polar' },
    'ACA': { aminoAcid: 'Thr', symbol: 'T', type: 'polar' },
    'ACG': { aminoAcid: 'Thr', symbol: 'T', type: 'polar' },
    // Alanine (A)
    'GCT': { aminoAcid: 'Ala', symbol: 'A', type: 'nonpolar' },
    'GCC': { aminoAcid: 'Ala', symbol: 'A', type: 'nonpolar' },
    'GCA': { aminoAcid: 'Ala', symbol: 'A', type: 'nonpolar' },
    'GCG': { aminoAcid: 'Ala', symbol: 'A', type: 'nonpolar' },
    // Tyrosine (Y)
    'TAT': { aminoAcid: 'Tyr', symbol: 'Y', type: 'polar' },
    'TAC': { aminoAcid: 'Tyr', symbol: 'Y', type: 'polar' },
    // Stop codons
    'TAA': { aminoAcid: 'Stop', symbol: '*', type: 'stop', isStop: true },
    'TAG': { aminoAcid: 'Stop', symbol: '*', type: 'stop', isStop: true },
    'TGA': { aminoAcid: 'Stop', symbol: '*', type: 'stop', isStop: true },
    // Histidine (H)
    'CAT': { aminoAcid: 'His', symbol: 'H', type: 'positive' },
    'CAC': { aminoAcid: 'His', symbol: 'H', type: 'positive' },
    // Glutamine (Q)
    'CAA': { aminoAcid: 'Gln', symbol: 'Q', type: 'polar' },
    'CAG': { aminoAcid: 'Gln', symbol: 'Q', type: 'polar' },
    // Asparagine (N)
    'AAT': { aminoAcid: 'Asn', symbol: 'N', type: 'polar' },
    'AAC': { aminoAcid: 'Asn', symbol: 'N', type: 'polar' },
    // Lysine (K)
    'AAA': { aminoAcid: 'Lys', symbol: 'K', type: 'positive' },
    'AAG': { aminoAcid: 'Lys', symbol: 'K', type: 'positive' },
    // Aspartic Acid (D)
    'GAT': { aminoAcid: 'Asp', symbol: 'D', type: 'negative' },
    'GAC': { aminoAcid: 'Asp', symbol: 'D', type: 'negative' },
    // Glutamic Acid (E)
    'GAA': { aminoAcid: 'Glu', symbol: 'E', type: 'negative' },
    'GAG': { aminoAcid: 'Glu', symbol: 'E', type: 'negative' },
    // Cysteine (C)
    'TGT': { aminoAcid: 'Cys', symbol: 'C', type: 'polar' },
    'TGC': { aminoAcid: 'Cys', symbol: 'C', type: 'polar' },
    // Tryptophan (W)
    'TGG': { aminoAcid: 'Trp', symbol: 'W', type: 'nonpolar' },
    // Arginine (R)
    'CGT': { aminoAcid: 'Arg', symbol: 'R', type: 'positive' },
    'CGC': { aminoAcid: 'Arg', symbol: 'R', type: 'positive' },
    'CGA': { aminoAcid: 'Arg', symbol: 'R', type: 'positive' },
    'CGG': { aminoAcid: 'Arg', symbol: 'R', type: 'positive' },
    'AGA': { aminoAcid: 'Arg', symbol: 'R', type: 'positive' },
    'AGG': { aminoAcid: 'Arg', symbol: 'R', type: 'positive' },
    // Glycine (G)
    'GGT': { aminoAcid: 'Gly', symbol: 'G', type: 'nonpolar' },
    'GGC': { aminoAcid: 'Gly', symbol: 'G', type: 'nonpolar' },
    'GGA': { aminoAcid: 'Gly', symbol: 'G', type: 'nonpolar' },
    'GGG': { aminoAcid: 'Gly', symbol: 'G', type: 'nonpolar' },
};

/**
 * Calculate codon frequency for a sequence
 */
export function calculateCodonFrequency(sequence) {
    const codonCounts = {};
    const totalCodons = Math.floor(sequence.length / 3);
    
    // Count codons in reading frame 0
    for (let i = 0; i < sequence.length - 2; i += 3) {
        const codon = sequence.substring(i, i + 3);
        if (codon.length === 3 && /^[ATGC]+$/.test(codon)) {
            codonCounts[codon] = (codonCounts[codon] || 0) + 1;
        }
    }
    
    // Build detailed frequency object
    const codonFrequency = {};
    let startCodons = 0;
    let stopCodons = 0;
    
    for (const [codon, count] of Object.entries(codonCounts)) {
        const codonInfo = CODON_TABLE[codon] || { aminoAcid: 'Unknown', symbol: '?', type: 'unknown' };
        codonFrequency[codon] = {
            count,
            percentage: totalCodons > 0 ? Number(((count / totalCodons) * 100).toFixed(2)) : 0,
            aminoAcid: codonInfo.aminoAcid,
            symbol: codonInfo.symbol,
            type: codonInfo.type
        };
        
        if (codonInfo.isStart) startCodons += count;
        if (codonInfo.isStop) stopCodons += count;
    }
    
    return {
        codonFrequency,
        codonStats: {
            totalCodons,
            uniqueCodons: Object.keys(codonCounts).length,
            startCodons,
            stopCodons
        }
    };
}

/**
 * Get amino acid frequency from codon frequency
 */
export function getAminoAcidFrequency(codonFrequency) {
    const aminoAcidCounts = {};
    
    for (const [codon, data] of Object.entries(codonFrequency)) {
        const aa = data.aminoAcid;
        if (!aminoAcidCounts[aa]) {
            aminoAcidCounts[aa] = { count: 0, symbol: data.symbol, type: data.type };
        }
        aminoAcidCounts[aa].count += data.count;
    }
    
    return aminoAcidCounts;
}

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
/**
 * Extract all metadata from a single sequence
 */
export function extractMetadata(header, sequence) {
    const nucleotideCounts = countNucleotides(sequence);
    const gcPercentage = calculateGCPercentage(nucleotideCounts, sequence.length);
    const orfs = detectORFs(sequence);
    const { codonFrequency, codonStats } = calculateCodonFrequency(sequence);

    return {
        id: generateUniqueId(),
        sequenceName: header,
        sequenceLength: sequence.length,
        gcPercentage,
        nucleotideCounts,
        orfs,
        codonFrequency,
        codonStats,
        rawSequence: sequence,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Count each nucleotide (A, T, G, C)
 */
export function countNucleotides(sequence) {
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
export function calculateGCPercentage(counts, totalLength) {
    const gcCount = counts.G + counts.C;
    return totalLength > 0 ? Number(((gcCount / totalLength) * 100).toFixed(2)) : 0;
}

/**
 * Detect Open Reading Frames (ORFs)
 * Simple check: starts with ATG and ends with TAA/TGA/TAG
 */
export function detectORFs(sequence) {
    const orfs = [];
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
export function generateUniqueId() {
    return `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate aggregate statistics from multiple sequences
 */
export function calculateAggregateStats(sequences) {
    if (!sequences || sequences.length === 0) {
        return null;
    }

    // Helper to get sequence length safely (handles both sequenceLength and length)
    const getSeqLength = (seq) => seq?.sequenceLength ?? seq?.length ?? 0;
    // Helper to get GC percentage safely (handles gcPercentage, gcContent, and gcPercent from backend)
    const getGC = (seq) => seq?.gcPercentage ?? seq?.gcContent ?? seq?.gcPercent ?? 0;
    // Helper to get ORFs safely
    const getOrfs = (seq) => seq?.orfs ?? [];
    // Helper to get nucleotide counts safely
    const getNucleotides = (seq) => seq?.nucleotideCounts ?? { A: 0, T: 0, G: 0, C: 0 };

    const totalSequences = sequences.length;
    const totalLength = sequences.reduce((sum, seq) => sum + getSeqLength(seq), 0);
    const avgLength = totalSequences > 0 ? Math.round(totalLength / totalSequences) : 0;

    const avgGC = totalSequences > 0 
        ? sequences.reduce((sum, seq) => sum + getGC(seq), 0) / totalSequences 
        : 0;

    const longestSeq = sequences.reduce((max, seq) =>
        getSeqLength(seq) > getSeqLength(max) ? seq : max
    , sequences[0]);

    const shortestSeq = sequences.reduce((min, seq) =>
        getSeqLength(seq) < getSeqLength(min) ? seq : min
    , sequences[0]);

    const totalORFs = sequences.reduce((sum, seq) => sum + getOrfs(seq).length, 0);

    // Aggregate nucleotide counts
    const totalNucleotides = sequences.reduce((acc, seq) => {
        const counts = getNucleotides(seq);
        acc.A += counts.A || 0;
        acc.T += counts.T || 0;
        acc.G += counts.G || 0;
        acc.C += counts.C || 0;
        return acc;
    }, { A: 0, T: 0, G: 0, C: 0 });

    const total = totalNucleotides.A + totalNucleotides.T + totalNucleotides.G + totalNucleotides.C;

    return {
        totalSequences,
        totalLength,
        avgLength,
        avgGC: Number((avgGC || 0).toFixed(2)),
        longestSequence: getSeqLength(longestSeq),
        shortestSequence: getSeqLength(shortestSeq),
        totalORFs,
        nucleotideDistribution: total > 0 ? {
            A: Number(((totalNucleotides.A / total) * 100).toFixed(2)),
            T: Number(((totalNucleotides.T / total) * 100).toFixed(2)),
            G: Number(((totalNucleotides.G / total) * 100).toFixed(2)),
            C: Number(((totalNucleotides.C / total) * 100).toFixed(2)),
        } : { A: 0, T: 0, G: 0, C: 0 },
        nucleotideCounts: totalNucleotides,
    };
}
