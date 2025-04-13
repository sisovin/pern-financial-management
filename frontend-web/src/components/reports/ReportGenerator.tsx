import React, { useState } from 'react';
import { useReports } from '../../hooks/useReports';
import ChartComponents from './ChartComponents';

const ReportGenerator = () => {
  const { generateReport } = useReports();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    const data = await generateReport();
    setReportData(data);
    setLoading(false);
  };

  return (
    <div>
      <h1>Report Generator</h1>
      <button onClick={handleGenerateReport} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
      {reportData && <ChartComponents data={reportData} options={{ responsive: true }} />}
    </div>
  );
};

export default ReportGenerator;
