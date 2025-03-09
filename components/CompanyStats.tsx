import { CompanyStats as CompanyStatsType } from '@/lib/types'
import ms from 'ms'

export default function CompanyStats({ stats }: { stats: CompanyStatsType }) {
  const { company, totalJobs, jobsByCategory, lastUpdated } = stats
  
  return (
    <div className="border border-gray-100 shadow-md rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">{company}</h3>
        <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
          {totalJobs} jobs
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500">Jobs by Category</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(jobsByCategory).map(([category, count]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-gray-600">{category}</span>
              <span className="text-gray-500 text-sm">{count} jobs</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-right">
        Last updated: {timeAgo(lastUpdated)}
      </div>
    </div>
  )
}

const timeAgo = (time: number): string => {
  if (!time) return 'Never'
  return `${ms(Date.now() - new Date(time).getTime())} ago`
} 