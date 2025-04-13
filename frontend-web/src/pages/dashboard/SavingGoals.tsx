import React from 'react';
import GoalForm from '../../components/goals/GoalForm';
import GoalProgress from '../../components/goals/GoalProgress';
import useGoals from '../../hooks/useGoals';

const SavingGoals: React.FC = () => {
  const { goals, createGoal, updateGoal, deleteGoal } = useGoals();

  const handleCreateGoal = (goal: { title: string; amount: number; deadline: string }) => {
    createGoal(goal);
  };

  return (
    <div>
      <h1>Saving Goals</h1>
      <GoalForm onSubmit={handleCreateGoal} />
      <div>
        {goals.map((goal) => (
          <GoalProgress
            key={goal.id}
            title={goal.title}
            amount={goal.amount}
            saved={goal.saved}
            deadline={goal.deadline}
          />
        ))}
      </div>
    </div>
  );
};

export default SavingGoals;
