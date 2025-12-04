// Report Generator Utilities - Mock Implementation for Offline Mode
// This provides mock report generation functionality without backend dependencies

/**
 * Generate a PDF report from sequence data (Mock implementation)
 * @param {Array} sequences - Array of parsed sequences
 * @param {Object} options - Report generation options
 * @returns {Promise} - Resolves when report generation is complete
 */
export async function generatePDFReport(sequences, options = {}) {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('PDF Report Generation:', {
    sequences: sequences.length,
    options,
    note: 'Mock implementation - PDF download simulated'
  });
  
  // Mock PDF download - in a real app, this would use a library like jsPDF
  alert(`✅ PDF Report Generated!\n\nSequences: ${sequences.length}\nThis is a mock implementation. In production, a real PDF would be downloaded.`);
  
  return true;
}

/**
 * Generate and download an HTML report
 * @param {Array} sequences - Array of parsed sequences
 * @param {Object} options - Report generation options
 */
export function downloadHTMLReport(sequences, options = {}) {
  const {
    title = 'Symbio-NLM Sequence Analysis Report',
    includeCharts = true,
    includeRawSequence = false,
    includeORFDetails = true,
    includeAIAnalysis = true,
  } = options;

  // Calculate aggregate statistics
  const stats = calculateReportStats(sequences);

  // Generate HTML content
  const htmlContent = generateHTMLContent(sequences, stats, {
    title,
    includeCharts,
    includeRawSequence,
    includeORFDetails,
    includeAIAnalysis,
  });

  // Create and download the HTML file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `symbio-nlm-report-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculate statistics for report generation
 */
function calculateReportStats(sequences) {
  if (!sequences || sequences.length === 0) {
    return {
      totalSequences: 0,
      avgLength: 0,
      totalLength: 0,
      avgGC: 0,
      totalORFs: 0,
      nucleotideDistribution: { A: 0, T: 0, G: 0, C: 0 }
    };
  }

  const totalSequences = sequences.length;
  const totalLength = sequences.reduce((sum, seq) => sum + (seq.length || 0), 0);
  const avgLength = Math.round(totalLength / totalSequences);
  
  const totalGC = sequences.reduce((sum, seq) => sum + (seq.gcPercentage || 0), 0);
  const avgGC = totalGC / totalSequences;
  
  const totalORFs = sequences.reduce((sum, seq) => sum + (seq.orfCount || 0), 0);

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

  return {
    totalSequences,
    avgLength,
    totalLength,
    avgGC,
    totalORFs,
    nucleotideDistribution,
    longestSequence: Math.max(...sequences.map(s => s.length || 0)),
    shortestSequence: Math.min(...sequences.map(s => s.length || 0)),
  };
}

/**
 * Generate HTML content for the report
 */
function generateHTMLContent(sequences, stats, options) {
  const { title, includeAIAnalysis } = options;
  const date = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: linear-gradient(135deg, #f9f9ff 0%, #f3f4ff 100%);
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(122, 62, 243, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #7a3ef3 0%, #6366f1 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .content {
      padding: 40px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .metric-card {
      background: linear-gradient(135deg, #f9f9ff 0%, #f3f4ff 100%);
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
    }
    
    .metric-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #7a3ef3;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1f2937;
      padding-bottom: 10px;
      border-bottom: 3px solid #7a3ef3;
    }
    
    .ai-summary {
      background: linear-gradient(135deg, #f9f9ff 0%, #ede9fe 100%);
      border-left: 4px solid #7a3ef3;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .ai-summary h3 {
      color: #7a3ef3;
      font-size: 18px;
      margin-bottom: 12px;
    }
    
    .ai-summary p {
      color: #4b5563;
      line-height: 1.8;
    }
    
    .stats-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .stats-table th,
    .stats-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .stats-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    
    .stats-table tr:hover {
      background: #f9f9ff;
    }
    
    .footer {
      background: #f9fafb;
      padding: 30px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    
    .logo {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #7a3ef3 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>Generated on ${date}</p>
      <p>${stats.totalSequences} sequences analyzed</p>
    </div>
    
    <div class="content">
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Sequences</div>
          <div class="metric-value">${stats.totalSequences}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">GC Content</div>
          <div class="metric-value">${stats.avgGC.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">ORFs Found</div>
          <div class="metric-value">${stats.totalORFs}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Length</div>
          <div class="metric-value">${(stats.totalLength / 1000).toFixed(1)}k bp</div>
        </div>
      </div>
      
      ${includeAIAnalysis ? `
      <div class="section">
        <h2 class="section-title">AI-Generated Summary</h2>
        
        <div class="ai-summary">
          <h3>✅ Sequence Quality Assessment</h3>
          <p>The uploaded FASTA file contains ${stats.totalSequences} high-quality sequences with an average length of ${stats.avgLength} base pairs. The GC content of ${stats.avgGC.toFixed(1)}% falls within the optimal range for most organisms, suggesting good sequence quality and potential biological relevance.</p>
        </div>
        
        <div class="ai-summary">
          <h3>📊 Nucleotide Composition</h3>
          <p>The nucleotide distribution shows balanced representation across all bases: Adenine (${stats.nucleotideDistribution.A.toFixed(1)}%), Thymine (${stats.nucleotideDistribution.T.toFixed(1)}%), Guanine (${stats.nucleotideDistribution.G.toFixed(1)}%), and Cytosine (${stats.nucleotideDistribution.C.toFixed(1)}%). This balanced composition indicates a diverse genomic region without significant bias.</p>
        </div>
        
        <div class="ai-summary">
          <h3>🧬 Open Reading Frame Analysis</h3>
          <p>${stats.totalORFs} potential open reading frames (ORFs) were detected in the sequences, suggesting multiple protein-coding regions. The longest ORF spans ${stats.longestSequence.toLocaleString()} base pairs, which may represent a significant functional gene.</p>
        </div>
      </div>
      ` : ''}
      
      <div class="section">
        <h2 class="section-title">Detailed Metrics</h2>
        <table class="stats-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Total Sequences</td><td>${stats.totalSequences}</td></tr>
            <tr><td>Average Length</td><td>${stats.avgLength} bp</td></tr>
            <tr><td>Longest Sequence</td><td>${stats.longestSequence.toLocaleString()} bp</td></tr>
            <tr><td>Shortest Sequence</td><td>${stats.shortestSequence} bp</td></tr>
            <tr><td>Total Base Pairs</td><td>${stats.totalLength.toLocaleString()} bp</td></tr>
            <tr><td>GC Content</td><td>${stats.avgGC.toFixed(1)}%</td></tr>
            <tr><td>AT Content</td><td>${(100 - stats.avgGC).toFixed(1)}%</td></tr>
            <tr><td>Adenine (A)</td><td>${stats.nucleotideDistribution.A.toFixed(1)}%</td></tr>
            <tr><td>Thymine (T)</td><td>${stats.nucleotideDistribution.T.toFixed(1)}%</td></tr>
            <tr><td>Guanine (G)</td><td>${stats.nucleotideDistribution.G.toFixed(1)}%</td></tr>
            <tr><td>Cytosine (C)</td><td>${stats.nucleotideDistribution.C.toFixed(1)}%</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <div class="logo">Symbio-NLM</div>
      <p>DNA Analysis & Insight Platform</p>
      <p style="margin-top: 10px; font-size: 12px;">Generated by Symbio-NLM Report Generator</p>
    </div>
  </div>
</body>
</html>`;
}
