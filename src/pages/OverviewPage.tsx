import React, { Fragment, useMemo } from 'react';
import { Task, User } from '../types';
import {
  CompletionDonut,
  WeeklyBarChart,
  TrendsLineChart } from
'../components/ProgressChart';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Star } from '../components/IllustrationElements';
import { CheckSquare, TrendingUp, Users } from 'lucide-react';

interface OverviewPageProps {
  tasks: Task[];
  teamMembers: User[];
}

export function OverviewPage({ tasks, teamMembers }: OverviewPageProps) {
  // Calculate real statistics from tasks
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const activeMembers = new Set(tasks.map(t => t.userId)).size;

    return [
      {
        label: 'Total Tasks',
        value: totalTasks.toString(),
        shortLabel: `${totalTasks} tasks`,
        color: 'bg-[var(--teal)]',
        icon: CheckSquare
      },
      {
        label: 'Completion',
        value: `${completionRate}%`,
        shortLabel: `${completionRate}%`,
        color: 'bg-[var(--mustard)]',
        icon: TrendingUp
      },
      {
        label: 'Active',
        value: activeMembers.toString(),
        shortLabel: `${activeMembers} active`,
        color: 'bg-[var(--coral)]',
        icon: Users
      }
    ];
  }, [tasks]);

  // Generate weekly data from tasks
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = days.map((name, index) => {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() - (today.getDay() - index));
      dayDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);
      
      const tasksCount = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= dayDate && taskDate < nextDay;
      }).length;
      
      return {
        name,
        tasks: tasksCount
      };
    });
    
    return weekData;
  }, [tasks]);

  // Generate completion data
  const completionData = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    const pending = tasks.length - completed;
    
    return [
      {
        name: 'Completed',
        value: completed
      },
      {
        name: 'Remaining',
        value: pending
      }
    ];
  }, [tasks]);

  // Generate productivity trends (last 4 weeks)
  const trendData = useMemo(() => {
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    const today = new Date();
    
    const weeklyTrends = weeks.map((name, index) => {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - (index * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      
      const completed = weekTasks.filter(t => t.completed).length;
      const productivity = weekTasks.length > 0 
        ? Math.round((completed / weekTasks.length) * 100)
        : 0;
      
      return {
        name: `W${4 - index}`,
        productivity
      };
    }).reverse();
    
    return weeklyTrends;
  }, [tasks]);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--black)] mb-1 sm:mb-2">
            Team Pulse
          </h1>
          <p className="text-base sm:text-xl text-gray-500 font-medium">
            Look at those numbers go! 📈
          </p>
        </div>
        <Star className="w-8 h-8 sm:w-12 sm:h-12 text-[var(--mustard)] animate-spin-slow hidden sm:block" />
      </header>

      {/* Mobile Compact Stats Bar */}
      <div className="sm:hidden mb-6">
        <div className="bg-white border-3 border-[var(--black)] rounded-xl p-3 shadow-[3px_3px_0px_0px_var(--black)]">
          <div className="flex items-center justify-between">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Fragment key={i}>
                  <div className="flex items-center gap-1.5">
                    <div className={`${stat.color} p-1.5 rounded-lg`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm text-[var(--black)]">
                      {stat.shortLabel}
                    </span>
                  </div>
                  {i < stats.length - 1 &&
                  <span className="text-gray-300 font-bold">•</span>
                  }
                </Fragment>);

            })}
          </div>
        </div>
      </div>

      {/* Desktop Stats Cards */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) =>
        <div
          key={i}
          className={`${stat.color} border-4 border-[var(--black)] rounded-2xl p-6 shadow-[6px_6px_0px_0px_var(--black)] transform hover:-translate-y-1 transition-transform`}>

            <h3 className="text-[var(--black)] font-bold opacity-80 mb-1 text-base">
              {stat.label}
            </h3>
            <p className="text-4xl font-black text-white drop-shadow-md">
              {stat.value}
            </p>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <Card className="border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl shadow-none overflow-hidden">
          <CardHeader
            title="Weekly Productivity"
            className="bg-[var(--cream-light)] border-b-2 border-[var(--black)] text-sm sm:text-base" />

          <CardContent className="p-3 sm:p-6">
            <WeeklyBarChart data={weeklyData} />
          </CardContent>
        </Card>

        <Card className="border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl shadow-none overflow-hidden">
          <CardHeader
            title="Completion Status"
            className="bg-[var(--cream-light)] border-b-2 border-[var(--black)] text-sm sm:text-base" />

          <CardContent className="p-3 sm:p-6">
            <CompletionDonut data={completionData} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl shadow-none overflow-hidden">
          <CardHeader
            title="Productivity Trends"
            className="bg-[var(--cream-light)] border-b-2 border-[var(--black)] text-sm sm:text-base" />

          <CardContent className="p-3 sm:p-6">
            <TrendsLineChart data={trendData} />
          </CardContent>
        </Card>
      </div>
    </div>);

}