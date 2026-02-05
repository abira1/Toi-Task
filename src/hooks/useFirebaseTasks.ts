import { useState, useEffect } from 'react';
import {
  ref,
  push,
  update,
  remove,
  onValue,
  off,
  get
} from 'firebase/database';
import { database } from '../firebase';
import { Task, Comment } from '../types';
import { 
  notifyAllTeamExcept, 
  getUserFCMToken, 
  sendNotificationToUser, 
  getUserName 
} from '../services/notificationService';

export function useFirebaseTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ALL tasks from global Firebase collection
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Reference to GLOBAL tasks collection
      const globalTasksRef = ref(database, 'tasks');

      // Listen to real-time changes
      const unsubscribe = onValue(
        globalTasksRef,
        (snapshot) => {
          try {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const tasksArray: Task[] = Object.entries(data).map(
                ([id, taskData]: [string, any]) => ({
                  id,
                  ...taskData,
                  comments: taskData.comments ? Object.values(taskData.comments) : [],
                  likes: taskData.likes || 0,
                  completed: taskData.completed || false
                })
              );
              // Sort by createdAt in descending order (newest first)
              tasksArray.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setTasks(tasksArray);
            } else {
              setTasks([]);
            }
            setError(null);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error processing tasks';
            setError(errorMessage);
            console.error('Error processing tasks:', err);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          const errorMessage = error.message || 'Failed to load tasks';
          setError(errorMessage);
          console.error('Firebase error:', error);
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
        if (globalTasksRef) {
          off(globalTasksRef);
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error setting up tasks listener';
      setError(errorMessage);
      console.error('Setup error:', err);
      setIsLoading(false);
    }
  }, [userId]);

  // Add a new task to global collection
  const addTask = async (userId: string, text: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const globalTasksRef = ref(database, 'tasks');
      const newTaskRef = push(globalTasksRef);

      const newTask: Task = {
        id: newTaskRef.key || `t${Date.now()}`,
        userId,
        text,
        createdAt: new Date().toISOString(),
        completed: false,
        comments: [],
        likes: 0
      };

      await update(newTaskRef, newTask);
      
      // Send notification to all team members except the creator
      // Fire and forget - don't wait for notification to complete
      (async () => {
        try {
          const userName = await getUserName(userId);
          await notifyAllTeamExcept(
            [userId], // Exclude the creator
            'New Task Created',
            `${userName} Added a New task`,
            { taskId: newTask.id, type: 'task_created' }
          );
        } catch (error) {
          console.error('[Task] Failed to send task creation notification:', error);
          // Don't throw - notifications are non-critical
        }
      })();
      
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setError(errorMessage);
      console.error('Add task error:', err);
      throw err;
    }
  };

  // Toggle task completion (only for task owner)
  const toggleTaskCompletion = async (taskId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `tasks/${taskId}`);
      const snapshot = await get(taskRef);

      if (snapshot.exists()) {
        const currentTask = snapshot.val();
        
        // Check if current user is the task owner
        if (currentTask.userId !== userId) {
          setError('You can only complete your own tasks');
          return;
        }

        const newCompletionStatus = !currentTask.completed;

        await update(taskRef, {
          completed: newCompletionStatus,
          completedAt: newCompletionStatus ? new Date().toISOString() : null
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Toggle completion error:', err);
      throw err;
    }
  };

  // Delete a task (only owner)
  const deleteTask = async (taskId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `tasks/${taskId}`);
      const snapshot = await get(taskRef);

      if (snapshot.exists()) {
        const currentTask = snapshot.val();
        
        // Check if current user is the task owner
        if (currentTask.userId !== userId) {
          setError('You can only delete your own tasks');
          return;
        }

        await remove(taskRef);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      console.error('Delete task error:', err);
      throw err;
    }
  };

  // Add a comment to ANY task (all users can comment on all tasks)
  const addComment = async (taskId: string, userId: string, text: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const commentsRef = ref(database, `tasks/${taskId}/comments`);
      const newCommentRef = push(commentsRef);

      const newComment: Comment = {
        id: newCommentRef.key || `c${Date.now()}`,
        taskId,
        userId,
        text: text,
        createdAt: new Date().toISOString()
      };

      await update(newCommentRef, newComment);
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      console.error('Add comment error:', err);
      throw err;
    }
  };

  // Delete a comment (only owner)
  const deleteComment = async (taskId: string, commentId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const commentRef = ref(database, `tasks/${taskId}/comments/${commentId}`);
      await remove(commentRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      console.error('Delete comment error:', err);
      throw err;
    }
  };

  // Like a task (anyone can like)
  const likeTask = async (taskId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `tasks/${taskId}`);
      const snapshot = await get(taskRef);

      if (snapshot.exists()) {
        const currentTask = snapshot.val();
        const currentLikes = currentTask.likes || 0;

        await update(taskRef, {
          likes: currentLikes + 1
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like task';
      setError(errorMessage);
      console.error('Like task error:', err);
      throw err;
    }
  };

  // Update task text (only owner)
  const updateTask = async (taskId: string, newText: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `tasks/${taskId}`);
      const snapshot = await get(taskRef);

      if (snapshot.exists()) {
        const currentTask = snapshot.val();
        
        // Check if current user is the task owner
        if (currentTask.userId !== userId) {
          setError('You can only edit your own tasks');
          return;
        }

        await update(taskRef, {
          text: newText
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Update task error:', err);
      throw err;
    }
  };

  // Get all tasks across all users (for team view) - Now just returns the tasks we already have
  const getAllTeamTasks = async (): Promise<Task[]> => {
    return tasks;
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    toggleTaskCompletion,
    deleteTask,
    addComment,
    deleteComment,
    likeTask,
    updateTask,
    getAllTeamTasks
  };
}
