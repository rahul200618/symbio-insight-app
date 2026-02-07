/**
 * Protein Translation Utility
 * 
 * Translates DNA sequences to amino acid sequences using the standard genetic code.
 * Supports all 6 reading frames (3 forward, 3 reverse complement).
 */

// Standard genetic code (DNA -> Amino Acid)
const CODON_TABLE = {
    // Phenylalanine (F)
    'TTT': { aa: 'F', name: 'Phenylalanine', abbrev: 'Phe' },
    'TTC': { aa: 'F', name: 'Phenylalanine', abbrev: 'Phe' },
    
    // Leucine (L)
    'TTA': { aa: 'L', name: 'Leucine', abbrev: 'Leu' },
    'TTG': { aa: 'L', name: 'Leucine', abbrev: 'Leu' },
    'CTT': { aa: 'L', name: 'Leucine', abbrev: 'Leu' },
    'CTC': { aa: 'L', name: 'Leucine', abbrev: 'Leu' },
    'CTA': { aa: 'L', name: 'Leucine', abbrev: 'Leu' },
    'CTG': { aa: 'L', name: 'Leucine', abbrev: 'Leu' },
    
    // Isoleucine (I)
    'ATT': { aa: 'I', name: 'Isoleucine', abbrev: 'Ile' },
    'ATC': { aa: 'I', name: 'Isoleucine', abbrev: 'Ile' },
    'ATA': { aa: 'I', name: 'Isoleucine', abbrev: 'Ile' },
    
    // Methionine (M) - Start codon
    'ATG': { aa: 'M', name: 'Methionine', abbrev: 'Met', isStart: true },
    
    // Valine (V)
    'GTT': { aa: 'V', name: 'Valine', abbrev: 'Val' },
    'GTC': { aa: 'V', name: 'Valine', abbrev: 'Val' },
    'GTA': { aa: 'V', name: 'Valine', abbrev: 'Val' },
    'GTG': { aa: 'V', name: 'Valine', abbrev: 'Val' },
    
    // Serine (S)
    'TCT': { aa: 'S', name: 'Serine', abbrev: 'Ser' },
    'TCC': { aa: 'S', name: 'Serine', abbrev: 'Ser' },
    'TCA': { aa: 'S', name: 'Serine', abbrev: 'Ser' },
    'TCG': { aa: 'S', name: 'Serine', abbrev: 'Ser' },
    'AGT': { aa: 'S', name: 'Serine', abbrev: 'Ser' },
    'AGC': { aa: 'S', name: 'Serine', abbrev: 'Ser' },
    
    // Proline (P)
    'CCT': { aa: 'P', name: 'Proline', abbrev: 'Pro' },
    'CCC': { aa: 'P', name: 'Proline', abbrev: 'Pro' },
    'CCA': { aa: 'P', name: 'Proline', abbrev: 'Pro' },
    'CCG': { aa: 'P', name: 'Proline', abbrev: 'Pro' },
    
    // Threonine (T)
    'ACT': { aa: 'T', name: 'Threonine', abbrev: 'Thr' },
    'ACC': { aa: 'T', name: 'Threonine', abbrev: 'Thr' },
    'ACA': { aa: 'T', name: 'Threonine', abbrev: 'Thr' },
    'ACG': { aa: 'T', name: 'Threonine', abbrev: 'Thr' },
    
    // Alanine (A)
    'GCT': { aa: 'A', name: 'Alanine', abbrev: 'Ala' },
    'GCC': { aa: 'A', name: 'Alanine', abbrev: 'Ala' },
    'GCA': { aa: 'A', name: 'Alanine', abbrev: 'Ala' },
    'GCG': { aa: 'A', name: 'Alanine', abbrev: 'Ala' },
    
    // Tyrosine (Y)
    'TAT': { aa: 'Y', name: 'Tyrosine', abbrev: 'Tyr' },
    'TAC': { aa: 'Y', name: 'Tyrosine', abbrev: 'Tyr' },
    
    // Stop codons
    'TAA': { aa: '*', name: 'Stop (Ochre)', abbrev: 'Stop', isStop: true },
    'TAG': { aa: '*', name: 'Stop (Amber)', abbrev: 'Stop', isStop: true },
    'TGA': { aa: '*', name: 'Stop (Opal)', abbrev: 'Stop', isStop: true },
    
    // Histidine (H)
    'CAT': { aa: 'H', name: 'Histidine', abbrev: 'His' },
    'CAC': { aa: 'H', name: 'Histidine', abbrev: 'His' },
    
    // Glutamine (Q)
    'CAA': { aa: 'Q', name: 'Glutamine', abbrev: 'Gln' },
    'CAG': { aa: 'Q', name: 'Glutamine', abbrev: 'Gln' },
    
    // Asparagine (N)
    'AAT': { aa: 'N', name: 'Asparagine', abbrev: 'Asn' },
    'AAC': { aa: 'N', name: 'Asparagine', abbrev: 'Asn' },
    
    // Lysine (K)
    'AAA': { aa: 'K', name: 'Lysine', abbrev: 'Lys' },
    'AAG': { aa: 'K', name: 'Lysine', abbrev: 'Lys' },
    
    // Aspartic Acid (D)
    'GAT': { aa: 'D', name: 'Aspartic acid', abbrev: 'Asp' },
    'GAC': { aa: 'D', name: 'Aspartic acid', abbrev: 'Asp' },
    
    // Glutamic Acid (E)
    'GAA': { aa: 'E', name: 'Glutamic acid', abbrev: 'Glu' },
    'GAG': { aa: 'E', name: 'Glutamic acid', abbrev: 'Glu' },
    
    // Cysteine (C)
    'TGT': { aa: 'C', name: 'Cysteine', abbrev: 'Cys' },
    'TGC': { aa: 'C', name: 'Cysteine', abbrev: 'Cys' },
    
    // Tryptophan (W)
    'TGG': { aa: 'W', name: 'Tryptophan', abbrev: 'Trp' },
    
    // Arginine (R)
    'CGT': { aa: 'R', name: 'Arginine', abbrev: 'Arg' },
    'CGC': { aa: 'R', name: 'Arginine', abbrev: 'Arg' },
    'CGA': { aa: 'R', name: 'Arginine', abbrev: 'Arg' },
    'CGG': { aa: 'R', name: 'Arginine', abbrev: 'Arg' },
    'AGA': { aa: 'R', name: 'Arginine', abbrev: 'Arg' },
    'AGG': { aa: 'R', name: 'Arginine', abbrev: 'Arg' },
    
    // Glycine (G)
    'GGT': { aa: 'G', name: 'Glycine', abbrev: 'Gly' },
    'GGC': { aa: 'G', name: 'Glycine', abbrev: 'Gly' },
    'GGA': { aa: 'G', name: 'Glycine', abbrev: 'Gly' },
    'GGG': { aa: 'G', name: 'Glycine', abbrev: 'Gly' }
};

// Amino acid properties
const AMINO_ACID_PROPERTIES = {
    'A': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'R': { hydrophobicity: 'hydrophilic', charge: 'positive', polarity: 'polar' },
    'N': { hydrophobicity: 'hydrophilic', charge: 'neutral', polarity: 'polar' },
    'D': { hydrophobicity: 'hydrophilic', charge: 'negative', polarity: 'polar' },
    'C': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'polar' },
    'Q': { hydrophobicity: 'hydrophilic', charge: 'neutral', polarity: 'polar' },
    'E': { hydrophobicity: 'hydrophilic', charge: 'negative', polarity: 'polar' },
    'G': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'H': { hydrophobicity: 'hydrophilic', charge: 'positive', polarity: 'polar' },
    'I': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'L': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'K': { hydrophobicity: 'hydrophilic', charge: 'positive', polarity: 'polar' },
    'M': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'F': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'P': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'S': { hydrophobicity: 'hydrophilic', charge: 'neutral', polarity: 'polar' },
    'T': { hydrophobicity: 'hydrophilic', charge: 'neutral', polarity: 'polar' },
    'W': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' },
    'Y': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'polar' },
    'V': { hydrophobicity: 'hydrophobic', charge: 'neutral', polarity: 'nonpolar' }
};

/**
 * Get complement of a nucleotide
 */
function getComplement(nucleotide) {
    const complements = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G', 'N': 'N' };
    return complements[nucleotide.toUpperCase()] || 'N';
}

/**
 * Get reverse complement of a DNA sequence
 */
export function reverseComplement(sequence) {
    return sequence
        .split('')
        .reverse()
        .map(nt => getComplement(nt))
        .join('');
}

/**
 * Translate a codon to amino acid
 */
export function translateCodon(codon) {
    const upperCodon = codon.toUpperCase();
    return CODON_TABLE[upperCodon] || { aa: 'X', name: 'Unknown', abbrev: 'Unk' };
}

/**
 * Translate DNA sequence to amino acids in a single reading frame
 * @param {string} sequence - DNA sequence
 * @param {number} frame - Reading frame offset (0, 1, or 2)
 * @returns {object} Translation result
 */
export function translateFrame(sequence, frame = 0) {
    const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
    const aminoAcids = [];
    const codons = [];
    
    for (let i = frame; i < cleanSeq.length - 2; i += 3) {
        const codon = cleanSeq.substring(i, i + 3);
        const translation = translateCodon(codon);
        codons.push(codon);
        aminoAcids.push(translation.aa);
    }
    
    return {
        frame: frame + 1, // 1-indexed for display
        direction: 'forward',
        codons,
        aminoAcids,
        protein: aminoAcids.join(''),
        length: aminoAcids.length
    };
}

/**
 * Translate DNA in all 6 reading frames
 * @param {string} sequence - DNA sequence
 * @returns {Array} Array of 6 translation results
 */
export function translateAllFrames(sequence) {
    const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
    const revComp = reverseComplement(cleanSeq);
    
    const translations = [];
    
    // Forward frames (5' to 3')
    for (let frame = 0; frame < 3; frame++) {
        const result = translateFrame(cleanSeq, frame);
        result.frame = frame + 1;
        result.label = `Frame +${frame + 1}`;
        translations.push(result);
    }
    
    // Reverse frames (3' to 5', reverse complement)
    for (let frame = 0; frame < 3; frame++) {
        const result = translateFrame(revComp, frame);
        result.frame = -(frame + 1);
        result.direction = 'reverse';
        result.label = `Frame -${frame + 1}`;
        translations.push(result);
    }
    
    return translations;
}

/**
 * Find all potential proteins (ORF translations) in a sequence
 * @param {string} sequence - DNA sequence
 * @param {number} minLength - Minimum protein length (default: 20 amino acids)
 * @returns {Array} Array of potential proteins
 */
export function findProteins(sequence, minLength = 20) {
    const translations = translateAllFrames(sequence);
    const proteins = [];
    
    translations.forEach(trans => {
        const proteinSeq = trans.protein;
        let inORF = false;
        let startIdx = 0;
        let currentProtein = '';
        
        for (let i = 0; i < proteinSeq.length; i++) {
            const aa = proteinSeq[i];
            
            if (aa === 'M' && !inORF) {
                // Start codon found
                inORF = true;
                startIdx = i;
                currentProtein = 'M';
            } else if (aa === '*' && inORF) {
                // Stop codon found
                if (currentProtein.length >= minLength) {
                    proteins.push({
                        frame: trans.frame,
                        label: trans.label,
                        start: startIdx * 3,
                        end: (i + 1) * 3,
                        length: currentProtein.length,
                        sequence: currentProtein,
                        molecularWeight: calculateMolecularWeight(currentProtein)
                    });
                }
                inORF = false;
                currentProtein = '';
            } else if (inORF) {
                currentProtein += aa;
            }
        }
        
        // Check for incomplete ORF at end (no stop codon)
        if (inORF && currentProtein.length >= minLength) {
            proteins.push({
                frame: trans.frame,
                label: trans.label,
                start: startIdx * 3,
                end: proteinSeq.length * 3,
                length: currentProtein.length,
                sequence: currentProtein,
                incomplete: true,
                molecularWeight: calculateMolecularWeight(currentProtein)
            });
        }
    });
    
    // Sort by length (longest first)
    proteins.sort((a, b) => b.length - a.length);
    
    return proteins;
}

/**
 * Calculate approximate molecular weight of a protein
 * @param {string} protein - Amino acid sequence
 * @returns {number} Molecular weight in Daltons
 */
export function calculateMolecularWeight(protein) {
    const weights = {
        'A': 89.09, 'R': 174.20, 'N': 132.12, 'D': 133.10, 'C': 121.15,
        'Q': 146.15, 'E': 147.13, 'G': 75.07, 'H': 155.16, 'I': 131.17,
        'L': 131.17, 'K': 146.19, 'M': 149.21, 'F': 165.19, 'P': 115.13,
        'S': 105.09, 'T': 119.12, 'W': 204.23, 'Y': 181.19, 'V': 117.15
    };
    
    let totalWeight = 18.015; // Water molecule
    for (const aa of protein) {
        totalWeight += (weights[aa] || 110) - 18.015; // Subtract water for peptide bond
    }
    
    return Math.round(totalWeight);
}

/**
 * Analyze amino acid composition of a protein
 * @param {string} protein - Amino acid sequence
 * @returns {object} Composition analysis
 */
export function analyzeProtein(protein) {
    const composition = {};
    let hydrophobic = 0;
    let hydrophilic = 0;
    let positive = 0;
    let negative = 0;
    
    for (const aa of protein) {
        if (aa === '*') continue;
        
        composition[aa] = (composition[aa] || 0) + 1;
        
        const props = AMINO_ACID_PROPERTIES[aa];
        if (props) {
            if (props.hydrophobicity === 'hydrophobic') hydrophobic++;
            else hydrophilic++;
            
            if (props.charge === 'positive') positive++;
            else if (props.charge === 'negative') negative++;
        }
    }
    
    const length = protein.replace(/\*/g, '').length;
    
    return {
        length,
        composition,
        molecularWeight: calculateMolecularWeight(protein),
        properties: {
            hydrophobic: { count: hydrophobic, percent: (hydrophobic / length * 100).toFixed(1) },
            hydrophilic: { count: hydrophilic, percent: (hydrophilic / length * 100).toFixed(1) },
            positiveCharge: { count: positive, percent: (positive / length * 100).toFixed(1) },
            negativeCharge: { count: negative, percent: (negative / length * 100).toFixed(1) },
            netCharge: positive - negative
        }
    };
}

/**
 * Format protein sequence for display (with line breaks)
 * @param {string} protein - Amino acid sequence
 * @param {number} lineLength - Characters per line (default: 60)
 * @returns {string} Formatted sequence
 */
export function formatProteinSequence(protein, lineLength = 60) {
    const lines = [];
    for (let i = 0; i < protein.length; i += lineLength) {
        lines.push(protein.substring(i, i + lineLength));
    }
    return lines.join('\n');
}

export default {
    CODON_TABLE,
    AMINO_ACID_PROPERTIES,
    reverseComplement,
    translateCodon,
    translateFrame,
    translateAllFrames,
    findProteins,
    calculateMolecularWeight,
    analyzeProtein,
    formatProteinSequence
};
