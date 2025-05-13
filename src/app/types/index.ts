export type JobStatus = 'applied' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Job {
  id: string;
  owner: string;
  title: string;
  company: string;
  logoURL?: string;
  status: JobStatus;
  notes: string;
  createdAt: number; 
  updatedAt: number; 
}

export interface UserStats {
  applied: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  stats: UserStats;
}