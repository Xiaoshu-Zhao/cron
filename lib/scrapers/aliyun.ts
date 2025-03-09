import FirecrawlApp from '@mendable/firecrawl-js';
import { JobListing, ScraperResponse } from '../types';
import { format } from 'date-fns';

// Initialize the FirecrawlApp with API key from environment variable
const apiKey = process.env.FIRECRAWL_API_KEY || '';
const app = new FirecrawlApp({ apiKey });

export async function scrapeAliyunJobs(): Promise<ScraperResponse> {
  try {
    // URL for Aliyun internship jobs
    const url = 'https://careers.aliyun.com/campus/position-list?campusType=internship&lang=zh';
    
    console.log('Scraping Aliyun jobs...');
    
    // Use firecrawl to scrape the page
    const scrapedData = await app.scrapeUrl(url, {
      formats: ['markdown'],
      pageOptions: {
        onlyMainContent: true
      }
    });
    
    if (!scrapedData || !scrapedData.data || !scrapedData.data.markdown) {
      return {
        success: false,
        jobsCount: 0,
        jobs: [],
        error: 'Failed to scrape Aliyun jobs'
      };
    }
    
    const markdown = scrapedData.data.markdown;
    
    // Parse the markdown to extract job listings
    // This is a simplified example - actual parsing would depend on the structure of the page
    const jobListings: JobListing[] = [];
    
    // Split the markdown by job listings (this is a simplified approach)
    const jobSections = markdown.split(/(?=## )/g).filter(section => 
      section.includes('实习') || 
      section.includes('开发') || 
      section.includes('工程师')
    );
    
    for (let i = 0; i < jobSections.length; i++) {
      const section: string = jobSections[i];
      
      // Extract job title
      const titleMatch = section.match(/## (.*?)(?:\n|$)/);
      const title = titleMatch ? titleMatch[1].trim() : '实习生';
      
      // Extract location
      const locationMatch = section.match(/地点: (.*?)(?:\n|$)/) || section.match(/Location: (.*?)(?:\n|$)/);
      const location = locationMatch ? locationMatch[1].trim() : '杭州';
      
      // Extract description (first paragraph after title)
      const descriptionMatch = section.match(/## .*?\n\n(.*?)(?:\n\n|$)/s);
      const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description available';
      
      // Extract URL (this is a placeholder as we don't have actual URLs in the markdown)
      const urlMatch = section.match(/\[Apply\]\((.*?)\)/) || section.match(/\[.*?\]\((.*?)\)/);
      const url = urlMatch ? urlMatch[1] : `https://careers.aliyun.com/campus/position-list?campusType=internship&lang=zh`;
      
      // Create job listing
      const job: JobListing = {
        id: `aliyun-${i}-${Date.now()}`,
        title,
        company: 'Aliyun',
        location,
        url,
        description,
        postedDate: format(new Date(), 'yyyy-MM-dd'),
        scrapedAt: Date.now(),
        source: 'aliyun',
        category: 'Internship'
      };
      
      jobListings.push(job);
    }
    
    return {
      success: true,
      jobsCount: jobListings.length,
      jobs: jobListings
    };
  } catch (error) {
    console.error('Error scraping Aliyun jobs:', error);
    return {
      success: false,
      jobsCount: 0,
      jobs: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 