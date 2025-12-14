// Report Generator Utilities with Real PDF Generation using html2canvas + jsPDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateSequenceAnalysis } from './aiService.js';

/**
 * Generate AI analysis for individual sequence
 */
async function generateSequenceAIAnalysis(seq, index) {
  try {
    const seqLength = seq.sequenceLength || seq.length || 0;
    const seqGC = seq.gcPercentage || seq.gcContent || 0;
    const seqOrfs = seq.orfs || [];
    
    const response = await fetch('http://localhost:3002/api/ai/analyze-sequence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sequenceName: seq.sequenceName || seq.name || `Sequence ${index + 1}`,
        length: seqLength,
        gcContent: seqGC,
        atContent: 100 - seqGC,
        nucleotides: seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 },
        totalORFs: seqOrfs.length,
        orfs: seqOrfs.slice(0, 3).map(orf => ({
          start: orf.start,
          end: orf.end,
          length: orf.length,
          frame: orf.frame || 2
        }))
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.summary;
    }
  } catch (error) {
    console.log('AI analysis failed for sequence, using fallback');
  }
  
  // Fallback analysis
  const seqLength = seq.sequenceLength || seq.length || 0;
  const seqGC = seq.gcPercentage || seq.gcContent || 0;
  const seqOrfs = seq.orfs || [];
  
  return `This sequence exhibits a length of ${seqLength} bp with a GC content of ${seqGC.toFixed(1)}%. ${seqGC >= 40 && seqGC <= 60 ? 'The balanced GC content suggests optimal stability for most organisms.' : seqGC > 60 ? 'The high GC content may indicate thermophilic origin or specialized adaptation.' : 'The AT-rich composition suggests potential regulatory or structural roles.'} ${seqOrfs.length > 0 ? `${seqOrfs.length} open reading frame${seqOrfs.length > 1 ? 's were' : ' was'} identified, indicating potential protein-coding capability.` : 'No clear protein-coding regions were detected.'} ${seqLength < 200 ? 'The short length limits comprehensive analysis, but preliminary assessment suggests adequate quality for initial screening.' : 'The sequence length is suitable for detailed bioinformatics analysis and functional prediction.'}`;
}

/**
 * Generate a PDF report from sequence data with AI analysis
 * @param {Array} sequences - Array of parsed sequences
 * @param {Object} options - Report generation options
 * @returns {Promise} - Resolves when PDF generation is complete
 */
export async function generatePDFReport(sequences, options = {}) {
  console.log('=== PDF Generation Started ===');
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

  // Generate AI analysis for overall summary
  let overallAIAnalysis = null;
  if (includeAIAnalysis) {
    console.log('Generating overall AI analysis...');
    overallAIAnalysis = await generateSequenceAnalysis(stats);
  }

  // Generate AI analysis for each sequence
  let sequenceAIAnalyses = [];
  if (includeAIAnalysis && normalizedSequences.length > 0) {
    console.log('Generating individual sequence AI analyses...');
    sequenceAIAnalyses = await Promise.all(
      normalizedSequences.map((seq, index) => generateSequenceAIAnalysis(seq, index))
    );
  }

  // Generate HTML content with AI analysis
  const htmlContent = generatePDFHTMLContent(normalizedSequences, stats, {
    title,
    includeCharts,
    includeRawSequence,
    includeORFDetails,
    includeAIAnalysis,
    overallAIAnalysis,
    sequenceAIAnalyses,
  });

  console.log('HTML content generated, length:', htmlContent.length);

  // Create an iframe to completely isolate the PDF content from page styles
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '900px';
  iframe.style.height = '5000px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  // Write the HTML content to the iframe
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('Could not access iframe document');
  }
  
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for content to render
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get the container from iframe
  const container = iframeDoc.body;
  iframe.style.visibility = 'visible';

  try {
    console.log('Starting PDF generation with page-per-sequence...');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    
    // Get all the page sections
    const headerSection = container.querySelector('.header');
    const keyMetricsSection = container.querySelector('.key-metrics');
    const sections = container.querySelectorAll('.section');
    const sequencePages = container.querySelectorAll('.sequence-page');
    const footer = container.querySelector('.footer');
    
    let currentY = margin;
    let pageNum = 1;
    
    // Helper function to add element to PDF
    const addElementToPDF = async (element, startNewPage = false) => {
      if (!element) return;
      
      if (startNewPage && pageNum > 1) {
        pdf.addPage();
        currentY = margin;
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 900,
        windowWidth: 900,
        // Use the iframe's window for proper style isolation
        foreignObjectRendering: false,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Check if we need a new page
      if (currentY + imgHeight > pdfHeight - margin && currentY > margin) {
        pdf.addPage();
        currentY = margin;
        pageNum++;
      }
      
      pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight, undefined, 'MEDIUM');
      currentY += imgHeight;
      
      return imgHeight;
    };
    
    // Add header
    if (headerSection) {
      await addElementToPDF(headerSection);
    }
    
    // Add key metrics
    if (keyMetricsSection) {
      await addElementToPDF(keyMetricsSection);
    }
    
    // Add other sections (charts, AI summary)
    for (const section of sections) {
      await addElementToPDF(section);
    }
    
    // Add each sequence on a new page
    for (let i = 0; i < sequencePages.length; i++) {
      pdf.addPage();
      currentY = margin;
      pageNum++;
      await addElementToPDF(sequencePages[i]);
    }
    
    // Add footer on the last page
    if (footer) {
      if (currentY + 100 > pdfHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      await addElementToPDF(footer);
    }

    // Save the PDF
    const filename = `symbio-nlm-report-${Date.now()}.pdf`;
    pdf.save(filename);
    console.log('PDF saved successfully:', filename, 'with', pageNum, 'pages');

    return true;
  } catch (error) {
    console.error('Error during PDF generation:', error);
    throw error;
  } finally {
    // Clean up - remove the iframe
    document.body.removeChild(iframe);
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
 * Generate HTML content specifically for PDF reports with AI analysis
 */
function generatePDFHTMLContent(sequences, stats, options) {
  const { title, includeAIAnalysis, overallAIAnalysis, sequenceAIAnalyses } = options;
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
      background: white;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
    }
    
    .header {
      background: white;
      color: #1f2937;
      padding: 40px 40px 20px 40px;
      border-bottom: 3px solid #f3f4f6;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 16px;
      font-weight: 700;
      color: #111827;
    }
    
    .header .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .key-metrics {
      padding: 24px 40px;
      background: white;
      border-bottom: 1px solid #f3f4f6;
      text-align: center;
    }
    
    .key-metrics h2 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #111827;
    }
    
    .key-metrics ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px 32px;
    }
    
    .key-metrics li {
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
    }
    
    .key-metrics li strong {
      font-weight: 600;
    }
    
    .section {
      padding: 28px 40px;
      border-bottom: 1px solid #e5e7eb;
      page-break-inside: avoid;
      text-align: center;
    }
    
    .section:last-child {
      border-bottom: none;
    }
    
    .section-title {
      font-size: 20px;
      color: #111827;
      margin-bottom: 18px;
      font-weight: 700;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
      text-align: center;
    }
    
    .ai-summary {
      background: white;
      padding: 0;
      margin-bottom: 20px;
      text-align: left;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
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
    
    .individual-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f3f4f6;
      text-align: center;
    }
    
    .sequence-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      margin: 0 auto 30px auto;
      overflow: hidden;
      page-break-before: always;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      max-width: 800px;
    }
    
    .sequence-card:first-child {
      page-break-before: auto;
    }
    
    .sequence-header {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      color: #1f2937;
      padding: 20px 24px;
      border-bottom: 2px solid #e5e7eb;
      text-align: center;
    }
    
    .sequence-header h4 {
      font-size: 16px;
      margin-bottom: 4px;
      color: #7c3aed;
      font-weight: 600;
      text-decoration: underline;
    }
    
    .sequence-header .meta {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .sequence-content {
      padding: 20px;
      background: #fafafa;
      text-align: left;
    }
    
    .info-section-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
      margin-top: 16px;
      text-align: center;
    }
    
    .info-section-title:first-child {
      margin-top: 0;
    }
    
    .ai-analysis {
      background: #f9fafb;
      padding: 16px;
      border-radius: 6px;
      border-left: 3px solid #7c3aed;
      margin-bottom: 16px;
    }
    
    .ai-analysis p {
      font-size: 14px;
      color: #374151;
      line-height: 1.8;
      text-align: justify;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .stat-item {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    
    .stat-item .label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .stat-item .value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
    
    .nucleotide-list {
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }
    
    .nucleotide-list p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
    }
    
    .orf-list {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .orf-list p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
    }
    
    .detailed-metrics-table {
      width: 100%;
      max-width: 700px;
      margin: 12px auto 16px auto;
      border-collapse: collapse;
      font-size: 13px;
    }
    
    .detailed-metrics-table th,
    .detailed-metrics-table td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #e5e7eb;
    }
    
    .detailed-metrics-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    
    .detailed-metrics-table tr:nth-child(even) {
      background: #fafafa;
    }
    
    .footer {
      background: #f9fafb;
      padding: 30px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
    }
    
    .footer .logo {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #7a3ef3 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      .section {
        page-break-inside: avoid;
      }
      .sequence-card {
        page-break-before: always;
        page-break-inside: avoid;
      }
      .sequence-card:first-child {
        page-break-before: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p class="subtitle">${date}</p>
      <p class="subtitle">${stats.totalSequences} sequence${stats.totalSequences !== 1 ? 's' : ''} analyzed</p>
    </div>
    
    <div class="key-metrics">
      <h2>Key Metrics</h2>
      <ul>
        <li><strong>Total Sequences:</strong> ${stats.totalSequences}</li>
        <li><strong>GC Content:</strong> ${stats.avgGC.toFixed(1)}%</li>
        <li><strong>ORFs Found:</strong> ${stats.totalORFs}</li>
        <li><strong>Total Length:</strong> ${stats.totalLength.toLocaleString()} bp</li>
        <li><strong>Avg Length:</strong> ${stats.avgLength} bp</li>
        <li><strong>Longest:</strong> ${stats.longestSequence.toLocaleString()} bp</li>
        <li><strong>Shortest:</strong> ${stats.shortestSequence} bp</li>
      </ul>
    </div>
    
    <!-- Visual Charts Section -->
    <div class="section">
      <h2 class="section-title">Visual Analysis</h2>
      <div style="display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
        
        <!-- GC/AT Pie Chart -->
        <div style="text-align: center;">
          <h4 style="margin-bottom: 12px; color: #374151; font-size: 14px;">GC/AT Content</h4>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="70" fill="none" stroke="#e5e7eb" stroke-width="30"/>
            <circle cx="90" cy="90" r="70" fill="none" stroke="#8b5cf6" stroke-width="30"
              stroke-dasharray="${stats.avgGC * 4.4} ${(100 - stats.avgGC) * 4.4}"
              stroke-dashoffset="110" transform="rotate(-90 90 90)"/>
            <text x="90" y="85" text-anchor="middle" font-size="24" font-weight="bold" fill="#1f2937">${stats.avgGC.toFixed(1)}%</text>
            <text x="90" y="105" text-anchor="middle" font-size="12" fill="#6b7280">GC Content</text>
          </svg>
          <div style="display: flex; gap: 16px; justify-content: center; margin-top: 8px;">
            <span style="display: flex; align-items: center; gap: 4px; font-size: 12px;"><span style="width: 12px; height: 12px; background: #8b5cf6; border-radius: 2px;"></span> GC</span>
            <span style="display: flex; align-items: center; gap: 4px; font-size: 12px;"><span style="width: 12px; height: 12px; background: #e5e7eb; border-radius: 2px;"></span> AT</span>
          </div>
        </div>
        
        <!-- Nucleotide Distribution Bar Chart -->
        <div style="text-align: center;">
          <h4 style="margin-bottom: 12px; color: #374151; font-size: 14px;">Nucleotide Distribution</h4>
          <svg width="200" height="180" viewBox="0 0 200 180">
            ${(() => {
              const nucleotides = stats.nucleotideCounts || { A: 25, T: 25, G: 25, C: 25 };
              const total = nucleotides.A + nucleotides.T + nucleotides.G + nucleotides.C;
              const percentages = {
                A: total > 0 ? (nucleotides.A / total) * 100 : 25,
                T: total > 0 ? (nucleotides.T / total) * 100 : 25,
                G: total > 0 ? (nucleotides.G / total) * 100 : 25,
                C: total > 0 ? (nucleotides.C / total) * 100 : 25
              };
              const maxPercent = Math.max(...Object.values(percentages));
              const colors = { A: '#3b82f6', T: '#10b981', G: '#f59e0b', C: '#ef4444' };
              let bars = '';
              let x = 20;
              for (const [base, pct] of Object.entries(percentages)) {
                const height = (pct / maxPercent) * 120;
                bars += `<rect x="${x}" y="${150 - height}" width="35" height="${height}" fill="${colors[base]}" rx="4"/>`;
                bars += `<text x="${x + 17}" y="170" text-anchor="middle" font-size="12" font-weight="600" fill="#374151">${base}</text>`;
                bars += `<text x="${x + 17}" y="${145 - height}" text-anchor="middle" font-size="10" fill="#6b7280">${pct.toFixed(1)}%</text>`;
                x += 45;
              }
              return bars;
            })()}
          </svg>
        </div>
        
        <!-- Sequence Length Bar Chart (if multiple sequences) -->
        ${sequences.length > 1 ? `
        <div style="text-align: center;">
          <h4 style="margin-bottom: 12px; color: #374151; font-size: 14px;">Sequence Lengths</h4>
          <svg width="220" height="180" viewBox="0 0 220 180">
            ${(() => {
              const maxLen = Math.max(...sequences.slice(0, 5).map(s => s.sequenceLength || s.length || 0));
              const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];
              let bars = '';
              sequences.slice(0, 5).forEach((seq, i) => {
                const len = seq.sequenceLength || seq.length || 0;
                const height = maxLen > 0 ? (len / maxLen) * 110 : 0;
                const x = 15 + i * 42;
                bars += `<rect x="${x}" y="${145 - height}" width="32" height="${height}" fill="${colors[i]}" rx="4"/>`;
                bars += `<text x="${x + 16}" y="165" text-anchor="middle" font-size="10" fill="#374151">S${i + 1}</text>`;
                bars += `<text x="${x + 16}" y="${140 - height}" text-anchor="middle" font-size="9" fill="#6b7280">${(len / 1000).toFixed(1)}k</text>`;
              });
              return bars;
            })()}
          </svg>
        </div>
        ` : ''}
      </div>
    </div>
    
    ${includeAIAnalysis && overallAIAnalysis ? `
    <div class="section">
      <h2 class="section-title">AI-Generated Summary</h2>
      <div class="ai-summary">
        <p>${overallAIAnalysis}</p>
      </div>
    </div>
    ` : includeAIAnalysis ? `
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
    
    ${sequences.length > 0 ? `
    <div class="section" style="page-break-after: always;">
      <h2 class="individual-title">Individual Sequence Details</h2>
      <p style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px;">Each sequence is displayed on its own page for clarity.</p>
    </div>
    
    ${sequences.map((seq, index) => {
        const seqLength = seq.sequenceLength || seq.length || 0;
        const seqGC = seq.gcPercentage || seq.gcContent || 0;
        const seqOrfs = seq.orfs || [];
        const counts = seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 };
        const aiAnalysis = sequenceAIAnalyses[index];
        
        return `
        <div class="sequence-page" style="page-break-before: always; page-break-after: always; padding: 20px 0;">
        <div class="sequence-card">
          <div class="sequence-header">
            <h4>Sequence ${index + 1} of ${sequences.length}: ${seq.sequenceName || seq.name || seq.header || 'Unnamed'}</h4>
            <div class="meta">Length: ${seqLength.toLocaleString()} bp | GC Content: ${seqGC.toFixed(2)}% | AT Content: ${(100 - seqGC).toFixed(2)}% | ORFs: ${seqOrfs.length}</div>
          </div>
          <div class="sequence-content">
            ${aiAnalysis ? `
            <div class="ai-analysis">
              <p><strong>AI Analysis:</strong> ${aiAnalysis}</p>
            </div>
            ` : ''}
            
            <h5 class="info-section-title">Sequence Information</h5>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="label">Length</div>
                <div class="value">${seqLength} bp</div>
              </div>
              <div class="stat-item">
                <div class="label">GC Content</div>
                <div class="value">${seqGC.toFixed(2)}%</div>
              </div>
              <div class="stat-item">
                <div class="label">AT Content</div>
                <div class="value">${(100 - seqGC).toFixed(2)}%</div>
              </div>
              <div class="stat-item">
                <div class="label">ORF Count</div>
                <div class="value">${seqOrfs.length}</div>
              </div>
            </div>
            
            <h5 class="info-section-title">Detailed Metrics</h5>
            <table class="detailed-metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sequence Length</td>
                  <td>${seqLength.toLocaleString()} bp</td>
                  <td>Total number of base pairs</td>
                </tr>
                <tr>
                  <td>GC Content</td>
                  <td>${seqGC.toFixed(2)}%</td>
                  <td>Percentage of G and C nucleotides</td>
                </tr>
                <tr>
                  <td>AT Content</td>
                  <td>${(100 - seqGC).toFixed(2)}%</td>
                  <td>Percentage of A and T nucleotides</td>
                </tr>
                <tr>
                  <td>GC/AT Ratio</td>
                  <td>${(seqGC / (100 - seqGC)).toFixed(2)}</td>
                  <td>Ratio of GC to AT content</td>
                </tr>
                <tr>
                  <td>Adenine (A)</td>
                  <td>${counts.A} (${((counts.A / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(2)}%)</td>
                  <td>Count and percentage</td>
                </tr>
                <tr>
                  <td>Thymine (T)</td>
                  <td>${counts.T} (${((counts.T / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(2)}%)</td>
                  <td>Count and percentage</td>
                </tr>
                <tr>
                  <td>Guanine (G)</td>
                  <td>${counts.G} (${((counts.G / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(2)}%)</td>
                  <td>Count and percentage</td>
                </tr>
                <tr>
                  <td>Cytosine (C)</td>
                  <td>${counts.C} (${((counts.C / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(2)}%)</td>
                  <td>Count and percentage</td>
                </tr>
                <tr>
                  <td>Total Bases</td>
                  <td>${(counts.A + counts.T + counts.G + counts.C).toLocaleString()}</td>
                  <td>Sum of all nucleotides</td>
                </tr>
                <tr>
                  <td>ORF Count</td>
                  <td>${seqOrfs.length}</td>
                  <td>Number of open reading frames detected</td>
                </tr>
                ${seqOrfs.length > 0 ? `
                <tr>
                  <td>Longest ORF</td>
                  <td>${Math.max(...seqOrfs.map(o => o.length))} bp</td>
                  <td>Length of longest ORF</td>
                </tr>
                <tr>
                  <td>Shortest ORF</td>
                  <td>${Math.min(...seqOrfs.map(o => o.length))} bp</td>
                  <td>Length of shortest ORF</td>
                </tr>
                <tr>
                  <td>Average ORF Length</td>
                  <td>${Math.round(seqOrfs.reduce((sum, o) => sum + o.length, 0) / seqOrfs.length)} bp</td>
                  <td>Mean ORF length</td>
                </tr>
                ` : ''}
                <tr>
                  <td>Purine Count (A+G)</td>
                  <td>${counts.A + counts.G} (${(((counts.A + counts.G) / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(2)}%)</td>
                  <td>Total purines</td>
                </tr>
                <tr>
                  <td>Pyrimidine Count (C+T)</td>
                  <td>${counts.C + counts.T} (${(((counts.C + counts.T) / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(2)}%)</td>
                  <td>Total pyrimidines</td>
                </tr>
                <tr>
                  <td>Melting Temperature (Tm)</td>
                  <td>${seqLength < 14 ? ((counts.A + counts.T) * 2 + (counts.G + counts.C) * 4).toFixed(1) : (64.9 + 41 * (counts.G + counts.C - 16.4) / (counts.A + counts.T + counts.G + counts.C)).toFixed(1)}°C</td>
                  <td>Estimated DNA melting point</td>
                </tr>
              </tbody>
            </table>
            
            <h5 class="info-section-title">Nucleotide Composition</h5>
            <div class="nucleotide-list">
              <p>Adenine (A): ${counts.A} (${((counts.A / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(1)}%)</p>
              <p>Thymine (T): ${counts.T} (${((counts.T / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(1)}%)</p>
              <p>Guanine (G): ${counts.G} (${((counts.G / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(1)}%)</p>
              <p>Cytosine (C): ${counts.C} (${((counts.C / (counts.A + counts.T + counts.G + counts.C)) * 100).toFixed(1)}%)</p>
            </div>
            
            ${seqOrfs.length > 0 ? `
            <h5 class="info-section-title">Open Reading Frames (ORFs)</h5>
            <div class="orf-list">
              ${seqOrfs.slice(0, 3).map((orf, orfIndex) => `
                <p>ORF ${orfIndex + 1}: Position ${orf.start}-${orf.end}, Length: ${orf.length} bp, Frame: ${orf.frame || 2}</p>
              `).join('')}
              ${seqOrfs.length > 3 ? `<p style="color: #6b7280; margin-top: 8px;">... and ${seqOrfs.length - 3} more ORF${seqOrfs.length - 3 > 1 ? 's' : ''}</p>` : ''}
            </div>
            ` : ''}
            
            ${seq.codonFrequency && Object.keys(seq.codonFrequency).length > 0 ? `
            <h5 class="info-section-title">Codon Frequency Analysis</h5>
            <div class="codon-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
              <div class="stat-item">
                <div class="label">Total Codons</div>
                <div class="value">${seq.codonStats?.totalCodons || Object.values(seq.codonFrequency).reduce((sum, d) => sum + d.count, 0)}</div>
              </div>
              <div class="stat-item">
                <div class="label">Unique Codons</div>
                <div class="value">${seq.codonStats?.uniqueCodons || Object.keys(seq.codonFrequency).length}/64</div>
              </div>
              <div class="stat-item">
                <div class="label">Start Codons</div>
                <div class="value">${seq.codonStats?.startCodons || seq.codonFrequency['ATG']?.count || 0}</div>
              </div>
              <div class="stat-item">
                <div class="label">Stop Codons</div>
                <div class="value">${seq.codonStats?.stopCodons || 0}</div>
              </div>
            </div>
            
            <!-- Codon Frequency Bar Chart -->
            <div style="margin: 16px 0;">
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Top 8 Codons Visualization:</p>
              <svg width="100%" height="120" viewBox="0 0 500 120" style="max-width: 500px;">
                ${(() => {
                  const topCodons = Object.entries(seq.codonFrequency)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 8);
                  const maxCount = topCodons[0]?.[1]?.count || 1;
                  const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
                  let bars = '';
                  topCodons.forEach(([codon, data], i) => {
                    const width = (data.count / maxCount) * 320;
                    const y = i * 14;
                    bars += `<text x="0" y="${y + 10}" font-size="10" font-family="monospace" font-weight="600" fill="#7c3aed">${codon}</text>`;
                    bars += `<rect x="35" y="${y}" width="${width}" height="11" fill="${colors[i]}" rx="2"/>`;
                    bars += `<text x="${40 + width}" y="${y + 9}" font-size="9" fill="#6b7280">${data.count} (${data.percentage}%)</text>`;
                  });
                  return bars;
                })()}
              </svg>
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Top 10 Most Frequent Codons:</p>
            <table class="detailed-metrics-table" style="font-size: 11px;">
              <thead>
                <tr>
                  <th>Codon</th>
                  <th>Amino Acid</th>
                  <th>Count</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(seq.codonFrequency)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 10)
                  .map(([codon, data]) => `
                    <tr>
                      <td style="font-family: monospace; font-weight: 600; color: #7c3aed;">${codon}</td>
                      <td>${data.symbol} (${data.aminoAcid})</td>
                      <td>${data.count}</td>
                      <td>${data.percentage}%</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
            ` : ''}
            
            <h5 class="info-section-title">Sequence Quality Assessment</h5>
            <ul style="margin: 0 auto; padding-left: 20px; max-width: 600px; text-align: left;">
              <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${seqGC >= 40 && seqGC <= 60 ? 'Balanced GC content - optimal for most organisms' : seqGC > 60 ? 'High GC content - may indicate thermophilic origin' : 'Low GC content - AT-rich region'}</li>
              <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${seqOrfs.length > 0 ? seqOrfs.length + ' potential protein-coding region' + (seqOrfs.length > 1 ? 's' : '') + ' detected' : 'No protein-coding regions detected'}</li>
              <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${seqLength < 200 ? 'Short sequence (' + seqLength + ' bp) - limited analysis possible' : 'Adequate sequence length for comprehensive analysis'}</li>
            </ul>
          </div>
        </div>
        </div>
        `;
      }).join('')}
    ` : ''}
    
    <div class="footer" style="page-break-before: always;">
      <div class="logo">Symbio-NLM</div>
      <p>Advanced DNA Analysis & Bioinformatics Platform</p>
      <p style="margin-top: 4px; font-size: 11px;">Generated on ${date} • Powered by AI-driven sequence analysis</p>
      <p style="margin-top: 12px; font-size: 12px; color: #9ca3af;">Report contains ${stats.totalSequences} sequence${stats.totalSequences !== 1 ? 's' : ''} • ${stats.totalLength.toLocaleString()} total base pairs</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML content for the report (unchanged for HTML export)
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
            
            ${seq.codonFrequency && Object.keys(seq.codonFrequency).length > 0 ? `
            <h5 class="info-section-title">Codon Frequency Analysis</h5>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px;">
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 11px; color: #6b7280;">Total Codons</div>
                <div style="font-size: 16px; font-weight: 600; color: #7c3aed;">${seq.codonStats?.totalCodons || Object.values(seq.codonFrequency).reduce((sum, d) => sum + d.count, 0)}</div>
              </div>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 11px; color: #6b7280;">Unique Codons</div>
                <div style="font-size: 16px; font-weight: 600; color: #7c3aed;">${seq.codonStats?.uniqueCodons || Object.keys(seq.codonFrequency).length}/64</div>
              </div>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 11px; color: #6b7280;">Start Codons</div>
                <div style="font-size: 16px; font-weight: 600; color: #10b981;">${seq.codonStats?.startCodons || seq.codonFrequency['ATG']?.count || 0}</div>
              </div>
              <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; text-align: center;">
                <div style="font-size: 11px; color: #6b7280;">Stop Codons</div>
                <div style="font-size: 16px; font-weight: 600; color: #ef4444;">${seq.codonStats?.stopCodons || 0}</div>
              </div>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Top 10 Most Frequent Codons:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Codon</th>
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Amino Acid</th>
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Count</th>
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Frequency</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(seq.codonFrequency)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 10)
                  .map(([codon, data]) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace; font-weight: 600; color: #7c3aed;">${codon}</td>
                      <td style="padding: 8px; border: 1px solid #e5e7eb;">${data.symbol} (${data.aminoAcid})</td>
                      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${data.count}</td>
                      <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${data.percentage}%</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
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

