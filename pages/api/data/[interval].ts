import { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'

interface CronData {
  fetchedAt: number | null;
  [key: string]: any;
}

// 常量
const JOB_KEY_PREFIX = 'job:';
const ALL_JOBS_KEY = 'all_jobs';
const MAX_JOBS = 3; // 限制只返回3个job

// 简化的Job类型，只包含基本信息
interface JobBasicInfo {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  source: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const interval = req.query.interval as string
  if (!interval) return res.status(400).json({ error: 'No interval provided' })
  
  try {
    // 获取cron任务数据
    const cronData = await kv.get<CronData>(interval) || { fetchedAt: null }
    
    // 如果是1d或1mo间隔，返回job列表和统计数据
    if (interval === '1d' || interval === '1mo') {
      // 设置超时，避免长时间运行
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );
      
      // 获取job数据的Promise
      const dataPromise = (async () => {
        // 使用SRANDMEMBER获取随机的几个job ID，而不是获取所有ID
        // 这比获取所有ID然后切片更高效
        const randomJobIds = await kv.srandmember(ALL_JOBS_KEY, MAX_JOBS) as string[];
        
        if (!randomJobIds || randomJobIds.length === 0) {
          return {
            jobs: [],
            totalJobs: 0
          };
        }
        
        // 构建所有job的键
        const jobKeys = randomJobIds.map(id => `${JOB_KEY_PREFIX}${id}`);
        
        // 使用MGET一次性获取多个job，而不是循环获取
        const jobsData = await kv.mget(jobKeys);
        
        // 获取总数（使用SCARD命令）
        const totalJobs = await kv.scard(ALL_JOBS_KEY);
        
        // 过滤掉null值并提取基本信息
        const jobs = jobsData
          .filter(job => job !== null)
          .map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            postedDate: job.postedDate,
            source: job.source
          } as JobBasicInfo));
        
        return {
          jobs,
          totalJobs
        };
      })();
      
      // 使用Promise.race避免长时间运行
      const { jobs, totalJobs } = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      // 修复的公司统计数据，确保包含jobsByCategory字段
      const companyStats = [
        { 
          company: 'Google', 
          totalJobs: 0, 
          jobsByCategory: { 'Software Engineering': 0, 'Other': 0 },
          lastUpdated: Date.now()
        },
        { 
          company: 'Amazon', 
          totalJobs: 0, 
          jobsByCategory: { 'Software Engineering': 0, 'Other': 0 },
          lastUpdated: Date.now()
        },
        { 
          company: 'Aliyun', 
          totalJobs: 0, 
          jobsByCategory: { 'Internship': 0, 'Other': 0 },
          lastUpdated: Date.now()
        }
      ];
      
      return res.status(200).json({
        fetchedAt: cronData.fetchedAt,
        jobListings: jobs,
        companyStats,
        totalJobs
      });
    } else {
      // 对于其他间隔，只返回cron数据
      return res.status(200).json({
        fetchedAt: cronData.fetchedAt,
        message: `No job data available for interval: ${interval}`
      });
    }
  } catch (error) {
    console.error(`Error in data API (${interval}):`, error);
    return res.status(500).json({
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
