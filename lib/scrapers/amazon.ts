import FirecrawlApp from '@mendable/firecrawl-js';
import { JobListing, ScraperResponse } from '../types';
import { format } from 'date-fns';

// Initialize the FirecrawlApp with API key from environment variable
const apiKey = process.env.FIRECRAWL_API_KEY || '';
const app = new FirecrawlApp({ apiKey });

export async function scrapeAmazonJobs(): Promise<ScraperResponse> {
  try {
    // URL for Amazon software engineer jobs
    const url = 'https://www.amazon.jobs/en/search?base_query=software+engineer&loc_query=';
    
    console.log('Scraping Amazon jobs...');
    
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
        error: 'Failed to scrape Amazon jobs'
      };
    }
    
    const markdown = scrapedData.data.markdown;
    
    // Parse the markdown to extract job listings
    // This is a simplified example - actual parsing would depend on the structure of the page
    const jobListings: JobListing[] = [];
    
    // Split the markdown by job listings (this is a simplified approach)
    const jobSections = markdown.split(/(?=## )/g).filter(section => 
      section.toLowerCase().includes('software') || 
      section.toLowerCase().includes('engineer')
    );
    
    for (let i = 0; i < jobSections.length; i++) {
      const section: string = jobSections[i];
      
      // Extract job title
      const titleMatch = section.match(/## (.*?)(?:\n|$)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Software Engineer';
      
      // Extract location
      const locationMatch = section.match(/Location: (.*?)(?:\n|$)/) || section.match(/\| (.*?) \|/);
      const location = locationMatch ? locationMatch[1].trim() : 'Unknown Location';
      
      // Extract description (first paragraph after title)
      const descriptionMatch = section.match(/## .*?\n\n(.*?)(?:\n\n|$)/s);
      const description = descriptionMatch ? descriptionMatch[1].trim() : 'No description available';
      
      // Extract URL (this is a placeholder as we don't have actual URLs in the markdown)
      const urlMatch = section.match(/\[Apply\]\((.*?)\)/) || section.match(/\[.*?\]\((.*?)\)/);
      const url = urlMatch ? urlMatch[1] : `https://www.amazon.jobs/en/search?base_query=software+engineer&loc_query=`;
      
      // Create job listing
      const job: JobListing = {
        id: `amazon-${i}-${Date.now()}`,
        title,
        company: 'Amazon',
        location,
        url,
        description,
        postedDate: format(new Date(), 'yyyy-MM-dd'),
        scrapedAt: Date.now(),
        source: 'amazon',
        category: 'Software Engineering'
      };
      
      jobListings.push(job);
    }
    
    return {
      success: true,
      jobsCount: jobListings.length,
      jobs: jobListings
    };
  } catch (error) {
    console.error('Error scraping Amazon jobs:', error);
    return {
      success: false,
      jobsCount: 0,
      jobs: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 