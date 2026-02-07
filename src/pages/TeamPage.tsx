import React from 'react';
import { User } from '../types';
import { Squiggle } from '../components/IllustrationElements';
import { Trophy, Flame, Target } from 'lucide-react';

interface TeamPageProps {
  teamMembers: User[];
  onMemberClick: (memberId: string) => void;
}

export function TeamPage({ teamMembers, onMemberClick }: TeamPageProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 sm:mb-8 relative">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--black)] mb-1 sm:mb-2">
          Meet Our Team
        </h1>
        <p className="text-base sm:text-xl text-gray-500 font-medium">
          {teamMembers.length} awesome {teamMembers.length === 1 ? 'person' : 'people'} making it happen! 🚀
        </p>
        <Squiggle className="absolute -top-4 sm:-top-6 right-0 w-20 sm:w-32 text-[var(--coral)] transform -rotate-12 hidden sm:block" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onMemberClick(member.id)}
            className="bg-white border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[3px_3px_0px_0px_var(--black)] sm:shadow-[4px_4px_0px_0px_var(--black)] hover:shadow-[6px_6px_0px_0px_var(--teal)] sm:hover:shadow-[8px_8px_0px_0px_var(--teal)] hover:-translate-y-1 transition-all cursor-pointer group"
            data-testid={`team-member-card-${member.id}`}
          >
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[var(--black)] object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 bg-[var(--mustard)] border-2 border-[var(--black)] rounded-full p-1.5">
                  <span className="text-sm">🎨</span>
                </div>
              </div>
            </div>

            {/* Name & Role */}
            <div className="text-center mb-4">
              <h3 className="text-lg sm:text-xl font-black text-[var(--black)] mb-1">
                {member.name}
              </h3>
              <p className="text-sm sm:text-base text-[var(--teal)] font-bold">
                {member.role}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[var(--cream-light)] border-2 border-[var(--black)] rounded-lg p-2 text-center">
                <Trophy className="w-4 h-4 text-[var(--teal)] mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-500">Points</p>
                <p className="text-sm sm:text-base font-black text-[var(--black)]">
                  {member.stats?.points || 0}
                </p>
              </div>
              <div className="bg-[var(--cream-light)] border-2 border-[var(--black)] rounded-lg p-2 text-center">
                <Flame className="w-4 h-4 text-[var(--coral)] mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-500">Streak</p>
                <p className="text-sm sm:text-base font-black text-[var(--black)]">
                  {member.stats?.streak || 0}d
                </p>
              </div>
              <div className="bg-[var(--cream-light)] border-2 border-[var(--black)] rounded-lg p-2 text-center">
                <Target className="w-4 h-4 text-[var(--mustard)] mx-auto mb-1" />
                <p className="text-xs font-bold text-gray-500">Done</p>
                <p className="text-sm sm:text-base font-black text-[var(--black)]">
                  {member.stats?.tasksCompleted || 0}
                </p>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {member.expertise && member.expertise.length > 0 ? (
                <>
                  {member.expertise.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[var(--black)] text-white rounded-md font-bold text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {member.expertise.length > 3 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md font-bold text-xs">
                      +{member.expertise.length - 3}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">No expertise listed</span>
              )}
            </div>

            {/* Click indicator */}
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-400 font-medium group-hover:text-[var(--teal)] transition-colors">
                Click to view profile →
              </span>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12 bg-white/50 rounded-3xl border-4 border-dashed border-gray-200">
          <p className="text-3xl mb-4">🤷‍♂️</p>
          <h3 className="text-xl font-bold text-gray-400 mb-2">No team members yet</h3>
          <p className="text-base text-gray-400">
            Team members will appear here once added by admin
          </p>
        </div>
      )}
    </div>
  );
}
