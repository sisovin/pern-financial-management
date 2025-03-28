import React from 'react';

interface GoalProgressProps {
  title: string;
  amount: number;
  saved: number;
  deadline: string;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ title, amount, saved, deadline }) => {
  const progress = (saved / amount) * 100;

  return (
    <div>
      <h3>{title}</h3>
      <p>Amount: ${amount}</p>
      <p>Saved: ${saved}</p>
      <p>Deadline: {deadline}</p>
      <div style={{ width: '100%', backgroundColor: '#e0e0e0' }}>
        <div
          style={{
            width: `${progress}%`,
            backgroundColor: progress >= 100 ? 'green' : 'blue',
            height: '24px',
          }}
        />
      </div>
      <p>{progress.toFixed(2)}% completed</p>
    </div>
  );
};

export default GoalProgress;
