import xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve(process.cwd(), '../Job_Hunt_Tracker.xlsx');

try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = '🐙 GitHub';
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  
  for (let i = 0; i < 10; i++) {
    console.log(`Row ${i + 1}:`, data[i]);
  }
} catch (error) {
  console.error(error);
}
