import * as XLSX from 'xlsx';

const excelFilePath = "/data/front-end-dynamic-table.xlsx"

export function excelToJson() {
    return new Promise((resolve, reject) => {
        fetch(excelFilePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob(); 
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstWorkSheetName = workbook.SheetNames[0];
                    const workSheet = workbook.Sheets[firstWorkSheetName];
                    const jsonData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
                    const headers = jsonData[0]; 

                    const rows = jsonData.slice(1)
                        .filter(row => {
                            return row.some(cell => cell !== null && cell !== undefined && cell !== '' && cell != 'NA');
                        })
                        .map(row => {
                        const rowObj = {};
                        headers.forEach((header, index) => {
                            rowObj[header] = row[index]; 
                        });
                        return rowObj;
                    });

                    resolve({
                        headers: headers,
                        rows: rows
                    });
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch(error => {
                reject(error);
            });
    });
}
