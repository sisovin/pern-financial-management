import React from 'react';
import { reports } from '../../services/reports';
import jsPDF from 'jspdf';

const PDF = () => {
  const handleDownload = async () => {
    try {
      const pdfData = await reports.generatePDFReport();
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'financial_report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }
  };

  return (
    <div className="pdf-report">
      <h1>Generate PDF Report</h1>
      <button onClick={handleDownload}>Download PDF</button>
    </div>
  );
};

export default PDF;
