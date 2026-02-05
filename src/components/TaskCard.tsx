import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, Heart, X } from 'lucide-react';
import { Task, User } from '../types';
import { CommentSection } from './CommentSection';
import { Checkbox } from './ui/Checkbox';
import { Sparkles } from './IllustrationElements';
interface TaskCardProps {
  task: Task;
  currentUserId: string;
  teamMembers: User[];
  onToggleComplete: (taskId: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  onLike: (taskId: string) => void;
}
export function TaskCard({
  task,
  currentUserId,
  teamMembers,
  onToggleComplete,
  onAddComment,
  onLike
}: TaskCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  
  // Try to find author by ID first, then fallback to Firebase UID for backward compatibility
  const author = teamMembers.find((u) => u.id === task.userId) || 
                 teamMembers.find((u) => u.firebaseUid === task.userId);
  
  // Log for debugging
  useEffect(() => {
    if (!author && task.userId) {
      console.log('TaskCard: Could not find author for task', {
        taskId: task.id,
        taskUserId: task.userId,
        availableMembers: teamMembers.map(m => ({ id: m.id, firebaseUid: m.firebaseUid, email: m.email }))
      });
    }
  }, [author, task.userId, task.id, teamMembers]);
  
  const isOwnTask = task.userId === currentUserId;
  // Check if text is truncated
  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [task.text]);
  const handleComplete = () => {
    if (!task.completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
    onToggleComplete(task.id);
  };
  // Default avatar if author not found
  const authorAvatar =
  author?.avatar ||
  'https://ui-avatars.com/api/?name=Unknown&background=9ca3af&color=fff';
  const authorName = author?.name || 'Unknown User';
  return (
    <>
      <div
        className={`
          relative group transition-all duration-300
          bg-white border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl p-3 sm:p-5
          shadow-[3px_3px_0px_0px_var(--black)] sm:shadow-[4px_4px_0px_0px_var(--black)]
          hover:shadow-[4px_4px_0px_0px_var(--teal)] sm:hover:shadow-[8px_8px_0px_0px_var(--teal)] hover:-translate-y-1
          ${task.completed ? 'opacity-75 bg-gray-50' : ''}
        `}>

        {isAnimating && <Sparkles className="absolute -top-4 -right-4 z-20" />}

        <div className="flex items-start gap-3 sm:gap-4">
          {/* Author Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--black)] object-cover" />

            <div
              className={`
                absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-[var(--black)]
                ${task.completed ? 'bg-green-500' : 'bg-[var(--mustard)]'}
              `} />

          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[var(--black)] text-xs sm:text-sm mb-1">
                  {authorName}
                  <span className="text-gray-400 font-normal ml-1 sm:ml-2 text-xs">
                    {new Date(task.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </h3>
                <p
                  ref={textRef}
                  className={`
                    text-base sm:text-lg font-medium text-[var(--black-soft)] leading-snug break-words
                    line-clamp-3
                    ${task.completed ? 'line-through decoration-2 sm:decoration-4 decoration-[var(--teal)] text-gray-400' : ''}
                  `}>

                  {task.text}
                </p>
                {isTruncated &&
                <button
                  onClick={() => setShowFullText(true)}
                  className="text-[var(--teal)] font-bold text-sm mt-1 hover:underline active:scale-95 transition-all">

                    Read more
                  </button>
                }
              </div>

              {isOwnTask &&
              <div className="flex-shrink-0">
                  <Checkbox
                  checked={task.completed}
                  onChange={handleComplete}
                  className="w-6 h-6 border-2 border-[var(--black)] rounded-md data-[state=checked]:bg-[var(--teal)] data-[state=checked]:text-white" />

                </div>
              }
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3 sm:mt-4">
              {!isOwnTask &&
              <button
                onClick={() => onLike(task.id)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--coral)] active:scale-95 transition-all">

                  <Heart
                  className={`w-5 h-5 ${task.likes > 0 ? 'fill-[var(--coral)] text-[var(--coral)]' : ''}`} />

                  <span className="font-bold text-sm">{task.likes || ''}</span>
                </button>
              }

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--teal)] active:scale-95 transition-all">

                <MessageSquare className="w-5 h-5" />
                <span className="font-bold text-sm">
                  {task.comments.length > 0 ? task.comments.length : 'Comment'}
                </span>
              </button>
            </div>

            {/* Comments */}
            <CommentSection
              comments={task.comments}
              teamMembers={teamMembers}
              onAddComment={(text) => onAddComment(task.id, text)}
              isOpen={showComments} />

          </div>
        </div>
      </div>

      {/* Full Text Modal */}
      {showFullText &&
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={() => setShowFullText(false)}>

          <div
          className="bg-white border-4 border-[var(--black)] rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-[8px_8px_0px_0px_var(--black)] animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}>

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full border-2 border-[var(--black)] object-cover" />

                <div>
                  <h3 className="font-bold text-[var(--black)] text-sm">
                    {authorName}
                  </h3>
                  <span className="text-gray-400 text-xs">
                    {new Date(task.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
              onClick={() => setShowFullText(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all">

                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p
            className={`text-base sm:text-lg font-medium text-[var(--black-soft)] leading-relaxed ${task.completed ? 'line-through text-gray-400' : ''}`}>

              {task.text}
            </p>
          </div>
        </div>
      }
    </>);

}