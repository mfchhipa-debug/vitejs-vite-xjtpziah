import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface BulkImportProps {
  onRefresh: () => void;
}

export default function BulkImport({ onRefresh }: BulkImportProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'head' | 'member') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    let errorMessages: string[] = [];

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          if (jsonData.length === 0) {
            alert('❌ File is empty!');
            setLoading(false);
            return;
          }

          if (!window.confirm(`Are you sure you want to import ${jsonData.length} records?`)) {
            setLoading(false);
            return;
          }

          for (const row of jsonData) {
            try {
              const familyID = row['FamilyID']?.toString().trim() || row['Family ID']?.toString().trim();
              
              if (!familyID) {
                errorCount++;
                errorMessages.push(`Missing FamilyID for row: ${JSON.stringify(row)}`);
                continue;
              }

              const familyQuery = query(collection(db, 'members'), where("familyID", "==", familyID));
              const familySnapshot = await getDocs(familyQuery);
              
              let familyExists = false;
              familySnapshot.forEach((doc) => {
                if (doc.data().isHead === true) {
                  familyExists = true;
                }
              });

              if (type === 'head') {
                if (familyExists) {
                  errorCount++;
                  errorMessages.push(`Family ID ${familyID} already exists. Skipping.`);
                  continue;
                }

                const memberData: any = {
                  familyID: familyID,
                  memberNo: row['MemberNo']?.toString() || row['Member No']?.toString() || '01',
                  name: row['Name']?.toString() || row['नाम']?.toString() || '',
                  fatherName: row['FatherName']?.toString() || row['पिता का नाम']?.toString() || '',
                  gotra: row['Gotra']?.toString() || row['गोत्र']?.toString() || '',
                  relationToHead: 'खुद',
                  dob: '',
                  age_years: '',
                  age_months: '',
                  gender: '',
                  maritalStatus: '',
                  education: '',
                  occupation: '',
                  villageCity: row['VillageCity']?.toString() || row['गाँव']?.toString() || row['Village']?.toString() || '',
                  area: row['Area']?.toString() || row['एरिया']?.toString() || '',
                  address: '',
                  mobile1: row['Mobile']?.toString() || row['मोबाइल']?.toString() || '',
                  mobile2: row['Mobile2']?.toString() || row['मोबाइल 2']?.toString() || '',
                  bloodGroup: row['BloodGroup']?.toString() || row['ब्लड ग्रुप']?.toString() || '',
                  isStudent: false,
                  isHead: true,
                  createdAt: new Date()
                };

                if (!memberData.name) {
                  errorCount++;
                  errorMessages.push(`Name is required for Family ID ${familyID}`);
                  continue;
                }

                await addDoc(collection(db, 'members'), memberData);
                successCount++;
              } else {
                if (!familyExists) {
                  errorCount++;
                  errorMessages.push(`Family ID ${familyID} does not exist. Please add family head first.`);
                  continue;
                }

                const memberData: any = {
                  familyID: familyID,
                  memberNo: row['MemberNo']?.toString() || row['सदस्य क्र.']?.toString() || row['Member No']?.toString() || '',
                  name: row['Name']?.toString() || row['नाम']?.toString() || '',
                  fatherName: row['FatherName']?.toString() || row['पिता/पति नाम']?.toString() || row['Father']?.toString() || '',
                  gotra: row['Gotra']?.toString() || row['गोत्र']?.toString() || '',
                  relationToHead: row['Relation']?.toString() || row['संबंध']?.toString() || '',
                  dob: row['DOB']?.toString() || row['जन्म तिथि']?.toString() || '',
                  age_years: row['Age']?.toString() || row['उम्र']?.toString() || '',
                  age_months: '',
                  gender: row['Gender']?.toString() || row['लिंग']?.toString() || '',
                  maritalStatus: row['MaritalStatus']?.toString() || row['मैरिटल स्टेटस']?.toString() || '',
                  education: row['Education']?.toString() || row['शिक्षा']?.toString() || '',
                  occupation: row['Occupation']?.toString() || row['व्यवसाय']?.toString() || '',
                  villageCity: row['VillageCity']?.toString() || row['गाँव']?.toString() || row['Village']?.toString() || '',
                  area: row['Area']?.toString() || row['एरिया']?.toString() || '',
                  address: row['Address']?.toString() || row['पूरा पता']?.toString() || '',
                  mobile1: row['Mobile']?.toString() || row['मोबाइल']?.toString() || '',
                  mobile2: row['Mobile2']?.toString() || row['मोबाइल 2']?.toString() || '',
                  bloodGroup: row['BloodGroup']?.toString() || row['ब्लड ग्रुप']?.toString() || '',
                  isStudent: row['IsStudent']?.toString()?.toLowerCase() === 'yes' || row['क्या छात्र है']?.toString()?.toLowerCase() === 'yes',
                  isHead: false,
                  createdAt: new Date()
                };

                if (!memberData.name) {
                  errorCount++;
                  errorMessages.push(`Name is required for member in Family ID ${familyID}`);
                  continue;
                }

                await addDoc(collection(db, 'members'), memberData);
                successCount++;
              }
            } catch (rowError: any) {
              errorCount++;
              errorMessages.push(`Error in row: ${rowError.message}`);
              console.error('Row import error:', rowError);
            }
          }

          let message = `✅ Import Complete!\n`;
          message += `Successfully imported: ${successCount} records\n`;
          if (errorCount > 0) {
            message += `Failed: ${errorCount} records\n\n`;
            message += `Errors:\n${errorMessages.slice(0, 5).join('\n')}`;
            if (errorMessages.length > 5) {
              message += `\n... and ${errorMessages.length - 5} more errors`;
            }
          }
          alert(message);
          
          if (successCount > 0) {
            onRefresh();
          }
        } catch (error: any) {
          console.error('Import error:', error);
          alert(`❌ Import failed: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Import error:', error);
      alert(`❌ Import failed: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Upload Family List - Only Choose file */}
      <div className="options-dropdown-item" style={{ cursor: 'pointer', position: 'relative', padding: '4px 16px' }}>
        <label style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span>📁 Upload Family List</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileUpload(e, 'head')}
            style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', left: 0, top: 0 }}
            disabled={loading}
          />
          {loading && <span style={{ fontSize: '12px', color: '#3b82f6' }}>⏳</span>}
        </label>
      </div>
      
      {/* Upload Members List - Only Choose file */}
      <div className="options-dropdown-item" style={{ cursor: 'pointer', position: 'relative', padding: '4px 16px' }}>
        <label style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span>📁 Upload Members List</span>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileUpload(e, 'member')}
            style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', left: 0, top: 0 }}
            disabled={loading}
          />
          {loading && <span style={{ fontSize: '12px', color: '#3b82f6' }}>⏳</span>}
        </label>
      </div>
    </>
  );
}