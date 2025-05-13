// src/components/StatsDisplay.tsx
'use client';

import { UserStats } from '../types';

interface StatsDisplayProps {
  stats: UserStats;
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  const totalApplications = 
    stats.applied + 
    stats.interview + 
    stats.offer + 
    stats.hired + 
    stats.rejected;
  
  const getProgressPercentage = (count: number) => {
    if (totalApplications === 0) return 0;
    return Math.round((count / totalApplications) * 100);
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Your Application Pipeline</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard 
          title="Applied" 
          count={stats.applied} 
          percentage={getProgressPercentage(stats.applied)}
          bgColor="bg-blue-100"
          textColor="text-blue-800"
        />
        
        <StatCard 
          title="Interview" 
          count={stats.interview} 
          percentage={getProgressPercentage(stats.interview)}
          bgColor="bg-yellow-100"
          textColor="text-yellow-800"
        />
        
        <StatCard 
          title="Offer" 
          count={stats.offer} 
          percentage={getProgressPercentage(stats.offer)}
          bgColor="bg-purple-100"
          textColor="text-purple-800"
        />
        
        <StatCard 
          title="Hired" 
          count={stats.hired} 
          percentage={getProgressPercentage(stats.hired)}
          bgColor="bg-green-100"
          textColor="text-green-800"
        />
        
        <StatCard 
          title="Rejected" 
          count={stats.rejected} 
          percentage={getProgressPercentage(stats.rejected)}
          bgColor="bg-red-100"
          textColor="text-red-800"
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Total Applications: {totalApplications}</p>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  count: number;
  percentage: number;
  bgColor: string;
  textColor: string;
}

function StatCard({ title, count, percentage, bgColor, textColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <h3 className={`font-medium ${textColor}`}>{title}</h3>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
    </div>
  );
}