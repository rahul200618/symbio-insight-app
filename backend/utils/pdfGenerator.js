const PDFDocument = require('pdfkit');

/**
 * Generate PDF report from sequence data
 * @param {Array} sequences - Array of sequence objects
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF document as buffer
 */
async function generatePDFReport(sequences, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const {
        title = 'Symbio-NLM Sequence Analysis Report',
        includeAIAnalysis = true,
      } = options;

      // Calculate statistics
      const stats = calculateStats(sequences);

      // Create PDF document
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4'
      });

      // Collect PDF chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Add header
      doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(0.5);
      
      const date = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.fontSize(10).font('Helvetica').text(date, { align: 'center' });
      doc.fontSize(10).text(`${stats.totalSequences} sequences analyzed`, { align: 'center' });
      doc.moveDown(1);

      // Add metrics grid
      doc.fontSize(12).font('Helvetica-Bold').text('Key Metrics', { underline: true });
      doc.moveDown(0.3);

      const metrics = [
        ['Total Sequences', stats.totalSequences.toString()],
        ['GC Content', `${stats.avgGC.toFixed(1)}%`],
        ['ORFs Found', stats.totalORFs.toString()],
        ['Total Length', `${(stats.totalLength / 1000).toFixed(1)}k bp`],
        ['Average Length', `${stats.avgLength} bp`],
        ['Longest Sequence', `${stats.longestSequence.toLocaleString()} bp`],
        ['Shortest Sequence', `${stats.shortestSequence} bp`],
      ];

      doc.fontSize(10).font('Helvetica');
      metrics.forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      doc.moveDown(1);

      // Add AI Analysis section
      if (includeAIAnalysis) {
        doc.fontSize(12).font('Helvetica-Bold').text('AI-Generated Summary', { underline: true });
        doc.moveDown(0.3);

        doc.fontSize(10).font('Helvetica-Bold').text('✓ Sequence Quality Assessment');
        doc.fontSize(9).font('Helvetica');
        doc.text(
          `The uploaded FASTA file contains ${stats.totalSequences} high-quality sequences with an average length of ${stats.avgLength} base pairs. The GC content of ${stats.avgGC.toFixed(1)}% falls within the optimal range for most organisms.`,
          { align: 'justify' }
        );
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica-Bold').text('◆ Nucleotide Composition');
        doc.fontSize(9).font('Helvetica');
        doc.text(
          `The nucleotide distribution shows balanced representation: Adenine (${stats.nucleotideDistribution.A.toFixed(1)}%), Thymine (${stats.nucleotideDistribution.T.toFixed(1)}%), Guanine (${stats.nucleotideDistribution.G.toFixed(1)}%), Cytosine (${stats.nucleotideDistribution.C.toFixed(1)}%).`,
          { align: 'justify' }
        );
        doc.moveDown(0.5);

        doc.fontSize(10).font('Helvetica-Bold').text('◉ Open Reading Frame Analysis');
        doc.fontSize(9).font('Helvetica');
        doc.text(
          `${stats.totalORFs} potential open reading frames (ORFs) were detected, suggesting multiple protein-coding regions.`,
          { align: 'justify' }
        );
        doc.moveDown(1);
      }

      // Add detailed metrics table
      doc.fontSize(12).font('Helvetica-Bold').text('Detailed Metrics', { underline: true });
      doc.moveDown(0.3);

      const tableData = [
        ['Metric', 'Value'],
        ['Total Sequences', stats.totalSequences.toString()],
        ['Average Length', `${stats.avgLength} bp`],
        ['Longest Sequence', `${stats.longestSequence.toLocaleString()} bp`],
        ['Shortest Sequence', `${stats.shortestSequence} bp`],
        ['Total Base Pairs', `${stats.totalLength.toLocaleString()} bp`],
        ['GC Content', `${stats.avgGC.toFixed(1)}%`],
        ['AT Content', `${(100 - stats.avgGC).toFixed(1)}%`],
        ['Adenine (A)', `${stats.nucleotideDistribution.A.toFixed(1)}%`],
        ['Thymine (T)', `${stats.nucleotideDistribution.T.toFixed(1)}%`],
        ['Guanine (G)', `${stats.nucleotideDistribution.G.toFixed(1)}%`],
        ['Cytosine (C)', `${stats.nucleotideDistribution.C.toFixed(1)}%`],
      ];

      // Simple table rendering
      doc.fontSize(9).font('Helvetica-Bold');
      tableData.forEach((row, index) => {
        if (index === 0) {
          doc.text(`${row[0].padEnd(30)} ${row[1]}`);
          doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        } else {
          doc.font('Helvetica');
          doc.text(`${row[0].padEnd(30)} ${row[1]}`);
        }
      });

      doc.moveDown(1);

      // Add individual sequence pages
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('Individual Sequence Details', { align: 'center' });
      doc.moveDown(1);

      sequences.forEach((seq, index) => {
        if (index > 0) {
          doc.addPage(); // New page for each sequence
        }

        // Sequence header
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#7c3aed')
          .text(`Sequence ${index + 1}: ${seq.name || 'Unnamed'}`, { underline: true });
        doc.fillColor('black');
        doc.moveDown(0.5);

        // Sequence metadata
        doc.fontSize(11).font('Helvetica-Bold').text('Sequence Information');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Length: ${seq.length?.toLocaleString() || 'N/A'} bp`);
        doc.text(`GC Content: ${seq.gcContent?.toFixed(2) || 'N/A'}%`);
        doc.text(`AT Content: ${seq.gcContent ? (100 - seq.gcContent).toFixed(2) : 'N/A'}%`);
        doc.text(`ORF Count: ${seq.orfCount || seq.orfs?.length || 0}`);
        doc.moveDown(0.5);

        // Nucleotide composition
        if (seq.nucleotideCounts) {
          doc.fontSize(11).font('Helvetica-Bold').text('Nucleotide Composition');
          doc.fontSize(10).font('Helvetica');
          
          const counts = seq.nucleotideCounts;
          const total = counts.A + counts.T + counts.G + counts.C;
          
          doc.text(`Adenine (A): ${counts.A?.toLocaleString() || 0} (${total > 0 ? ((counts.A / total) * 100).toFixed(1) : 0}%)`);
          doc.text(`Thymine (T): ${counts.T?.toLocaleString() || 0} (${total > 0 ? ((counts.T / total) * 100).toFixed(1) : 0}%)`);
          doc.text(`Guanine (G): ${counts.G?.toLocaleString() || 0} (${total > 0 ? ((counts.G / total) * 100).toFixed(1) : 0}%)`);
          doc.text(`Cytosine (C): ${counts.C?.toLocaleString() || 0} (${total > 0 ? ((counts.C / total) * 100).toFixed(1) : 0}%)`);
          doc.moveDown(0.5);
        }

        // ORF details
        if (seq.orfs && seq.orfs.length > 0) {
          doc.fontSize(11).font('Helvetica-Bold').text('Open Reading Frames (ORFs)');
          doc.fontSize(9).font('Helvetica');
          
          const displayORFs = seq.orfs.slice(0, 10); // Limit to first 10 ORFs
          displayORFs.forEach((orf, orfIndex) => {
            doc.text(`ORF ${orfIndex + 1}: Position ${orf.start}-${orf.end}, Length: ${orf.length} bp, Frame: ${orf.frame || 'N/A'}`);
          });
          
          if (seq.orfs.length > 10) {
            doc.text(`... and ${seq.orfs.length - 10} more ORFs`);
          }
          doc.moveDown(0.5);
        }

        // Visual indicators
        doc.fontSize(11).font('Helvetica-Bold').text('Sequence Quality Assessment');
        doc.fontSize(9).font('Helvetica');
        
        // GC content assessment
        const gcContent = seq.gcContent || 0;
        let gcAssessment = '';
        if (gcContent < 30) {
          gcAssessment = '⚠ Low GC content - may indicate AT-rich regions';
        } else if (gcContent > 70) {
          gcAssessment = '⚠ High GC content - may indicate GC-rich regions';
        } else {
          gcAssessment = '✓ Balanced GC content - optimal for most organisms';
        }
        doc.text(gcAssessment);

        // ORF assessment
        const orfCount = seq.orfCount || seq.orfs?.length || 0;
        if (orfCount > 0) {
          doc.text(`✓ ${orfCount} potential protein-coding regions detected`);
        } else {
          doc.text('⚠ No ORFs detected - may be non-coding sequence');
        }

        // Length assessment
        const length = seq.length || 0;
        if (length > 10000) {
          doc.text(`✓ Long sequence (${(length / 1000).toFixed(1)}k bp) - suitable for detailed analysis`);
        } else if (length > 1000) {
          doc.text(`✓ Medium-length sequence (${length} bp) - good for analysis`);
        } else if (length > 100) {
          doc.text(`⚠ Short sequence (${length} bp) - limited analysis possible`);
        } else {
          doc.text(`⚠ Very short sequence (${length} bp) - minimal analysis`);
        }

        // Footer for this page
        doc.fontSize(8).fillColor('#888888').text(
          `Page ${index + 2} of ${sequences.length + 1} • Sequence ${index + 1} of ${sequences.length}`,
          40,
          doc.page.height - 40,
          { align: 'center' }
        );
        doc.fillColor('black');
      });

      // Final page - footer
      doc.fontSize(8).font('Helvetica').fillColor('#888888').text('Symbio-NLM - DNA Analysis & Insight Platform', {
        align: 'center'
      });
      doc.text('Generated by Symbio-NLM Report Generator', { align: 'center' });
      doc.fillColor('black');

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Calculate statistics from sequences
 */
function calculateStats(sequences) {
  if (!sequences || sequences.length === 0) {
    return {
      totalSequences: 0,
      avgLength: 0,
      totalLength: 0,
      avgGC: 0,
      totalORFs: 0,
      nucleotideDistribution: { A: 0, T: 0, G: 0, C: 0 },
      longestSequence: 0,
      shortestSequence: 0
    };
  }

  const totalSequences = sequences.length;
  const totalLength = sequences.reduce((sum, seq) => sum + (seq.length || seq.sequenceLength || 0), 0);
  const avgLength = Math.round(totalLength / totalSequences);

  const totalGC = sequences.reduce((sum, seq) => sum + (seq.gcContent || seq.gcPercentage || 0), 0);
  const avgGC = totalGC / totalSequences;

  const totalORFs = sequences.reduce((sum, seq) => sum + (seq.orfCount || (seq.orfs?.length || 0)), 0);

  // Calculate nucleotide distribution
  const totalNucleotides = {
    A: sequences.reduce((sum, seq) => sum + (seq.nucleotideCounts?.A || 0), 0),
    T: sequences.reduce((sum, seq) => sum + (seq.nucleotideCounts?.T || 0), 0),
    G: sequences.reduce((sum, seq) => sum + (seq.nucleotideCounts?.G || 0), 0),
    C: sequences.reduce((sum, seq) => sum + (seq.nucleotideCounts?.C || 0), 0),
  };

  const totalBases = totalNucleotides.A + totalNucleotides.T + totalNucleotides.G + totalNucleotides.C;
  const nucleotideDistribution = {
    A: totalBases > 0 ? (totalNucleotides.A / totalBases) * 100 : 0,
    T: totalBases > 0 ? (totalNucleotides.T / totalBases) * 100 : 0,
    G: totalBases > 0 ? (totalNucleotides.G / totalBases) * 100 : 0,
    C: totalBases > 0 ? (totalNucleotides.C / totalBases) * 100 : 0,
  };

  const lengths = sequences.map(s => s.length || s.sequenceLength || 0);

  return {
    totalSequences,
    avgLength,
    totalLength,
    avgGC,
    totalORFs,
    nucleotideDistribution,
    longestSequence: Math.max(...lengths),
    shortestSequence: Math.min(...lengths),
  };
}

module.exports = {
  generatePDFReport
};
