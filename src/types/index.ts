export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  expertise: string[];
  stats: {
    tasksCompleted: number;
    streak: number;
    points: number;
  };
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  comments: Comment[];
  likes: number;
}

export type Page = 'login' | 'home' | 'overview' | 'profile';