import sys
from Bio import SeqIO
import json

# Usage: python fasta_parser.py <input_fasta_file>

def parse_fasta(file_path):
    records = []
    for record in SeqIO.parse(file_path, "fasta"):
        records.append({
            "id": record.id,
            "description": record.description,
            "sequence": str(record.seq)
        })
    return records

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No FASTA file provided."}))
        sys.exit(1)
    fasta_file = sys.argv[1]
    try:
        result = parse_fasta(fasta_file)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
