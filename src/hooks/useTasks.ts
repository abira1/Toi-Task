import { useFirebaseTasks } from './useFirebaseTasks';
import { Task } from '../types';

// Backward compatibility wrapper
export function useTasks(userId?: string) {
  const {
    tasks,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    addComment,
    deleteComment,
    likeTask,
    updateTask,
    isLoading,
    error
  } = useFirebaseTasks(userId);

  // Wrapper functions to maintain legacy API
  const addTaskLegacy = (userId: string, text: string) => {
    return addTask(text);
  };

  const addCommentLegacy = (taskId: string, userId: string, text: string) => {
    return addComment(taskId, text);
  };

  const setTasksData = (tasksData: Task[]) => {
    // This is now handled automatically by Firebase listener
    console.log('setTasksData is deprecated - data is automatically synced from Firebase');
  };

  return {
    tasks,
    addTask: addTaskLegacy,
    toggleTaskCompletion,
    deleteTask,
    addComment: addCommentLegacy,
    deleteComment,
    likeTask,
    updateTask,
    setTasksData,
    isLoading,
    error
  };
}