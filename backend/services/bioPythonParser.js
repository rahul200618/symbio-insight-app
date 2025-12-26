/**
 * Python BioPython Bridge Service
 * Handles communication between Node.js and Python BioPython parser
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class BioPythonParser {
    constructor() {
        this.pythonScript = path.join(__dirname, 'fasta_parser.py');
    }

    /**
     * Parse FASTA file using BioPython
     * @param {string} filePath - Path to the FASTA file
     * @returns {Promise<Array>} Parsed sequence metadata
     */
    async parseFastaFile(filePath) {
        return new Promise((resolve, reject) => {
            // Check if file exists
            fs.access(filePath)
                .then(() => {
                    const pythonProcess = spawn('python', [this.pythonScript, filePath]);
                    
                    let stdout = '';
                    let stderr = '';

                    pythonProcess.stdout.on('data', (data) => {
                        stdout += data.toString();
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });

                    pythonProcess.on('close', (code) => {
                        if (code !== 0) {
                            reject(new Error(`Python process exited with code ${code}: ${stderr}`));
                            return;
                        }

                        try {
                            const result = JSON.parse(stdout);
                            
                            if (result.error) {
                                reject(new Error(result.error));
                            } else {
                                resolve(result);
                            }
                        } catch (error) {
                            reject(new Error(`Failed to parse Python output: ${error.message}`));
                        }
                    });

                    pythonProcess.on('error', (error) => {
                        reject(new Error(`Failed to start Python process: ${error.message}`));
                    });
                })
                .catch((error) => {
                    reject(new Error(`File not found: ${filePath}`));
                });
        });
    }

    /**
     * Parse FASTA content from string
     * @param {string} content - FASTA file content
     * @returns {Promise<Array>} Parsed sequence metadata
     */
    async parseFastaContent(content) {
        // Create temporary file
        const tempDir = path.join(__dirname, '../temp');
        await fs.mkdir(tempDir, { recursive: true });
        
        const tempFile = path.join(tempDir, `temp_${Date.now()}.fasta`);
        
        try {
            // Write content to temp file
            await fs.writeFile(tempFile, content, 'utf8');
            
            // Parse the temp file
            const result = await this.parseFastaFile(tempFile);
            
            // Clean up temp file
            await fs.unlink(tempFile).catch(() => {});
            
            return result;
        } catch (error) {
            // Clean up temp file on error
            await fs.unlink(tempFile).catch(() => {});
            throw error;
        }
    }

    /**
     * Check if Python and BioPython are installed
     * @returns {Promise<Object>} Status object
     */
    async checkDependencies() {
        return new Promise((resolve) => {
            const pythonProcess = spawn('python', ['-c', 'import Bio; print(Bio.__version__)']);
            
            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        installed: true,
                        version: stdout.trim(),
                        message: 'BioPython is installed and ready'
                    });
                } else {
                    resolve({
                        installed: false,
                        message: 'BioPython is not installed. Run: pip install -r requirements.txt',
                        error: stderr
                    });
                }
            });

            pythonProcess.on('error', (error) => {
                resolve({
                    installed: false,
                    message: 'Python is not installed or not in PATH',
                    error: error.message
                });
            });
        });
    }
}

module.exports = new BioPythonParser();
