import React, { useState } from 'react';

interface FilterCriteria {
  category?: string;
  dateRange?: { 
    startDate?: string; 
    endDate?: string; 
  };
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionFilterProps {
  onFilter: (filters: FilterCriteria) => void;
}

const TransactionFilter: React.FC<TransactionFilterProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    category: '',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    minAmount: undefined,
    maxAmount: undefined
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name]: value
        }
      }));
    } else if (name === 'minAmount' || name === 'maxAmount') {
      setFilters(prev => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      dateRange: {
        startDate: '',
        endDate: ''
      },
      minAmount: undefined,
      maxAmount: undefined
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="filter-controls">
      <div className="form-control">
        <label htmlFor="category" className="form-label">Category</label>
        <select
          id="category"
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">All Categories</option>
          <option value="Income">Income</option>
          <option value="Food">Food</option>
          <option value="Transportation">Transportation</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Utilities">Utilities</option>
          <option value="Housing">Housing</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="form-control">
        <label htmlFor="startDate" className="form-label">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={filters.dateRange?.startDate || ''}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      <div className="form-control">
        <label htmlFor="endDate" className="form-label">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={filters.dateRange?.endDate || ''}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      
      <div className="form-control">
        <label htmlFor="minAmount" className="form-label">Min Amount</label>
        <input
          type="number"
          id="minAmount"
          name="minAmount"
          value={filters.minAmount || ''}
          onChange={handleChange}
          className="form-input"
          step="0.01"
          min="0"
        />
      </div>
      
      <div className="form-control">
        <label htmlFor="maxAmount" className="form-label">Max Amount</label>
        <input
          type="number"
          id="maxAmount"
          name="maxAmount"
          value={filters.maxAmount || ''}
          onChange={handleChange}
          className="form-input"
          step="0.01"
          min="0"
        />
      </div>
      
      <div className="flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary">Apply Filters</button>
        <button type="button" onClick={handleReset} className="btn btn-secondary">Reset</button>
      </div>
    </form>
  );
};

export default TransactionFilter;