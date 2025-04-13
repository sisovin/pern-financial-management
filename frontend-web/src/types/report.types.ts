export interface Report {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  data: any;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  type?: string;
}

export interface ReportGenerationOptions {
  includeCharts: boolean;
  includeTables: boolean;
  includeSummary: boolean;
}
