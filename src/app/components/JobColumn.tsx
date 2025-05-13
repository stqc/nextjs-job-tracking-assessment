// src/components/JobColumn.tsx
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Job, JobStatus } from '../types';
import SortableJobCard from './SortableJobCard';

interface JobColumnProps {
  status: JobStatus;
  jobs: Job[];
}

export default function JobColumn({ status, jobs }: JobColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });
  
  const jobIds = jobs.map((job) => job.id);
  
  // Get column title and styling based on status
  const getColumnTitle = (status: JobStatus) => {
    switch (status) {
      case 'applied':
        return 'Applied';
      case 'interview':
        return 'Interview';
      case 'offer':
        return 'Offer';
      case 'hired':
        return 'Hired';
      case 'rejected':
        return 'Rejected';
      default:
        return (status as string).charAt(0).toUpperCase() + (status as string).slice(1);
    }
  };
  
  const getColumnHeaderClass = (status: JobStatus) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500';
      case 'interview':
        return 'bg-yellow-500';
      case 'offer':
        return 'bg-purple-500';
      case 'hired':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div
      className="flex-1 min-w-[250px] bg-gray-100 rounded-md flex flex-col"
    >
      <div className={`p-2 ${getColumnHeaderClass(status)} text-white text-center rounded-t-md`}>
        <h3 className="font-bold">{getColumnTitle(status)}</h3>
        <div className="text-sm">{jobs.length} jobs</div>
      </div>
      
      <div
        ref={setNodeRef}
        className="flex-1 p-2 overflow-y-auto"
        style={{ minHeight: '60vh' }}
      >
        <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {jobs.map((job) => (
              <SortableJobCard key={job.id} job={job} />
            ))}
            
            {jobs.length === 0 && (
              <div className="text-center text-gray-500 p-4">
                Drop jobs here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}