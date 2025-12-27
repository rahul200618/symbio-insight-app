const { spawn } = require('child_process');
const path = require('path');

/**
 * Parses a FASTA file using Biopython via a Python child process.
 * @param {string} fastaFilePath - Absolute path to the FASTA file.
 * @returns {Promise<Object[]>} - Resolves to parsed FASTA records.
 */
async function parseFastaWithBiopython(fastaFilePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'fasta_parser.py');
    const pythonProcess = spawn('python', [scriptPath, fastaFilePath]);
    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(error || output));
      }
      try {
        const result = JSON.parse(output);
        if (result.error) return reject(new Error(result.error));
        resolve(result);
      } catch (e) {
        reject(new Error('Failed to parse Biopython output: ' + e.message));
      }
    });
  });
}

module.exports = { parseFastaWithBiopython };