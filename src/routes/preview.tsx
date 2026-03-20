import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getRawExcelData } from '../server/tasks'
import { queryOptions } from '@tanstack/react-query'

const rawExcelQueryOptions = () =>
  queryOptions({
    queryKey: ['rawExcel'],
    queryFn: () => getRawExcelData(),
  })

export const Route = createFileRoute('/preview')({
  component: PreviewPage,
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(rawExcelQueryOptions())
  },
})

function PreviewPage() {
  const rawDataQuery = useQuery(rawExcelQueryOptions())
  const data = rawDataQuery.data || []

  if (rawDataQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-medium">Loading Spreadsheet Data...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Excel Preview</h1>
          <p className="text-gray-500 mt-1">Direct view of Job_Hunt_Tracker.xlsx sheets</p>
        </header>

        <div className="space-y-10">
          {data.map((sheet) => (
            <section key={sheet.sheetName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">{sheet.sheetName}</h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-mono">
                  {sheet.rows.length} rows
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-50">
                    {sheet.rows.map((row: any[], rowIdx: number) => (
                      <tr key={rowIdx} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 py-2 text-[10px] font-mono text-gray-300 bg-gray-50/50 border-r border-gray-100 select-none w-10 text-center">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell: any, cellIdx: number) => (
                          <td 
                            key={cellIdx} 
                            className={`px-4 py-2.5 text-sm text-gray-600 border-r border-gray-50 last:border-r-0 whitespace-nowrap max-w-[300px] truncate ${rowIdx === 5 ? 'font-bold bg-gray-50/50 text-gray-900' : ''}`}
                            title={String(cell)}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sheet.rows.length === 0 && (
                <div className="p-12 text-center text-gray-400 italic">No data found in this sheet.</div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
