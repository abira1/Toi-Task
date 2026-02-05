import React, { useState } from 'react';
import { User, Task } from '../types';
import { AddTaskForm } from '../components/AddTaskForm';
import { TaskCard } from '../components/TaskCard';
import { Squiggle } from '../components/IllustrationElements';

interface HomePageProps {
  currentUser: User;
  tasks: Task[];
  teamMembers: User[];
  addTask: (userId: string, text: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  addComment: (taskId: string, userId: string, text: string) => Promise<void>;
  likeTask: (taskId: string) => Promise<void>;
}

export function HomePage({
  currentUser,
  tasks,
  teamMembers,
  addTask,
  toggleTaskCompletion,
  addComment,
  likeTask
}: HomePageProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Filter for today's tasks only
  const todayTasks = tasks.filter((t) => {
    const date = new Date(t.createdAt);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  // Sort: Incomplete first, then by creation time (newest first)
  const sortedTodayTasks = [...todayTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  const handleAddTask = async (text: string) => {
    try {
      setIsAddingTask(true);
      await addTask(currentUser.id, text);
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6 sm:mb-8 relative">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--black)] mb-1 sm:mb-2">
          Team Task Feed
        </h1>
        <p className="text-base sm:text-xl text-gray-500 font-medium">
          {totalCount > 0
            ? `${completedCount}/${totalCount} team tasks completed today! 💪`
            : "Let's make it happen! 💪"}
        </p>
        <Squiggle className="absolute -top-4 sm:-top-6 right-0 w-20 sm:w-32 text-[var(--mustard)] transform rotate-6 hidden sm:block" />
      </header>

      <AddTaskForm
        onAdd={handleAddTask}
        userAvatar={currentUser.avatar}
        isLoading={isAddingTask}
      />

      <div className="space-y-4 sm:space-y-6">
        {sortedTodayTasks.length > 0 ? (
          sortedTodayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={currentUser.id}
              teamMembers={teamMembers}
              onToggleComplete={toggleTaskCompletion}
              onAddComment={(taskId, text) => addComment(taskId, currentUser.id, text)}
              onLike={likeTask}
            />
          ))
        ) : (
          <div className="text-center py-10 sm:py-12 bg-white/50 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-dashed border-gray-200">
            <p className="text-2xl mb-2">🤷‍♂️</p>
            <h3 className="text-lg sm:text-xl font-bold text-gray-400">
              No tasks yet today
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Be the first to kick things off!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}