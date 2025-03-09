import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import { getAllJobListings, getAllCompanyStats } from '@/lib/db'

interface CronData {
  fetchedAt: number | null;
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const interval = req.query.interval as string
  if (!interval) return res.status(400).json({ error: 'No interval provided' })
  
  // Get the cron job data
  const cronData = await kv.get<CronData>(interval) || { fetchedAt: null }
  
  // If the interval is 1d, return job listings and stats
  if (interval === '1d') {
    // Get all job listings and company stats
    const [jobListings, companyStats] = await Promise.all([
      getAllJobListings(),
      getAllCompanyStats()
    ])
    
    return res.status(200).json({
      fetchedAt: cronData.fetchedAt,
      jobListings: jobListings.slice(0, 10), // Return only the first 10 jobs
      companyStats,
      totalJobs: jobListings.length
    })
  } else {
    // For other intervals, just return the cron data
    return res.status(200).json({
      fetchedAt: cronData.fetchedAt,
      message: `No job data available for interval: ${interval}`
    })
  }
}
