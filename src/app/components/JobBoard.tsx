'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { updateJobStatus } from '../lib/firestoreService';
import { Job, JobStatus } from '../types';
import JobColumn from './JobColumn';
import JobCard from './JobCard';

interface JobBoardProps {
  jobs: Job[];
}

export default function JobBoard({ jobs }: JobBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  // Filter jobs by status
  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((job) => job.status === status);
  };
  
  // Handle the start of a drag operation
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeJobId = active.id as string;
    const job = jobs.find((j) => j.id === activeJobId);
    
    if (job) {
      setActiveJob(job);
    }
  };
  
  // Handle the drag over event - useful for later enhancements
  const handleDragOver = (event: DragOverEvent) => {
    // This function can be expanded for more advanced drag and drop behaviors
  };
  
  // Handle the end of a drag operation
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active job
    setActiveJob(null);
    
    if (!over) return;
    
    const activeJobId = active.id as string;
    const newStatus = over.id as JobStatus;
    
    // Only update if status has changed
    const job = jobs.find((j) => j.id === activeJobId);
    if (job && job.status !== newStatus) {
      try {
        // Optimistic update - update UI first
        // This would be handled better with a state management library in a larger app
        
        // Update in Firestore
        await updateJobStatus(activeJobId, newStatus);
      } catch (error) {
        console.error('Error updating job status:', error);
        // Would handle reverting the UI update here in a real app
      }
    }
  };
  
  // All possible job statuses
  const statuses: JobStatus[] = ['applied', 'interview', 'offer', 'hired', 'rejected'];
  
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
        {statuses.map((status) => (
          <JobColumn
            key={status}
            status={status}
            jobs={getJobsByStatus(status)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeJob ? <JobCard job={activeJob} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}