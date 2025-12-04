// FASTA File Parser and Metadata Extractor

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
function extractMetadata(header, sequence) {
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
function calculateGCPercentage(counts, totalLength) {
    const gcCount = counts.G + counts.C;
    return totalLength > 0 ? Number(((gcCount / totalLength) * 100).toFixed(2)) : 0;
}

/**
 * Detect Open Reading Frames (ORFs)
 * Simple check: starts with ATG and ends with TAA/TGA/TAG
 */
function detectORFs(sequence) {
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
function generateUniqueId() {
    return `seq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate aggregate statistics from multiple sequences
 */
export function calculateAggregateStats(sequences) {
    if (sequences.length === 0) {
        return null;
    }

    const totalSequences = sequences.length;

    // Handle both frontend (sequenceLength) and backend (length) field names
    const getLength = (seq) => seq.sequenceLength || seq.length || 0;
    const getGC = (seq) => seq.gcPercentage || seq.gcPercent || seq.gcContent || 0;
    const getORFCount = (seq) => (seq.orfs ? seq.orfs.length : (seq.orfCount || 0));
    const getNucleotides = (seq) => seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 };

    const totalLength = sequences.reduce((sum, seq) => sum + getLength(seq), 0);
    const avgLength = Math.round(totalLength / totalSequences);

    const avgGC = sequences.reduce((sum, seq) => sum + getGC(seq), 0) / totalSequences;

    const longestSeq = sequences.reduce((max, seq) =>
        getLength(seq) > getLength(max) ? seq : max
    );

    const shortestSeq = sequences.reduce((min, seq) =>
        getLength(seq) < getLength(min) ? seq : min
    );

    const totalORFs = sequences.reduce((sum, seq) => sum + getORFCount(seq), 0);

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
        avgGC: Number(avgGC.toFixed(2)),
        longestSequence: getLength(longestSeq),
        shortestSequence: getLength(shortestSeq),
        totalORFs,
        nucleotideDistribution: {
            A: total > 0 ? Number(((totalNucleotides.A / total) * 100).toFixed(2)) : 0,
            T: total > 0 ? Number(((totalNucleotides.T / total) * 100).toFixed(2)) : 0,
            G: total > 0 ? Number(((totalNucleotides.G / total) * 100).toFixed(2)) : 0,
            C: total > 0 ? Number(((totalNucleotides.C / total) * 100).toFixed(2)) : 0,
        },
    };
}
