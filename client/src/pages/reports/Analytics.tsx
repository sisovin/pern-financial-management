import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const data = {
    labels: ['Income', 'Expenses', 'Savings'],
    datasets: [
      {
        label: 'Amount',
        data: [1200, 800, 400],
        backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Analytics',
      },
    },
  };

  return (
    <div className="analytics">
      <h1>Financial Analytics</h1>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Analytics;
