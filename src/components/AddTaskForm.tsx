import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddTaskFormProps {
  onAdd: (text: string) => void;
  userAvatar: string;
  isLoading?: boolean;
  error?: string | null;
}

export function AddTaskForm({ onAdd, userAvatar, isLoading = false, error = null }: AddTaskFormProps) {
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      return;
    }

    try {
      setLocalError(null);
      await onAdd(text);
      setText('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task';
      setLocalError(errorMessage);
      console.error('Add task error:', err);
    }
  };

  const displayError = error || localError;

  return (
    <>
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{displayError}</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_var(--mustard)] sm:shadow-[8px_8px_0px_0px_var(--mustard)] transition-transform hover:-translate-y-1 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <img
            src={userAvatar}
            alt="You"
            className="w-10 h-10 rounded-full border-2 border-[var(--black)] hidden sm:block flex-shrink-0"
          />

          <div className="flex-1">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's the mission today?"
              className="w-full text-base sm:text-lg font-medium border-none focus:ring-0 placeholder:text-gray-400"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] border-2 border-[var(--black)] rounded-xl px-4 sm:px-6 py-2.5 sm:py-2 font-bold shadow-[3px_3px_0px_0px_var(--black)] sm:shadow-[4px_4px_0px_0px_var(--black)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center disabled:opacity-50">
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                <span className="hidden sm:inline">Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Add Task</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}