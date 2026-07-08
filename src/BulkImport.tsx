import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function BulkImport({ onRefresh }: { onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // CSV टेक्स्ट को ऐरे में बदलने का सिंपल हेल्पर
  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    return lines
      .map(line => line.split(',').map(cell => cell.trim()))
      .filter(row => row.length > 1 && row[0] !== '');
  };

  // 1. परिवार मुखिया बल्क अपलोड
  const handleHeadUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage('⌛ मुखिया डेटा अपलोड हो रहा है...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const rows = parseCSV(text);
        
        // पहली लाइन हेडर (Columns) की होगी, उसे छोड़ देंगे
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
          const [familyID, name, fatherName, gotra, villageCity, area, mobile, bloodGroup] = rows[i];
          
          if (!familyID || !name) continue; // जरूरी फील्ड्स

          await addDoc(collection(db, 'members'), {
            familyID: familyID,
            name: name,
            fatherName: fatherName || '',
            gotra: gotra || '',
            villageCity: villageCity || '',
            area: area || '',
            mobile: mobile || '',
            bloodGroup: bloodGroup || '',
            isHead: true,
            relationToHead: 'स्वयं मुखिया'
          });
          count++;
        }

        setStatusMessage(`✅ सफलता: ${count} नए परिवार मुखिया अपलोड हो गए!`);
        onRefresh();
      } catch (err) {
        console.error(err);
        setStatusMessage('❌ अपलोड में कुछ गड़बड़ हुई। फाइल चेक करें।');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // 2. परिवार सदस्य बल्क अपलोड
  const handleMemberUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage('⌛ सदस्यों का डेटा अपलोड हो रहा है...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const rows = parseCSV(text);
        
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
          const [
            familyID, memberSerial, name, fatherHusbandName, gotra, relationToHead,
            dob, age_years, gender, maritalStatus, education, occupation,
            villageCity, area, address, mobile, bloodGroup, isStudentRaw
          ] = rows[i];

          if (!familyID || !name) continue;

          await addDoc(collection(db, 'members'), {
            familyID: familyID,
            memberSerial: memberSerial || '',
            name: name,
            fatherHusbandName: fatherHusbandName || '',
            gotra: gotra || '',
            relationToHead: relationToHead || 'सदस्य',
            dob: dob || '',
            age_years: age_years || '',
            gender: gender || '',
            maritalStatus: maritalStatus || '',
            education: education || '',
            occupation: occupation || '',
            villageCity: villageCity || '',
            area: area || '',
            address: address || '',
            mobile: mobile || '',
            bloodGroup: bloodGroup || '',
            isStudent: isStudentRaw?.toLowerCase() === 'yes' || isStudentRaw === 'हाँ',
            isHead: false
          });
          count++;
        }

        setStatusMessage(`✅ सफलता: ${count} परिवार सदस्य अपलोड हो गए!`);
        onRefresh();
      } catch (err) {
        console.error(err);
        setStatusMessage('❌ अपलोड में कुछ गड़बड़ हुई। फाइल चेक करें।');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      background: '#ffffff',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      marginBottom: '30px',
      border: '1px solid #e2e8f0',
      fontFamily: "'Noto Sans', sans-serif"
    }}>
      <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
        🚀 एक्सपोर्ट/इम्पोर्ट सेंटर (Bulk Entry Console)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '15px' }}>
        
        {/* कार्ड 1: मुखिया इम्पोर्ट */}
        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>🏠 1. मुखिया लिस्ट अपलोड करें</h4>
          <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 12px 0' }}>कॉलम क्रम: FamilyID, नाम, पिता का नाम, गोत्र, गाँव, एरिया, मोबाइल, ब्लड ग्रुप</p>
          <input 
            type="file" 
            accept=".csv" 
            disabled={loading}
            onChange={handleHeadUpload}
            style={{ fontSize: '13px', width: '100%' }}
          />
        </div>

        {/* कार्ड 2: सदस्य इम्पोर्ट */}
        <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2563eb' }}>👥 2. सदस्य लिस्ट अपलोड करें</h4>
          <p style={{ fontSize: '12px', color: '#1e40af', margin: '0 0 12px 0' }}>कॉलम क्रम: FamilyID, सदस्य क्र., नाम, पिता/पति नाम, गोत्र, संबंध, DOB, उम्र, लिंग, मैरिटल स्टेटस, शिक्षा, व्यवसाय, गाँव, एरिया, पूरा पता, मोबाइल, ब्लड ग्रुप, क्या छात्र है(Yes/No)</p>
          <input 
            type="file" 
            accept=".csv" 
            disabled={loading}
            onChange={handleMemberUpload}
            style={{ fontSize: '13px', width: '100%' }}
          />
        </div>

      </div>

      {statusMessage && (
        <div style={{
          marginTop: '15px',
          padding: '10px 15px',
          borderRadius: '6px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#334155',
          textAlign: 'center'
        }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}