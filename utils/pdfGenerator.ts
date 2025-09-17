
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WorkTimeEntry, MonthlyData } from '../types/WorkTime';

export const generatePDF = async (
  data: MonthlyData | WorkTimeEntry[],
  userName: string,
  title: string
): Promise<void> => {
  try {
    console.log('Generating PDF:', title);
    
    const entries = Array.isArray(data) ? data : data.entries;
    const totalHours = Array.isArray(data) 
      ? data.reduce((sum, entry) => sum + entry.totalHours, 0)
      : data.totalHours;

    const htmlContent = generateHTMLContent(entries, userName, title, totalHours);
    
    // Create HTML file
    const htmlUri = FileSystem.documentDirectory + 'worktime.html';
    await FileSystem.writeAsStringAsync(htmlUri, htmlContent);
    
    // For now, we'll share the HTML file since react-native-html-to-pdf might have issues
    // In a production app, you'd want to use a proper PDF generation library
    await Sharing.shareAsync(htmlUri, {
      mimeType: 'text/html',
      dialogTitle: 'Arbeitszeit Bericht teilen',
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const generateHTMLContent = (
  entries: WorkTimeEntry[],
  userName: string,
  title: string,
  totalHours: number
): string => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const tableRows = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => `
      <tr>
        <td>${formatDate(entry.date)}</td>
        <td>${entry.startTime}</td>
        <td>${entry.endTime}</td>
        <td>${entry.hasBreak ? 'Ja' : 'Nein'}</td>
        <td>${formatHours(entry.totalHours)}</td>
        <td>${entry.notes || '-'}</td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2196F3;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #2196F3;
          margin-bottom: 10px;
        }
        .report-title {
          font-size: 18px;
          margin-bottom: 10px;
        }
        .employee-name {
          font-size: 16px;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #2196F3;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .summary {
          margin-top: 30px;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        .total-hours {
          font-size: 18px;
          font-weight: bold;
          color: #2196F3;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Asendorf Elektrotechnik</div>
        <div class="report-title">${title}</div>
        <div class="employee-name">Mitarbeiter: ${userName || 'Nicht angegeben'}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Startzeit</th>
            <th>Endzeit</th>
            <th>Pause</th>
            <th>Stunden</th>
            <th>Notizen</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div class="summary">
        <div class="total-hours">
          Gesamtstunden: ${formatHours(totalHours)}
        </div>
        <div>Anzahl Arbeitstage: ${entries.length}</div>
      </div>
      
      <div class="footer">
        Erstellt am ${new Date().toLocaleDateString('de-DE')} mit Asendorf Elektrotechnik Work Time App
      </div>
    </body>
    </html>
  `;
};
