import React, { Fragment } from 'react';
import {
  CompletionDonut,
  WeeklyBarChart,
  TrendsLineChart } from
'../components/ProgressChart';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Star } from '../components/IllustrationElements';
import { CheckSquare, TrendingUp, Users } from 'lucide-react';
const mockWeeklyData = [
{
  name: 'Mon',
  tasks: 12
},
{
  name: 'Tue',
  tasks: 19
},
{
  name: 'Wed',
  tasks: 15
},
{
  name: 'Thu',
  tasks: 22
},
{
  name: 'Fri',
  tasks: 18
},
{
  name: 'Sat',
  tasks: 8
},
{
  name: 'Sun',
  tasks: 5
}];

const mockCompletionData = [
{
  name: 'Completed',
  value: 65
},
{
  name: 'Remaining',
  value: 35
}];

const mockTrendData = [
{
  name: 'W1',
  productivity: 75
},
{
  name: 'W2',
  productivity: 82
},
{
  name: 'W3',
  productivity: 78
},
{
  name: 'W4',
  productivity: 90
}];

const stats = [
{
  label: 'Total Tasks',
  value: '142',
  shortLabel: '142 tasks',
  color: 'bg-[var(--teal)]',
  icon: CheckSquare
},
{
  label: 'Completion',
  value: '87%',
  shortLabel: '87%',
  color: 'bg-[var(--mustard)]',
  icon: TrendingUp
},
{
  label: 'Active',
  value: '8',
  shortLabel: '8 active',
  color: 'bg-[var(--coral)]',
  icon: Users
}];

export function OverviewPage() {
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
            <WeeklyBarChart data={mockWeeklyData} />
          </CardContent>
        </Card>

        <Card className="border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl shadow-none overflow-hidden">
          <CardHeader
            title="Completion Status"
            className="bg-[var(--cream-light)] border-b-2 border-[var(--black)] text-sm sm:text-base" />

          <CardContent className="p-3 sm:p-6">
            <CompletionDonut data={mockCompletionData} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-3 sm:border-4 border-[var(--black)] rounded-2xl sm:rounded-3xl shadow-none overflow-hidden">
          <CardHeader
            title="Productivity Trends"
            className="bg-[var(--cream-light)] border-b-2 border-[var(--black)] text-sm sm:text-base" />

          <CardContent className="p-3 sm:p-6">
            <TrendsLineChart data={mockTrendData} />
          </CardContent>
        </Card>
      </div>
    </div>);

}