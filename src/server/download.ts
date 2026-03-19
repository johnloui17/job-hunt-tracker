import { createServerFn } from '@tanstack/react-start'
import path from 'path'
import fs from 'fs'

export const downloadExcel = createServerFn({ method: 'GET' }).handler(async () => {
  const filePath = path.resolve(process.cwd(), '../Job_Hunt_Tracker.xlsx')
  
  try {
    const fileBuffer = fs.readFileSync(filePath)
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Job_Hunt_Tracker.xlsx"'
      }
    })
  } catch (error) {
    return new Response('File not found', { status: 404 })
  }
})
