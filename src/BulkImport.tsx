// src/BulkImport.tsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

interface BulkImportProps {
  onRefresh: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('कृपया पहले कोई फ़ाइल चुनें!');
      return;
    }

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);  // ← ✅ FIXED

      for (const row of json) {
        await addDoc(collection(db, 'members'), {
          name: row['Name'] || row['नाम'] || '',
          fatherName: row['Father Name'] || row['पिता का नाम'] || '',
          gotra: row['Gotra'] || row['गोत्र'] || '',
          relationToHead: row['Relation'] || row['संबंध'] || '',
          dob: row['DOB']?.toString() || row['जन्म तिथि']?.toString() || '',
          age_years: row['Age']?.toString() || row['उम्र']?.toString() || '',
          gender: row['Gender'] || row['लिंग'] || '',
          maritalStatus: row['Marital Status'] || row['वैवाहिक स्थिति'] || '',
          education: row['Education'] || row['शिक्षा'] || '',
          occupation: row['Occupation'] || row['व्यवसाय'] || '',
          villageCity: row['Village/City'] || row['गाँव/शहर'] || '',
          area: row['Area'] || row['एरिया'] || '',
          address: row['Address'] || row['पता'] || '',
          mobile1: row['Mobile 1'] || row['मोबाइल 1'] || '',
          mobile2: row['Mobile 2'] || row['मोबाइल 2'] || '',
          bloodGroup: row['Blood Group'] || row['ब्लड ग्रुप'] || '',
          isStudent: row['Is Student'] === 'Yes' || row['छात्र'] === 'हाँ' || false,
          isHead: row['Is Head'] === 'Yes' || row['मुखिया'] === 'हाँ' || false,
          memberNo: row['Member No'] || row['सदस्य क्रमांक'] || '',
          familyID: row['Family ID']?.toString() || '',
        });
      }

      alert(`✅ ${json.length} रिकॉर्ड सफलतापूर्वक इम्पोर्ट हो गए!`);
      onRefresh();
      setFile(null);
      const fileInput = document.getElementById('bulk-import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error(error);
      alert('❌ इम्पोर्ट में गड़बड़ी हुई! कृपया फ़ाइल फॉर्मेट चेक करें।');
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: '2px dashed #cbd5e1',
      borderRadius: '12px',
      padding: '20px',
      background: '#f8fafc',
      textAlign: 'center',
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>
        📤 Excel/CSV बल्क इम्पोर्ट
      </h4>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
        .xlsx, .xls, .csv फ़ाइल सपोर्ट करता है
      </p>
      
      <input
        id="bulk-import-file"
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        style={{
          display: 'block',
          margin: '0 auto 12px auto',
          padding: '8px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          width: '100%',
          maxWidth: '300px',
          background: 'white',
        }}
      />
      
      {file && (
        <div style={{ fontSize: '13px', color: '#16a34a', marginBottom: '12px' }}>
          ✅ {file.name} ({Math.round(file.size / 1024)} KB)
        </div>
      )}
      
      <button
        onClick={handleImport}
        disabled={loading}
        style={{
          padding: '8px 24px',
          background: loading ? '#94a3b8' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'all 0.3s',
        }}
      >
        {loading ? '⏳ इम्पोर्ट हो रहा है...' : '📥 इम्पोर्ट करें'}
      </button>
    </div>
  );
};

export default BulkImport;