import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import AddFamilyHead from './AddFamilyHead';
import AddMemberToFamily from './AddMemberToFamily';
import AddCommitteeMember from './AddCommitteeMember';

export default function App() {
  const [members, setMembers] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);

  // सेक्शन को Hide/Show करने के लिए स्टेट्स
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showPdfSection, setShowPdfSection] = useState(false);
  const [showCommitteeList, setShowCommitteeList] = useState(false);

  // खोज (Search) के लिए स्टेट्स
  const [filterType, setFilterType] = useState('text'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGotra, setSearchGotra] = useState('');
  const [searchBlood, setSearchBlood] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  // PDF रिपोर्ट का प्रकार
  const [pdfReportType, setPdfReportType] = useState('all_grouped');

  // डेटा लोड करने का फंक्शन
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

  // डेटा हटाने (Delete) का लॉजिक
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

  // डेटा सुधारने (Edit) का लॉजिक
  const handleEditMember = async (m: any) => {
    const newName = window.prompt("नया नाम दर्ज करें:", m.name);
    const newMobile = window.prompt("नया मोबाइल नंबर दर्ज करें:", m.mobile || '');
    if (newName) {
      await updateDoc(doc(db, 'members', m.id), { name: newName, mobile: newMobile });
      alert('जानकारी अपडेट कर दी गई है! 🎉');
      fetchData();
    }
  };

  // आज किसका जन्मदिन है?
  const todayStr = new Date().toISOString().substring(5, 10); 
  const birthdayFolks = members.filter(m => {
    if (!m.dob) return false;
    return m.dob.substring(5, 10) === todayStr;
  });

  // डैशबोर्ड काउंटर्स
  const totalFamilies = members.filter(m => m.isHead === true).length;
  const totalMembers = members.length;
  const totalKids = members.filter(m => parseInt(m.age_years || '0') < 10).length;
  const totalAdults = totalMembers - totalKids;
  const totalStudents = members.filter(m => m.occupation === 'छात्र').length;

  // एडवांस्ड सर्च और फ़िल्टर लॉजिक
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

  // FamilyID ग्रुपिंग
  const grouped = filteredMembers.reduce((acc: any, m: any) => {
    const fid = m.familyID ? m.familyID.toString().trim() : '';
    if (fid) {
      if (!acc[fid]) acc[fid] = [];
      acc[fid].push(m);
    }
    return acc;
  }, {});

  // PDF प्रिंट/डाउनलोड फंक्शन
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
      
      const students = filteredMembers.filter((m: any) => m.occupation === 'छात्र');
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
            <span>कुल रिकॉर्ड संख्या: ${pdfReportType === 'only_committee' ? committee.length : (pdfReportType === 'only_families' ? filteredMembers.filter(m=>m.isHead).length : (pdfReportType === 'only_students' ? filteredMembers.filter(m=>m.occupation==='छात्र').length : filteredMembers.length))}</span>
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

  // नीचे वाले बटनों के लिए यूनिफॉर्म स्टाइल
  const commonButtonStyle = (isActive: boolean, activeColor: string, defaultColor: string) => ({
    width: '280px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    color: '#fff',
    background: isActive ? activeColor : defaultColor,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    fontFamily: "'Poppins', 'Noto Sans', sans-serif"
  });

  const commonWrapperStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    margin: '20px 0 10px 0'
  };

  return (
    <div style={{ 
      padding: '20px', 
      // 🌟 यहाँ हमने मुख्य फॉन्ट को Noto Sans और Poppins कर दिया है
      fontFamily: "'Noto Sans', 'Poppins', sans-serif", 
      maxWidth: '1000px', 
      margin: '0 auto', 
      background: '#f8f9fa' 
    }}>
      
      {/* 🔮 CSS इंजेक्शन: Google Fonts इंपोर्ट और स्टाइलिंग */}
      <style>{`
        /* Google Fonts से प्रीमियम फॉन्ट्स मंगाना */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&family=Noto+Sans:wght@400;600;700&display=swap');

        /* ग्रेडिएंट टेक्स्ट इफ़ेक्ट के लिए क्लास */
        .gradient-text {
          background: linear-gradient(90deg, #2563eb, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }

        .form-card-container {
          width: 280px !important;
        }
        .form-card-container > * {
          width: 100% !important;
        }
        .form-card-container button:first-of-type {
          width: 100% !important;
          height: 72px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          box-sizing: border-box !important;
          padding: 10px 15px !important;
          font-family: 'Poppins', 'Noto Sans', sans-serif !important;
          letter-spacing: 0.5px !important;
        }
      `}</style>

      {/* 👑 नया स्टाइलिश और प्रीमियम हेडर सेक्शन */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        flexWrap: 'wrap',
        textAlign: 'center',
        marginBottom: '35px',
        padding: '20px 10px',
        borderBottom: '2px solid #e2e8f0',
        width: '100%'
      }}>
        <span style={{ fontSize: '42px', lineHeight: '1', filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.1))' }}>🏛️</span>
        <h1 style={{ 
          margin: '0', 
          fontSize: '32px', 
          fontWeight: '800', 
          color: '#1e3a8a', 
          fontFamily: "'Poppins', sans-serif", // खास तौर पर Poppins फॉन्ट
          lineHeight: '1.3',
          letterSpacing: '0.5px',
          textShadow: '0px 2px 4px rgba(0,0,0,0.05)'
        }}>
          Chhipa Samaj Jaipur <br className="mobile-break" style={{ display: 'none' }}/>
          <span className="gradient-text">Digital Directory</span>
        </h1>
      </div>
      
      {/* जन्मदिन रिमाइंडर्स अलर्ट बॉक्स */}
      {birthdayFolks.length > 0 && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '24px' }}>🎉</span>
          <div>
            <strong>आज समाज में उत्सव का दिन है!</strong> निम्नलिखित सदस्यों को जन्मदिन की हार्दिक बधाई: 
            <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#d9534f' }}>
              {birthdayFolks.map(f => `${f.name} (Family ID: ${f.familyID})`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* डैशबोर्ड काउंटर्स */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#e3f2fd', borderLeft: '5px solid #1e88e5', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#1565c0', fontSize: '14px', fontWeight: '600' }}>🏠 कुल परिवार</div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px', color: '#0d47a1' }}>{totalFamilies}</div>
        </div>
        <div style={{ background: '#e8f5e9', borderLeft: '5px solid #43a047', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#2e7d32', fontSize: '14px', fontWeight: '600' }}>👥 कुल सदस्य</div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px', color: '#1b5e20' }}>{totalMembers}</div>
        </div>
        <div style={{ background: '#fff3e0', borderLeft: '5px solid #fb8c00', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#e65100', fontSize: '14px', fontWeight: '600' }}>👶 कुल बच्चे (&lt;10 वर्ष)</div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px', color: '#bf360c' }}>{totalKids}</div>
        </div>
        <div style={{ background: '#f3e5f5', borderLeft: '5px solid #8e24aa', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#6a1b9a', fontSize: '14px', fontWeight: '600' }}>👨 कुल बड़े सदस्य</div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px', color: '#4a148c' }}>{totalAdults}</div>
        </div>
        <div style={{ background: '#e0f2f1', borderLeft: '5px solid #00897b', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ color: '#004d40', fontSize: '14px', fontWeight: '600' }}>🎓 कुल छात्र/छात्राएं</div>
          <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '5px', color: '#00251a' }}>{totalStudents}</div>
        </div>
      </div>

      {/* 🛠️ ऊपर वाले इनपुट फॉर्म्स */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, 280px)', 
        justifyContent: 'center', 
        alignItems: 'start',
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div className="form-card-container"><AddFamilyHead /></div>
        <div className="form-card-container"><AddMemberToFamily /></div>
        <div className="form-card-container"><AddCommitteeMember /></div>
      </div>
      
      <hr style={{ margin: '40px 0', borderColor: '#e2e8f0' }} />
      
      {/* 🔴 1. समाज खोज केंद्र बटन */}
      <div style={commonWrapperStyle}>
        <button 
          onClick={() => setShowSearchBox(!showSearchBox)} 
          style={commonButtonStyle(showSearchBox, '#ef4444', '#3b82f6')}
        >
          {showSearchBox ? '❌ खोज केंद्र बंद करें' : '🔍 समाज में खोजें (Search)'}
        </button>
      </div>

      {/* खोज केंद्र का बॉक्स */}
      {showSearchBox && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '25px', border: '1px solid #bfdbfe', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>🔍 समाज खोज केंद्र (Search Console)</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '2px solid #cbd5e1', background: '#f8fafc', fontWeight: '600', color: '#334155', height: '44px', fontFamily: "'Noto Sans', sans-serif" }}
            >
              <option value="text">👤 नाम / शहर / एरिया से खोजें</option>
              <option value="gotra">🧬 गोत्र के अनुसार खोजें</option>
              <option value="blood">🩸 ब्लड ग्रुप से खोजें</option>
              <option value="age">⏳ उम्र सीमा (Between) से खोजें</option>
            </select>

            <div style={{ flex: 1, minWidth: '250px' }}>
              {filterType === 'text' && (
                <input placeholder="यहाँ नाम, शहर या एरिया... " value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px', boxSizing: 'border-box', fontFamily: "'Noto Sans', sans-serif" }} />
              )}
              {filterType === 'gotra' && (
                <select value={searchGotra} onChange={(e) => setSearchGotra(e.target.value)} style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px', fontFamily: "'Noto Sans', sans-serif" }}>
                  <option value="">-- गोत्र चुनें --</option>
                  <option value="कश्यप">कश्यप</option>
                  <option value="गर्ग">गर्ग</option>
                  <option value="भारद्वाज">भारद्वाज</option>
                  <option value="वशिष्ठ">वशिष्ठ</option>
                  <option value="अन्य">अन्य</option>
                </select>
              )}
              {filterType === 'blood' && (
                <select value={searchBlood} onChange={(e) => setSearchBlood(e.target.value)} style={{ width: '100%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px', fontFamily: "'Poppins', sans-serif" }}>
                  <option value="">-- ब्लड ग्रुप चुनें --</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              )}
              {filterType === 'age' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" placeholder="न्यूनतम उम्र" value={minAge} onChange={(e) => setMinAge(e.target.value)} style={{ width: '50%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif" }} />
                  <input type="number" placeholder="अधिकतम उम्र" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} style={{ width: '50%', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '44px', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif" }} />
                </div>
              )}
            </div>
          </div>
          
          {(searchTerm || searchGotra || searchBlood || minAge || maxAge) && (
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => { setSearchTerm(''); setSearchGotra(''); setSearchBlood(''); setMinAge(''); setMaxAge(''); }} style={{ padding: '8px 15px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', fontFamily: "'Noto Sans', sans-serif" }}>सर्च फिल्टर साफ करें ❌</button>
            </div>
          )}

          <h2 style={{ fontSize: '18px', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>👥 परिवारों की सूची ({filteredMembers.length} सदस्य मिले)</h2>
          {Object.keys(grouped).length === 0 ? (
            <p style={{ color: '#64748b', background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>कोई रिकॉर्ड नहीं मिला।</p>
          ) : (
            Object.keys(grouped).map((fid) => {
              const familyList = grouped[fid];
              return (
                <div key={fid} style={{ border: '1px solid #e2e8f0', padding: '15px', margin: '15px 0', borderRadius: '10px', background: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ color: '#2563eb', margin: '0 0 12px 0', fontFamily: "'Poppins', sans-serif" }}>Family ID: {fid}</h3>
                  {familyList.map((m: any, index: number) => (
                    <div key={index} style={{ padding: '10px 0', borderBottom: index !== familyList.length - 1 ? '1px dashed #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '15px' }}>
                        • <strong>{m.name}</strong> {m.isHead ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>(मुखिया)</span> : <span style={{ color: '#64748b' }}>({m.relationToHead || 'सदस्य'})</span>} 
                        {m.age_years ? <span style={{ color: '#475569' }}> — उम्र: {m.age_years} वर्ष</span> : ''}
                        {m.gotra ? <span style={{ color: '#475569' }}> | गोत्र: {m.gotra}</span> : ''}
                        {m.bloodGroup ? <span style={{ color: '#dc2626', fontWeight: '600' }}> | 🩸 {m.bloodGroup}</span> : ''}
                        {m.occupation ? <span style={{ color: '#475569' }}> | 💼 कार्य: {m.occupation}</span> : ''}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {m.mobile && <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', fontFamily: "'Poppins', sans-serif" }}>📞 {m.mobile}</span>}
                        <button onClick={() => handleEditMember(m)} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }} title="सुधारें">✏️</button>
                        <button onClick={() => handleDeleteMember(m.id, m.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }} title="हटाएं">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 🔴 2. PDF रिपोर्ट सेक्शन बटन */}
      <div style={commonWrapperStyle}>
        <button 
          onClick={() => setShowPdfSection(!showPdfSection)} 
          style={commonButtonStyle(showPdfSection, '#ef4444', '#10b981')}
        >
          {showPdfSection ? '❌ रिपोर्ट विकल्प बंद करें' : '🖨️ PDF रिपोर्ट और प्रिंट'}
        </button>
      </div>

      {/* PDF विकल्प का बॉक्स */}
      {showPdfSection && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '25px', border: '1px solid #a7f3d0', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ marginTop: 0, color: '#059669', borderBottom: '2px solid #d1fae5', paddingBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>🖨️ रिपोर्ट का प्रकार चुनें और PDF डाउनलोड करें</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <select
              value={pdfReportType}
              onChange={(e) => setPdfReportType(e.target.value)}
              style={{ padding: '10px 15px', borderRadius: '6px', border: '2px solid #10b981', background: '#f0fdf4', fontWeight: '600', color: '#047857', height: '44px', minWidth: '250px', fontFamily: "'Noto Sans', sans-serif" }}
            >
              <option value="all_grouped">📋 सभी सदस्य (Family ID व ग्रुप के साथ)</option>
              <option value="only_families">🏠 केवल परिवार के मुखिया</option>
              <option value="only_students">🎓 केवल छात्र / छात्राएं</option>
              <option value="only_committee">🏢 केवल कमेटी पदाधिकारी सूची</option>
            </select>
            
            <button onClick={handlePrintPDF} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '44px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)', fontFamily: "'Noto Sans', sans-serif" }}>
              📄 PDF डाउनलोड / प्रिंट करें
            </button>
          </div>
        </div>
      )}

      {/* 🔴 3. समाज कमेटी सूची बटन */}
      <div style={commonWrapperStyle}>
        <button 
          onClick={() => setShowCommitteeList(!showCommitteeList)} 
          style={commonButtonStyle(showCommitteeList, '#ef4444', '#f59e0b')}
        >
          {showCommitteeList ? '❌ कमेटी सूची बंद करें' : '🏢 समाज कमेटी सूची देखें'}
        </button>
      </div>

      {/* कमेटी कार्यकारिणी की सूची */}
      {showCommitteeList && (
        <div style={{ border: '1px solid #fcd34d', borderRadius: '12px', padding: '20px', background: '#fffbeb', overflowX: 'auto', marginBottom: '25px', width: '100%', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, color: '#d97706', borderBottom: '2px solid #fde68a', paddingBottom: '12px', fontFamily: "'Poppins', sans-serif" }}>🏢 समाज कमेटी कार्यकारिणी सूची</h2>
          {committee.length === 0 ? (
            <p style={{ color: '#92400e', background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>वर्तमान में कमेटी में कोई पदाधिकारी नियुक्त नहीं है।</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Noto Sans', sans-serif" }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f59e0b', background: '#fef3c7' }}>
                  <th style={{ padding: '12px', color: '#b45309' }}>पद / दायित्व</th>
                  <th style={{ padding: '12px', color: '#b45309' }}>पदाधिकारी का नाम</th>
                  <th style={{ padding: '12px', color: '#b45309' }}>गोत्र</th>
                  <th style={{ padding: '12px', color: '#b45309' }}>मोबाइल नंबर</th>
                  <th style={{ padding: '12px', color: '#b45309' }}>कार्रवाई</th>
                </tr>
              </thead>
              <tbody>
                {committee.map((c, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #fde68a', background: index % 2 === 0 ? '#ffffff' : '#fffbeb' }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#ea580c' }}>⭐ {c.designation}</td>
                    <td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>{c.name}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{c.gotra || '-'}</td>
                    <td style={{ padding: '12px', color: '#475569', fontWeight: '600', fontFamily: "'Poppins', sans-serif" }}>{c.mobile || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => handleDeleteCommittee(c.id, c.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>🗑️ हटाएं</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}