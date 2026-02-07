import { Icons } from './Icons';
import { Logo } from './Logo';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatWithAI } from '../utils/aiService.js';
import { BarChart, PieChart } from './Charts.jsx';
import { extractMetadata, parseFastaFile } from '../utils/fastaParser.js';

// Mini chart components for chatbot
function MiniBarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value)) || 100;
  return (
    <div className="w-full h-24 flex items-end justify-between gap-1 px-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center h-full justify-end">
            <div 
              className="w-full rounded-t transition-all" 
              style={{ 
                backgroundColor: item.color, 
                height: `${height}%`,
                minHeight: item.value > 0 ? '4px' : '0px'
              }} 
            />
            <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">{item.name}</p>
          </div>
        );
      })}
    </div>
  );
}

function MiniPieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentAngle = 0;
  
  const slices = data.map((item) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle, percentage };
  });

  const createArcPath = (startAngle, angle) => {
    const endAngle = startAngle + angle;
    const start = polarToCartesian(50, 50, 40, startAngle);
    const end = polarToCartesian(50, 50, 40, endAngle);
    const largeArc = angle > 180 ? 1 : 0;
    return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        {slices.map((slice, i) => (
          <path key={i} d={createArcPath(slice.startAngle, slice.angle)} fill={slice.color} />
        ))}
      </svg>
      <div className="flex flex-col gap-0.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600 dark:text-gray-300">{item.name}: {item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonChart({ sequences }) {
  const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const data = sequences.slice(0, 6).map((seq, i) => ({
    name: (seq.sequenceName || seq.name || `Seq ${i+1}`).slice(0, 8),
    value: seq.gcPercentage || seq.gcContent || seq.gcPercent || 0,
    color: colors[i % colors.length]
  }));
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-medium">GC Content Comparison</p>
      <MiniBarChart data={data} />
    </div>
  );
}

function LengthDistributionChart({ sequences }) {
  const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const maxLen = Math.max(...sequences.map(s => s.sequenceLength || s.length || 0));
  const data = sequences.slice(0, 6).map((seq, i) => ({
    name: (seq.sequenceName || seq.name || `Seq ${i+1}`).slice(0, 8),
    value: ((seq.sequenceLength || seq.length || 0) / maxLen) * 100,
    color: colors[i % colors.length]
  }));
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-medium">Sequence Length Distribution</p>
      <MiniBarChart data={data} />
    </div>
  );
}

// Mini Codon Frequency Chart for chatbot
function MiniCodonChart({ codonFrequency, maxItems = 6 }) {
  if (!codonFrequency) return null;
  
  const topCodons = Object.entries(codonFrequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, maxItems);
  
  const maxCount = topCodons[0]?.[1]?.count || 1;
  const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-2">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-medium">🧬 Top Codons</p>
      <div className="space-y-1.5">
        {topCodons.map(([codon, data], i) => (
          <div key={codon} className="flex items-center gap-2 text-xs">
            <span className="w-10 font-mono text-purple-600 dark:text-purple-400 font-medium">{codon}</span>
            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ 
                  width: `${(data.count / maxCount) * 100}%`,
                  backgroundColor: colors[i % colors.length]
                }}
              />
            </div>
            <span className="w-6 text-right text-gray-600 dark:text-gray-400 font-medium">{data.count}</span>
            <span className="w-10 text-gray-400 text-[10px]">{data.aminoAcid}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-[10px] text-gray-500">
        <span>Total: {Object.values(codonFrequency).reduce((sum, d) => sum + d.count, 0)} codons</span>
        <span>{Object.keys(codonFrequency).length} unique</span>
      </div>
    </div>
  );
}

export function ChatbotAssistant({ sequences, currentView, onGenerateReport, onUploadClick, onSequenceInput }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Available actions the chatbot can perform
  const actions = {
    navigateTo: (page) => {
      navigate(`/${page}`);
      addAssistantMessage(`I've navigated you to the ${page} page. ${getPageHelp(page)}`);
    },
    generateReport: () => {
      if (onGenerateReport) {
        onGenerateReport();
        addAssistantMessage("I'm generating your PDF report now! It will include AI-powered analysis for each sequence.");
      } else {
        navigate('/report');
        addAssistantMessage("I've taken you to the Report page. Click 'Download PDF Report' to generate your comprehensive analysis.");
      }
    },
    showUploadGuide: () => {
      addAssistantMessage(`📁 **How to Upload a FASTA File:**

1. Go to the Dashboard page
2. Click the "Upload" button or drag & drop your file
3. Select a .fasta, .fa, or .fna file
4. Wait for parsing to complete
5. Your sequences will appear for analysis!

**Supported formats:** FASTA (.fasta, .fa, .fna)
**Tip:** Files can contain multiple sequences!`);
    },
    explainCurrentPage: () => {
      const explanation = getPageExplanation(currentView);
      addAssistantMessage(explanation);
    },
    analyzeSequences: () => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("You haven't uploaded any sequences yet. Would you like me to guide you through the upload process?");
        return;
      }
      const analysis = generateQuickAnalysis(sequences);
      addAssistantMessage(analysis);
    },
    suggestNextSteps: () => {
      const suggestions = getNextStepSuggestions(sequences, currentView);
      addAssistantMessage(suggestions);
    },
    // Chart generation actions
    showNucleotideChart: () => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("Upload sequences first to see nucleotide distribution charts.");
        return;
      }
      const firstSeq = sequences[0];
      const counts = firstSeq.nucleotideCounts || {};
      const total = Object.values(counts).reduce((sum, v) => sum + v, 0) || 1;
      const chartData = [
        { name: 'A', value: ((counts.A || 0) / total) * 100, color: '#22c55e' },
        { name: 'T', value: ((counts.T || 0) / total) * 100, color: '#ef4444' },
        { name: 'G', value: ((counts.G || 0) / total) * 100, color: '#3b82f6' },
        { name: 'C', value: ((counts.C || 0) / total) * 100, color: '#f59e0b' },
      ];
      addAssistantMessage("📊 **Nucleotide Distribution**\n\nHere's the nucleotide breakdown for your first sequence:", null, { type: 'pie', data: chartData });
    },
    showGCChart: () => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("Upload sequences first to see GC content comparison.");
        return;
      }
      addAssistantMessage("📊 **GC Content Comparison**\n\nComparing GC content across your sequences:", null, { type: 'gc-comparison', sequences });
    },
    showLengthChart: () => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("Upload sequences first to see length distribution.");
        return;
      }
      addAssistantMessage("📊 **Sequence Length Distribution**\n\nComparing sequence lengths:", null, { type: 'length-distribution', sequences });
    },
    showSequenceOverview: () => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("Upload sequences first to see the overview.");
        return;
      }
      const avgGC = sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || s.gcPercent || 0), 0) / sequences.length;
      const chartData = [
        { name: 'GC', value: avgGC, color: '#8b5cf6' },
        { name: 'AT', value: 100 - avgGC, color: '#6366f1' },
      ];
      addAssistantMessage(`📊 **Sequence Overview**\n\nYou have ${sequences.length} sequence(s) with an average GC/AT ratio:`, null, { type: 'pie', data: chartData });
    },
    showCodonChart: (seqIndex = 0) => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("Upload sequences first to see codon frequency analysis.");
        return;
      }
      const seq = sequences[seqIndex] || sequences[0];
      const codonFreq = seq.codonFrequency;
      const codonStats = seq.codonStats;
      
      if (!codonFreq || Object.keys(codonFreq).length === 0) {
        addAssistantMessage(`⚠️ **No Codon Data Available**\n\nCodon frequency analysis requires a coding DNA sequence. The sequence "${seq.sequenceName || 'Selected'}" may be too short or doesn't contain valid codons.\n\n*Tip: Sequences should be at least 3 nucleotides long for codon analysis.*`);
        return;
      }
      
      // Get top codons for summary
      const topCodons = Object.entries(codonFreq)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
      
      // Group by amino acid
      const aaGroups = {};
      Object.entries(codonFreq).forEach(([codon, data]) => {
        const aa = data.aminoAcid;
        if (!aaGroups[aa]) aaGroups[aa] = { total: 0, codons: [] };
        aaGroups[aa].total += data.count;
        aaGroups[aa].codons.push(codon);
      });
      
      const topAAs = Object.entries(aaGroups)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5);
      
      let message = `🧬 **Codon Frequency Analysis**\n\n`;
      message += `**Sequence:** ${seq.sequenceName || 'Sequence ' + (seqIndex + 1)}\n\n`;
      message += `📊 **Statistics:**\n`;
      message += `• Total Codons: ${codonStats?.totalCodons || 'N/A'}\n`;
      message += `• Unique Codons: ${codonStats?.uniqueCodons || Object.keys(codonFreq).length}\n`;
      message += `• Start Codons (ATG): ${codonStats?.startCodons || codonFreq['ATG']?.count || 0}\n`;
      message += `• Stop Codons: ${codonStats?.stopCodons || 0}\n\n`;
      
      message += `🔝 **Top 5 Codons:**\n`;
      topCodons.forEach(([codon, data], i) => {
        message += `${i + 1}. \`${codon}\` → ${data.symbol} (${data.aminoAcid}) - ${data.count} (${data.percentage}%)\n`;
      });
      
      message += `\n🧪 **Most Frequent Amino Acids:**\n`;
      topAAs.forEach(([aa, data], i) => {
        if (aa !== 'Stop') {
          message += `${i + 1}. ${aa}: ${data.total} codons (${data.codons.slice(0, 3).join(', ')}${data.codons.length > 3 ? '...' : ''})\n`;
        }
      });
      
      addAssistantMessage(message, null, { type: 'codon-chart', codonFrequency: codonFreq, sequenceName: seq.sequenceName });
    },
    explainCodonUsage: () => {
      const message = `🧬 **Understanding Codon Frequency**\n\n**What are Codons?**
Codons are triplets of nucleotides (3 letters) that encode amino acids during translation. There are 64 possible codons, coding for 20 amino acids plus stop signals.\n\n**Why is Codon Frequency Important?**
• **Codon Bias:** Different organisms prefer certain codons over others
• **Expression Optimization:** Understanding bias helps optimize gene expression
• **Evolutionary Studies:** Codon usage patterns reveal evolutionary relationships\n\n**Key Codons:**
• \`ATG\` - Start codon (Methionine)
• \`TAA\`, \`TAG\`, \`TGA\` - Stop codons\n\n**Amino Acid Types:**
🔵 Nonpolar: Hydrophobic (Ala, Val, Leu, etc.)
🟢 Polar: Hydrophilic (Ser, Thr, Asn, etc.)
🔴 Positive: Basic (Lys, Arg, His)
🟡 Negative: Acidic (Asp, Glu)\n\n*Use "show codon chart" to visualize your sequence's codon distribution!*`;
      addAssistantMessage(message);
    },
    identifySpecies: async () => {
      if (!sequences || sequences.length === 0) {
        addAssistantMessage("Upload sequences first to identify potential species/organism.");
        return;
      }
      
      // Analyze sequence characteristics
      const seq = sequences[0];
      const gcContent = seq.gcPercentage || seq.gcContent || seq.gcPercent || 0;
      const length = seq.sequenceLength || seq.length || 0;
      const orfs = seq.orfs?.length || 0;
      const counts = seq.nucleotideCounts || { A: 0, T: 0, G: 0, C: 0 };
      const total = counts.A + counts.T + counts.G + counts.C;
      const atSkew = total > 0 ? ((counts.A - counts.T) / (counts.A + counts.T)).toFixed(3) : 0;
      const gcSkew = total > 0 ? ((counts.G - counts.C) / (counts.G + counts.C)).toFixed(3) : 0;
      
      // Predict organism based on GC content patterns
      let speciesPrediction = '';
      let genomeType = '';
      let confidence = 'Low';
      
      if (gcContent < 30) {
        speciesPrediction = 'Plasmodium (Malaria parasite), Mycoplasma, or AT-rich parasites';
        genomeType = 'AT-rich parasitic/symbiotic organism';
        confidence = 'Medium';
      } else if (gcContent >= 30 && gcContent < 40) {
        speciesPrediction = 'Bacillus subtilis, Staphylococcus aureus, or mammalian mitochondrial DNA';
        genomeType = 'Low-GC Gram-positive bacteria or organelle';
        confidence = 'Medium';
      } else if (gcContent >= 40 && gcContent < 50) {
        speciesPrediction = 'Escherichia coli, Saccharomyces cerevisiae (yeast), or human genomic DNA';
        genomeType = 'Moderate-GC bacterium or eukaryote';
        confidence = 'Medium-High';
      } else if (gcContent >= 50 && gcContent < 60) {
        speciesPrediction = 'Pseudomonas, Drosophila melanogaster, or plant chloroplast DNA';
        genomeType = 'Moderate-to-high GC organism';
        confidence = 'Medium';
      } else if (gcContent >= 60 && gcContent < 70) {
        speciesPrediction = 'Streptomyces, Micrococcus, or Actinobacteria';
        genomeType = 'High-GC Gram-positive bacteria';
        confidence = 'Medium-High';
      } else {
        speciesPrediction = 'Streptomyces coelicolor, Thermus thermophilus (thermophile)';
        genomeType = 'Very high-GC thermophilic or actinobacterial';
        confidence = 'Medium';
      }
      
      // Check for viral patterns
      if (length < 10000 && orfs <= 5) {
        speciesPrediction += ', or viral genome fragment';
      }
      
      let message = `🧬 **Species/Genome Identification**\n\n`;
      message += `**Sequence:** ${seq.sequenceName || 'Analyzed Sequence'}\n`;
      message += `**Length:** ${length.toLocaleString()} bp\n\n`;
      
      message += `📊 **Composition Analysis:**\n`;
      message += `• GC Content: ${gcContent.toFixed(2)}%\n`;
      message += `• AT Content: ${(100 - gcContent).toFixed(2)}%\n`;
      message += `• AT Skew: ${atSkew}\n`;
      message += `• GC Skew: ${gcSkew}\n`;
      message += `• ORFs Detected: ${orfs}\n\n`;
      
      message += `🔬 **Predicted Organism(s):**\n`;
      message += `${speciesPrediction}\n\n`;
      
      message += `🧫 **Genome Type:**\n${genomeType}\n\n`;
      
      message += `📈 **Confidence:** ${confidence}\n\n`;
      
      message += `💡 **Note:** This prediction is based on GC content patterns and sequence characteristics. For accurate identification, use BLAST against NCBI databases or specialized tools like Kraken2 for metagenomic classification.\n\n`;
      
      message += `*Want to learn more? Try asking about RCSB PDB for protein structures!*`;
      
      const actionButtons = [
        { label: '🔍 Search NCBI BLAST', action: () => window.open('https://blast.ncbi.nlm.nih.gov/Blast.cgi', '_blank') },
        { label: '📊 Show GC Chart', action: () => actions.showGCChart() },
      ];
      
      addAssistantMessage(message, actionButtons);
    },
    parseSequenceInput: (inputText) => {
      try {
        // Check if it looks like FASTA format
        if (inputText.includes('>')) {
          const parsedSeqs = parseFastaFile(inputText);
          if (parsedSeqs.length > 0) {
            // Call the callback to update sequences in parent
            if (onSequenceInput) {
              onSequenceInput(parsedSeqs);
            }
            
            const seq = parsedSeqs[0];
            let message = `✅ **Sequence Parsed Successfully!**\n\n`;
            message += `📋 **Name:** ${seq.sequenceName}\n`;
            message += `📏 **Length:** ${seq.sequenceLength} bp\n`;
            message += `🧬 **GC Content:** ${seq.gcPercentage?.toFixed(2)}%\n`;
            message += `🔬 **ORFs Found:** ${seq.orfs?.length || 0}\n`;
            message += `🧪 **Total Codons:** ${seq.codonStats?.totalCodons || 0}\n\n`;
            
            if (seq.codonFrequency && Object.keys(seq.codonFrequency).length > 0) {
              const topCodons = Object.entries(seq.codonFrequency)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5);
              message += `**Top Codons:** ${topCodons.map(([c, d]) => `${c}(${d.count})`).join(', ')}\n\n`;
            }
            
            message += `*Sequence loaded! Go to Metadata page to see full analysis including codon frequency.*`;
            
            const actionButtons = [
              { label: '💾 Save as .fasta', action: () => actions.downloadAsFasta(parsedSeqs) },
              { label: '📋 Go to Metadata', action: () => actions.navigateTo('metadata') },
            ];
            
            addAssistantMessage(message, actionButtons, parsedSeqs.length > 0 ? { type: 'codon-chart', codonFrequency: seq.codonFrequency, sequenceName: seq.sequenceName } : null);
            return true;
          }
        } else {
          // Try parsing as raw sequence (no header)
          const cleanSeq = inputText.replace(/\s/g, '').toUpperCase();
          if (/^[ATGCNU]+$/i.test(cleanSeq) && cleanSeq.length >= 3) {
            const seq = extractMetadata('User Input Sequence', cleanSeq);
            
            if (onSequenceInput) {
              onSequenceInput([seq]);
            }
            
            let message = `✅ **Raw Sequence Parsed!**\n\n`;
            message += `📏 **Length:** ${seq.sequenceLength} bp\n`;
            message += `🧬 **GC Content:** ${seq.gcPercentage?.toFixed(2)}%\n`;
            message += `🔬 **ORFs Found:** ${seq.orfs?.length || 0}\n`;
            message += `🧪 **Total Codons:** ${seq.codonStats?.totalCodons || 0}\n\n`;
            
            message += `*Sequence loaded! Go to Metadata page to see full analysis.*`;
            
            const actionButtons = [
              { label: '💾 Save as .fasta', action: () => actions.downloadAsFasta([seq]) },
              { label: '📋 Go to Metadata', action: () => actions.navigateTo('metadata') },
            ];
            
            addAssistantMessage(message, actionButtons, seq.codonFrequency ? { type: 'codon-chart', codonFrequency: seq.codonFrequency, sequenceName: 'User Input' } : null);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error parsing sequence:', error);
        return false;
      }
    },
    downloadAsFasta: (seqs) => {
      const targetSeqs = seqs || sequences;
      if (!targetSeqs || targetSeqs.length === 0) {
        addAssistantMessage("❌ No sequences available to download. Please upload or paste a sequence first.");
        return;
      }
      
      let fastaContent = '';
      targetSeqs.forEach(seq => {
        const header = seq.sequenceName || seq.name || 'Sequence';
        const rawSeq = seq.rawSequence || '';
        // Format sequence with 80 characters per line
        const formattedSeq = rawSeq.match(/.{1,80}/g)?.join('\n') || rawSeq;
        fastaContent += `>${header}\n${formattedSeq}\n`;
      });
      
      const blob = new Blob([fastaContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sequences_${Date.now()}.fasta`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addAssistantMessage(`✅ **Downloaded ${targetSeqs.length} sequence(s) as .fasta file!**`);
    }
  };

  const getPageHelp = (page) => {
    const help = {
      dashboard: "Here you can upload files and see an overview of your analysis.",
      metadata: "View detailed statistics and metrics for each sequence.",
      report: "Generate comprehensive PDF or HTML reports with AI insights.",
      recent: "Access your previously uploaded files and analyses.",
      profile: "Manage your account settings and preferences."
    };
    return help[page] || "";
  };

  const getPageExplanation = (view) => {
    const explanations = {
      dashboard: `📊 **Dashboard Page**

You're on the main dashboard where you can:
• Upload new FASTA files
• See quick statistics
• Access recent analyses
• Navigate to detailed views

**Quick Actions:**
- Drag & drop a file to upload
- Click on any card to explore more`,
      metadata: `📋 **Metadata Page**

Here you can see detailed metrics for your ${sequences?.length || 0} sequence(s):
• Sequence length and composition
• GC/AT content percentages
• Nucleotide distribution
• Open Reading Frames (ORFs)
• Detailed metrics tables

**Tip:** Use the search bar to filter sequences!`,
      report: `📄 **Report Page**

Generate comprehensive analysis reports:
• PDF with AI-powered insights
• HTML for web viewing
• Detailed per-sequence analysis
• Export options available

**Click "Download PDF Report" to generate!**`,
      recent: `🕒 **Recent Uploads**

View and manage your previously uploaded files:
• Click any file to reload it
• See upload history
• Compare different analyses`
    };
    return explanations[view] || "I can help you navigate and use this page. What would you like to know?";
  };

  const generateQuickAnalysis = (seqs) => {
    const count = seqs.length;
    const totalBp = seqs.reduce((sum, s) => sum + (s.sequenceLength || s.length || 0), 0);
    const avgGC = seqs.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || s.gcPercent || 0), 0) / count;
    const totalORFs = seqs.reduce((sum, s) => sum + (s.orfs?.length || 0), 0);
    
    let analysis = `🧬 **Quick Sequence Analysis**

**Overview:**
• ${count} sequence${count > 1 ? 's' : ''} loaded
• Total: ${totalBp.toLocaleString()} base pairs
• Average GC: ${avgGC.toFixed(1)}%
• Total ORFs: ${totalORFs}

**Interpretation:**
`;
    
    if (avgGC < 40) {
      analysis += "• Low GC content suggests AT-rich genome (possibly parasites or certain fungi)\n";
    } else if (avgGC > 60) {
      analysis += "• High GC content typical of bacteria like Streptomyces\n";
    } else {
      analysis += "• Moderate GC content typical of most organisms\n";
    }
    
    if (totalORFs > 0) {
      analysis += `• ${totalORFs} ORF${totalORFs > 1 ? 's' : ''} detected - potential protein-coding regions\n`;
    }
    
    analysis += "\n**Would you like me to:**\n• Generate a detailed report?\n• Explain specific metrics?\n• Navigate to another page?";
    
    return analysis;
  };

  const getNextStepSuggestions = (seqs, view) => {
    if (!seqs || seqs.length === 0) {
      return `🎯 **Suggested Next Steps:**

1. **Upload a FASTA file** - Start by uploading your sequence data
2. **Explore sample data** - Try our demo sequences to learn the interface

Would you like me to show you how to upload a file?`;
    }
    
    const suggestions = {
      dashboard: `🎯 **Suggested Next Steps:**

1. ➡️ **View Metadata** - See detailed stats for your ${seqs.length} sequence(s)
2. 📊 **Generate Report** - Create AI-powered PDF analysis
3. 🔍 **Compare Sequences** - Analyze differences between sequences

Which would you like to do?`,
      metadata: `🎯 **Suggested Next Steps:**

1. 📄 **Generate PDF Report** - Export comprehensive analysis
2. 🧬 **Analyze ORFs** - Study protein-coding potential
3. 🔬 **BLAST Search** - Find similar sequences online

Shall I take you to the Report page?`,
      report: `🎯 **Suggested Next Steps:**

1. 📥 **Download PDF** - Get your complete analysis report
2. 🌐 **Export HTML** - Generate web-viewable report
3. 📋 **Review Metadata** - Go back to detailed metrics

Ready to generate your report?`,
      recent: `🎯 **Suggested Next Steps:**

1. 📂 **Select a file** - Click any file to analyze it
2. ➕ **Upload new** - Add more sequences to analyze
3. 📊 **Compare files** - Analyze differences

Which file would you like to explore?`
    };
    
    return suggestions[view] || suggestions.dashboard;
  };

  const addAssistantMessage = (content, actionButtons = null, chart = null) => {
    const message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      actionButtons,
      chart
    };
    setMessages(prev => [...prev, message]);
  };
  
  // Generate context-aware initial message
  const getContextualGreeting = () => {
    if (!sequences || sequences.length === 0) {
      return "Hi! I'm your DNA Analysis Assistant. Upload a FASTA file to get started, and I'll help you understand your sequences, identify their type (DNA/RNA/Protein), predict species, and guide you through the analysis process!";
    }
    
    const seqCount = sequences.length;
    const avgLength = sequences.reduce((sum, s) => sum + (s.sequenceLength || s.length || 0), 0) / seqCount;
    const avgGC = sequences.reduce((sum, s) => sum + (s.gcPercentage || s.gcContent || s.gcPercent || 0), 0) / seqCount;
    
    let greeting = `Hi! I'm analyzing your ${seqCount} sequence${seqCount > 1 ? 's' : ''}. `;
    greeting += `Average length: ${Math.round(avgLength)} bp, GC content: ${avgGC.toFixed(1)}%. `;
    
    if (currentView === 'metadata') {
      greeting += "You're viewing metadata. I can explain any metrics or suggest what to analyze next!";
    } else if (currentView === 'report') {
      greeting += "You're on the report page. Ready to generate a comprehensive analysis report!";
    } else if (currentView === 'recent') {
      greeting += "Viewing recent uploads. Need help comparing or selecting sequences?";
    } else {
      greeting += "What would you like to know about your sequences?";
    }
    
    return greeting;
  };

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const savedHistory = localStorage.getItem('symbio-chat-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (e) {
      console.log('Could not load chat history');
    }
    return [{
      id: '1',
      role: 'assistant',
      content: getContextualGreeting(),
      timestamp: new Date(),
    }];
  };
  
  const [messages, setMessages] = useState(loadChatHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Draggable and resizable state
  const [position, setPosition] = useState({ x: null, y: null }); // null means default position
  const [size, setSize] = useState({ width: 384, height: 600 }); // Default w-96 = 384px
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (isFullscreen) return;
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isFullscreen) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      // Keep within viewport bounds
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
    if (isResizing && !isFullscreen) {
      const rect = chatRef.current?.getBoundingClientRect();
      if (rect) {
        const newWidth = Math.max(320, Math.min(800, e.clientX - rect.left));
        const newHeight = Math.max(400, Math.min(900, e.clientY - rect.top));
        setSize({ width: newWidth, height: newHeight });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add global mouse listeners for drag and resize
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, size]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the greeting
      try {
        // Only save last 50 messages to prevent localStorage overflow
        const toSave = messages.slice(-50).map(msg => ({
          ...msg,
          actionButtons: undefined, // Don't serialize functions
          chart: undefined, // Don't serialize chart data
        }));
        localStorage.setItem('symbio-chat-history', JSON.stringify(toSave));
      } catch (e) {
        console.log('Could not save chat history');
      }
    }
  }, [messages]);

  // Clear chat history
  const clearChatHistory = () => {
    localStorage.removeItem('symbio-chat-history');
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: getContextualGreeting(),
      timestamp: new Date(),
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Detect action requests in user message
  const detectAndExecuteAction = (msg) => {
    const lowerMsg = msg.toLowerCase();
    
    // Check for FASTA sequence input (starts with > or looks like raw sequence)
    if (msg.includes('>') || /^[ATGCNU\s]+$/i.test(msg.trim())) {
      const trimmedMsg = msg.trim();
      // Check if it looks like a sequence (has enough nucleotides)
      const nucleotideCount = (trimmedMsg.match(/[ATGCNU]/gi) || []).length;
      if (nucleotideCount >= 10) {
        if (actions.parseSequenceInput(trimmedMsg)) {
          return true;
        }
      }
    }
    
    // Navigation requests
    if (lowerMsg.includes('go to') || lowerMsg.includes('take me to') || lowerMsg.includes('navigate to') || lowerMsg.includes('open')) {
      if (lowerMsg.includes('dashboard') || lowerMsg.includes('home')) {
        actions.navigateTo('dashboard');
        return true;
      }
      if (lowerMsg.includes('metadata') || lowerMsg.includes('stats') || lowerMsg.includes('statistics')) {
        actions.navigateTo('metadata');
        return true;
      }
      if (lowerMsg.includes('report')) {
        actions.navigateTo('report');
        return true;
      }
      if (lowerMsg.includes('recent') || lowerMsg.includes('history') || lowerMsg.includes('uploads')) {
        actions.navigateTo('recent');
        return true;
      }
      if (lowerMsg.includes('profile') || lowerMsg.includes('settings') || lowerMsg.includes('account')) {
        actions.navigateTo('profile');
        return true;
      }
    }
    
    // Report generation
    if ((lowerMsg.includes('generate') || lowerMsg.includes('create') || lowerMsg.includes('make') || lowerMsg.includes('download')) && 
        (lowerMsg.includes('report') || lowerMsg.includes('pdf'))) {
      actions.generateReport();
      return true;
    }
    
    // Upload help
    if ((lowerMsg.includes('how') || lowerMsg.includes('help')) && 
        (lowerMsg.includes('upload') || lowerMsg.includes('file'))) {
      actions.showUploadGuide();
      return true;
    }
    
    // Page explanation
    if ((lowerMsg.includes('what') || lowerMsg.includes('explain') || lowerMsg.includes('help')) && 
        (lowerMsg.includes('this page') || lowerMsg.includes('here') || lowerMsg.includes('this section'))) {
      actions.explainCurrentPage();
      return true;
    }
    
    // Analyze request
    if ((lowerMsg.includes('analyze') || lowerMsg.includes('analyse') || lowerMsg.includes('summary')) && 
        (lowerMsg.includes('sequence') || lowerMsg.includes('data') || lowerMsg.includes('file'))) {
      actions.analyzeSequences();
      return true;
    }
    
    // Next steps
    if (lowerMsg.includes('next') || lowerMsg.includes('what should') || lowerMsg.includes('suggest') || lowerMsg.includes('recommend')) {
      actions.suggestNextSteps();
      return true;
    }
    
    // Chart/visualization requests
    if (lowerMsg.includes('chart') || lowerMsg.includes('graph') || lowerMsg.includes('visual') || lowerMsg.includes('plot') || lowerMsg.includes('show me')) {
      if (lowerMsg.includes('nucleotide') || lowerMsg.includes('atgc') || lowerMsg.includes('base')) {
        actions.showNucleotideChart();
        return true;
      }
      if (lowerMsg.includes('gc') || lowerMsg.includes('content') || lowerMsg.includes('compar')) {
        actions.showGCChart();
        return true;
      }
      if (lowerMsg.includes('length') || lowerMsg.includes('size') || lowerMsg.includes('distribution')) {
        actions.showLengthChart();
        return true;
      }
      if (lowerMsg.includes('overview') || lowerMsg.includes('summary')) {
        actions.showSequenceOverview();
        return true;
      }
      if (lowerMsg.includes('codon') || lowerMsg.includes('amino') || lowerMsg.includes('translation')) {
        actions.showCodonChart();
        return true;
      }
      // Default: show overview
      actions.showSequenceOverview();
      return true;
    }
    
    // Direct visualization keywords
    if (lowerMsg.includes('pie chart') || lowerMsg.includes('pie')) {
      actions.showNucleotideChart();
      return true;
    }
    if (lowerMsg.includes('bar chart') || lowerMsg.includes('bar graph')) {
      actions.showGCChart();
      return true;
    }
    
    // Codon-related requests
    if (lowerMsg.includes('codon') || lowerMsg.includes('amino acid') || lowerMsg.includes('translation')) {
      if (lowerMsg.includes('what') || lowerMsg.includes('explain') || lowerMsg.includes('how') || lowerMsg.includes('understand')) {
        actions.explainCodonUsage();
        return true;
      }
      if (lowerMsg.includes('show') || lowerMsg.includes('analyze') || lowerMsg.includes('frequency') || lowerMsg.includes('chart') || lowerMsg.includes('distribution')) {
        actions.showCodonChart();
        return true;
      }
      // Default: show chart if sequences available, otherwise explain
      if (sequences && sequences.length > 0) {
        actions.showCodonChart();
      } else {
        actions.explainCodonUsage();
      }
      return true;
    }
    
    // Species/Organism identification requests
    if (lowerMsg.includes('species') || lowerMsg.includes('organism') || lowerMsg.includes('what is this') || 
        lowerMsg.includes('identify') || lowerMsg.includes('genome type') || lowerMsg.includes('what kind') ||
        (lowerMsg.includes('what') && (lowerMsg.includes('genome') || lowerMsg.includes('dna') || lowerMsg.includes('from')))) {
      actions.identifySpecies();
      return true;
    }
    
    return false;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    
    // Check for action commands first
    if (detectAndExecuteAction(userInput)) {
      return; // Action was handled locally
    }
    
    setIsLoading(true);

    try {
      const response = await chatWithAI(userInput, { sequences, currentView });
      
      // Check if AI response suggests an action
      const actionButtons = detectSuggestedActions(response);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actionButtons
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Detect if AI response suggests actions and return buttons
  const detectSuggestedActions = (response) => {
    const lowerResponse = response.toLowerCase();
    const buttons = [];
    
    if (lowerResponse.includes('metadata') && currentView !== 'metadata') {
      buttons.push({ label: '📋 Go to Metadata', action: () => actions.navigateTo('metadata') });
    }
    if (lowerResponse.includes('report') && currentView !== 'report') {
      buttons.push({ label: '📄 Go to Report', action: () => actions.navigateTo('report') });
    }
    if (lowerResponse.includes('pdf') || lowerResponse.includes('generate')) {
      buttons.push({ label: '📥 Generate PDF', action: () => actions.generateReport() });
    }
    if (lowerResponse.includes('upload') && (!sequences || sequences.length === 0)) {
      buttons.push({ label: '📁 How to Upload', action: () => actions.showUploadGuide() });
    }
    
    return buttons.length > 0 ? buttons : null;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick actions based on context
  const quickActions = sequences && sequences.length > 0 ? [
    { label: "📊 Analyze sequences", action: () => actions.analyzeSequences() },
    { label: "🔬 Identify species", action: () => actions.identifySpecies() },
    { label: "📉 Nucleotide chart", action: () => actions.showNucleotideChart() },
    { label: "📈 GC comparison", action: () => actions.showGCChart() },
    { label: "🧬 Codon frequency", action: () => actions.showCodonChart() },
    { label: "💾 Save as .fasta", action: () => actions.downloadAsFasta() },
    { label: "📄 Generate report", action: () => actions.generateReport() },
  ] : [
    { label: "📁 How to upload", action: () => actions.showUploadGuide() },
    { label: "📝 Paste sequence", action: () => setInput(">Sample_Sequence\nATGCGTATCGATCGTACGATCGTAGCTAGCTAGCGATCGATAGCTAGCTACGATCGATCGTAA") },
    { label: "❓ What can you do?", action: () => setInput("What can you help me with?") },
    { label: "🧬 What are codons?", action: () => actions.explainCodonUsage() },
    { label: "📋 Go to Metadata", action: () => actions.navigateTo('metadata') },
  ];

  const quickQuestions = sequences && sequences.length > 0 ? [
    "What species is this?",
    "Show me a pie chart",
    "Compare GC content",
    "What should I analyze next?",
  ] : [
    "How do I upload a file?",
    "What file formats are supported?",
    "What analysis can I perform?",
    "How do I interpret results?",
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 rounded-full shadow-lg hover:shadow-2xl transition-all flex items-center justify-center text-white group hover:scale-105 z-50"
          title="Open DNA Assistant"
        >
          {/* Animated pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 animate-ping opacity-20" />

          {/* DNA Helix Logo */}
          <div className="relative z-10 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:rotate-180 transition-transform duration-700 ease-in-out"
            >
              <path d="M12 4 Q8 12, 12 20 Q16 28, 12 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M28 4 Q32 12, 28 20 Q24 28, 28 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
              <line x1="12" y1="10" x2="28" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="12" y1="30" x2="28" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <circle cx="20" cy="10" r="1.5" fill="white" />
              <circle cx="20" cy="20" r="1.5" fill="white" />
              <circle cx="20" cy="30" r="1.5" fill="white" />
            </svg>
          </div>

          {/* Active status indicator with glow */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg z-20">
            <span className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatRef}
          className={`fixed bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-800 transition-colors duration-300 ${isDragging ? 'cursor-grabbing select-none' : ''}`}
          style={isFullscreen ? {
            inset: '16px'
          } : {
            left: position.x !== null ? `${position.x}px` : 'auto',
            top: position.y !== null ? `${position.y}px` : 'auto',
            right: position.x === null ? '24px' : 'auto',
            bottom: position.y === null ? '24px' : 'auto',
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        >
          {/* Header - Draggable */}
          <div 
            className={`p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl flex items-center justify-between ${!isFullscreen ? 'cursor-grab' : ''}`}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 4 Q8 12, 12 20 Q16 28, 12 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M28 4 Q32 12, 28 20 Q24 28, 28 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <line x1="12" y1="10" x2="28" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="12" y1="30" x2="28" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <circle cx="20" cy="10" r="1.5" fill="white" />
                  <circle cx="20" cy="20" r="1.5" fill="white" />
                  <circle cx="20" cy="30" r="1.5" fill="white" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">DNA Assistant</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Online • {messages.length} messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* History Toggle Button */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`w-8 h-8 rounded-full ${showHistory ? 'bg-white/40' : 'bg-white/20'} hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group`}
                title={showHistory ? "Hide chat history" : "Show chat history"}
              >
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {/* Clear History Button */}
              <button
                onClick={clearChatHistory}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group"
                title="Clear chat history"
              >
                <Icons.Trash className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </button>
              {/* Fullscreen Toggle Button */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all group"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v4m0-4h4m6 0l5-5m0 0v4m0-4h-4m0 16l5 5m0 0v-4m0 4h-4M4 15l5 5m0 0v-4m0 4H5" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5h-4m4 0v-4m0 4l-5-5" />
                  </svg>
                )}
              </button>
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:rotate-90 duration-300 group"
                title="Close chat"
              >
                <Icons.X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Chat History Info Bar */}
          {showHistory && (
            <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/30 border-b border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Chat History</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {messages.length} messages • Last saved {messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
                        clearChatHistory();
                        setShowHistory(false);
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Inline Chart */}
                    {message.chart && (
                      <div className="mt-3">
                        {message.chart.type === 'pie' && (
                          <MiniPieChart data={message.chart.data} />
                        )}
                        {message.chart.type === 'bar' && (
                          <MiniBarChart data={message.chart.data} />
                        )}
                        {message.chart.type === 'gc-comparison' && (
                          <ComparisonChart sequences={message.chart.sequences} />
                        )}
                        {message.chart.type === 'length-distribution' && (
                          <LengthDistributionChart sequences={message.chart.sequences} />
                        )}
                        {message.chart.type === 'codon-chart' && (
                          <MiniCodonChart codonFrequency={message.chart.codonFrequency} maxItems={8} />
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  {message.actionButtons && message.actionButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={btn.action}
                          className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg transition-all border border-purple-200 dark:border-purple-700 hover:scale-105"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

{/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium">⚡ Quick Actions:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg transition-all border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 hover:scale-105 hover:shadow-sm"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Or ask a question:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="px-3 py-1 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full transition-all border border-gray-200 dark:border-gray-600"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything or say 'go to report'..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.Upload className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
              Try: "Go to metadata" • "Generate report" • "Analyze my sequences"
            </p>
          </div>
          
          {/* Resize Handle - only visible when not fullscreen */}
          {!isFullscreen && (
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize group"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsResizing(true);
              }}
            >
              <svg 
                className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-purple-500 transition-colors" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM22 14H20V12H22V14ZM18 18H16V16H18V18ZM14 22H12V20H14V22Z" />
              </svg>
            </div>
          )}
        </div>
      )}
      
    </>
  );
}

