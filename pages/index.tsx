import { Layout, Text, Page, Link } from '@vercel/examples-ui'
import Head from 'next/head'
import useSWR from 'swr'
import JobCard from '@/components/JobCard'
import CompanyStats from '@/components/CompanyStats'
import { JobListing, CompanyStats as CompanyStatsType } from '@/lib/types'
import { useState, useEffect } from 'react'

interface JobData {
  fetchedAt: number;
  jobListings: JobListing[];
  companyStats: CompanyStatsType[];
  totalJobs: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [autoScrapeDone, setAutoScrapeDone] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [nextScrapeTime, setNextScrapeTime] = useState<number | null>(null);
  
  // Fetch job data
  const { data, error, mutate } = useSWR<JobData>('/api/data/1d', (url: string) =>
    fetch(url).then((res) => res.json())
  );
  
  // 自动执行爬虫任务（仅在页面首次加载时）
  useEffect(() => {
    const autoScrape = async () => {
      if (autoScrapeDone) return;
      
      setIsLoading(true);
      setScrapeError(null);
      
      try {
        console.log('Auto-scraping jobs on page load...');
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          // 处理限流情况
          if (response.status === 429) {
            console.log('Rate limited, using cached data');
            setNextScrapeTime(responseData.canScrapeAfter);
            // 如果有上次的数据，刷新显示
            if (responseData.lastScrapeData) {
              await mutate();
            }
            setScrapeError(`${responseData.message}. Using cached data.`);
          } else {
            throw new Error(responseData.message || 'Failed to auto-scrape jobs');
          }
        } else {
          // 成功爬取，刷新数据
          await mutate();
          setNextScrapeTime(null);
        }
        
        setAutoScrapeDone(true);
      } catch (error) {
        console.error('Error auto-scraping jobs:', error);
        setScrapeError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    // 如果没有数据或数据为空，则执行自动爬取
    if (!data || !data.jobListings || data.jobListings.length === 0) {
      autoScrape();
    } else {
      setAutoScrapeDone(true);
    }
  }, [data, mutate, autoScrapeDone]);
  
  // 手动触发爬虫任务
  const handleScrape = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setScrapeError(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // 处理限流情况
        if (response.status === 429) {
          console.log('Rate limited, using cached data');
          setNextScrapeTime(responseData.canScrapeAfter);
          setScrapeError(`${responseData.message}. Using cached data.`);
        } else {
          throw new Error(responseData.message || 'Failed to scrape jobs');
        }
      } else {
        // 成功爬取，刷新数据
        await mutate();
        setNextScrapeTime(null);
      }
    } catch (error) {
      console.error('Error scraping jobs:', error);
      setScrapeError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 格式化下次可爬取时间
  const formatNextScrapeTime = () => {
    if (!nextScrapeTime) return null;
    
    const now = Date.now();
    if (nextScrapeTime <= now) return 'Now';
    
    const seconds = Math.ceil((nextScrapeTime - now) / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minutes`;
  };
  
  return (
    <Page>
      <Head>
        <title>Job Aggregator</title>
      </Head>
      <section className="flex flex-col gap-6">
        <Text variant="h1">AI Job Crawler</Text>
        <Text>
          This application aggregates job listings from big tech companies like Google, Amazon, and Aliyun.
        </Text>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {nextScrapeTime && (
            <div className="text-sm text-gray-500">
              Next scrape available in: {formatNextScrapeTime()}
            </div>
          )}
          <button
            onClick={handleScrape}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-300"
          >
            {isLoading ? 'Scraping...' : 'Scrape Jobs Now'}
          </button>
        </div>
        
        {scrapeError && (
          <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
            {scrapeError}
          </div>
        )}
      </section>
      
      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-500 rounded-md">
          Error loading job data: {error.message}
        </div>
      )}
      
      {!data && !error && (
        <div className="mt-8 grid gap-6">
          <div className="animate-pulse bg-gray-200 h-40 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="animate-pulse bg-gray-200 h-60 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 h-60 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 h-60 rounded-lg"></div>
          </div>
        </div>
      )}
      
      {data && (
        <>
          <section className="mt-10 pt-10 border-t border-gray-300">
            <Text variant="h2">Company Statistics</Text>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.companyStats?.map((stats) => (
                <CompanyStats key={stats.company} stats={stats} />
              ))}
              
              {(!data.companyStats || data.companyStats.length === 0) && (
                <div className="col-span-3 p-4 bg-yellow-50 text-yellow-600 rounded-md">
                  No company statistics available. Try scraping jobs first.
                </div>
              )}
            </div>
          </section>
          
          <section className="mt-10 pt-10 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <Text variant="h2">Recent Job Listings</Text>
              <Text className="text-gray-500">
                Total: {data.totalJobs || 0} jobs
              </Text>
            </div>
            <div className="mt-6 grid gap-6">
              {data.jobListings?.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              
              {(!data.jobListings || data.jobListings.length === 0) && (
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-md">
                  No job listings available. Try scraping jobs first.
                </div>
              )}
            </div>
          </section>
          
          <div className="mt-6 text-sm text-gray-400 text-right">
            Last updated: {data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : 'Never'}
          </div>
        </>
      )}
    </Page>
  )
}

Home.Layout = Layout
