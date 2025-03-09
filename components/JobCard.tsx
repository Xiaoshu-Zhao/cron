import { JobListing } from '@/lib/types'
import ms from 'ms'

export default function JobCard({ job }: { job: JobListing }) {
  const { title, company, location, url, description, postedDate, scrapedAt } = job
  
  return (
    <div className="flex flex-col border border-gray-100 shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-lg font-semibold text-gray-600 hover:text-black transition-colors"
          >
            {title}
          </a>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-500">{company}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">{location}</span>
          </div>
        </div>
        <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
          {job.category || 'Job'}
        </div>
      </div>
      
      <p className="text-gray-600 mt-4 line-clamp-3">{description}</p>
      
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>Posted: {postedDate}</span>
        <span>Scraped {timeAgo(scrapedAt)}</span>
      </div>
    </div>
  )
}

const timeAgo = (time: number): string => {
  if (!time) return 'Never'
  return `${ms(Date.now() - new Date(time).getTime())} ago`
} 