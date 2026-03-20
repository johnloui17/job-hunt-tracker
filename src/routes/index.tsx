import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { updateTaskStatus } from '../server/tasks'
import { downloadExcel } from '../server/download'
import { tasksQueryOptions } from '../server/tasks.queries'
import { CheckCircle, Circle, Download } from 'lucide-react'

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

  const updateMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.invalidate()
    },
  })

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? '' : 'Done'
    updateMutation.mutate({ id, status: newStatus })
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

  // Group tasks by sheet
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.sheetName]) acc[task.sheetName] = []
    acc[task.sheetName].push(task)
    return acc
  }, {} as Record<string, typeof tasks>)

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Hunt Tracker</h1>
            <p className="text-gray-500 mt-2">Track every task needed to land your role</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Excel
          </button>
        </header>

        {tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500">No tasks found. Please check your Job_Hunt_Tracker.xlsx file.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTasks).map(([sheetName, sheetTasks]) => {
              const completedCount = sheetTasks.filter(t => t.status === 'Done').length
              const progress = Math.round((completedCount / sheetTasks.length) * 100) || 0

              return (
                <section key={sheetName} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      {sheetName}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 font-medium">{progress}% Complete</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-500" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {sheetTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`px-6 py-4 flex items-start gap-4 transition hover:bg-gray-50 ${task.status === 'Done' ? 'opacity-60' : ''}`}
                      >
                        <button
                          onClick={() => toggleTask(task.id, task.status)}
                          className="mt-1 flex-shrink-0 text-gray-400 hover:text-green-500 transition"
                        >
                          {task.status === 'Done' ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`font-medium ${task.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {task.task}
                            </span>
                            {task.priority && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                                {task.priority}
                              </span>
                            )}
                            {task.effort && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                                {task.effort}
                              </span>
                            )}
                          </div>
                          {task.category && (
                            <p className="text-sm text-gray-500">{task.category}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
