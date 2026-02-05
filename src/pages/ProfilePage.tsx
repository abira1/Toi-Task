import React, { useState, Fragment } from 'react';
import { User, Task } from '../types';
import { Blob2, Squiggle } from '../components/IllustrationElements';
import { NotificationSettings } from '../components/NotificationSettings';
import {
  Trophy,
  Flame,
  Target,
  CheckCircle2,
  Clock,
  LogOut } from
'lucide-react';
interface ProfilePageProps {
  user: User;
  tasks: Task[];
  toggleTaskCompletion: (taskId: string) => void;
  onLogout: () => void;
}
export function ProfilePage({
  user,
  tasks,
  toggleTaskCompletion,
  onLogout
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'done' | 'pending'>('pending');
  // Filter tasks for current user
  const userTasks = tasks.filter((t) => t.userId === user.id);
  const doneTasks = userTasks.filter((t) => t.completed);
  const pendingTasks = userTasks.filter((t) => !t.completed);
  const displayTasks = activeTab === 'done' ? doneTasks : pendingTasks;
  const profileStats = [
  {
    label: 'Points',
    value: user.stats.points.toLocaleString(),
    shortValue: `${user.stats.points} pts`,
    icon: Trophy,
    color: 'bg-[var(--teal)]'
  },
  {
    label: 'Streak',
    value: `${user.stats.streak}d`,
    shortValue: `${user.stats.streak}d streak`,
    icon: Flame,
    color: 'bg-[var(--coral)]'
  },
  {
    label: 'Done',
    value: doneTasks.length.toString(),
    shortValue: `${doneTasks.length} done`,
    icon: Target,
    color: 'bg-[var(--mustard)]'
  }];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative mb-16 sm:mb-12">
        <div className="h-32 sm:h-48 bg-[var(--black)] rounded-2xl sm:rounded-t-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <Squiggle className="absolute bottom-4 right-4 w-32 sm:w-48 text-[var(--teal)] opacity-50" />
        </div>

        <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8 md:left-12 flex items-end">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--cream)] shadow-xl object-cover bg-white" />

            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-[var(--mustard)] border-2 border-[var(--black)] rounded-full p-1.5 sm:p-2">
              <span className="text-base sm:text-xl">🎨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Compact Stats Bar */}
      <div className="sm:hidden mb-6">
        <div className="bg-white border-3 border-[var(--black)] rounded-xl p-3 shadow-[3px_3px_0px_0px_var(--black)]">
          <div className="flex items-center justify-between">
            {profileStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Fragment key={i}>
                  <div className="flex items-center gap-1.5">
                    <div className={`${stat.color} p-1.5 rounded-lg`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm text-[var(--black)]">
                      {stat.shortValue}
                    </span>
                  </div>
                  {i < profileStats.length - 1 &&
                  <span className="text-gray-300 font-bold">•</span>
                  }
                </Fragment>);

            })}
          </div>
        </div>
      </div>

      {/* Desktop Stats Cards */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4 mb-8">
        {profileStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 bg-[var(--cream-light)] border-3 border-[var(--black)] rounded-xl p-4">

              <div
                className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white border-2 border-[var(--black)] shadow-[4px_4px_0px_0px_var(--black)]`}>

                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </div>);

        })}
      </div>

      {/* Main Content */}
      <div className="space-y-6 sm:space-y-8">
        {/* Name & Role */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-[var(--black)] mb-1">
            {user.name}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--teal-dark)] font-bold">
            {user.role}
          </p>
        </div>

        {/* About Me */}
        <div className="bg-white border-3 sm:border-4 border-[var(--black)] rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
          <Blob2 className="absolute -right-10 -bottom-10 w-40 text-[var(--cream)] opacity-50" />
          <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="bg-[var(--mustard)] w-2 h-5 sm:h-6 rounded-full block"></span>
            About Me
          </h3>
          <p className="text-gray-600 leading-relaxed text-base sm:text-lg relative z-10">
            {user.bio}
          </p>
        </div>

        {/* Expertise */}
        <div>
          <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
            <span className="bg-[var(--coral)] w-2 h-5 sm:h-6 rounded-full block"></span>
            Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.expertise.map((skill, i) =>
            <span
              key={i}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--black)] text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm">

                {skill}
              </span>
            )}
          </div>
        </div>

        {/* My Tasks Section */}
        <div>
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span className="bg-[var(--teal)] w-2 h-5 sm:h-6 rounded-full block"></span>
            My Tasks
          </h3>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-[var(--mustard)] text-[var(--black)] border-2 border-[var(--black)] shadow-[2px_2px_0px_0px_var(--black)] sm:shadow-[3px_3px_0px_0px_var(--black)]' : 'bg-gray-100 text-gray-500 active:bg-gray-200'}`}>

              <Clock className="w-4 h-4" />
              Pending ({pendingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'done' ? 'bg-[var(--teal)] text-white border-2 border-[var(--black)] shadow-[2px_2px_0px_0px_var(--black)] sm:shadow-[3px_3px_0px_0px_var(--black)]' : 'bg-gray-100 text-gray-500 active:bg-gray-200'}`}>

              <CheckCircle2 className="w-4 h-4" />
              Done ({doneTasks.length})
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-2 sm:space-y-3">
            {displayTasks.length > 0 ?
            displayTasks.map((task) =>
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 sm:p-4 bg-white border-2 border-[var(--black)] rounded-xl transition-all active:scale-[0.99] ${task.completed ? 'opacity-75' : ''}`}>

                  <button
                onClick={() => toggleTaskCompletion(task.id)}
                className={`w-6 h-6 rounded-full border-2 border-[var(--black)] flex items-center justify-center transition-colors flex-shrink-0 ${task.completed ? 'bg-[var(--teal)] text-white' : 'bg-white active:bg-gray-100'}`}>

                    {task.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                  className={`font-medium text-sm sm:text-base truncate ${task.completed ? 'line-through text-gray-400' : 'text-[var(--black)]'}`}>

                      {task.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
            ) :

            <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium text-sm sm:text-base">
                  {activeTab === 'done' ?
                'No completed tasks yet. Keep going! 🚀' :
                'All caught up! No pending tasks. 🎉'}
                </p>
              </div>
            }
          </div>
        </div>

        {/* Account Section */}
        <div>
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span className="bg-[var(--coral)] w-2 h-5 sm:h-6 rounded-full block"></span>
            Account
          </h3>
          <div className="bg-white border-3 sm:border-4 border-[var(--black)] rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <p className="text-gray-500 text-sm sm:text-base mb-4">
              Signed in as{' '}
              <span className="font-bold text-[var(--black)]">
                {user.email}
              </span>
            </p>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-[var(--coral)] text-white font-bold rounded-xl border-2 border-[var(--black)] shadow-[4px_4px_0px_0px_var(--black)] hover:bg-red-400 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">

              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>);

}