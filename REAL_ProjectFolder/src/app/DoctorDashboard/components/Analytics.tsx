// components/analytics.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export interface Metrics {
  patientsToday: number;
  avgResponse: string;
  satisfaction: number;
  consultationEfficiency: number;
  documentation: number;
  monthlyAdmissions: { month: string; count: number }[];
  weeklyTrend: { day: string; patients: number }[];
  conditionDistribution: { name: string; value: number }[];
}

export interface Condition {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface AnalyticsData {
  metrics: Metrics;
  conditions: Condition[];
  ageDistribution?: any[];
}

const COLORS = ['#2EC4B6', '#0A2463', '#4ade80', '#fbbf24', '#ef4444', '#8b5cf6'];

// Default metrics data
export const defaultMetrics: Metrics = {
  patientsToday: 12,
  avgResponse: '8m 24s',
  satisfaction: 94,
  consultationEfficiency: 87,
  documentation: 92,
  monthlyAdmissions: [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Apr', count: 61 },
    { month: 'May', count: 55 },
    { month: 'Jun', count: 58 },
  ],
  weeklyTrend: [
    { day: 'Mon', patients: 18 },
    { day: 'Tue', patients: 22 },
    { day: 'Wed', patients: 16 },
    { day: 'Thu', patients: 24 },
    { day: 'Fri', patients: 20 },
    { day: 'Sat', patients: 12 },
    { day: 'Sun', patients: 8 },
  ],
  conditionDistribution: [
    { name: 'Hypertension', value: 35 },
    { name: 'Diabetes', value: 25 },
    { name: 'COPD', value: 15 },
    { name: 'Arthritis', value: 12 },
    { name: 'Asthma', value: 8 },
    { name: 'Other', value: 5 },
  ]
};

// Performance Metrics Component
export function PerformanceMetrics({ metrics }: { metrics: Metrics }) {
  const performanceMetrics = [
    { label: 'Consultation Efficiency', value: `${metrics.consultationEfficiency}%`, color: 'cyan', trend: 'up' },
    { label: 'Avg Response Time', value: metrics.avgResponse, color: 'blue', trend: 'down' },
    { label: 'Documentation', value: `${metrics.documentation}%`, color: 'emerald', trend: 'up' },
    { label: 'Patient Satisfaction', value: `${metrics.satisfaction}%`, color: 'purple', trend: 'stable' },
  ];

  return (
    <div className="premium-card p-8 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mr-4 shadow-lg">
            <i className="fas fa-chart-line text-white"></i>
          </div>
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            Performance Analytics
          </span>
        </h3>
        <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold">
          +12% vs last week
        </span>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {performanceMetrics.map((metric) => (
          <div key={metric.label} className="text-center cursor-pointer hover:scale-105 transition-transform">
            <p className="text-3xl font-bold text-white">{metric.value}</p>
            <p className="text-sm text-slate-400 mt-1">{metric.label}</p>
            <div className="flex items-center justify-center mt-2">
              <i className={`fas fa-arrow-${metric.trend} text-${metric.color}-400 mr-1`}></i>
              <span className={`text-xs text-${metric.color}-400`}>
                {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Faster' : 'Stable'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-400 mb-4">Weekly Patient Trend</h4>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={metrics.weeklyTrend}>
            <defs>
              <linearGradient id="patientTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="patients" stroke="#2EC4B6" fill="url(#patientTrend)" />
            <XAxis dataKey="day" fontSize={12} />
            <YAxis fontSize={12} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Conditions Overview Component
export function ConditionsOverview({ conditions }: { conditions: Condition[] }) {
  return (
    <div className="premium-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mr-3 shadow-lg">
          <i className="fas fa-diagnoses text-white"></i>
        </div>
        <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
          Conditions Overview
        </span>
      </h4>
      <div className="space-y-4">
        {conditions.map((condition, index) => (
          <div key={condition.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="font-semibold text-white">{condition.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold">{condition.count} cases</span>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                condition.trend === 'up' ? 'bg-red-500/20 text-red-400' :
                condition.trend === 'down' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <i className={`fas fa-arrow-${condition.trend} mr-1`}></i>
                {condition.change > 0 ? '+' : ''}{condition.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Conditions Distribution Chart Component
export function ConditionsDistribution({ conditions }: { conditions: Condition[] }) {
  const chartData = conditions.map(c => ({
    name: c.name,
    value: c.count
  }));

  return (
    <div className="premium-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
          <i className="fas fa-chart-pie text-white"></i>
        </div>
        <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Conditions Distribution
        </span>
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Monthly Admissions Chart Component
export function MonthlyAdmissions({ data }: { data: { month: string; count: number }[] }) {
  return (
    <div className="premium-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mr-3 shadow-lg">
          <i className="fas fa-chart-bar text-white"></i>
        </div>
        <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
          Monthly Admissions
        </span>
      </h4>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4ade80" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <Bar dataKey="count" fill="url(#admissionGradient)" radius={[4,4,0,0]} />
          <XAxis dataKey="month" fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Age Distribution Component
export function AgeDistribution({ patients }: { patients: any[] }) {
  const ageGroups = [
    { range: '0-18', count: 0, color: '#4ade80' },
    { range: '19-35', count: 0, color: '#2EC4B6' },
    { range: '36-50', count: 0, color: '#0A2463' },
    { range: '51-65', count: 0, color: '#fbbf24' },
    { range: '65+', count: 0, color: '#ef4444' }
  ];

  // Calculate actual age distribution from patients
  patients?.forEach(patient => {
    if (patient.age <= 18) ageGroups[0].count++;
    else if (patient.age <= 35) ageGroups[1].count++;
    else if (patient.age <= 50) ageGroups[2].count++;
    else if (patient.age <= 65) ageGroups[3].count++;
    else ageGroups[4].count++;
  });

  const totalPatients = ageGroups.reduce((sum, group) => sum + group.count, 0);

  return (
    <div className="premium-card p-6">
      <h4 className="text-lg font-bold mb-4 flex items-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg">
          <i className="fas fa-user-friends text-white"></i>
        </div>
        <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Age Distribution
        </span>
      </h4>
      
      <div className="space-y-3">
        {ageGroups.map((group, index) => (
          <div key={group.range} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: group.color }}
              ></div>
              <span className="text-sm font-medium text-white">{group.range}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white font-semibold">{group.count}</span>
              <span className="text-xs text-slate-400 w-12 text-right">
                {totalPatients > 0 ? Math.round((group.count / totalPatients) * 100) : 0}%
              </span>
            </div>
          </div>
        ))}
        
        {/* Visual Bar Chart */}
        <div className="mt-4 space-y-2">
          {ageGroups.map((group, index) => (
            <div key={group.range} className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 w-10">{group.range}</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: totalPatients > 0 ? `${(group.count / totalPatients) * 100}%` : '0%',
                    backgroundColor: group.color
                  }}
                ></div>
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">
                {group.count}
              </span>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {Math.round(patients?.reduce((sum, p) => sum + p.age, 0) / (patients?.length || 1))}
            </p>
            <p className="text-xs text-slate-400">Avg Age</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {patients?.filter(p => p.age >= 65).length || 0}
            </p>
            <p className="text-xs text-slate-400">Seniors (65+)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Analytics Dashboard Component
export function AnalyticsDashboard({ 
  metrics, 
  conditions, 
  patients = [] 
}: { 
  metrics: Metrics;
  conditions: Condition[];
  patients?: any[];
}) {
  return (
    <div className="space-y-6">
      <PerformanceMetrics metrics={metrics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConditionsOverview conditions={conditions} />
        <ConditionsDistribution conditions={conditions} />
      </div>
      <MonthlyAdmissions data={metrics.monthlyAdmissions} />
      <AgeDistribution patients={patients} />
    </div>
  );
}

// Helper function to generate conditions from patient data
export function generateConditionsFromPatients(patients: any[]): Condition[] {
  const conditionCounts = patients.reduce((acc, p) => {
    p.tags?.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(conditionCounts || {})
    .map(([name, count]) => ({
      name,
      count,
      trend: 'stable' as const,
      change: 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}