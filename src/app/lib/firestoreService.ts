// src/lib/firestoreService.ts
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, 
  runTransaction,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Job, JobStatus, UserStats } from '../types';

// Get jobs for a specific user with real-time updates
export const getJobsForUser = (
  userId: string, 
  callback: (jobs: Job[]) => void
) => {
  const jobsQuery = query(
    collection(db, 'jobs'),
    where('owner', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(jobsQuery, (snapshot) => {
    const jobs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
    callback(jobs);
  });
};

// Add a new job
export const addJob = async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
  const timestamp = Date.now();
  const newJob = {
    ...job,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await updateUserStats(job.owner, null, job.status);

  return await addDoc(collection(db, 'jobs'), newJob);
};

// Update job status
export const updateJobStatus = async (jobId: string, status: JobStatus) => {

  const jobRef = doc(db, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);
  
  if (!jobSnap.exists()) {
    throw new Error('Job not found');
  }
  
  const job = jobSnap.data() as Job;
  const oldStatus = job.status;
  
  if (oldStatus !== status) {
    // Update the job document
    await updateDoc(jobRef, { 
      status, 
      updatedAt: Date.now() 
    });
    
    // Update the user's stats
    await updateUserStats(job.owner, oldStatus, status);
  }
  else {
    // Just update the timestamp
    await updateDoc(jobRef, { updatedAt: Date.now() });
  }
  
};

// Update job details
export const updateJob = async (jobId: string, data: Partial<Omit<Job, 'id' | 'owner'>>) => {
  const jobRef = doc(db, 'jobs', jobId);
  return await updateDoc(jobRef, {
    ...data,
    updatedAt: Date.now()
  });
};

// Delete a job
export const deleteJob = async (jobId: string) => {
  const jobRef = doc(db, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);
  
  if (!jobSnap.exists()) {
    throw new Error('Job not found');
  }
  
  const job = jobSnap.data() as Job;
  
  await deleteDoc(jobRef);
  
  await updateUserStats(job.owner, job.status, null as unknown as JobStatus);
};

// Get a single job by ID with real-time updates
export const getJobById = (
  jobId: string,
  callback: (job: Job | null) => void
) => {
  const jobRef = doc(db, 'jobs', jobId);
  
  return onSnapshot(jobRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Job);
    } else {
      callback(null);
    }
  });
};

// Get user stats with real-time updates
export const getUserStats = (
  userId: string,
  callback: (stats: UserStats) => void
) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists() && doc.data().stats) {
      callback(doc.data().stats as UserStats);
    } else {
      callback({
        applied: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0
      });
    }
  });
};

export const updateUserStats = async (
  userId: string, 
  oldStatus: JobStatus | null, 
  newStatus: JobStatus
) => {
  const userRef = doc(db, 'users', userId);
  
  // Use a transaction to ensure accurate updates
  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists()) {
      // Create user doc with initial stats
      const initialStats = {
        applied: 0,
        interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0
      };
      initialStats[newStatus] = 1;
      
      transaction.set(userRef, {
        uid: userId,
        stats: initialStats
      });
      return;
    }
    
    // Update existing stats
    const userData = userDoc.data();
    const stats = userData.stats || {
      applied: 0,
      interview: 0,
      offer: 0,
      hired: 0,
      rejected: 0
    };
    
    // Make a copy of the stats to update
    const updatedStats = { ...stats };
    
    // Decrement old status count if it exists
    if (oldStatus) {
      updatedStats[oldStatus] = Math.max(0, (updatedStats[oldStatus] || 0) - 1);
    }
    
    // Increment new status count
    updatedStats[newStatus] = (updatedStats[newStatus] || 0) + 1;
    
    // Update the user document
    transaction.update(userRef, { stats: updatedStats });
  });
};