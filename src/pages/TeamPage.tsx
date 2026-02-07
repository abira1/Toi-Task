import React from 'react';
import { User } from '../types';
import { Squiggle } from '../components/IllustrationElements';

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onMemberClick(member.id)}
            className="bg-white border-3 border-[var(--black)] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[2px_2px_0px_0px_var(--black)] sm:shadow-[3px_3px_0px_0px_var(--black)] hover:shadow-[4px_4px_0px_0px_var(--teal)] sm:hover:shadow-[6px_6px_0px_0px_var(--teal)] hover:-translate-y-1 transition-all cursor-pointer group"
            data-testid={`team-member-card-${member.id}`}
          >
            {/* Avatar */}
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-[var(--black)] object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Name */}
            <div className="text-center">
              <h3 className="text-sm sm:text-base font-black text-[var(--black)] line-clamp-2">
                {member.name}
              </h3>
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
