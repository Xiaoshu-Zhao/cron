import { NextApiRequest, NextApiResponse } from 'next'
import { getJobListingsByCompany, getCompanyStats } from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const company = req.query.company as string
  
  if (!company) {
    return res.status(400).json({ error: 'No company provided' })
  }
  
  try {
    // Get jobs and stats for the company
    const [jobs, stats] = await Promise.all([
      getJobListingsByCompany(company),
      getCompanyStats(company)
    ])
    
    return res.status(200).json({
      company,
      jobs,
      stats,
      totalJobs: jobs.length
    })
  } catch (error) {
    console.error(`Error getting jobs for ${company}:`, error)
    return res.status(500).json({ 
      error: `Failed to get jobs for ${company}`,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 