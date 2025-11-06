export const downloadCSV = (headers: string[], data: (string | number)[][], filename: string) => {
    const csvRows = [headers.join(',')];
    data.forEach(row => {
        const escapedRow = row.map(item => {
            const strItem = String(item);
            // Escape commas, quotes, and newlines
            if (strItem.includes(',') || strItem.includes('"') || strItem.includes('\n')) {
                return `"${strItem.replace(/"/g, '""')}"`;
            }
            return strItem;
        });
        csvRows.push(escapedRow.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
