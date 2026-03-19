import { createServerFn } from '@tanstack/react-start'
import xlsx from 'xlsx'
import path from 'path'

const filePath = path.resolve(process.cwd(), '../Job_Hunt_Tracker.xlsx')

export type Task = {
  id: string; // sheetName + rowIndex
  sheetName: string;
  rowIndex: number;
  category: string;
  status: string;
  task: string;
  priority: string;
  effort: string;
}

export const getTasks = createServerFn({ method: 'GET' }).handler(async () => {
  const workbook = xlsx.readFile(filePath)
  const allTasks: Task[] = []

  for (const sheetName of workbook.SheetNames.slice(1)) { // Skip dashboard
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json<any>(worksheet, { header: 1, defval: "" })
    
    // Row 3 (index 2) is header, data starts at index 3
    for (let i = 3; i < data.length; i++) {
      const row = data[i]
      if (!row || (!row[0] && !row[2])) continue; // skip totally empty rows
      
      allTasks.push({
        id: `${sheetName}-${i}`,
        sheetName,
        rowIndex: i,
        category: row[0] || "",
        status: row[1] || "",
        task: row[2] || "",
        priority: row[5] || "",
        effort: row[6] || "",
      })
    }
  }

  return allTasks
})

export const updateTaskStatus = createServerFn({ method: 'POST' })
  .validator((d: { id: string, status: string }) => d)
  .handler(async ({ data: { id, status } }) => {
    const workbook = xlsx.readFile(filePath)
    
    const [sheetName, rowIndexStr] = id.split('-');
    const rowIndex = parseInt(rowIndexStr, 10);

    const worksheet = workbook.Sheets[sheetName]
    if (worksheet) {
      // Status is in the second column (B)
      const cellAddress = xlsx.utils.encode_cell({ r: rowIndex, c: 1 })
      worksheet[cellAddress] = { t: 's', v: status }
      
      // We must write it back
      xlsx.writeFile(workbook, filePath)
      return { success: true }
    }
    throw new Error('Sheet not found')
  })
