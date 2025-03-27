import React from 'react';
import { reports } from '../../services/reports';
import { saveAs } from 'file-saver';

const CSV = () => {
  const handleDownload = async () => {
    try {
      const csvData = await reports.generateCSVReport();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'financial_report.csv');
    } catch (error) {
      console.error('Error generating CSV report:', error);
    }
  };

  return (
    <div className="csv-report">
      <h1>Generate CSV Report</h1>
      <button onClick={handleDownload}>Download CSV</button>
    </div>
  );
};

export default CSV;
