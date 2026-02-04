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

export function useFirebaseTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from Firebase Realtime Database
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userTasksRef = ref(database, `users/${userId}/tasks`);

      // Listen to real-time changes
      const unsubscribe = onValue(
        userTasksRef,
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
        if (userTasksRef) {
          off(userTasksRef);
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error setting up tasks listener';
      setError(errorMessage);
      console.error('Setup error:', err);
      setIsLoading(false);
    }
  }, [userId]);

  // Add a new task
  const addTask = async (text: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const userTasksRef = ref(database, `users/${userId}/tasks`);
      const newTaskRef = push(userTasksRef);

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
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setError(errorMessage);
      console.error('Add task error:', err);
      throw err;
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
      const snapshot = await get(taskRef);

      if (snapshot.exists()) {
        const currentTask = snapshot.val();
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

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
      await remove(taskRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      console.error('Delete task error:', err);
      throw err;
    }
  };

  // Add a comment to a task
  const addComment = async (taskId: string, commentText: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const commentsRef = ref(database, `users/${userId}/tasks/${taskId}/comments`);
      const newCommentRef = push(commentsRef);

      const newComment: Comment = {
        id: newCommentRef.key || `c${Date.now()}`,
        taskId,
        userId,
        text: commentText,
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

  // Delete a comment
  const deleteComment = async (taskId: string, commentId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const commentRef = ref(
        database,
        `users/${userId}/tasks/${taskId}/comments/${commentId}`
      );
      await remove(commentRef);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      console.error('Delete comment error:', err);
      throw err;
    }
  };

  // Like a task
  const likeTask = async (taskId: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
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

  // Update task text
  const updateTask = async (taskId: string, newText: string) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      setError(null);
      const taskRef = ref(database, `users/${userId}/tasks/${taskId}`);
      await update(taskRef, {
        text: newText
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Update task error:', err);
      throw err;
    }
  };

  // Get all tasks across all users (for team view)
  const getAllTeamTasks = async (userIds: string[]): Promise<Task[]> => {
    try {
      setError(null);
      const allTasks: Task[] = [];

      for (const uid of userIds) {
        const userTasksRef = ref(database, `users/${uid}/tasks`);
        const snapshot = await get(userTasksRef);

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
          allTasks.push(...tasksArray);
        }
      }

      // Sort by createdAt in descending order
      allTasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return allTasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load team tasks';
      setError(errorMessage);
      console.error('Get team tasks error:', err);
      return [];
    }
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
