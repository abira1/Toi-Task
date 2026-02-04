import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Comment, User } from '../types';
interface CommentSectionProps {
  comments: Comment[];
  teamMembers: User[];
  onAddComment: (text: string) => void;
  isOpen: boolean;
}
export function CommentSection({
  comments,
  teamMembers,
  onAddComment,
  isOpen
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };
  const getAuthor = (userId: string) => teamMembers.find((u) => u.id === userId);
  return (
    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200 animate-in slide-in-from-top-2 duration-300">
      <div className="space-y-3 mb-4">
        {comments.map((comment) => {
          const author = getAuthor(comment.userId);
          const authorAvatar =
          author?.avatar ||
          'https://ui-avatars.com/api/?name=Unknown&background=9ca3af&color=fff';
          const authorName = author?.name || 'Unknown User';
          return (
            <div
              key={comment.id}
              className="flex gap-3 bg-[var(--cream-light)] p-3 rounded-xl border border-[var(--black)]">

              <img
                src={authorAvatar}
                alt={authorName}
                className="w-8 h-8 rounded-full border border-[var(--black)]" />

              <div>
                <p className="text-xs font-bold text-[var(--teal-dark)]">
                  {authorName}
                </p>
                <p className="text-sm text-[var(--black)]">{comment.text}</p>
              </div>
            </div>);

        })}
        {comments.length === 0 &&
        <p className="text-sm text-gray-400 italic text-center">
            No comments yet. Be the first!
          </p>
        }
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a supportive comment..."
          className="flex-1 bg-white border-2 border-[var(--black)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)]" />

        <button
          type="submit"
          disabled={!newComment.trim()}
          className="bg-[var(--mustard)] text-[var(--black)] p-2 rounded-xl border-2 border-[var(--black)] hover:bg-[var(--mustard-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">

          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>);

}