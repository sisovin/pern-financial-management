import { useState, useEffect } from 'react';
import { generateReport, fetchReportData, saveReport, deleteReport } from '../services/reportService';
import { Report, ReportFilter, ReportGenerationOptions } from '../types/report.types';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReportData();
      setReports(data);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (options: ReportGenerationOptions) => {
    setLoading(true);
    try {
      const newReport = await generateReport(options);
      setReports([...reports, newReport]);
    } catch (err) {
      setError('Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId: string, reportData: Partial<Report>) => {
    setLoading(true);
    try {
      const updatedReport = await saveReport(reportId, reportData);
      setReports(reports.map(report => (report.id === reportId ? updatedReport : report)));
    } catch (err) {
      setError('Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  const removeReport = async (reportId: string) => {
    setLoading(true);
    try {
      await deleteReport(reportId);
      setReports(reports.filter(report => report.id !== reportId));
    } catch (err) {
      setError('Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    removeReport,
  };
};
