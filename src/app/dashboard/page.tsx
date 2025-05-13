// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '../context/AuthContext';
import AuthGuard from '../components/AuthGuard';
import { useState, useEffect } from 'react';
import { getJobsForUser, getUserStats } from '../lib/firestoreService';
import { Job, JobStatus, UserStats } from '../types';
import JobBoard from '../components/JobBoard';
import StatsDisplay from '../components/StatsDisplay';
import NewJobForm from '../components/NewJobForm';

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<UserStats>({
    applied: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0
  });
  const [showNewJobForm, setShowNewJobForm] = useState(false);

  useEffect(() => {
    let unsubscribeJobs: () => void;
    let unsubscribeStats: () => void;

    if (user) {
      unsubscribeJobs = getJobsForUser(user.uid, (fetchedJobs) => {
        setJobs(fetchedJobs);
      });

      unsubscribeStats = getUserStats(user.uid, (fetchedStats) => {
        setStats(fetchedStats);
      });
    }

    return () => {
      if (unsubscribeJobs) unsubscribeJobs();
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [user]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Job Pipeline Dashboard</h1>
            <button
              onClick={() => setShowNewJobForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Job
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <StatsDisplay stats={stats} />
          
          <div className="mt-6">
            <JobBoard jobs={jobs} />
          </div>
          
          {showNewJobForm && (
            <NewJobForm onClose={() => setShowNewJobForm(false)} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}