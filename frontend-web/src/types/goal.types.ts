export interface Goal {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  saved: number;
}

export interface CreateGoal {
  title: string;
  amount: number;
  deadline: string;
}

export interface UpdateGoal {
  title?: string;
  amount?: number;
  deadline?: string;
  saved?: number;
}
