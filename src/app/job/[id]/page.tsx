'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getJobById, updateJob, deleteJob } from '../../lib/firestoreService';
import { Job, JobStatus } from '../../types';
import AuthGuard from '../../components/AuthGuard';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    logoURL: '',
    notes: '',
    status: '' as JobStatus
  });

  useEffect(() => {
    let unsubscribe: () => void;

    if (id && typeof id === 'string') {
      unsubscribe = getJobById(id, (fetchedJob) => {
        setJob(fetchedJob);
        if (fetchedJob) {
          setFormData({
            title: fetchedJob.title,
            company: fetchedJob.company,
            logoURL: fetchedJob.logoURL || '',
            notes: fetchedJob.notes,
            status: fetchedJob.status
          });
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !user) return;
    
    try {
      await updateJob(job.id, {
        title: formData.title,
        company: formData.company,
        logoURL: formData.logoURL || undefined,
        notes: formData.notes,
        status: formData.status
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    if (confirm('Are you sure you want to delete this job application?')) {
      try {
        await deleteJob(job.id);
        router.push('/dashboard');
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  if (!job) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading job details...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              &larr; Back to Dashboard
            </button>
            
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          {!isEditing ? (
            <div>
              <div className="flex items-center mb-6">
                {job.logoURL && (
                  <div className="mr-4">
                    <Image
                      src={job.logoURL}
                      alt={`${job.company} logo`}
                      width={64}
                      height={64}
                      className="rounded-md"
                    />
                  </div>
                )}
                
                <div>
                  <h1 className="text-2xl font-bold text-black">{job.title}</h1>
                  <p className="text-lg text-gray-600">{job.company}</p>
                </div>
                
                <div className="ml-auto">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold 
                    ${job.status === 'applied' ? 'bg-blue-100 text-blue-800' : 
                    job.status === 'interview' ? 'bg-yellow-100 text-yellow-800' : 
                    job.status === 'offer' ? 'bg-purple-100 text-purple-800' : 
                    job.status === 'hired' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}
                  `}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-600">Notes</h2>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-black">
                  {job.notes || "No notes added yet."}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(job.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo URL (optional)</label>
                  <input
                    type="text"
                    name="logoURL"
                    value={formData.logoURL}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
                    required
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-black"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}