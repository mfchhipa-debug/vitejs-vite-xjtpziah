// App.tsx.files/utils/pdfGenerator.ts
import { Member, Committee } from '../types';

export const generatePDF = (reportType: string, members: Member[], committee: Committee[], filteredMembers: Member[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  let reportTitle = '';
  let tableHeaders = '';
  let tableRows = '';

  if (reportType === 'all_members') {
    reportTitle = '📋 सभी सदस्य (Family ID व ग्रुप के साथ)';
    tableHeaders = `<tr><th>Family ID</th><th>सदस्य का नाम</th><th>संबंध</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल 1</th><th>मोबाइल 2</th><th>शहर/गाँव</th></tr>`;
    filteredMembers.forEach((m: any) => {
      const displayName = m.isHead ? m.name : (m.fatherName ? `${m.name} S/O ${m.fatherName}` : m.name);
      tableRows += `
        <tr>
          <td><strong>${m.familyID || '-'}</strong></td>
          <td>${displayName}</td>
          <td>${m.relationToHead || '-'}</td>
          <td>${m.gotra || '-'}</td>
          <td>${m.age_years || '-'}</td>
          <td>${m.mobile1 || '-'}</td>
          <td>${m.mobile2 || '-'}</td>
          <td>${m.villageCity || '-'}</td>
        </tr>
      `;
    });
  } else if (reportType === 'students') {
    reportTitle = '🎓 छात्र / छात्राएं सूची';
    tableHeaders = `<tr><th>Family ID</th><th>नाम</th><th>गोत्र</th><th>उम्र</th><th>शहर/गाँव</th><th>मोबाइल 1</th><th>मोबाइल 2</th></tr>`;
    const students = members.filter((m: any) => m.occupation === 'छात्र' || m.occupation_isStudent === true);
    students.forEach((m: any) => {
      const displayName = m.fatherName ? `${m.name} S/O ${m.fatherName}` : m.name;
      tableRows += `
        <tr>
          <td>${m.familyID || '-'}</td>
          <td><strong>${displayName}</strong></td>
          <td>${m.gotra || '-'}</td>
          <td>${m.age_years || '-'}</td>
          <td>${m.villageCity || '-'}</td>
          <td>${m.mobile1 || '-'}</td>
          <td>${m.mobile2 || '-'}</td>
        </tr>
      `;
    });
  } else if (reportType === 'families') {
    reportTitle = '🏠 परिवार मुखिया सूची';
    tableHeaders = `<tr><th>Family ID</th><th>मुखिया का नाम</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल 1</th><th>मोबाइल 2</th><th>शहर/गाँव</th></tr>`;
    const headsList = members.filter((m: any) => m.isHead === true);
    headsList.forEach((m: any) => {
      tableRows += `
        <tr>
          <td><strong>${m.familyID || '-'}</strong></td>
          <td><strong>${m.name}</strong></td>
          <td>${m.gotra || '-'}</td>
          <td>${m.age_years || '-'}</td>
          <td>${m.mobile1 || '-'}</td>
          <td>${m.mobile2 || '-'}</td>
          <td>${m.villageCity || '-'}</td>
        </tr>
      `;
    });
  } else if (reportType === 'committee') {
    reportTitle = '🏢 समाज कमेटी पदाधिकारी सूची';
    tableHeaders = `<tr><th>पद</th><th>नाम</th><th>गोत्र</th><th>मोबाइल</th><th>कार्यकाल</th></tr>`;
    committee.forEach((c: any) => {
      tableRows += `
        <tr>
          <td style="color:#e65100; font-weight:bold;">⭐ ${c.designation}</td>
          <td><strong>${c.name}</strong></td>
          <td>${c.gotra || '-'}</td>
          <td>${c.mobile || '-'}</td>
          <td>${c.tenure || '-'}</td>
        </tr>
      `;
    });
  }

  printWindow.document.write(`
    <html>
    <head><title>${reportTitle}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #333; }
      .header-box { text-align: center; border-bottom: 3px double #2c3e50; padding-bottom: 12px; margin-bottom: 20px; }
      h2 { margin: 0; color: #2c3e50; font-size: 22px; }
      .meta-info { display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-top: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
      th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; }
      tr:nth-child(even) { background-color: #f8fafc; }
      @media print { body { padding: 0; } }
    </style>
    </head>
    <body>
      <div class="header-box">
        <h2>${reportTitle}</h2>
        <div class="meta-info">
          <span>कुल रिकॉर्ड: ${tableRows.split('<tr>').length - 1}</span>
          <span>तिथि: ${new Date().toLocaleDateString('hi-IN')}</span>
        </div>
      </div>
      <table>
        <thead>${tableHeaders}</thead>
        <tbody>${tableRows || '<tr><td colspan="10" style="text-align:center; color:#888;">कोई डेटा नहीं</td></tr>'}</tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};