// Report Generator Utilities with Real PDF Generation using html2canvas + jsPDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateSequenceAnalysis, generateAIAnnotation, predictSequenceQuality } from './aiService.js';

/**
 * Generate a PDF report with AI-powered analysis
 * @param {Array} sequences - Array of parsed sequences
 * @param {Object} options - Report generation options
 * @returns {Promise} - Resolves when PDF generation is complete
 */
export async function generatePDFReport(sequences, options = {}) {
  console.log('=== AI-Powered PDF Generation Started ===');
  console.log('Input sequences:', sequences);
  console.log('Number of sequences:', sequences?.length);

  // Normalize sequences to always be an array
  let normalizedSequences = sequences;
  if (!Array.isArray(sequences)) {
    console.log('Sequences is not an array, normalizing...');
    if (sequences && typeof sequences === 'object') {
      if (sequences.parsedSequences) {
        normalizedSequences = Array.isArray(sequences.parsedSequences)
          ? sequences.parsedSequences
          : [sequences.parsedSequences];
      } else {
        normalizedSequences = [sequences];
      }
    } else {
      normalizedSequences = [];
    }
  }
  console.log('Normalized sequences:', normalizedSequences);

  const {
    title = 'Symbio-NLM Sequence Analysis Report',
    includeCharts = true,
    includeRawSequence = false,
    includeORFDetails = true,
    includeAIAnalysis = true,
  } = options;

  // Calculate aggregate statistics
  const stats = calculateReportStats(normalizedSequences);
  console.log('Calculated stats:', stats);

  if (stats.totalSequences === 0) {
    console.error('No sequences in stats!');
    throw new Error('No sequences available for report generation');
  }

  // Generate AI Analysis
  console.log('Generating AI analysis...');
  const aiSummary = includeAIAnalysis ? await generateSequenceAnalysis(stats) : null;
  
  // Generate individual sequence analysis
  const sequenceAnalyses = [];
  if (includeAIAnalysis && normalizedSequences.length > 0) {
    console.log('Generating individual sequence analyses...');
    for (const seq of normalizedSequences) {
      try {
        const annotation = await generateAIAnnotation(seq);
        const quality = await predictSequenceQuality(seq);
        sequenceAnalyses.push({ sequence: seq, annotation, quality });
      } catch (error) {
        console.log('Error generating analysis for sequence:', seq.sequenceName, error);
        sequenceAnalyses.push({ sequence: seq, annotation: null, quality: null });
      }
    }
  }

  // Generate HTML content with AI insights
  const htmlContent = generateAIPoweredHTMLContent(normalizedSequences, stats, sequenceAnalyses, aiSummary, {
    title,
    includeCharts,
    includeRawSequence,
    includeORFDetails,
    includeAIAnalysis,
  });

  console.log('HTML content generated, length:', htmlContent.length);

  // Create a temporary container to render the HTML
  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1200px';
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    console.log('Starting canvas rendering with html2canvas...');
    
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 1200,
      height: container.scrollHeight,
    });

    console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate scaling to fit the image to PDF width
    const imgWidth = pdfWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add multiple pages if needed
    pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 30); // Account for margins

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Save the PDF
    const filename = `symbio-nlm-report-${Date.now()}.pdf`;
    pdf.save(filename);
    console.log('PDF saved successfully:', filename);

    return true;
  } catch (error) {
    console.error('Error during PDF generation:', error);
    throw error;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Generate and download an HTML report
 * @param {Array} sequences - Array of parsed sequences
 * @param {Object} options - Report generation options
 */
export function downloadHTMLReport(sequences, options = {}) {
  // Normalize sequences to always be an array
  let normalizedSequences = sequences;
  if (!Array.isArray(sequences)) {
    if (sequences && typeof sequences === 'object') {
      if (sequences.parsedSequences) {
        normalizedSequences = Array.isArray(sequences.parsedSequences)
          ? sequences.parsedSequences
          : [sequences.parsedSequences];
      } else {
        normalizedSequences = [sequences];
      }
    } else {
      normalizedSequences = [];
    }
  }

  const {
    title = 'Symbio-NLM Sequence Analysis Report',
    includeCharts = true,
    includeRawSequence = false,
    includeORFDetails = true,
    includeAIAnalysis = true,
  } = options;

  // Calculate aggregate statistics
  const stats = calculateReportStats(normalizedSequences);

  // Generate HTML content
  const htmlContent = generateHTMLContent(normalizedSequences, stats, {
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
      nucleotideDistribution: { A: 0, T: 0, G: 0, C: 0 },
      longestSequence: 0,
      shortestSequence: 0
    };
  }

  const totalSequences = sequences.length;
  const totalLength = sequences.reduce((sum, seq) => sum + (seq.length || seq.sequenceLength || 0), 0);
  const avgLength = Math.round(totalLength / totalSequences);

  const totalGC = sequences.reduce((sum, seq) => sum + (seq.gcPercentage || seq.gcContent || 0), 0);
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
      background: white;
      color: #1f2937;
      padding: 40px 40px 20px 40px;
      border-bottom: 3px solid #f3f4f6;
    }
    
    .header h1 {
      font-size: 36px;
      margin-bottom: 16px;
      font-weight: 700;
      color: #111827;
    }
    
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .content {
      padding: 0;
    }
    
    .key-metrics {
      padding: 24px 40px;
      background: white;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .key-metrics h2 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #111827;
    }
    
    .key-metrics ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .key-metrics li {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
      line-height: 1.6;
    }
    
    .key-metrics li strong {
      font-weight: 600;
    }
    
    .section {
      padding: 24px 40px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .section:last-child {
      border-bottom: none;
    }
    
    .section-title {
      font-size: 18px;
      color: #111827;
      margin-bottom: 16px;
      font-weight: 700;
    }
    
    .ai-summary {
      background: white;
      padding: 0;
      margin-bottom: 16px;
    }
    
    .ai-summary h3 {
      color: #111827;
      font-size: 15px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .ai-summary p {
      color: #374151;
      line-height: 1.8;
      font-size: 14px;
      text-align: justify;
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
    
    .sequence-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    
    .sequence-header {
      background: white;
      color: #1f2937;
      padding: 16px 20px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .sequence-number {
      background: #7c3aed;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .sequence-info h4 {
      font-size: 16px;
      margin-bottom: 0;
      color: #7c3aed;
      font-weight: 600;
      text-decoration: underline;
    }
    
    .sequence-info .meta {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .sequence-content {
      padding: 20px;
      display: none;
      background: #fafafa;
    }
    
    .info-section-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
      margin-top: 16px;
    }
    
    .info-section-title:first-child {
      margin-top: 0;
    }
    
    .sequence-header {
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .sequence-header:hover {
      background: linear-gradient(135deg, #f0e8ff 0%, #e8e0ff 100%);
    }
    
    .sequence-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .sequence-stat {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    
    .sequence-stat .label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .sequence-stat .value {
      font-size: 18px;
      font-weight: 700;
      color: #7a3ef3;
    }
    
    .nucleotide-bars {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .nucleotide-bar {
      flex: 1;
      text-align: center;
    }
    
    .nucleotide-bar .bar-container {
      background: #e5e7eb;
      height: 80px;
      border-radius: 8px;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .nucleotide-bar .bar {
      width: 100%;
      border-radius: 8px 8px 0 0;
      transition: height 0.3s;
    }
    
    .nucleotide-bar .bar-a { background: #38bdf8; }
    .nucleotide-bar .bar-t { background: #22d3ee; }
    .nucleotide-bar .bar-g { background: #06b6d4; }
    .nucleotide-bar .bar-c { background: #0ea5e9; }
    
    .nucleotide-bar .percentage {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .nucleotide-bar .count {
      font-size: 11px;
      color: #6b7280;
    }
    
    .nucleotide-bar .name {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .gc-content-row {
      display: flex;
      gap: 20px;
      margin-top: 16px;
    }
    
    .gc-box {
      flex: 1;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .gc-box .label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .gc-box .value {
      font-size: 24px;
      font-weight: 700;
      color: #7a3ef3;
    }
    
    .orf-section {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    
    .orf-section h5 {
      color: #059669;
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    .orf-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    
    .orf-item {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 12px;
    }
    
    .orf-item .orf-label {
      font-size: 11px;
      color: #7a3ef3;
      font-weight: 600;
    }
    
    .orf-item .orf-info {
      font-size: 11px;
      color: #6b7280;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }
      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p class="subtitle">${date}</p>
      <p class="subtitle">${stats.totalSequences} sequences analyzed</p>
    </div>
    
    <div class="content">
      <div class="key-metrics">
        <h2>Key Metrics</h2>
        <ul>
          <li><strong>Total Sequences:</strong> ${stats.totalSequences}</li>
          <li><strong>GC Content:</strong> ${stats.avgGC.toFixed(1)}%</li>
          <li><strong>ORFs Found:</strong> ${stats.totalORFs}</li>
          <li><strong>Total Length:</strong> ${stats.totalLength.toLocaleString()} bp</li>
          <li><strong>Average Length:</strong> ${stats.avgLength} bp</li>
          <li><strong>Longest Sequence:</strong> ${stats.longestSequence.toLocaleString()} bp</li>
          <li><strong>Shortest Sequence:</strong> ${stats.shortestSequence} bp</li>
        </ul>
      </div>
      
      ${includeAIAnalysis ? `
      <div class="section">
        <h2 class="section-title">AI-Generated Summary</h2>
        
        <div class="ai-summary">
          <h3>% Sequence Quality Assessment</h3>
          <p>The ${stats.totalSequences === 1 ? 'single sequence' : stats.totalSequences + ' sequences'} exhibit${stats.totalSequences === 1 ? 's' : ''} a respectable average length of ${stats.avgLength} bp, suggesting adequate coverage and minimal fragmentation. While overall length is not a definitive indicator of sequence accuracy, it provides a reasonable starting point for further analysis.</p>
        </div>
        
        <div class="ai-summary">
          <h3>% Nucleotide Composition Analysis</h3>
          <p>The GC content of ${stats.avgGC.toFixed(1)}% is ${stats.avgGC > 52 ? 'relatively high' : stats.avgGC < 45 ? 'relatively low' : 'well-balanced'}, indicating a ${stats.avgGC > 52 ? 'possible preference for guanine and cytosine' : stats.avgGC < 45 ? 'possible preference for adenine and thymine' : 'balanced nucleotide composition'} in this particular sequence, which can influence factors like melting temperature and DNA stability. Further examination of base distribution would be beneficial to confirm any significant biases.</p>
        </div>
        
        <div class="ai-summary">
          <h3>% Open Reading Frame Analysis</h3>
          <p>The presence of ${stats.totalORFs === 0 ? 'no identified ORFs' : stats.totalORFs === 1 ? 'a single identified ORF' : stats.totalORFs + ' identified ORFs'} ${stats.totalORFs > 0 ? 'suggests the potential for a coding region within this sequence. However, without further information on the ORF\'s length, start/stop codons, and frame, its biological significance remains speculative.' : 'indicates that no clear protein-coding regions were detected using standard ORF prediction criteria.'}</p>
        </div>
        
        <div class="ai-summary">
          <h3>% Recommendations</h3>
          <p>To enhance understanding, it is recommended to perform a BLAST search against relevant databases to identify potential homologous sequences or known genes. Further analysis, including codon usage and potential protein domain prediction for the identified ORF${stats.totalORFs > 1 ? 's' : ''}, is also advised.</p>
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
      
      ${sequences.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Individual Sequence Analysis</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">Detailed analytics for each of the ${sequences.length} sequences</p>
        
        <!-- Search and Filter Controls -->
        <div class="search-filter-controls" style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <div style="flex: 1; min-width: 200px; position: relative;">
            <svg style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #9ca3af;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input type="text" id="sequenceSearch" placeholder="Search sequences..." 
              style="width: 100%; padding: 8px 12px 8px 36px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; outline: none;"
              onkeyup="filterSequences()">
          </div>
          <select id="sortSelect" onchange="sortSequences()" style="padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; min-width: 160px;">
            <option value="default">Default Order</option>
            <option value="name">Name (A-Z)</option>
            <option value="length-desc">Length (High to Low)</option>
            <option value="length-asc">Length (Low to High)</option>
            <option value="gc-desc">GC Content (High to Low)</option>
            <option value="gc-asc">GC Content (Low to High)</option>
            <option value="orfs">ORFs (Most First)</option>
          </select>
          <button onclick="toggleAllSequences()" id="toggleAllBtn" style="padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px; background: white; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            Expand All
          </button>
        </div>
        
        <h2 class="individual-title">Individual Sequence Details</h2>
        <div id="sequenceCardsContainer">
        ${sequences.map((seq, index) => {
          const seqLength = seq.sequenceLength || seq.length || 0;
          const seqGC = seq.gcPercentage || seq.gcContent || 0;
          const seqOrfs = seq.orfs || [];
          const counts = seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 };
          const totalBases = counts.A + counts.T + counts.G + counts.C;
          const aPercent = totalBases > 0 ? (counts.A / totalBases) * 100 : 0;
          const tPercent = totalBases > 0 ? (counts.T / totalBases) * 100 : 0;
          const gPercent = totalBases > 0 ? (counts.G / totalBases) * 100 : 0;
          const cPercent = totalBases > 0 ? (counts.C / totalBases) * 100 : 0;
          const maxPercent = Math.max(aPercent, tPercent, gPercent, cPercent) || 1;
          
          return `
        <div class="sequence-card">
          <div class="sequence-header">
            <div class="sequence-number">${index + 1}</div>
            <div class="sequence-info">
              <h4>${seq.sequenceName || seq.name || seq.header || 'Sequence ' + (index + 1)}</h4>
              <div class="meta">${seqLength.toLocaleString()} bp • GC: ${seqGC.toFixed(1)}% • ${seqOrfs.length} ORFs</div>
            </div>
          </div>
          <div class="sequence-content">
            <h5 class="info-section-title">Sequence Information</h5>
            <div class="sequence-stats">
              <div class="sequence-stat">
                <div class="label">Length</div>
                <div class="value">${seqLength} bp</div>
              </div>
              <div class="sequence-stat">
                <div class="label">GC Content</div>
                <div class="value">${seqGC.toFixed(2)}%</div>
              </div>
              <div class="sequence-stat">
                <div class="label">AT Content</div>
                <div class="value">${(100 - seqGC).toFixed(2)}%</div>
              </div>
              <div class="sequence-stat">
                <div class="label">ORF Count</div>
                <div class="value">${seqOrfs.length}</div>
              </div>
            </div>
            
            <h5 class="info-section-title">Nucleotide Composition</h5>
            <div style="margin-bottom: 16px;">
              <p style="font-size: 14px; color: #374151; margin-bottom: 4px;">Adenine (A): ${counts.A} (${aPercent.toFixed(1)}%)</p>
              <p style="font-size: 14px; color: #374151; margin-bottom: 4px;">Thymine (T): ${counts.T} (${tPercent.toFixed(1)}%)</p>
              <p style="font-size: 14px; color: #374151; margin-bottom: 4px;">Guanine (G): ${counts.G} (${gPercent.toFixed(1)}%)</p>
              <p style="font-size: 14px; color: #374151; margin-bottom: 4px;">Cytosine (C): ${counts.C} (${cPercent.toFixed(1)}%)</p>
            </div>
            
            ${seqOrfs.length > 0 ? `
            <h5 class="info-section-title">Open Reading Frames (ORFs)</h5>
            <div style="margin-bottom: 16px;">
              ${seqOrfs.slice(0, 3).map((orf, orfIndex) => `
                <p style="font-size: 14px; color: #374151; margin-bottom: 4px;">ORF ${orfIndex + 1}: Position ${orf.start}-${orf.end}, Length: ${orf.length} bp, Frame: ${orf.frame || 2}</p>
              `).join('')}
              ${seqOrfs.length > 3 ? `<p style="font-size: 14px; color: #6b7280; margin-top: 8px;">... and ${seqOrfs.length - 3} more ORF${seqOrfs.length - 3 > 1 ? 's' : ''}</p>` : ''}
            </div>
            ` : ''}
            
            <h5 class="info-section-title">Sequence Quality Assessment</h5>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${seqGC >= 40 && seqGC <= 60 ? 'Balanced GC content - optimal for most organisms' : seqGC > 60 ? 'High GC content - may indicate thermophilic origin' : 'Low GC content - AT-rich region'}</li>
              <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${seqOrfs.length > 0 ? seqOrfs.length + ' potential protein-coding region' + (seqOrfs.length > 1 ? 's' : '') + ' detected' : 'No protein-coding regions detected'}</li>
              <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${seqLength < 200 ? 'Short sequence (' + seqLength + ' bp) - limited analysis possible' : 'Adequate sequence length for comprehensive analysis'}</li>
            </ul>
          </div>
        </div>
          `;
        }).join('')}
        </div>
        
        <div id="noResultsMessage" style="display: none; text-align: center; padding: 40px; color: #6b7280;">
          <svg style="width: 48px; height: 48px; margin: 0 auto 16px; color: #d1d5db;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p>No sequences match your search</p>
          <button onclick="clearFilters()" style="margin-top: 12px; color: #7a3ef3; background: none; border: none; cursor: pointer; text-decoration: underline;">Clear filters</button>
        </div>
      </div>
      
      <script>
        // Sequence data for filtering/sorting
        const sequenceData = ${JSON.stringify(sequences.map((seq, index) => ({
          index,
          name: seq.sequenceName || seq.name || seq.header || 'Sequence ' + (index + 1),
          length: seq.sequenceLength || seq.length || 0,
          gc: seq.gcPercentage || seq.gcContent || 0,
          orfs: (seq.orfs || []).length
        })))};
        
        let allExpanded = false;
        
        function filterSequences() {
          const query = document.getElementById('sequenceSearch').value.toLowerCase();
          const cards = document.querySelectorAll('.sequence-card');
          let visibleCount = 0;
          
          cards.forEach((card, index) => {
            const seqInfo = sequenceData[index];
            const matches = seqInfo.name.toLowerCase().includes(query);
            card.style.display = matches ? 'block' : 'none';
            if (matches) visibleCount++;
          });
          
          document.getElementById('noResultsMessage').style.display = visibleCount === 0 ? 'block' : 'none';
        }
        
        function sortSequences() {
          const sortBy = document.getElementById('sortSelect').value;
          const container = document.getElementById('sequenceCardsContainer');
          const cards = Array.from(container.querySelectorAll('.sequence-card'));
          
          cards.sort((a, b) => {
            const indexA = parseInt(a.dataset.index);
            const indexB = parseInt(b.dataset.index);
            const seqA = sequenceData[indexA];
            const seqB = sequenceData[indexB];
            
            switch(sortBy) {
              case 'name': return seqA.name.localeCompare(seqB.name);
              case 'length-desc': return seqB.length - seqA.length;
              case 'length-asc': return seqA.length - seqB.length;
              case 'gc-desc': return seqB.gc - seqA.gc;
              case 'gc-asc': return seqA.gc - seqB.gc;
              case 'orfs': return seqB.orfs - seqA.orfs;
              default: return indexA - indexB;
            }
          });
          
          cards.forEach(card => container.appendChild(card));
        }
        
        function toggleAllSequences() {
          allExpanded = !allExpanded;
          const cards = document.querySelectorAll('.sequence-card');
          const btn = document.getElementById('toggleAllBtn');
          
          cards.forEach(card => {
            const content = card.querySelector('.sequence-content');
            if (content) {
              content.style.display = allExpanded ? 'block' : 'none';
            }
          });
          
          btn.innerHTML = allExpanded ? 
            '<svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg> Collapse All' :
            '<svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg> Expand All';
        }
        
        function clearFilters() {
          document.getElementById('sequenceSearch').value = '';
          document.getElementById('sortSelect').value = 'default';
          filterSequences();
          sortSequences();
        }
        
        // Add click handlers for sequence cards
        document.addEventListener('DOMContentLoaded', function() {
          const cards = document.querySelectorAll('.sequence-card');
          cards.forEach((card, index) => {
            card.dataset.index = index;
            const header = card.querySelector('.sequence-header');
            const content = card.querySelector('.sequence-content');
            if (header && content) {
              header.style.cursor = 'pointer';
              header.addEventListener('click', function() {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
              });
            }
          });
        });
      </script>
      ` : ''}
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

