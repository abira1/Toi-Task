import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell } from
'recharts';
const COLORS = ['#00BFA5', '#F5A623', '#FF6B6B', '#1A1A1A'];
export function CompletionDonut({ data }: {data: any[];}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value">

          {data.map((entry, index) =>
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            stroke="#1A1A1A"
            strokeWidth={2} />

          )}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFF8E1',
            border: '2px solid #1A1A1A',
            borderRadius: '8px',
            fontFamily: 'sans-serif',
            fontWeight: 'bold'
          }} />

      </PieChart>
    </ResponsiveContainer>);

}
export function WeeklyBarChart({ data }: {data: any[];}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: '#1A1A1A',
            fontSize: 12,
            fontWeight: 'bold'
          }} />

        <Tooltip
          cursor={{
            fill: 'transparent'
          }}
          contentStyle={{
            backgroundColor: '#FFF8E1',
            border: '2px solid #1A1A1A',
            borderRadius: '8px',
            fontFamily: 'sans-serif',
            fontWeight: 'bold'
          }} />

        <Bar
          dataKey="tasks"
          fill="#00BFA5"
          radius={[4, 4, 0, 0]}
          stroke="#1A1A1A"
          strokeWidth={2} />

      </BarChart>
    </ResponsiveContainer>);

}
export function TrendsLineChart({ data }: {data: any[];}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fill: '#1A1A1A',
            fontSize: 12
          }} />

        <Tooltip
          contentStyle={{
            backgroundColor: '#FFF8E1',
            border: '2px solid #1A1A1A',
            borderRadius: '8px'
          }} />

        <Line
          type="monotone"
          dataKey="productivity"
          stroke="#FF6B6B"
          strokeWidth={4}
          dot={{
            fill: '#F5A623',
            stroke: '#1A1A1A',
            strokeWidth: 2,
            r: 6
          }}
          activeDot={{
            r: 8
          }} />

      </LineChart>
    </ResponsiveContainer>);

}