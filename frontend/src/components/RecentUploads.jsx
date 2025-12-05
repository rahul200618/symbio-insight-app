import { Icons } from './Icons';
import { useState } from 'react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function RecentUploads({ onFileSelect }) {
  // Helper to generate mock sequence data
  const generateMockData = (count, fileName) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `seq_${i}`,
      sequenceName: `${fileName}_seq_${i + 1}`,
      sequenceLength: Math.floor(Math.random() * 1000) + 100,
      gcPercentage: Math.floor(Math.random() * 40) + 30,
      nucleotideCounts: {
        A: Math.floor(Math.random() * 100),
        T: Math.floor(Math.random() * 100),
        G: Math.floor(Math.random() * 100),
        C: Math.floor(Math.random() * 100),
      },
      orfs: Array.from({ length: Math.floor(Math.random() * 3) }, () => ({
        start: 0,
        end: 100,
        length: 100,
        sequence: 'ATGC'
      })),
      rawSequence: 'ATGC'.repeat(20),
      timestamp: new Date().toISOString(),
    }));
  };

  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'genome_sequence_01.fasta',
      sequences: 245,
      date: 'Nov 27, 2024 14:32',
      size: '2.4 MB',
      data: generateMockData(245, 'genome_sequence_01')
    },
    {
      id: '2',
      name: 'protein_coding_regions.fa',
      sequences: 189,
      date: 'Nov 27, 2024 09:15',
      size: '1.8 MB',
      data: generateMockData(189, 'protein_coding_regions')
    },
    {
      id: '3',
      name: 'mitochondrial_dna_analysis.fasta',
      sequences: 156,
      date: 'Nov 26, 2024 16:45',
      size: '956 KB',
      data: generateMockData(156, 'mitochondrial_dna_analysis')
    },
    {
      id: '4',
      name: 'viral_genome_complete.fa',
      sequences: 312,
      date: 'Nov 26, 2024 11:20',
      size: '3.7 MB',
      data: generateMockData(312, 'viral_genome_complete')
    },
    {
      id: '5',
      name: 'bacterial_plasmid_seq.fasta',
      sequences: 98,
      date: 'Nov 25, 2024 13:08',
      size: '1.5 MB',
      data: generateMockData(98, 'bacterial_plasmid_seq')
    },
    {
      id: '6',
      name: 'chromosomal_region_22.fa',
      sequences: 421,
      date: 'Nov 25, 2024 08:55',
      size: '5.2 MB',
      data: generateMockData(421, 'chromosomal_region_22')
    },
  ]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleViewReport = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDelete = (file, e) => {
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    // Remove from local state
    setFiles(files.filter(f => f.id !== file.id));
  };

  const handleDownload = (file, e) => {
    e.stopPropagation();

    // Generate FASTA content
    let fastaContent = '';

    if (file.data && file.data.length > 0) {
      file.data.forEach((seq) => {
        fastaContent += `>${seq.sequenceName}\n`;
        fastaContent += `${seq.rawSequence}\n\n`;
      });
    } else {
      fastaContent = `>Sample sequence\nATGCGATCGATCGATCG\n`;
    }

    // Create download
    const blob = new Blob([fastaContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' });

      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(124, 58, 237); // Purple color
      doc.text('Symbio-NLM - Recent Uploads Report', 14, 22);

      // Add generation date
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

      // Add summary stats
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Total Files: ${files.length}`, 14, 40);
      const totalSequences = files.reduce((sum, file) => sum + file.sequences, 0);
      doc.text(`Total Sequences: ${totalSequences}`, 14, 47);

      // Prepare table data
      const tableData = files.map(file => [
        file.name,
        file.sequences.toString(),
        file.date,
        file.size
      ]);

      // Add table
      doc.autoTable({
        head: [['File Name', 'Sequences', 'Upload Date', 'File Size']],
        body: tableData,
        startY: 55,
        theme: 'grid',
        headStyles: {
          fillColor: [124, 58, 237], // Purple color
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 45 },
          3: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 14, right: 14 }
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`symbio-nlm-uploads-${new Date().getTime()}.pdf`);

      toast.success('PDF exported successfully!', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF', { id: 'pdf-export' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Recent Uploads</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your uploaded sequences</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Files</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{files.length} total uploads</p>
          </div>
          <button onClick={handleExportAll} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
            <Icons.Download className="w-4 h-4" />
            Export All to PDF
          </button>
        </div>

        {files.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sequences</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {files.map((file, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleViewReport(file)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Icons.DNA className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">FASTA file</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-purple-50/50 dark:bg-purple-900/30 border border-purple-100/50 dark:border-purple-800/50 rounded-lg">
                          <span className="text-sm text-gray-900 dark:text-white">{file.sequences}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">sequences</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{file.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{file.size}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReport(file);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-lg hover:shadow-md transition-all flex items-center gap-2"
                        >
                          <Icons.Eye className="w-3 h-3 text-white" />
                          View Report
                        </button>
                        <button
                          onClick={(e) => handleDownload(file, e)}
                          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                        >
                          <Icons.Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(file, e)}
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-all"
                        >
                          <Icons.Trash className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Icons.File className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
