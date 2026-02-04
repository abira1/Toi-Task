import React, { useState, Component } from 'react';
import { User } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserPlus, Users, Trash2 } from 'lucide-react';
import { Squiggle } from '../components/IllustrationElements';
interface AdminPageProps {
  teamMembers: User[];
  onAddMember: (member: User) => void;
}
export function AdminPage({ teamMembers, onAddMember }: AdminPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    expertise: '',
    avatar: '',
    coverImage: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return;
    }
    setIsSubmitting(true);
    const newMember: User = {
      id: `u${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role || 'Team Member',
      bio: formData.bio || '',
      avatar:
      formData.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=00BFA5&color=fff`,
      coverImage: formData.coverImage || undefined,
      expertise: formData.expertise ?
      formData.expertise.
      split(',').
      map((s) => s.trim()).
      filter(Boolean) :
      [],
      stats: {
        tasksCompleted: 0,
        streak: 0,
        points: 0
      }
    };
    onAddMember(newMember);
    // Reset form
    setFormData({
      name: '',
      role: '',
      bio: '',
      expertise: '',
      avatar: '',
      coverImage: '',
      email: ''
    });
    setSuccessMessage(`${newMember.name} has been added to the team!`);
    setTimeout(() => setSuccessMessage(''), 3000);
    setIsSubmitting(false);
  };
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6 sm:mb-8 relative">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--black)] mb-1 sm:mb-2">
          Admin Panel
        </h1>
        <p className="text-base sm:text-xl text-gray-500 font-medium">
          Manage your team members 👥
        </p>
        <Squiggle className="absolute -top-4 sm:-top-6 right-0 w-20 sm:w-32 text-[var(--coral)] transform rotate-6 hidden sm:block" />
      </header>

      {/* Success Message */}
      {successMessage &&
      <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-xl text-green-700 font-bold animate-in slide-in-from-top-2">
          ✅ {successMessage}
        </div>
      }

      {/* Add Member Form */}
      <div className="bg-white border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_var(--mustard)] sm:shadow-[8px_8px_0px_0px_var(--mustard)] mb-8">
        <h2 className="text-lg sm:text-xl font-black text-[var(--black)] mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--teal)]" />
          Add New Team Member
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name *"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe" />

            <Input
              label="Login Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@team.com" />

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder="Product Designer" />

            <Input
              label="Expertise (comma-separated)"
              value={formData.expertise}
              onChange={(e) => handleChange('expertise', e.target.value)}
              placeholder="React, TypeScript, Design" />

          </div>

          <Input
            label="About / Bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="A short bio about this team member..." />


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Profile Image URL"
              value={formData.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg" />

            <Input
              label="Cover Image URL"
              value={formData.coverImage}
              onChange={(e) => handleChange('coverImage', e.target.value)}
              placeholder="https://example.com/cover.jpg" />

          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!formData.name || !formData.email || isSubmitting}
              className="w-full sm:w-auto bg-[var(--teal)] text-white hover:bg-[var(--teal-dark)] border-2 border-[var(--black)] rounded-xl px-6 py-3 font-bold shadow-[4px_4px_0px_0px_var(--black)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">

              <UserPlus className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Team Member'}
            </Button>
          </div>
        </form>
      </div>

      {/* Team Members List */}
      <div className="bg-white border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-black text-[var(--black)] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--mustard)]" />
          Current Team Members ({teamMembers.length})
        </h2>

        <div className="space-y-3">
          {teamMembers.map((member) =>
          <div
            key={member.id}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--cream-light)] border-2 border-[var(--black)] rounded-xl">

              <img
              src={member.avatar}
              alt={member.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[var(--black)] object-cover flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[var(--black)] text-sm sm:text-base truncate">
                  {member.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {member.role} • {member.email}
                </p>
              </div>
              <div className="hidden sm:flex flex-wrap gap-1 max-w-[200px]">
                {member.expertise.slice(0, 2).map((skill, i) =>
              <span
                key={i}
                className="px-2 py-1 bg-[var(--black)] text-white rounded-lg text-xs font-bold">

                    {skill}
                  </span>
              )}
                {member.expertise.length > 2 &&
              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold">
                    +{member.expertise.length - 2}
                  </span>
              }
              </div>
            </div>
          )}

          {teamMembers.length === 0 &&
          <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No team members yet</p>
            </div>
          }
        </div>
      </div>
    </div>);

}