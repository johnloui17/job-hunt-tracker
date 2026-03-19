import xlsx from 'xlsx';
const workbook = xlsx.readFile('../Job_Hunt_Tracker.xlsx');
console.log('Sheets:', workbook.SheetNames);
for (const sheetName of workbook.SheetNames.slice(1)) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
    console.log(data.slice(0, 3));
}
