// src/components/JobCard.tsx
'use client';

import { Job } from '../types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import sampleLogo from '../Assets/sample.jpeg'

interface JobCardProps {
  job: Job;
  isDragging?: boolean;
}

export default function JobCard({ job, isDragging = false }: JobCardProps) {
  const placeholderLogo = sampleLogo;
  
  return (
    <Link href={`/job/${job.id}`}>
      <div
        className={`bg-white p-4 rounded-md shadow ${
          isDragging ? 'opacity-50' : ''
        } hover:shadow-md transition-shadow`}
      >
        <div className="flex items-start">
          <div className="h-10 w-10 flex-shrink-0 mr-3">
            <Image
              src={job.logoURL || placeholderLogo}
              alt={`${job.company} logo`}
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {job.title}
            </h3>
            <p className="text-sm text-gray-500 truncate">{job.company}</p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(job.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {job.notes && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 line-clamp-2">
              {job.notes}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}