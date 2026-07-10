import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import AddFamilyHead from './AddFamilyHead';
import AddMemberToFamily from './AddMemberToFamily';
import AddCommitteeMember from './AddCommitteeMember';
import BulkImport from './BulkImport';

export default function App() {
  const [members, setMembers] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);

  const [showFamilyList, setShowFamilyList] = useState(false);
  const [showAllMembersList, setShowAllMembersList] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showCommitteeList, setShowCommitteeList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [viewMode, setViewMode] = useState('card');

  const [filterType, setFilterType] = useState('text');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGotra, setSearchGotra] = useState('');
  const [searchBlood, setSearchBlood] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

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

  const generatePDF = (reportType: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let reportTitle = '';
    let tableHeaders = '';
    let tableRows = '';

    if (reportType === 'all_members') {
      reportTitle = '📋 सभी सदस्य (Family ID व ग्रुप के साथ)';
      tableHeaders = `<tr><th>Family ID</th><th>सदस्य का नाम</th><th>संबंध</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल</th><th>शहर/गाँव</th></tr>`;
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
    } else if (reportType === 'students') {
      reportTitle = '🎓 छात्र / छात्राएं सूची';
      tableHeaders = `<tr><th>Family ID</th><th>नाम</th><th>गोत्र</th><th>उम्र</th><th>शहर/गाँव</th><th>मोबाइल</th></tr>`;
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
    } else if (reportType === 'families') {
      reportTitle = '🏠 परिवार मुखिया सूची';
      tableHeaders = `<tr><th>Family ID</th><th>मुखिया का नाम</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल</th><th>शहर/गाँव</th></tr>`;
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

  const handleAdminLogin = () => {
    const pwd = prompt('Admin पासवर्ड दर्ज करें:');
    if (pwd === 'admin123') {
      setIsAdmin(true);
      alert('✅ Admin मोड सक्रिय!');
    } else if (pwd !== null) {
      alert('❌ गलत पासवर्ड!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    alert('🔒 Admin मोड बंद कर दिया गया।');
  };

  const toggleButtonStyle = (isOpen: boolean, openColor: string, closedColor: string) => ({
    width: '100%',
    padding: '14px 18px',
    background: isOpen ? openColor : closedColor,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: "'Poppins', 'Noto Sans', sans-serif",
    transition: 'all 0.3s ease'
  });

  const cardWrapperStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    boxSizing: 'border-box' as const
  };

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

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: '30px',
        padding: '8px 10px 16px 10px',
        borderBottom: '2px solid #e2e8f0',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '40px', lineHeight: '1' }}>🏛️</span>
          <div>
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
              fontSize: '1.2rem',
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
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: showSettings ? '#e2e8f0' : 'transparent',
            border: 'none',
            fontSize: '2.2rem',
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '8px',
            transition: 'background 0.3s',
          }}
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          marginBottom: '30px',
          border: '1px solid #cbd5e1'
        }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            ⚙️ सेटिंग्स
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#334155', marginBottom: '10px' }}>📥 Public Downloads</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button onClick={() => generatePDF('families')} style={{ padding: '8px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🏠 परिवार लिस्ट</button>
              <button onClick={() => generatePDF('committee')} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🏢 कमेटी लिस्ट</button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
              <h4 style={{ color: '#334155', margin: 0 }}>🔐 Admin Area</h4>
              {isAdmin ? (
                <button onClick={handleAdminLogout} style={{ padding: '4px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
              ) : (
                <button onClick={handleAdminLogin} style={{ padding: '4px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Admin Login</button>
              )}
            </div>
            {isAdmin ? (
              <div>
                <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ Admin मोड सक्रिय है</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <button onClick={() => generatePDF('all_members')} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📋 सभी सदस्य</button>
                  <button onClick={() => generatePDF('students')} style={{ padding: '8px 16px', background: '#06b6d4', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🎓 छात्र/छात्राएं</button>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <BulkImport onRefresh={fetchData} />
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontStyle: 'italic' }}>Admin लॉगिन करें ताकि आप सभी सदस्य, छात्र लिस्ट डाउनलोड कर सकें और Excel/CSV बल्क इम्पोर्ट का उपयोग कर सकें।</p>
            )}
          </div>
        </div>
      )}

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

      {/* 📊 नया Dashboard – Gradient Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '18px 14px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.35)',
          transition: 'transform 0.2s'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>🏠</div>
          <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.85 }}>परिवार</div>
          <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '2px' }}>{totalFamilies}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          borderRadius: '16px',
          padding: '18px 14px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(17, 153, 142, 0.35)',
          transition: 'transform 0.2s'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>👥</div>
          <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.85 }}>कुल सदस्य</div>
          <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '2px' }}>{totalMembers}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '16px',
          padding: '18px 14px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(245, 87, 108, 0.35)',
          transition: 'transform 0.2s'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>👶</div>
          <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.85 }}>बच्चे (&lt;10 वर्ष)</div>
          <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '2px' }}>{totalKids}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '16px',
          padding: '18px 14px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(79, 172, 254, 0.35)',
          transition: 'transform 0.2s'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>👨</div>
          <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.85 }}>बड़े सदस्य</div>
          <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '2px' }}>{totalAdults}</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: '16px',
          padding: '18px 14px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 15px rgba(250, 112, 154, 0.35)',
          transition: 'transform 0.2s'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '4px' }}>🎓</div>
          <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.85 }}>छात्र</div>
          <div style={{ fontSize: '30px', fontWeight: '800', marginTop: '2px' }}>{totalStudents}</div>
        </div>
      </div>

      {/* 3 Forms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <AddFamilyHead />
        <AddMemberToFamily />
        <AddCommitteeMember />
      </div>

      <hr style={{ margin: '35px 0', borderColor: '#e2e8f0' }} />

      {/* Utility Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={cardWrapperStyle}>
          <button onClick={() => setShowCommitteeList(!showCommitteeList)} style={toggleButtonStyle(showCommitteeList, '#ef4444', '#f59e0b')}>
            {showCommitteeList ? '▲ समाज कमेटी' : '▼ समाज कमेटी'}
          </button>
          {showCommitteeList && (
            <div style={{ marginTop: '15px', border: '1px solid #fcd34d', borderRadius: '12px', padding: '15px', background: '#fffbeb', overflowX: 'auto' }}>
              <h2 style={{ marginTop: 0, color: '#d97706', borderBottom: '2px solid #fde68a', paddingBottom: '12px' }}>🏢 समाज कमेटी</h2>
              {committee.length === 0 ? <p style={{ color: '#92400e', background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>कोई पदाधिकारी नहीं।</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead><tr style={{ borderBottom: '2px solid #f59e0b', background: '#fef3c7' }}><th style={{ padding: '12px', color: '#b45309' }}>पद</th><th style={{ padding: '12px', color: '#b45309' }}>नाम</th><th style={{ padding: '12px', color: '#b45309' }}>गोत्र</th><th style={{ padding: '12px', color: '#b45309' }}>मोबाइल</th><th style={{ padding: '12px', color: '#b45309' }}>कार्रवाई</th></tr></thead>
                  <tbody>{committee.map((c, index) => (<tr key={index} style={{ borderBottom: '1px solid #fde68a', background: index % 2 === 0 ? '#ffffff' : '#fffbeb' }}><td style={{ padding: '12px', fontWeight: '700', color: '#ea580c' }}>⭐ {c.designation}</td><td style={{ padding: '12px', fontWeight: '700', color: '#334155' }}>{c.name}</td><td style={{ padding: '12px', color: '#475569' }}>{c.gotra || '-'}</td><td style={{ padding: '12px', color: '#475569', fontWeight: '600' }}>{c.mobile || '-'}</td><td style={{ padding: '12px' }}><button onClick={() => handleDeleteCommittee(c.id, c.name)} style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>🗑️ हटाएं</button></td></tr>))}</tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div style={cardWrapperStyle}>
          <button onClick={() => setShowFamilyList(!showFamilyList)} style={toggleButtonStyle(showFamilyList, '#ef4444', '#8b5cf6')}>
            {showFamilyList ? '▲ सभी परिवार' : '▼ सभी परिवार'}
          </button>
          {showFamilyList && (
            <div style={{ marginTop: '15px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #c084fc', maxHeight: '400px', overflowY: 'auto' }}>
              <h2 style={{ color: '#7c3aed', borderBottom: '2px solid #ede9fe', paddingBottom: '12px' }}>🏠 सभी परिवार</h2>
              <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'card' ? 'repeat(auto-fill, minmax(250px, 1fr))' : '1fr', gap: '15px' }}>
                {members.filter(m => m.isHead).map((head, index) => {
                  const familyMembers = members.filter(m => m.familyID === head.familyID);
                  return viewMode === 'card' ? (
                    <div key={index} style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>🏠 {head.familyID}</div>
                      <div><strong>मुखिया:</strong> {head.name}</div>
                      <div><strong>गोत्र:</strong> {head.gotra || '-'}</div>
                      <div><strong>सदस्य:</strong> {familyMembers.length}</div>
                      <div><strong>मोबाइल:</strong> {head.mobile || '-'}</div>
                      <div><strong>शहर:</strong> {head.villageCity || '-'}</div>
                      {head.photoURL && <img src={head.photoURL} alt="Head" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', marginTop: '8px' }} />}
                    </div>
                  ) : (
                    <div key={index} style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
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
        </div>

        <div style={cardWrapperStyle}>
          <button onClick={() => setShowAllMembersList(!showAllMembersList)} style={toggleButtonStyle(showAllMembersList, '#ef4444', '#06b6d4')}>
            {showAllMembersList ? '▲ सभी सदस्य' : '▼ सभी सदस्य'}
          </button>
          {showAllMembersList && (
            <div style={{ marginTop: '15px', background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #67e8f9', maxHeight: '400px', overflowY: 'auto' }}>
              <h2 style={{ color: '#0891b2', borderBottom: '2px solid #cffafe', paddingBottom: '12px' }}>👥 सभी सदस्य</h2>
              {Object.keys(grouped).map((fid) => {
                const familyMembers = grouped[fid];
                return (
                  <div key={fid} style={{ marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#0891b2', color: 'white', padding: '8px 12px', fontWeight: 'bold', fontSize: '14px' }}>
                      🏠 Family ID: {fid} ({familyMembers.length} सदस्य)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'card' ? 'repeat(auto-fill, minmax(200px, 1fr))' : '1fr', gap: '8px', padding: '10px' }}>
                      {familyMembers.map((m: any, idx: number) => (
                        viewMode === 'card' ? (
                          <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <div><strong>{m.name}</strong> {m.isHead && '👑'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{m.relationToHead || 'सदस्य'} | {m.gotra || '-'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{m.age_years && `उम्र: ${m.age_years} वर्ष`}</div>
                          </div>
                        ) : (
                          <div key={idx} style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px', fontSize: '13px' }}>
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
        </div>

        <div style={cardWrapperStyle}>
          <button onClick={() => setShowSearchBox(!showSearchBox)} style={toggleButtonStyle(showSearchBox, '#ef4444', '#3b82f6')}>
            {showSearchBox ? '▲ खोजें' : '▼ खोजें'}
          </button>
          {showSearchBox && (
            <div style={{ marginTop: '15px', background: '#ffffff', padding: '15px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <h3 style={{ marginTop: 0, color: '#1e3a8a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🔍 समाज खोज केंद्र</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '2px solid #cbd5e1', background: '#f8fafc', fontWeight: '600', color: '#334155', height: '40px' }}>
                  <option value="text">👤 नाम / शहर / एरिया</option>
                  <option value="gotra">🧬 गोत्र</option>
                  <option value="blood">🩸 ब्लड ग्रुप</option>
                  <option value="age">⏳ उम्र सीमा</option>
                </select>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  {filterType === 'text' && (
                    <input
                      placeholder="नाम, शहर या एरिया..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '40px', boxSizing: 'border-box' }}
                    />
                  )}
                  {filterType === 'gotra' && (
                    <select
                      value={searchGotra}
                      onChange={(e) => setSearchGotra(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '40px' }}
                    >
                      <option value="">-- गोत्र --</option>
                      <option value="कश्यप">कश्यप</option>
                      <option value="गर्ग">गर्ग</option>
                      <option value="भारद्वाज">भारद्वाज</option>
                      <option value="वशिष्ठ">वशिष्ठ</option>
                      <option value="अत्रि">अत्रि</option>
                      <option value="विश्वमित्र">विश्वमित्र</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  )}
                  {filterType === 'blood' && (
                    <select
                      value={searchBlood}
                      onChange={(e) => setSearchBlood(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '40px' }}
                    >
                      <option value="">-- ब्लड ग्रुप --</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  )}
                  {filterType === 'age' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="number"
                        placeholder="न्यूनतम"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        style={{ width: '50%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '40px' }}
                      />
                      <input
                        type="number"
                        placeholder="अधिकतम"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        style={{ width: '50%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '40px' }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {(searchTerm || searchGotra || searchBlood || minAge || maxAge) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSearchGotra('');
                    setSearchBlood('');
                    setMinAge('');
                    setMaxAge('');
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                >
                  सर्च फिल्टर साफ करें ❌
                </button>
              )}
              <h2 style={{ fontSize: '16px', color: '#334155', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                👥 परिवारों की सूची ({filteredMembers.length} सदस्य मिले)
              </h2>
              {Object.keys(grouped).length === 0 ? (
                <p style={{ color: '#64748b', background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  कोई रिकॉर्ड नहीं मिला।
                </p>
              ) : (
                Object.keys(grouped).map((fid) => {
                  const familyList = grouped[fid];
                  return (
                    <div
                      key={fid}
                      style={{
                        border: '1px solid #e2e8f0',
                        padding: '12px',
                        margin: '12px 0',
                        borderRadius: '8px',
                        background: '#ffffff',
                      }}
                    >
                      <h3 style={{ color: '#2563eb', margin: '0 0 8px 0', fontSize: '15px' }}>Family ID: {fid}</h3>
                      {familyList.map((m: any, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px 0',
                            borderBottom: index !== familyList.length - 1 ? '1px dashed #e2e8f0' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '6px',
                            fontSize: '13px',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            • <strong>{m.name}</strong>{' '}
                            {m.isHead ? (
                              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>(मुखिया)</span>
                            ) : (
                              <span style={{ color: '#64748b' }}>({m.relationToHead || 'सदस्य'})</span>
                            )}
                            {m.age_years ? <span style={{ color: '#475569' }}> — {m.age_years} वर्ष</span> : ''}
                            {m.gotra ? <span style={{ color: '#475569' }}> | {m.gotra}</span> : ''}
                            {m.bloodGroup ? (
                              <span style={{ color: '#dc2626', fontWeight: '600' }}> | 🩸 {m.bloodGroup}</span>
                            ) : (
                              ''
                            )}
                            {m.occupation || m.occupation_isStudent ? (
                              <span style={{ color: '#475569' }}>
                                {' '}
                                | {m.occupation_isStudent ? 'छात्र' : m.occupation}
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {m.mobile && (
                              <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '600' }}>📞 {m.mobile}</span>
                            )}
                            <button
                              onClick={() => handleEditMember(m)}
                              style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id, m.name)}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}