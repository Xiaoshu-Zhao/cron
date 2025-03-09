import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import { scrapeAllJobs } from '@/lib/scraper'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const cron = req.url?.split('/')[3]
  console.log(`Running cron job: ${cron}`)
  
  if (!cron) return res.status(400).json({ error: 'No cron provided' })
  
  // Only run the job scraper for the daily cron job
  if (cron === '1d') {
    const response = await scrapeAllJobs()
    
    // Store the scraping result in KV
    await kv.set(cron, {
      fetchedAt: Date.now(),
      ...response
    })
    
    return res.status(200).json(response)
  } else {
    // For other cron intervals, just update the timestamp
    const response = await kv.set(cron, {
      fetchedAt: Date.now(),
      message: `Cron job ${cron} executed but no scraping was performed`
    })
    
    return res.status(200).json(response)
  }
}
