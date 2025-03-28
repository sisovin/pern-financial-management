import React, { useState, useEffect } from 'react';
import { useReports } from '../../hooks/useReports';
import ChartComponents from '../../components/reports/ChartComponents';
import ReportGenerator from '../../components/reports/ReportGenerator';

const Analytics = () => {
  const { reports, loading, error, createReport, updateReport, removeReport } = useReports();
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (reports.length > 0) {
      setSelectedReport(reports[0]);
    }
  }, [reports]);

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  return (
    <div>
      <h1>Analytics</h1>
      {loading && <p>Loading reports...</p>}
      {error && <p>{error}</p>}
      <ReportGenerator />
      <div>
        <h2>Saved Reports</h2>
        <ul>
          {reports.map((report) => (
            <li key={report.id} onClick={() => handleSelectReport(report)}>
              {report.title}
            </li>
          ))}
        </ul>
      </div>
      {selectedReport && (
        <div>
          <h2>Report Details</h2>
          <p>{selectedReport.description}</p>
          <ChartComponents data={selectedReport.data} options={{ responsive: true }} />
        </div>
      )}
    </div>
  );
};

export default Analytics;
