'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const PASTEL_COLORS = ['#b2f0e8', '#c8e6f5', '#e8d5f5', '#f5d5e8', '#f5f0c8', '#f5e0c8', '#c8f5c8', '#f5c8c8']

interface PieData {
  name: string
  value: number
  color: string
}

interface LineData {
  month: string
  total: number
}

interface BarData {
  name: string
  value: number
  color: string
  icon: string
}

export function CategoryPieChart({ data }: { data: PieData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || PASTEL_COLORS[index % PASTEL_COLORS.length]}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccfbf1', borderRadius: '12px', fontSize: '12px' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function MonthlyAreaChart({ data }: { data: LineData[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccfbf1', borderRadius: '12px', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="total" stroke="#14b8a6" strokeWidth={2} fill="url(#tealGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function PaymentBarChart({ data }: { data: BarData[] }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0fdfa" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccfbf1', borderRadius: '12px', fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
