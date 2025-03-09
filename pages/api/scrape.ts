import { NextApiRequest, NextApiResponse } from 'next'
import { scrapeAllJobs, scrapeJobsByCompany } from '@/lib/scraper'
import { kv } from '@vercel/kv'

// 最小爬取间隔（毫秒）- 5分钟
const MIN_SCRAPE_INTERVAL = 5 * 60 * 1000;
const LAST_SCRAPE_KEY = 'last_scrape_timestamp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    // 检查上次爬取时间
    const lastScrapeTime = await kv.get<number>(LAST_SCRAPE_KEY) || 0;
    const now = Date.now();
    const timeSinceLastScrape = now - lastScrapeTime;
    
    // 如果距离上次爬取时间不足最小间隔，返回上次爬取的结果
    if (timeSinceLastScrape < MIN_SCRAPE_INTERVAL) {
      const timeRemaining = Math.ceil((MIN_SCRAPE_INTERVAL - timeSinceLastScrape) / 1000);
      
      // 获取上次爬取的数据
      const lastScrapeData = await kv.get('1d') || { 
        fetchedAt: lastScrapeTime,
        message: 'No previous scrape data available'
      };
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Please wait ${timeRemaining} seconds before scraping again`,
        lastScrapeTime,
        lastScrapeData,
        canScrapeAfter: lastScrapeTime + MIN_SCRAPE_INTERVAL
      });
    }
    
    const { company } = req.body;
    let response;
    
    // 如果提供了特定公司，只爬取该公司
    if (company && ['google', 'amazon', 'aliyun'].includes(company.toLowerCase())) {
      response = await scrapeJobsByCompany(company.toLowerCase() as 'google' | 'amazon' | 'aliyun');
    } else {
      // 否则，爬取所有公司
      response = await scrapeAllJobs();
    }
    
    // 更新上次爬取时间
    await kv.set(LAST_SCRAPE_KEY, now);
    
    return res.status(200).json({
      ...response,
      scrapedAt: now
    });
  } catch (error) {
    console.error('Error in scrape API:', error);
    return res.status(500).json({ 
      error: 'Failed to scrape jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 