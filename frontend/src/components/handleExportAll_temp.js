const handleExportAll = () => {
    try {
        toast.loading('Preparing PDF...', { id: 'pdf-export' });

        // Create HTML content for printing
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Symbio-NLM - Recent Uploads Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #7c3aed; margin-bottom: 10px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #7c3aed; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Symbio-NLM - Recent Uploads Report</h1>
          <div class="meta">
            Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}<br>
            Total Files: ${files.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Length (bp)</th>
                <th>GC %</th>
                <th>ORFs</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              ${files.map(file => `
                <tr>
                  <td>${file.name}</td>
                  <td>${file.backendData?.length || 'N/A'}</td>
                  <td>${file.backendData?.gcContent?.toFixed(1) || 'N/A'}%</td>
                  <td>${file.backendData?.orfCount || 0}</td>
                  <td>${file.date}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

        // Open in new window and trigger print
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to export PDF', { id: 'pdf-export' });
            return;
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Trigger print dialog after content loads
        setTimeout(() => {
            printWindow.print();
            toast.success('Print dialog opened - choose "Save as PDF"', { id: 'pdf-export' });
        }, 500);

    } catch (error) {
        console.error('Export error:', error);
        toast.error('Export failed: ' + error.message, { id: 'pdf-export' });
    }
};
