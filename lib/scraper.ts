import { scrapeGoogleJobs } from './scrapers/google';
import { scrapeAmazonJobs } from './scrapers/amazon';
import { scrapeAliyunJobs } from './scrapers/aliyun';
import { JobListing, ScraperResponse } from './types';
import { storeJobListings, updateCompanyStats } from './db';

// Scrape all job sites
export async function scrapeAllJobs(): Promise<{
  success: boolean;
  totalJobs: number;
  jobsByCompany: Record<string, number>;
  error?: string;
}> {
  try {
    console.log('Starting job scraping...');
    
    // Scrape jobs from all sources
    const [googleResponse, amazonResponse, aliyunResponse] = await Promise.all([
      scrapeGoogleJobs(),
      scrapeAmazonJobs(),
      scrapeAliyunJobs()
    ]);
    
    // Combine all jobs
    const allJobs: JobListing[] = [
      ...googleResponse.jobs,
      ...amazonResponse.jobs,
      ...aliyunResponse.jobs
    ];
    
    // Store all jobs in the database
    if (allJobs.length > 0) {
      await storeJobListings(allJobs);
      
      // Update company stats
      const googleJobs = googleResponse.jobs;
      const amazonJobs = amazonResponse.jobs;
      const aliyunJobs = aliyunResponse.jobs;
      
      if (googleJobs.length > 0) {
        await updateCompanyStats('Google', googleJobs);
      }
      
      if (amazonJobs.length > 0) {
        await updateCompanyStats('Amazon', amazonJobs);
      }
      
      if (aliyunJobs.length > 0) {
        await updateCompanyStats('Aliyun', aliyunJobs);
      }
    }
    
    // Calculate jobs by company
    const jobsByCompany: Record<string, number> = {
      Google: googleResponse.jobsCount,
      Amazon: amazonResponse.jobsCount,
      Aliyun: aliyunResponse.jobsCount
    };
    
    return {
      success: true,
      totalJobs: allJobs.length,
      jobsByCompany
    };
  } catch (error) {
    console.error('Error scraping jobs:', error);
    return {
      success: false,
      totalJobs: 0,
      jobsByCompany: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Scrape jobs from a specific company
export async function scrapeJobsByCompany(company: 'google' | 'amazon' | 'aliyun'): Promise<ScraperResponse> {
  try {
    switch (company.toLowerCase()) {
      case 'google':
        return scrapeGoogleJobs();
      case 'amazon':
        return scrapeAmazonJobs();
      case 'aliyun':
        return scrapeAliyunJobs();
      default:
        return {
          success: false,
          jobsCount: 0,
          jobs: [],
          error: `Invalid company: ${company}`
        };
    }
  } catch (error) {
    console.error(`Error scraping ${company} jobs:`, error);
    return {
      success: false,
      jobsCount: 0,
      jobs: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 