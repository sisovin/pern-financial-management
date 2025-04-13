import api from './api';

interface Goal {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  saved: number;
}

const goalService = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get('/goals');
    return response.data;
  },

  getGoalById: async (id: string): Promise<Goal> => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  createGoal: async (goal: Omit<Goal, 'id' | 'saved'>): Promise<Goal> => {
    const response = await api.post('/goals', goal);
    return response.data;
  },

  updateGoal: async (id: string, goal: Partial<Omit<Goal, 'id'>>): Promise<Goal> => {
    const response = await api.put(`/goals/${id}`, goal);
    return response.data;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },
};

export default goalService;
