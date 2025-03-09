// Job listing interface
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  postedDate: string;
  scrapedAt: number;
  source: 'google' | 'amazon' | 'aliyun';
  category?: string;
}

// Company stats interface
export interface CompanyStats {
  company: string;
  totalJobs: number;
  jobsByCategory: Record<string, number>;
  lastUpdated: number;
}

// Scraper response interface
export interface ScraperResponse {
  success: boolean;
  jobsCount: number;
  jobs: JobListing[];
  error?: string;
} 