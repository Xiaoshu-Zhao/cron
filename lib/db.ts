import { kv } from '@vercel/kv';
import { JobListing, CompanyStats } from './types';

// Key prefixes
const JOB_KEY_PREFIX = 'job:';
const COMPANY_STATS_KEY_PREFIX = 'company:';
const ALL_JOBS_KEY = 'all_jobs';

// Store a job listing
export async function storeJobListing(job: JobListing): Promise<string> {
  const jobId = job.id || `${job.source}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  job.id = jobId;
  
  // Store the job with its ID
  await kv.set(`${JOB_KEY_PREFIX}${jobId}`, job);
  
  // Add to the list of all jobs
  await kv.sadd(ALL_JOBS_KEY, jobId);
  
  return jobId;
}

// Store multiple job listings
export async function storeJobListings(jobs: JobListing[]): Promise<string[]> {
  const jobIds: string[] = [];
  
  for (const job of jobs) {
    const jobId = await storeJobListing(job);
    jobIds.push(jobId);
  }
  
  return jobIds;
}

// Get a job listing by ID
export async function getJobListing(jobId: string): Promise<JobListing | null> {
  return kv.get<JobListing>(`${JOB_KEY_PREFIX}${jobId}`);
}

// Get all job listings
export async function getAllJobListings(): Promise<JobListing[]> {
  const jobIds = await kv.smembers(ALL_JOBS_KEY) as string[];
  const jobs: JobListing[] = [];
  
  for (const jobId of jobIds) {
    const job = await getJobListing(jobId);
    if (job) {
      jobs.push(job);
    }
  }
  
  return jobs;
}

// Get job listings by company
export async function getJobListingsByCompany(company: string): Promise<JobListing[]> {
  const allJobs = await getAllJobListings();
  return allJobs.filter(job => job.company.toLowerCase() === company.toLowerCase());
}

// Update company stats
export async function updateCompanyStats(company: string, jobs: JobListing[]): Promise<CompanyStats> {
  const jobsByCategory: Record<string, number> = {};
  
  // Count jobs by category
  for (const job of jobs) {
    const category = job.category || 'Uncategorized';
    jobsByCategory[category] = (jobsByCategory[category] || 0) + 1;
  }
  
  const stats: CompanyStats = {
    company,
    totalJobs: jobs.length,
    jobsByCategory,
    lastUpdated: Date.now()
  };
  
  // Store the stats
  await kv.set(`${COMPANY_STATS_KEY_PREFIX}${company.toLowerCase()}`, stats);
  
  return stats;
}

// Get company stats
export async function getCompanyStats(company: string): Promise<CompanyStats | null> {
  return kv.get<CompanyStats>(`${COMPANY_STATS_KEY_PREFIX}${company.toLowerCase()}`);
}

// Get all company stats
export async function getAllCompanyStats(): Promise<CompanyStats[]> {
  const allJobs = await getAllJobListings();
  const companies = new Set(allJobs.map(job => job.company.toLowerCase()));
  const stats: CompanyStats[] = [];
  
  for (const company of companies) {
    const companyStats = await getCompanyStats(company);
    if (companyStats) {
      stats.push(companyStats);
    }
  }
  
  return stats;
} 