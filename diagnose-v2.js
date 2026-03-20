import xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve(process.cwd(), '../Job_Hunt_Tracker.xlsx');

try {
  const workbook = xlsx.readFile(filePath);
  const sheetName = '📄 Resume';
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  
  const allTasks = [];
  for (let i = 6; i < data.length; i++) {
    const row = data[i];
    if (!row || (!row[1] && !row[2])) continue;
    allTasks.push({
      id: `${sheetName}-${i}`,
      sheetName,
      rowIndex: i,
      category: row[0] || "",
      status: row[1] || "",
      task: row[2] || "",
    });
  }
  console.log('Total tasks parsed:', allTasks.length);
  console.log('First task:', allTasks[0]);
} catch (error) {
  console.error(error);
}
