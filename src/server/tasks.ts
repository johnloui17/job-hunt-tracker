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
  priority: string;
  effort: string;
}

export const getTasks = createServerFn({ method: 'GET' }).handler(async () => {
  if (!fs.existsSync(ABS_PATH)) {
    console.error('File not found at', ABS_PATH)
    return []
  }

  try {
    const workbook = xlsx.default.readFile(ABS_PATH)
    const allTasks: Task[] = []

    for (const sheetName of workbook.SheetNames.slice(1)) {
      const worksheet = workbook.Sheets[sheetName]
      const data = xlsx.default.utils.sheet_to_json<any>(worksheet, { header: 1, defval: "" })
      
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
          priority: row[5] || "",
          effort: row[6] || "",
        })
      }
    }

    return allTasks
  } catch (error: any) {
    console.error('Error in getTasks:', error.message)
    return []
  }
})

export const getRawExcelData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const [xlsx, fs] = await Promise.all([import('xlsx'), import('fs')]);
    const ABS_PATH = '/Users/loui/Desktop/FIND JOB!/Job_Hunt_Tracker.xlsx';
    
    if (!fs.default.existsSync(ABS_PATH)) return [];

    const workbook = xlsx.default.readFile(ABS_PATH);
    const results: { sheetName: string; rows: any[] }[] = [];

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows = xlsx.default.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
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
    const workbook = xlsx.default.readFile(ABS_PATH)
    const [sheetName, rowIndexStr] = data.id.split('-')
    const rowIndex = parseInt(rowIndexStr, 10)
    const worksheet = workbook.Sheets[sheetName]
    if (worksheet) {
      const cellAddress = xlsx.default.utils.encode_cell({ r: rowIndex, c: 1 })
      worksheet[cellAddress] = { t: 's', v: data.status }
      xlsx.default.writeFile(workbook, ABS_PATH)
      return { success: true }
    }
    throw new Error('Sheet not found')
  })
