import { useState, useEffect } from 'react';
import goalService from '../services/goalService';
import { Goal, CreateGoal, UpdateGoal } from '../types/goal.types';

const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const data = await goalService.getGoals();
        setGoals(data);
      } catch (err) {
        setError('Failed to fetch goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const createGoal = async (goal: CreateGoal) => {
    setLoading(true);
    try {
      const newGoal = await goalService.createGoal(goal);
      setGoals((prevGoals) => [...prevGoals, newGoal]);
    } catch (err) {
      setError('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, goal: UpdateGoal) => {
    setLoading(true);
    try {
      const updatedGoal = await goalService.updateGoal(id, goal);
      setGoals((prevGoals) =>
        prevGoals.map((g) => (g.id === id ? updatedGoal : g))
      );
    } catch (err) {
      setError('Failed to update goal');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    setLoading(true);
    try {
      await goalService.deleteGoal(id);
      setGoals((prevGoals) => prevGoals.filter((g) => g.id !== id));
    } catch (err) {
      setError('Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
  };
};

export default useGoals;
