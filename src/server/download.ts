import { createServerFn } from '@tanstack/react-start'

export const downloadExcel = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const [path, fs] = await Promise.all([
      import('path'),
      import('fs')
    ]);
    const ABS_PATH = '/Users/loui/Desktop/FIND JOB!/Job_Hunt_Tracker.xlsx';
    console.log('Attempting to download file from:', ABS_PATH);
    
    const fileBuffer = fs.default.readFileSync(ABS_PATH);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Job_Hunt_Tracker.xlsx"'
      }
    });
  } catch (error: any) {
    console.error('Download failed:', error.message);
    return new Response('File not found: ' + error.message, { status: 404 });
  }
})
