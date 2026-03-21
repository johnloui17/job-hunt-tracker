import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { updateTaskStatus } from '../server/tasks'
import { downloadExcel } from '../server/download'
import { tasksQueryOptions } from '../server/tasks.queries'
import { CheckCircle, Circle, Download, ChevronDown, ChevronUp, Lightbulb, ListTodo } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(tasksQueryOptions())
  },
})

function App() {
  const { queryClient } = Route.useRouteContext()
  const tasksQuery = useSuspenseQuery(tasksQueryOptions())
  const tasks = tasksQuery.data || []
  const router = useRouter()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  const updateMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.invalidate()
    },
  })

  const toggleTask = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation()
    const newStatus = currentStatus === 'Done' ? '' : 'Done'
    updateMutation.mutate({ data: { id, status: newStatus } })
  }

  const handleDownload = async () => {
    const response = await downloadExcel()
    if (response instanceof Response) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Job_Hunt_Tracker.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  const getSmartTip = (taskName: string) => {
    const lowerTask = taskName.toLowerCase()
    if (lowerTask.includes('github')) return 'Pro Tip: Ensure your GitHub pinned repositories have high-quality READMEs and live demo links.'
    if (lowerTask.includes('linkedin')) return 'Pro Tip: Customizing your LinkedIn URL (e.g., /in/yourname) makes it look much more professional on a resume.'
    if (lowerTask.includes('summary')) return 'Pro Tip: Use the formula: "[Role] with [X] years of experience in [Stack] who achieved [Result]." Keep it under 3 sentences.'
    if (lowerTask.includes('number') || lowerTask.includes('metrics')) return 'Pro Tip: If you don’t have exact data, use estimates like "Improved efficiency by ~20%" based on user feedback or build speed.'
    if (lowerTask.includes('referral')) return 'Pro Tip: When asking for referrals, always provide a 2-sentence blurb they can copy-paste to their hiring manager.'
    return null
  }

  // Group tasks by sheet
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.sheetName]) acc[task.sheetName] = []
    acc[task.sheetName].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Task Tracker</h1>
            <p className="text-gray-500 mt-2 font-medium">Strategic roadmap to your next role</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer font-semibold"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </header>

        <div className="space-y-10">
          {Object.entries(groupedTasks).map(([sheetName, sheetTasks]) => {
            const completedCount = sheetTasks.filter(t => t.status === 'Done').length
            const progress = Math.round((completedCount / sheetTasks.length) * 100) || 0

            return (
              <section key={sheetName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    {sheetName}
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{completedCount} / {sheetTasks.length} Done</span>
                      <span className="text-sm text-blue-600 font-bold">{progress}%</span>
                    </div>
                    <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {sheetTasks.map(task => {
                    const isExpanded = expandedTaskId === task.id
                    const smartTip = getSmartTip(task.task)

                    return (
                      <div 
                        key={task.id} 
                        className={`transition-all duration-200 ${isExpanded ? 'bg-blue-50/20' : 'hover:bg-gray-50/50'} ${task.status === 'Done' ? 'opacity-70' : ''}`}
                      >
                        <div 
                          className="px-6 py-4 flex items-center gap-4 cursor-pointer"
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        >
                          <button
                            onClick={(e) => toggleTask(e, task.id, task.status)}
                            className="flex-shrink-0 text-gray-300 hover:text-green-500 transition-colors"
                          >
                            {task.status === 'Done' ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className="w-6 h-6" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className={`font-semibold text-[15px] ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {task.task}
                              </span>
                              {task.priority && (
                                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md font-bold border ${
                                  task.priority.toLowerCase() === 'high' 
                                    ? 'bg-red-50 text-red-600 border-red-100' 
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            {task.category && (
                              <p className="text-xs text-gray-400 font-medium mt-0.5">{task.category}</p>
                            )}
                          </div>

                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-16 pb-6 pt-2 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            {task.description && (
                              <div className="flex gap-3">
                                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Why this matters</h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
                                </div>
                              </div>
                            )}
                            
                            {task.howTo && (
                              <div className="flex gap-3">
                                <ListTodo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Action Items</h4>
                                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.howTo}</p>
                                </div>
                              </div>
                            )}

                            {smartTip && (
                              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                                <span className="text-lg">✨</span>
                                <p className="text-sm text-blue-800 font-medium italic">{smartTip}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
