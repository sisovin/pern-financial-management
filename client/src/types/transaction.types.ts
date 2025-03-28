export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

export interface Filters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  category: string;
}
