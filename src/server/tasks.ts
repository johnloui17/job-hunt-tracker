import { createServerFn } from '@tanstack/react-start'
import * as xlsx from 'xlsx'
import path from 'path'
import fs from 'fs'

const ABS_PATH = '/Users/loui/Desktop/FIND JOB!/Job_Hunt_Tracker.xlsx'

export type Task = {
  id: string;
  sheetName: string;
  rowIndex: number;
  category: string;
  status: string;
  task: string;
  description: string;
  howTo: string;
  priority: string;
  effort: string;
}

export const getTasks = createServerFn({ method: 'GET' }).handler(async () => {
  console.log('--- getTasks called ---')
  if (!fs.existsSync(ABS_PATH)) {
    console.error('File not found at', ABS_PATH)
    return []
  }

  try {
    const workbook = (xlsx as any).default ? (xlsx as any).default.readFile(ABS_PATH) : xlsx.readFile(ABS_PATH)
    console.log('Workbook loaded, sheets:', workbook.SheetNames)
    const allTasks: Task[] = []

    for (const sheetName of workbook.SheetNames.slice(1)) {
      const worksheet = workbook.Sheets[sheetName]
      const data = (xlsx as any).default ? (xlsx as any).default.utils.sheet_to_json<any>(worksheet, { header: 1, defval: "" }) : xlsx.utils.sheet_to_json<any>(worksheet, { header: 1, defval: "" })
      
      for (let i = 6; i < data.length; i++) {
        const row = data[i]
        if (!row || (!row[1] && !row[2])) continue;
        
        allTasks.push({
          id: `${sheetName}-${i}`,
          sheetName,
          rowIndex: i,
          category: row[0] || "",
          status: row[1] || "",
          task: row[2] || "",
          description: row[3] || "",
          howTo: row[4] || "",
          priority: row[5] || "",
          effort: row[6] || "",
        })
      }
    }

    console.log(`Parsed ${allTasks.length} tasks.`)
    return allTasks
  } catch (error: any) {
    console.error('Error in getTasks:', error.message)
    return []
  }
})

export const getRawExcelData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const workbook = (xlsx as any).default ? (xlsx as any).default.readFile(ABS_PATH) : xlsx.readFile(ABS_PATH)
    const results: { sheetName: string; rows: any[] }[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = (xlsx as any).default ? (xlsx as any).default.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) : xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      results.push({ sheetName, rows });
    }

    return results;
  } catch (error: any) {
    console.error('Error in getRawExcelData:', error.message);
    return [];
  }
})

export const updateTaskStatus = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: { id: string, status: string } }) => {
    console.log('--- updateTaskStatus called ---');
    console.log('Target ID:', data.id);
    console.log('New Status:', data.status);

    try {
      const workbook = (xlsx as any).default ? (xlsx as any).default.readFile(ABS_PATH) : xlsx.readFile(ABS_PATH)
      const [sheetName, rowIndexStr] = data.id.split('-')
      const rowIndex = parseInt(rowIndexStr, 10)
      const worksheet = workbook.Sheets[sheetName]
      
      if (worksheet) {
        const cellAddress = (xlsx as any).default ? (xlsx as any).default.utils.encode_cell({ r: rowIndex, c: 1 }) : xlsx.utils.encode_cell({ r: rowIndex, c: 1 })
        console.log('Updating cell ' + cellAddress + ' in sheet \"' + sheetName + '\"');
        
        worksheet[cellAddress] = { t: 's', v: data.status, w: data.status };
        
        if ((xlsx as any).default) {
          (xlsx as any).default.writeFile(workbook, ABS_PATH)
        } else {
          xlsx.writeFile(workbook, ABS_PATH)
        }
        console.log('File saved successfully.');
        return { success: true }
      }
      throw new Error('Sheet not found: ' + sheetName)
    } catch (error: any) {
      console.error('Error in updateTaskStatus server function:', error.message);
      throw error;
    }
  })
