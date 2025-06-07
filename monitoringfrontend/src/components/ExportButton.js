import React from 'react';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

/**
 * ExportButton for exporting reports as PDF or CSV.
 * Props:
 * - mapRef: ref to map container (for snapshot)
 * - metrics: object
 * - weights: object
 */
const ExportButton = ({ mapRef, metrics, weights }) => {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Business Location Suitability Report', 10, 10);
    doc.text('Metrics:', 10, 20);
    Object.entries(metrics).forEach(([k, v], i) => {
      doc.text(`${k}: ${v}`, 10, 30 + i * 10);
    });
    doc.text('Weights:', 10, 60);
    Object.entries(weights).forEach(([k, v], i) => {
      doc.text(`${k}: ${v}`, 10, 70 + i * 10);
    });
    // TODO: Add map snapshot if possible
    doc.save('suitability_report.pdf');
  };

  const handleExportCSV = () => {
    let csv = 'Metric,Value\n';
    Object.entries(metrics).forEach(([k, v]) => {
      csv += `${k},${v}\n`;
    });
    csv += '\nWeight,Value\n';
    Object.entries(weights).forEach(([k, v]) => {
      csv += `${k},${v}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'suitability_report.csv');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportPDF}
        className="px-3 py-1 text-xs font-medium rounded bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-blue-400 transition-colors"
        aria-label="Export as PDF"
        style={{ fontFamily: 'inherit' }}
      >
        Export PDF
      </button>
      <button
        onClick={handleExportCSV}
        className="px-3 py-1 text-xs font-medium rounded bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-blue-400 transition-colors"
        aria-label="Export as CSV"
        style={{ fontFamily: 'inherit' }}
      >
        Export CSV
      </button>
    </div>
  );
};

export default ExportButton; 