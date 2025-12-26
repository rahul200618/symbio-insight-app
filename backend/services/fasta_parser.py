#!/usr/bin/env python3
"""
BioPython-based FASTA Parser
Reads and analyzes FASTA files using BioPython's SeqIO module
"""

import sys
import json
from Bio import SeqIO
from Bio.SeqUtils import gc_fraction
from Bio.Seq import Seq
from collections import Counter
import re

def parse_fasta_file(file_path):
    """
    Parse FASTA file and extract comprehensive metadata using BioPython
    
    Args:
        file_path: Path to the FASTA file
        
    Returns:
        List of dictionaries containing sequence metadata
    """
    sequences = []
    
    try:
        for record in SeqIO.parse(file_path, "fasta"):
            metadata = extract_sequence_metadata(record)
            sequences.append(metadata)
            
        return sequences
    except Exception as e:
        return {"error": str(e)}

def extract_sequence_metadata(record):
    """
    Extract comprehensive metadata from a BioPython SeqRecord
    
    Args:
        record: BioPython SeqRecord object
        
    Returns:
        Dictionary containing all metadata
    """
    sequence = str(record.seq).upper()
    seq_obj = Seq(sequence)
    
    # Basic information
    metadata = {
        "id": record.id,
        "description": record.description,
        "sequenceName": record.name or record.id,
        "sequenceLength": len(sequence),
        "rawSequence": sequence
    }
    
    # Nucleotide composition
    metadata["nucleotideCounts"] = count_nucleotides(sequence)
    
    # GC content
    try:
        metadata["gcPercentage"] = round(gc_fraction(seq_obj) * 100, 2)
    except:
        metadata["gcPercentage"] = 0
    
    # Open Reading Frames
    metadata["orfs"] = detect_orfs(seq_obj)
    
    # Codon analysis
    codon_data = analyze_codons(sequence)
    metadata["codonFrequency"] = codon_data["codonFrequency"]
    metadata["codonStats"] = codon_data["codonStats"]
    
    # Molecular weight (if DNA/RNA)
    try:
        metadata["molecularWeight"] = round(seq_obj.molecular_weight(), 2)
    except:
        metadata["molecularWeight"] = None
    
    # Additional BioPython features
    metadata["sequenceType"] = detect_sequence_type(sequence)
    
    return metadata

def count_nucleotides(sequence):
    """Count each nucleotide in the sequence"""
    counter = Counter(sequence)
    return {
        "A": counter.get('A', 0),
        "T": counter.get('T', 0),
        "G": counter.get('G', 0),
        "C": counter.get('C', 0),
        "N": counter.get('N', 0),
        "other": sum(v for k, v in counter.items() if k not in 'ATGCN')
    }

def detect_sequence_type(sequence):
    """Determine if sequence is DNA, RNA, or protein"""
    if 'U' in sequence and 'T' not in sequence:
        return "RNA"
    elif re.match(r'^[ATGCN]+$', sequence):
        return "DNA"
    else:
        return "Protein or Mixed"

def detect_orfs(seq_obj):
    """
    Detect Open Reading Frames using BioPython
    
    Args:
        seq_obj: BioPython Seq object
        
    Returns:
        List of ORF dictionaries
    """
    orfs = []
    sequence = str(seq_obj)
    stop_codons = ['TAA', 'TAG', 'TGA']
    
    # Search in all three reading frames
    for frame in range(3):
        for match in re.finditer(r'ATG', sequence[frame:]):
            start = match.start() + frame
            
            # Look for stop codon
            for i in range(start + 3, len(sequence) - 2, 3):
                codon = sequence[i:i+3]
                
                if codon in stop_codons:
                    orf_length = i + 3 - start
                    if orf_length >= 30:  # Minimum ORF length (10 codons)
                        orfs.append({
                            "start": start,
                            "end": i + 3,
                            "length": orf_length,
                            "frame": frame,
                            "sequence": sequence[start:i+3]
                        })
                    break
    
    return orfs

def analyze_codons(sequence):
    """
    Analyze codon frequency and statistics
    
    Args:
        sequence: DNA sequence string
        
    Returns:
        Dictionary with codon frequency and stats
    """
    # Codon table
    from Bio.Data import CodonTable
    standard_table = CodonTable.unambiguous_dna_by_name["Standard"]
    
    codon_counts = Counter()
    total_codons = 0
    
    # Count codons in reading frame 0
    for i in range(0, len(sequence) - 2, 3):
        codon = sequence[i:i+3]
        if len(codon) == 3 and re.match(r'^[ATGC]{3}$', codon):
            codon_counts[codon] += 1
            total_codons += 1
    
    # Build frequency dictionary
    codon_frequency = {}
    start_codons = 0
    stop_codons = 0
    
    for codon, count in codon_counts.items():
        # Get amino acid for this codon
        try:
            if codon in standard_table.stop_codons:
                amino_acid = "Stop"
                symbol = "*"
                aa_type = "stop"
                stop_codons += count
            else:
                amino_acid = standard_table.forward_table.get(codon, "Unknown")
                symbol = amino_acid
                aa_type = get_amino_acid_type(amino_acid)
                
            if codon == "ATG":
                start_codons += count
                
            codon_frequency[codon] = {
                "count": count,
                "percentage": round((count / total_codons * 100), 2) if total_codons > 0 else 0,
                "aminoAcid": amino_acid,
                "symbol": symbol,
                "type": aa_type
            }
        except:
            codon_frequency[codon] = {
                "count": count,
                "percentage": round((count / total_codons * 100), 2) if total_codons > 0 else 0,
                "aminoAcid": "Unknown",
                "symbol": "?",
                "type": "unknown"
            }
    
    return {
        "codonFrequency": codon_frequency,
        "codonStats": {
            "totalCodons": total_codons,
            "uniqueCodons": len(codon_counts),
            "startCodons": start_codons,
            "stopCodons": stop_codons
        }
    }

def get_amino_acid_type(amino_acid):
    """Classify amino acid by chemical properties"""
    aa_types = {
        "nonpolar": ["A", "V", "L", "I", "M", "F", "W", "P", "G"],
        "polar": ["S", "T", "C", "Y", "N", "Q"],
        "positive": ["K", "R", "H"],
        "negative": ["D", "E"]
    }
    
    for aa_type, aa_list in aa_types.items():
        if amino_acid in aa_list:
            return aa_type
    return "unknown"

def main():
    """Main function to handle command line execution"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = parse_fasta_file(file_path)
    
    # Output as JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
