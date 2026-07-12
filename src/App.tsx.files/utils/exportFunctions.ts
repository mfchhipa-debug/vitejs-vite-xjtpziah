// App.tsx.files/utils/exportFunctions.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Member, Committee } from '../types';

export const exportData = (members: Member[], format: string) => {
  const data = members.map(m => ({
    'Family ID': m.familyID || '',
    'Member No': m.memberNo || '',
    'Name': m.name || '',
    'Father Name': m.fatherName || '',
    'Gotra': m.gotra || '',
    'Relation': m.relationToHead || '',
    'DOB': m.dob || '',
    'Age Years': m.age_years || '',
    'Age Months': m.age_months || '',
    'Gender': m.gender || '',
    'Marital Status': m.maritalStatus || '',
    'Education': m.education || '',
    'Occupation': m.occupation || '',
    'Village/City': m.villageCity || '',
    'Area': m.area || '',
    'Address': m.address || '',
    'Mobile 1': m.mobile1 || '',
    'Mobile 2': m.mobile2 || '',
    'Blood Group': m.bloodGroup || '',
    'Is Student': m.isStudent ? 'Yes' : 'No',
    'Is Head': m.isHead ? 'Yes' : 'No'
  }));

  const headers = Object.keys(data[0] || {});
  const rows = data.map(obj => headers.map(key => obj[key as keyof typeof obj]));

  if (format === 'xlsx') {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    XLSX.writeFile(wb, `members_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  } else if (format === 'csv') {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  } else if (format === 'json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  } else if (format === 'pdf') {
    const doc = new jsPDF();
    doc.text('CSJ Report - Members List', 14, 20);
    const tableData = rows.map(row => row.map(cell => String(cell || '')));
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    doc.save(`members_export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};

export const exportCommitteeData = (committee: Committee[], format: string) => {
  const data = committee.map(c => ({
    'पद': c.designation || '',
    'नाम': c.name || '',
    'गोत्र': c.gotra || '',
    'मोबाइल': c.mobile || '',
    'कार्यकाल': c.tenure || '',
  }));

  const headers = Object.keys(data[0] || {});
  const rows = data.map(obj => headers.map(key => obj[key as keyof typeof obj]));

  if (format === 'xlsx') {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Committee');
    XLSX.writeFile(wb, `committee_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  } else if (format === 'csv') {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `committee_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  } else if (format === 'pdf') {
    const doc = new jsPDF();
    doc.text('CSJ Report - Committee Members', 14, 20);
    const tableData = rows.map(row => row.map(cell => String(cell || '')));
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 158, 11] }
    });
    doc.save(`committee_export_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};