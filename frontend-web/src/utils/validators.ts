export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
};

export const validateTransactionAmount = (amount: number): boolean => {
  return amount > 0;
};

export const validateTransactionDate = (date: string): boolean => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  return re.test(date);
};

export const validateGoalAmount = (amount: number): boolean => {
  return amount > 0;
};

export const validateGoalDeadline = (deadline: string): boolean => {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  return re.test(deadline);
};
