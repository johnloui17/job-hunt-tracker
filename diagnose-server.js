import xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve(process.cwd(), '../Job_Hunt_Tracker.xlsx');

try {
  console.log('Testing Excel parsing for server functions...');
  console.log('Target file path:', filePath);
  
  const workbook = xlsx.readFile(filePath);
  console.log('Workbook read successfully!');
  console.log('Sheet names:', workbook.SheetNames);
  
  const allTasks = [];
  for (const sheetName of workbook.SheetNames.slice(1)) {
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    console.log(`Parsing sheet "${sheetName}": ${data.length} rows found.`);
    
    for (let i = 3; i < data.length; i++) {
      const row = data[i];
      if (!row || (!row[0] && !row[2])) continue;
      allTasks.push({
        id: `${sheetName}-${i}`,
        sheetName,
        rowIndex: i,
        task: row[2] || "",
      });
    }
  }
  
  console.log(`Total tasks parsed: ${allTasks.length}`);
  if (allTasks.length > 0) {
    console.log('First task sample:', allTasks[0]);
  } else {
    console.warn('No tasks found! Check row indexing (starting at row 4/index 3).');
  }
  
} catch (error) {
  console.error('SERVER FUNCTION FAILURE DIAGNOSIS:');
  console.error(error);
  process.exit(1);
}
