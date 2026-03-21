import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { updateTaskStatus } from '../server/tasks'
import { downloadExcel } from '../server/download'
import { tasksQueryOptions } from '../server/tasks.queries'
import { CheckCircle, Circle, Download, ChevronDown, ChevronUp, Lightbulb, ListTodo, Clock, Sparkles, LayoutPanelTop } from 'lucide-react'
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
  const { tasks = [], lastModified } = tasksQuery.data || {}
  const router = useRouter()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

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
    updateMutation.mutate({ id, status: newStatus })
  }

  const toggleSection = (sheetName: string) => {
    const next = new Set(collapsedSections)
    if (next.has(sheetName)) {
      next.delete(sheetName)
    } else {
      next.add(sheetName)
    }
    setCollapsedSections(next)
  }

  const expandAll = () => setCollapsedSections(new Set())
  const collapseAll = () => {
    const allSheets = new Set(Object.keys(groupedTasks))
    setCollapsedSections(allSheets)
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

  const parseHowTo = (howTo: string) => {
    if (!howTo) return []
    return howTo
      .split(/\n|•|\*/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
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

  const getBonusSteps = (sheetName: string) => {
    if (sheetName.includes('Resume')) return ['Run your resume through an ATS checker (e.g., Jobscan).', 'Save your resume as "John_Loui_FullStack_Engineer.pdf".']
    if (sheetName.includes('GitHub')) return ['Add a "Hire Me" button to your profile README.', 'Ensure you have at least 1 public repo with a commit every 2 days.']
    if (sheetName.includes('LinkedIn')) return ['Turn on "Creator Mode" to highlight your best content.', 'Engage with 3 posts from hiring managers daily.']
    return []
  }

  // Group tasks by sheet
  const groupedTasks = (tasks || []).reduce((acc, task) => {
    if (!acc[task.sheetName]) acc[task.sheetName] = []
    acc[task.sheetName].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-end bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">v2.1</span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-400 font-medium italic">Powered by your Job Hunt Spreadsheet</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Task Tracker</h1>
            <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Last synced: <span className="text-gray-700">{lastModified || 'Just now'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 mr-2">
              <button 
                onClick={collapseAll}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Collapse All
              </button>
              <button 
                onClick={expandAll}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight text-gray-500 hover:text-gray-900 transition-colors cursor-pointer border-l border-gray-200"
              >
                Expand All
              </button>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl cursor-pointer font-bold text-sm active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([sheetName, sheetTasks]) => {
            const completedCount = sheetTasks.filter(t => t.status === 'Done').length
            const progress = Math.round((completedCount / sheetTasks.length) * 100) || 0
            const bonusSteps = getBonusSteps(sheetName)
            const isSectionCollapsed = collapsedSections.has(sheetName)

            return (
              <section key={sheetName} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden transition-all duration-500">
                <div 
                  className="px-8 py-6 flex justify-between items-center bg-gray-50/20 cursor-pointer group/header"
                  onClick={() => toggleSection(sheetName)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 ${isSectionCollapsed ? 'bg-gray-100 text-gray-400 scale-90' : progress === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {sheetName.split(' ')[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        {sheetName.split(' ').slice(1).join(' ')}
                        <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isSectionCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                      </h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{completedCount} of {sheetTasks.length} Milestones</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                      <span className={`text-2xl font-black transition-colors duration-300 ${isSectionCollapsed ? 'text-gray-300' : progress === 100 ? 'text-green-500' : 'text-blue-600'}`}>{progress}%</span>
                    </div>
                    <div className="relative w-40 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                      <div 
                        className={`h-full transition-all duration-1000 ease-in-out ${isSectionCollapsed ? 'bg-gray-200' : progress === 100 ? 'bg-green-500' : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]'}`}
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {!isSectionCollapsed && (
                  <div className="divide-y divide-gray-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    {sheetTasks.map(task => {
                      const isExpanded = expandedTaskId === task.id
                      const smartTip = getSmartTip(task.task)
                      const todos = parseHowTo(task.howTo)

                      return (
                        <div 
                          key={task.id} 
                          className={`transition-all duration-300 ${isExpanded ? 'bg-blue-50/10' : 'hover:bg-gray-50/30'} ${task.status === 'Done' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                        >
                          <div 
                            className="px-8 py-5 flex items-center gap-5 cursor-pointer group"
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                          >
                            <button
                              onClick={(e) => toggleTask(e, task.id, task.status)}
                              className={`flex-shrink-0 transition-all duration-200 hover:scale-110 ${task.status === 'Done' ? 'text-green-500' : 'text-gray-200 group-hover:text-blue-400'}`}
                            >
                              {task.status === 'Done' ? (
                                <CheckCircle className="w-7 h-7 fill-green-50" />
                              ) : (
                                <Circle className="w-7 h-7" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className={`text-[16px] font-bold tracking-tight ${task.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                  {task.task}
                                </span>
                                {task.priority && (
                                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-widest rounded-full font-black border ${
                                    task.priority.toLowerCase() === 'high' 
                                      ? 'bg-red-50 text-red-600 border-red-100' 
                                      : 'bg-blue-50 text-blue-600 border-blue-100'
                                  }`}>
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                              {task.category && (
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">{task.category}</p>
                              )}
                            </div>

                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                              <ChevronDown className="w-5 h-5" />
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-[84px] pb-8 pt-2 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                              {task.description && (
                                <div className="flex gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Lightbulb className="w-5 h-5 text-amber-500" />
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Strategy & Motivation</h4>
                                    <p className="text-[15px] text-gray-600 leading-relaxed font-medium">{task.description}</p>
                                  </div>
                                </div>
                              )}
                              
                              {todos.length > 0 && (
                                <div className="flex gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                                    <ListTodo className="w-5 h-5 text-blue-500" />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">Checklist for completion</h4>
                                    <div className="space-y-2.5">
                                      {todos.map((todo, idx) => (
                                        <div key={idx} className="flex items-start gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                          <div className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-blue-100" />
                                          </div>
                                          <span className="text-sm text-gray-700 font-semibold leading-tight">{todo}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {(smartTip || bonusSteps.length > 0) && (
                                <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border border-blue-100 rounded-3xl p-6 relative overflow-hidden group/tip">
                                  <div className="absolute -right-4 -top-4 opacity-10 group-hover/tip:scale-110 transition-transform duration-700">
                                    <Sparkles className="w-24 h-24 text-blue-600" />
                                  </div>
                                  <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                      <Sparkles className="w-4 h-4 text-blue-600" />
                                      <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Enrichment Hub</h4>
                                    </div>
                                    
                                    {smartTip && (
                                      <p className="text-[15px] text-indigo-900 font-bold mb-4">{smartTip}</p>
                                    )}

                                    {bonusSteps.length > 0 && (
                                      <div className="space-y-2 pt-2 border-t border-blue-100/50">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Recommended next steps</p>
                                        {bonusSteps.map((step, idx) => (
                                          <div key={idx} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            <span className="text-sm text-indigo-700 font-medium">{step}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
