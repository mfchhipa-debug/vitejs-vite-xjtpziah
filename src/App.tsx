import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import AddFamilyHead from './AddFamilyHead';
import AddMemberToFamily from './AddMemberToFamily';
import AddCommitteeMember from './AddCommitteeMember';

// ==========================================
// 🚀 1. बल्क इम्पोर्ट कंसोल (Bulk Import Component)
// ==========================================
function BulkImport({ onRefresh }: { onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    return lines
      .map(line => line.split(',').map(cell => cell.trim()))
      .filter(row => row.length > 1 && row[0] !== '');
  };

  const handleHeadUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage('⌛ मुखिया डेटा अपलोड हो रहा है...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const rows = parseCSV(text);
        
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
          const [familyID, name, fatherName, gotra, villageCity, area, mobile, bloodGroup] = rows[i];
          
          if (!familyID || !name) continue;

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
        setStatusMessage('❌ अपलोड में कुछ गड़बड़ हुई। फाइल चेक करें।');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleMemberUpload = async (e: any) => {
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
            occupation_isStudent: isStudentRaw?.toLowerCase() === 'yes' || isStudentRaw === 'हाँ' || isStudentRaw === 'छात्र',
            isHead: false
          });
          count++;
        }

        setStatusMessage(`✅ सफलता: ${count} परिवार सदस्य अपलोड हो गए!`);
        onRefresh();
      } catch (err) {
        console.error(err);
        setStatusMessage('❌ अपलोड में कुछ गड़बड़ हुई। फाइल चेक करें।');
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
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '880px',
      margin: '20px auto 20px auto',
      border: '1px solid #cbd5e1',
      boxSizing: 'border-box'
    }}>
      <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', fontFamily: "'Poppins', 'Noto Sans', sans-serif" }}>
        🚀 एक्सपोर्ट/इम्पोर्ट सेंटर (Bulk Entry Console)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '15px' }}>
        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#16a34a' }}>🏠 1. मुखिया लिस्ट बल्क अपलोड करें (.csv)</h4>
          <p style={{ fontSize: '11px', color: '#166534', margin: '0 0 12px 0', lineHeight: '1.4' }}>
            <strong>कॉलम क्रम:</strong> FamilyID, नाम, पिता का नाम, गोत्र, शहर/गाँव, एरिया, मोबाइल नंबर, ब्लड ग्रुप
          </p>
          <input type="file" accept=".csv" disabled={loading} onChange={handleHeadUpload} style={{ fontSize: '13px', width: '100%' }} />
        </div>

        <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2563eb' }}>👥 2. सदस्य लिस्ट बल्क अपलोड करें (.csv)</h4>
          <p style={{ fontSize: '11px', color: '#1e40af', margin: '0 0 12px 0', lineHeight: '1.4' }}>
            <strong>कॉलम क्रम:</strong> FamilyID, सदस्य क्र., नाम, पिता/पति नाम, गोत्र, संबंध, DOB, उम्र, लिंग, वैवाहिक स्थिति, शिक्षा, व्यवसाय, शहर/गाँव, एरिया, पूरा पता, मोबाइल, ब्लड ग्रुप, क्या छात्र है(हाँ/नहीं)
          </p>
          <input type="file" accept=".csv" disabled={loading} onChange={handleMemberUpload} style={{ fontSize: '13px', width: '100%' }} />
        </div>
      </div>

      {statusMessage && (
        <div style={{ marginTop: '15px', padding: '10px 15px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', color: '#334155', textAlign: 'center' }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 👑 2. मुख्य एप्लीकेशन कॉम्पोनेंट
// ==========================================
export default function App() {
  const [members, setMembers] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);

  // ===== सभी टॉगल स्टेट्स =====
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showFamilyList, setShowFamilyList] = useState(false);
  const [showAllMembersList, setShowAllMembersList] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showPdfSection, setShowPdfSection] = useState(false);
  const [showCommitteeList, setShowCommitteeList] = useState(false);

  const [viewMode, setViewMode] = useState('card');

  const [filterType, setFilterType] = useState('text'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGotra, setSearchGotra] = useState('');
  const [searchBlood, setSearchBlood] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  const [pdfReportType, setPdfReportType] = useState('all_grouped');

  const fetchData = async () => {
    try {
      const memberSnapshot = await getDocs(collection(db, 'members'));
      setMembers(memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const committeeSnapshot = await getDocs(collection(db, 'committee'));
      setCommittee(committeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`क्या आप सचमुच ${name} को सूची से हटाना चाहते हैं?`)) {
      await deleteDoc(doc(db, 'members', id));
      alert('सदस्य को हटा दिया गया है।');
      fetchData();
    }
  };

  const handleDeleteCommittee = async (id: string, name: string) => {
    if (window.confirm(`क्या आप सचमुच पदाधिकारी ${name} को कमेटी से हटाना चाहते हैं?`)) {
      await deleteDoc(doc(db, 'committee', id));
      alert('पदाधिकारी को कमेटी से हटा दिया गया है।');
      fetchData();
    }
  };

  const handleEditMember = async (m: any) => {
    const newName = window.prompt("नया नाम दर्ज करें:", m.name);
    const newMobile = window.prompt("नया मोबाइल नंबर दर्ज करें:", m.mobile || '');
    if (newName) {
      await updateDoc(doc(db, 'members', m.id), { name: newName, mobile: newMobile });
      alert('जानकारी अपडेट कर दी गई है! 🎉');
      fetchData();
    }
  };

  const todayStr = new Date().toISOString().substring(5, 10); 
  const birthdayFolks = members.filter(m => {
    if (!m.dob) return false;
    return m.dob.substring(5, 10) === todayStr;
  });

  const totalFamilies = members.filter(m => m.isHead === true).length;
  const totalMembers = members.length;
  const totalKids = members.filter(m => parseInt(m.age_years || '0') < 10).length;
  const totalAdults = totalMembers - totalKids;
  const totalStudents = members.filter(m => m.occupation === 'छात्र' || m.occupation_isStudent === true).length;

  const filteredMembers = members.filter((m) => {
    const matchesText = !searchTerm || 
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.villageCity && m.villageCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.area && m.area.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGotra = !searchGotra || (m.gotra === searchGotra);
    const matchesBlood = !searchBlood || (m.bloodGroup === searchBlood);

    const age = parseInt(m.age_years || '0');
    const min = minAge ? parseInt(minAge) : 0;
    const max = maxAge ? parseInt(maxAge) : 999;
    const matchesAge = age >= min && age <= max;

    return matchesText && matchesGotra && matchesAge && matchesBlood;
  });

  const grouped = filteredMembers.reduce((acc: any, m: any) => {
    const fid = m.familyID ? m.familyID.toString().trim() : '';
    if (fid) {
      if (!acc[fid]) acc[fid] = [];
      acc[fid].push(m);
    }
    return acc;
  }, {});

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let reportTitle = '';
    let tableHeaders = '';
    let tableRows = '';

    if (pdfReportType === 'all_grouped') {
      reportTitle = '📋 समाज डायरेक्टरी - सभी सदस्य (Family ID व ग्रुप के साथ)';
      tableHeaders = `<tr><th>Family ID</th><th>सदस्य का नाम</th><th>मुखिया से संबंध</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल नंबर</th><th>शहर/गाँव</th></tr>`;
      
      Object.keys(grouped).forEach(fid => {
        grouped[fid].forEach((m: any) => {
          tableRows += `
            <tr>
              <td><strong>${fid}</strong></td>
              <td>${m.name} ${m.isHead ? '<span style="color:#2ecc71;font-weight:bold;">(मुखिया)</span>' : ''}</td>
              <td>${m.isHead ? 'स्वयं मुखिया' : (m.relationToHead || 'सदस्य')}</td>
              <td>${m.gotra || '-'}</td>
              <td>${m.age_years || '-'} वर्ष</td>
              <td>${m.mobile || '-'}</td>
              <td>${m.villageCity || '-'}</td>
            </tr>
          `;
        });
      });
    } 
    else if (pdfReportType === 'only_families') {
      reportTitle = '🏠 समाज डायरेक्टरी - केवल परिवार मुखिया सूची';
      tableHeaders = `<tr><th>Family ID</th><th>मुखिया का नाम</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल नंबर</th><th>शहर/गाँव</th><th>एरिया/colony</th></tr>`;
      
      const heads = filteredMembers.filter((m: any) => m.isHead === true);
      heads.forEach((m: any) => {
        tableRows += `
          <tr>
            <td><strong>${m.familyID || '-'}</strong></td>
            <td><strong>${m.name}</strong></td>
            <td>${m.gotra || '-'}</td>
            <td>${m.age_years || '-'} वर्ष</td>
            <td>${m.mobile || '-'}</td>
            <td>${m.villageCity || '-'}</td>
            <td>${m.area || '-'}</td>
          </tr>
        `;
      });
    } 
    else if (pdfReportType === 'only_students') {
      reportTitle = '🎓 समाज डायरेक्टरी - विशेष छात्र / छात्राएं सूची';
      tableHeaders = `<tr><th>Family ID</th><th>विद्यार्थी का नाम</th><th>गोत्र</th><th>उम्र</th><th>शहर/गाँव</th><th>मोबाइल नंबर</th></tr>`;
      
      const students = filteredMembers.filter((m: any) => m.occupation === 'छात्र' || m.occupation_isStudent === true);
      students.forEach((m: any) => {
        tableRows += `
          <tr>
            <td>${m.familyID || '-'}</td>
            <td><strong>${m.name}</strong></td>
            <td>${m.gotra || '-'}</td>
            <td>${m.age_years || '-'} वर्ष</td>
            <td>${m.villageCity || '-'}</td>
            <td>${m.mobile || '-'}</td>
          </tr>
        `;
      });
    } 
    else if (pdfReportType === 'only_committee') {
      reportTitle = '🏢 समाज प्रबंधन - कार्यकारिणी समिति पदाधिकारी सूची';
      tableHeaders = `<tr><th>पद / दायित्व</th><th>पदाधिकारी का नाम</th><th>गोत्र</th><th>कार्यकाल</th><th>मोबाइल नंबर</th></tr>`;
      
      committee.forEach((c: any) => {
        tableRows += `
          <tr>
            <td style="color:#e65100; font-weight:bold;">⭐ ${c.designation}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.gotra || '-'}</td>
            <td>${c.tenure || '-'}</td>
            <td>${c.mobile || '-'}</td>
          </tr>
        `;
      });
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #333; line-height: 1.4; }
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
            <span>कुल रिकॉर्ड संख्या: ${pdfReportType === 'only_committee' ? committee.length : (pdfReportType === 'only_families' ? filteredMembers.filter(m=>m.isHead).length : (pdfReportType === 'only_students' ? filteredMembers.filter(m=>m.occupation==='छात्र' || m.occupation_isStudent===true).length : filteredMembers.length))}</span>
            <span>रिपोर्ट जनरेट तिथि: ${new Date().toLocaleDateString('hi-IN')}</span>
          </div>
        </div>
        <table>
          <thead>
            ${tableHeaders}
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="10" style="text-align:center; color:#888;">इस श्रेणी में कोई डेटा उपलब्ध नहीं है।</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ===== टॉगल बटन स्टाइल =====
  const toggleButtonStyle = (isOpen: boolean, openColor: string, closedColor: string) => ({
    width: '100%',
    padding: '16px 20px',
    background: isOpen ? openColor : closedColor,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: "'Poppins', 'Noto Sans', sans-serif",
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: "'Noto Sans', 'Poppins', sans-serif", 
      maxWidth: '1000px', 
      margin: '0 auto', 
      background: '#f8f9fa' 
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Poppins:wght@400;600;800&family=Noto+Sans:wght@400;600;700&display=swap');
        .gradient-text {
          background: linear-gradient(90deg, #2563eb, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }
      `}</style>

      {/* ===== स्टाइलिश हेडर ===== */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        marginBottom: '30px',
        padding: '8px 10px 16px 10px',
        borderBottom: '2px solid #e2e8f0',
        width: '100%'
      }}>
        <span style={{ fontSize: '40px', lineHeight: '1', marginBottom: '4px' }}>🏛️</span>
        
        <h1 style={{
          margin: '0',
          fontSize: '2.2rem',
          fontWeight: '800',
          lineHeight: '1.2',
          letterSpacing: '1px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 12px rgba(102, 126, 234, 0.25)',
          fontFamily: "'Playfair Display', serif",
          paddingBottom: '2px'
        }}>
          Chhipa Samaj Jaipur
        </h1>
        
        <h2 style={{
          margin: '-4px 0 0 0',
          fontSize: '1.5rem',
          fontWeight: '700',
          letterSpacing: '4px',
          fontStyle: 'italic',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(245, 87, 108, 0.2)',
          fontFamily: "'Playfair Display', serif"
        }}>
          Digital Directory
        </h2>
      </div>
      
      {/* Birthday Alert */}
      {birthdayFolks.length > 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🎉</span>
          <div>
            <strong>आज समाज में उत्सव का दिन है!</strong> निम्नलिखित सदस्यों को जन्मदिन की हार्दिक बधाई: 
            <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#d9534f' }}>
              {birthdayFolks.map(f => `${f.name} (Family ID: ${f.familyID})`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ===== डैशबोर्ड काउंटर्स ===== */}
      {/* ========================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {/* परिवार */}
        <div style={{ background: '#e3f2fd', borderLeft: '5px solid #1e88e5', padding: '15px', borderRadius: '8px' }}>
          <div style={{ color: '#1565c0', fontSize: '16px', fontWeight: '600' }}>🏠 परिवार</div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '5px', color: '#0d47a1' }}>{totalFamilies}</div>
        </div>
        
        {/* कुल सदस्य */}
        <div style={{ background: '#e8f5e9', borderLeft: '5px solid #43a047', padding: '15px', borderRadius: '8px' }}>
          <div style={{ color: '#2e7d32', fontSize: '16px', fontWeight: '600' }}>👥 कुल सदस्य</div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '5px', color: '#1b5e20' }}>{totalMembers}</div>
        </div>
        
        {/* बच्चे (<10 वर्ष) */}
        <div style={{ background: '#fff3e0', borderLeft: '5px solid #fb8c00', padding: '15px', borderRadius: '8px' }}>
          <div style={{ color: '#e65100', fontSize: '16px', fontWeight: '600' }}>👶 बच्चे (&lt;10 वर्ष)</div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '5px', color: '#bf360c' }}>{totalKids}</div>
        </div>
        
        {/* बड़े सदस्य */}
        <div style={{ background: '#f3e5f5', borderLeft: '5px solid #8e24aa', padding: '15px', borderRadius: '8px' }}>
          <div style={{ color: '#6a1b9a', fontSize: '16px', fontWeight: '600' }}>👨 बड़े सदस्य</div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '5px', color: '#4a148c' }}>{totalAdults}</div>
        </div>
        
        {/* छात्र/छात्राएं */}
        <div style={{ background: '#e0f2f1', borderLeft: '5px solid #00897b', padding: '15px', borderRadius: '8px' }}>
          <div style={{ color: '#004d40', fontSize: '16px', fontWeight: '600' }}>🎓 छात्र/छात्राएं</div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginTop: '5px', color: '#00251a' }}>{totalStudents}</div>
        </div>
      </div>

      {/* ===== 4 बटन – सभी फॉर्म ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <AddFamilyHead />
        <AddMemberToFamily />
        <AddCommitteeMember />
        
        {/* Bulk Import */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setShowBulkImport(!showBulkImport)} 
            style={toggleButtonStyle(showBulkImport, '#ef4444', '#a855f7')}
          >
            {showBulkImport ? '▲ एक्सेल बल्क एंट्री सेंटर' : '▼ एक्सेल बल्क एंट्री सेंटर'}
          </button>
          {showBulkImport && <BulkImport onRefresh={fetchData} />}
        </div>
      </div>

      <hr style={{ margin: '35px 0', borderColor: '#e2e8f0' }} />

      {/* ========================================================= */}
      {/* ===== 1. समाज कमेटी ===== */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowCommitteeList(!showCommitteeList)}
          style={toggleButtonStyle(showCommitteeList, '#ef4444', '#f59e0b')}
        >
          {showCommitteeList ? '▲ समाज कमेटी' : '▼ समाज कमेटी'}
        </button>
      </div>

      {showCommitteeList && (
        <div style={{ border: '1px solid #fcd34d', borderRadius: '12px', padding: '20px', background: '#fffbeb', overflowX: 'auto', marginBottom: '25px', width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ marginTop: 0, color: '#d97706', borderBottom: '2px solid #fde68a', paddingBottom: '12px' }}>🏢 समाज कमेटी कार्यकारिणी</h2>
          {committee.length === 0 ? <p style={{ color: '#92400e', background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>कोई पदाधिकारी नहीं।</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ borderBottom: '2px solid #f59e0b', background: '#fef3c7' }}><th style={{ padding: '12px', color: '#b45309' }}>पद</th><th style={{ padding: '12px', color: '#b45309' }}>नाम</th><th style={{ padding: '12px', color: '#b45309' }}>गोत्र</th><th style={{ padding: '12px', color: '#b45309' }}>मोबाइल</th><th style={{ padding: '12px', color: '#b45309' }}>कार्रवाई</th></tr></thead>
              <tbody>{committee.map((c, index) => (<tr key={index} style={{ borderBottom: '1px solid #fde68a', background: index % 2 === 0 ? '#ffffff' : '#fffbeb' }}><td style={{ padding: '12px', fontWeight: '700', color: '#ea580c' }}>⭐ {c.designation}</td><td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>{c.name}</td><td style={{ padding: '12px', color: '#475569' }}>{c.gotra || '-'}</td><td style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>{c.mobile || '-'}</td><td style={{ padding: '12px' }}><button onClick={() => handleDeleteCommittee(c.id, c.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>🗑️ हटाएं</button></td></tr>))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ===== 2. सभी परिवार ===== */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowFamilyList(!showFamilyList)}
          style={toggleButtonStyle(showFamilyList, '#ef4444', '#8b5cf6')}
        >
          {showFamilyList ? '▲ सभी परिवार' : '▼ सभी परिवार'}
        </button>
      </div>

      {showFamilyList && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #c084fc' }}>
          <h2 style={{ color: '#7c3aed', borderBottom: '2px solid #ede9fe', paddingBottom: '12px' }}>🏠 सभी परिवारों की सूची ({totalFamilies})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'card' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '15px' }}>
            {members.filter(m => m.isHead).map((head, index) => {
              const familyMembers = members.filter(m => m.familyID === head.familyID);
              return viewMode === 'card' ? (
                <div key={index} style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>🏠 {head.familyID}</div>
                  <div><strong>मुखिया:</strong> {head.name}</div>
                  <div><strong>गोत्र:</strong> {head.gotra || '-'}</div>
                  <div><strong>कुल सदस्य:</strong> {familyMembers.length}</div>
                  <div><strong>मोबाइल:</strong> {head.mobile || '-'}</div>
                  <div><strong>शहर:</strong> {head.villageCity || '-'}</div>
                  {head.photoURL && <img src={head.photoURL} alt="Head" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', marginTop: '10px' }} />}
                </div>
              ) : (
                <div key={index} style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  <span><strong>ID:</strong> {head.familyID}</span>
                  <span><strong>मुखिया:</strong> {head.name}</span>
                  <span><strong>गोत्र:</strong> {head.gotra || '-'}</span>
                  <span><strong>सदस्य:</strong> {familyMembers.length}</span>
                  <span><strong>मोबाइल:</strong> {head.mobile || '-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ===== 3. सभी सदस्य (ग्रुपिंग) ===== */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowAllMembersList(!showAllMembersList)}
          style={toggleButtonStyle(showAllMembersList, '#ef4444', '#06b6d4')}
        >
          {showAllMembersList ? '▲ सभी सदस्य (ग्रुपिंग)' : '▼ सभी सदस्य (ग्रुपिंग)'}
        </button>
      </div>

      {(showFamilyList || showAllMembersList) && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}>
          <button onClick={() => setViewMode('card')} style={{ padding: '8px 20px', background: viewMode === 'card' ? '#3b82f6' : '#e2e8f0', color: viewMode === 'card' ? 'white' : '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🃏 कार्ड व्यू</button>
          <button onClick={() => setViewMode('list')} style={{ padding: '8px 20px', background: viewMode === 'list' ? '#3b82f6' : '#e2e8f0', color: viewMode === 'list' ? 'white' : '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📋 लिस्ट व्यू</button>
        </div>
      )}

      {showAllMembersList && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #67e8f9' }}>
          <h2 style={{ color: '#0891b2', borderBottom: '2px solid #cffafe', paddingBottom: '12px' }}>👥 सभी सदस्य (Family ID के साथ) - {totalMembers} सदस्य</h2>
          {Object.keys(grouped).map((fid) => {
            const familyMembers = grouped[fid];
            return (
              <div key={fid} style={{ marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ background: '#0891b2', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '16px' }}>
                  🏠 Family ID: {fid} ({familyMembers.length} सदस्य)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'card' ? 'repeat(auto-fill, minmax(250px, 1fr))' : '1fr', gap: '10px', padding: '15px' }}>
                  {familyMembers.map((m: any, idx: number) => (
                    viewMode === 'card' ? (
                      <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div><strong>{m.name}</strong> {m.isHead && '👑'}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{m.relationToHead || 'सदस्य'} | {m.gotra || '-'}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{m.age_years && `उम्र: ${m.age_years} वर्ष`}</div>
                      </div>
                    ) : (
                      <div key={idx} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}>
                        <span><strong>{m.name}</strong> {m.isHead && '👑'}</span>
                        <span style={{ color: '#64748b' }}>{m.relationToHead || 'सदस्य'}</span>
                        <span style={{ color: '#64748b' }}>{m.gotra || '-'}</span>
                        {m.age_years && <span style={{ color: '#64748b' }}>{m.age_years} वर्ष</span>}
                      </div>
                    )
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* ===== 4. समाज में खोजें ===== */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowSearchBox(!showSearchBox)}
          style={toggleButtonStyle(showSearchBox, '#ef4444', '#3b82f6')}
        >
          {showSearchBox ? '▲ समाज में खोजें' : '▼ समाज में खोजें'}
        </button>
      </div>

      {showSearchBox && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '25px', border: '1px solid #bfdbfe', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>🔍 समाज खोज केंद्र</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '2px solid #cbd5e1', background: '#f8fafc', fontWeight: '600', color: '#334155', height: '44px' }}>
              <option value="text">👤 नाम / शहर / एरिया</option>
              <option value="gotra">🧬 गोत्र</option>
              <option value="blood">🩸 ब्लड ग्रुप</option>
              <option value="age">⏳ उम्र सीमा</option>
            </select>
            <div style={{ flex: 1, minWidth: '250px' }}>
              {filterType === 'text' && <input placeholder="नाम, शहर या एरिया..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px', boxSizing: 'border-box' }} />}
              {filterType === 'gotra' && <select value={searchGotra} onChange={(e) => setSearchGotra(e.target.value)} style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px' }}><option value="">-- गोत्र --</option>{["कश्यप","गर्ग","भारद्वाज","वशिष्ठ","अत्रि","विश्वमित्र","अन्य"].map(g => <option key={g} value={g}>{g}</option>)}</select>}
              {filterType === 'blood' && <select value={searchBlood} onChange={(e) => setSearchBlood(e.target.value)} style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px' }}><option value="">-- ब्लड ग्रुप --</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}</select>}
              {filterType === 'age' && <div style={{ display: 'flex', gap: '10px' }}><input type="number" placeholder="न्यूनतम" value={minAge} onChange={(e) => setMinAge(e.target.value)} style={{ width: '50%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px' }} /><input type="number" placeholder="अधिकतम" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} style={{ width: '50%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px' }} /></div>}
            </div>
          </div>
          {(searchTerm || searchGotra || searchBlood || minAge || maxAge) && <button onClick={() => { setSearchTerm(''); setSearchGotra(''); setSearchBlood(''); setMinAge(''); setMaxAge(''); }} style={{ padding: '8px 15px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>सर्च फिल्टर साफ करें ❌</button>}
          <h2 style={{ fontSize: '18px', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>👥 परिवारों की सूची ({filteredMembers.length} सदस्य मिले)</h2>
          {Object.keys(grouped).length === 0 ? <p style={{ color: '#64748b', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>कोई रिकॉर्ड नहीं मिला।</p> : Object.keys(grouped).map((fid) => {
            const familyList = grouped[fid];
            return (
              <div key={fid} style={{ border: '1px solid #e2e8f0', padding: '15px', margin: '15px 0', borderRadius: '10px', background: '#ffffff' }}>
                <h3 style={{ color: '#2563eb', margin: '0 0 12px 0' }}>Family ID: {fid}</h3>
                {familyList.map((m: any, index: number) => (
                  <div key={index} style={{ padding: '10px 0', borderBottom: index !== familyList.length - 1 ? '1px dashed #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '15px', flex: 1 }}>• <strong>{m.name}</strong> {m.isHead ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>(मुखिया)</span> : <span style={{ color: '#64748b' }}>({m.relationToHead || 'सदस्य'})</span>} {m.age_years ? <span style={{ color: '#475569' }}> — उम्र: {m.age_years} वर्ष</span> : ''}{m.gotra ? <span style={{ color: '#475569' }}> | गोत्र: {m.gotra}</span> : ''}{m.bloodGroup ? <span style={{ color: '#dc2626', fontWeight: '600' }}> | 🩸 {m.bloodGroup}</span> : ''}{(m.occupation || m.occupation_isStudent) ? <span style={{ color: '#475569' }}> | 💼 कार्य: {m.occupation_isStudent ? 'छात्र' : m.occupation}</span> : ''}</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>{m.mobile && <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>📞 {m.mobile}</span>}<button onClick={() => handleEditMember(m)} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}>✏️</button><button onClick={() => handleDeleteMember(m.id, m.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}>🗑️</button></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* ===== 5. PDF रिपोर्ट ===== */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => setShowPdfSection(!showPdfSection)}
          style={toggleButtonStyle(showPdfSection, '#ef4444', '#10b981')}
        >
          {showPdfSection ? '▲ PDF रिपोर्ट' : '▼ PDF रिपोर्ट'}
        </button>
      </div>

      {showPdfSection && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '25px', border: '1px solid #a7f3d0', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ marginTop: 0, color: '#059669', borderBottom: '2px solid #d1fae5', paddingBottom: '12px' }}>🖨️ रिपोर्ट का प्रकार चुनें</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <select value={pdfReportType} onChange={(e) => setPdfReportType(e.target.value)} style={{ padding: '10px 15px', borderRadius: '6px', border: '2px solid #10b981', background: '#f0fdf4', fontWeight: '600', color: '#047857', height: '44px', minWidth: '250px' }}>
              <option value="all_grouped">📋 सभी सदस्य (ग्रुपिंग)</option>
              <option value="only_families">🏠 केवल परिवार मुखिया</option>
              <option value="only_students">🎓 केवल छात्र</option>
              <option value="only_committee">🏢 केवल कमेटी</option>
            </select>
            <button onClick={handlePrintPDF} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '44px' }}>📄 PDF डाउनलोड</button>
          </div>
        </div>
      )}

    </div>
  );
} 