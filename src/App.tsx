import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import AddFamilyHead from './AddFamilyHead';
import AddMemberToFamily from './AddMemberToFamily';
import AddCommitteeMember from './AddCommitteeMember';

export default function App() {
  const [members, setMembers] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);

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

  // आज किसका जन्मदिन है? (Birthday Tracker)
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

  // एडवांस्ड डायनेमिक PDF प्रिंट/डाउनलोड फंक्शन
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
          body { font-family: Arial, sans-serif; padding: 25px; color: #333; line-height: 1.4; }
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f8f9fa' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>🏛️ समाज प्रबंधन एवं डिजिटल डायरेक्टरी</h1>
      
      {/* जन्मदिन रिमाइंडर्स अलर्ट बॉक्स */}
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

      {/* डैशबोर्ड काउंटर्स */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#e3f2fd', borderLeft: '5px solid #1e88e5', padding: '15px', borderRadius: '6px' }}>
          <div style={{ color: '#1565c0', fontSize: '14px', fontWeight: 'bold' }}>🏠 कुल परिवार</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{totalFamilies}</div>
        </div>
        <div style={{ background: '#e8f5e9', borderLeft: '5px solid #43a047', padding: '15px', borderRadius: '6px' }}>
          <div style={{ color: '#2e7d32', fontSize: '14px', fontWeight: 'bold' }}>👥 कुल सदस्य</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{totalMembers}</div>
        </div>
        <div style={{ background: '#fff3e0', borderLeft: '5px solid #fb8c00', padding: '15px', borderRadius: '6px' }}>
          <div style={{ color: '#e65100', fontSize: '14px', fontWeight: 'bold' }}>👶 कुल बच्चे (&lt;10 वर्ष)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{totalKids}</div>
        </div>
        <div style={{ background: '#f3e5f5', borderLeft: '5px solid #8e24aa', padding: '15px', borderRadius: '6px' }}>
          <div style={{ color: '#6a1b9a', fontSize: '14px', fontWeight: 'bold' }}>👨 कुल बड़े सदस्य</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{totalAdults}</div>
        </div>
        <div style={{ background: '#e0f2f1', borderLeft: '5px solid #00897b', padding: '15px', borderRadius: '6px' }}>
          <div style={{ color: '#004d40', fontSize: '14px', fontWeight: 'bold' }}>🎓 कुल छात्र/छात्राएं</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{totalStudents}</div>
        </div>
      </div>

      {/* इनपुट फॉर्म्स */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <AddFamilyHead />
        <AddMemberToFamily />
      </div>
      <AddCommitteeMember />
      
      <hr style={{ margin: '40px 0', borderColor: '#ccc' }} />
      
      {/* यूनीफाइड सिंगल सर्च बॉक्स */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #34495e', paddingBottom: '8px' }}>🔍 समाज खोज केंद्र (Search Console)</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '2px solid #34495e', background: '#f8f9fa', fontWeight: 'bold', color: '#2c3e50', height: '42px' }}
          >
            <option value="text">👤 नाम / शहर / एरिया से खोजें</option>
            <option value="gotra">🧬 गोत्र के अनुसार खोजें</option>
            <option value="blood">🩸 ब्लड ग्रुप से खोजें</option>
            <option value="age">⏳ उम्र सीमा (Between) से खोजें</option>
          </select>

          <div style={{ flex: 1, minWidth: '250px' }}>
            {filterType === 'text' && (
              <input placeholder="यहाँ नाम, शहर या एरिया टाइप करें..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '42px', boxSizing: 'border-box' }} />
            )}
            {filterType === 'gotra' && (
              <select value={searchGotra} onChange={(e) => setSearchGotra(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '42px' }}>
                <option value="">-- गोत्र चुनें --</option>
                <option value="कश्यप">कश्यप</option>
                <option value="गर्ग">गर्ग</option>
                <option value="भारद्वाज">भारद्वाज</option>
                <option value="वशिष्ठ">वशिष्ठ</option>
                <option value="अन्य">अन्य</option>
              </select>
            )}
            {filterType === 'blood' && (
              <select value={searchBlood} onChange={(e) => setSearchBlood(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '42px' }}>
                <option value="">-- ब्लड ग्रुप चुनें --</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            )}
            {filterType === 'age' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" placeholder="न्यूनतम उम्र" value={minAge} onChange={(e) => setMinAge(e.target.value)} style={{ width: '50%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '42px', boxSizing: 'border-box' }} />
                <input type="number" placeholder="अधिकतम उम्र" value={maxAge} onChange={(e) => setMaxAge(e.target.value)} style={{ width: '50%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', height: '42px', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>
        </div>

        {/* PDF डाउनलोड करने हेतु एडवांस विकल्प एरिया */}
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            {(searchTerm || searchGotra || searchBlood || minAge || maxAge) && (
              <button onClick={() => { setSearchTerm(''); setSearchGotra(''); setSearchBlood(''); setMinAge(''); setMaxAge(''); }} style={{ padding: '8px 15px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>सर्च फिल्टर साफ करें ❌</button>
            )}
          </div>

          {/* PDF ड्रापडाउन और प्रिंट बटन ग्रुप */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#34495e' }}>🖨️ रिपोर्ट का प्रकार:</label>
            <select
              value={pdfReportType}
              onChange={(e) => setPdfReportType(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '2px solid #2ecc71', background: '#fff', fontWeight: 'bold', color: '#27ae60', height: '38px' }}
            >
              <option value="all_grouped">📋 सभी सदस्य (Family ID व ग्रुप के साथ)</option>
              <option value="only_families">🏠 केवल परिवार के मुखिया</option>
              <option value="only_students">🎓 केवल छात्र / छात्राएं</option>
              <option value="only_committee">🏢 केवल कमेटी पदाधिकारी सूची</option>
            </select>
            
            <button onClick={handlePrintPDF} style={{ padding: '8px 18px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '38px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              📄 PDF डाउनलोड / प्रिंट करें
            </button>
          </div>
        </div>
      </div>

      {/* परिवारों की सूची */}
      <h2>👥 परिवारों की सूची ({filteredMembers.length} सदस्य मिले)</h2>
      {Object.keys(grouped).length === 0 ? (
        <p style={{ color: '#666', background: '#fff', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>कोई रिकॉर्ड नहीं मिला।</p>
      ) : (
        Object.keys(grouped).map((fid) => {
          const familyList = grouped[fid];
          return (
            <div key={fid} style={{ border: '1px solid #ccc', padding: '15px', margin: '15px 0', borderRadius: '8px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>Family ID: {fid}</h3>
              {familyList.map((m: any, index: number) => (
                <div key={index} style={{ padding: '8px 0', borderBottom: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    • <strong>{m.name}</strong> {m.isHead ? <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>(मुखिया)</span> : `(${m.relationToHead || 'सदस्य'})`} 
                    {m.age_years ? ` — उम्र: ${m.age_years} वर्ष` : ''}
                    {m.gotra ? ` | गोत्र: ${m.gotra}` : ''}
                    {m.bloodGroup ? ` | 🩸 ${m.bloodGroup}` : ''}
                    {m.occupation ? ` | 💼 कार्य: ${m.occupation}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {m.mobile && <span style={{ color: '#555', fontSize: '14px' }}>📞 {m.mobile}</span>}
                    <button onClick={() => handleEditMember(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="सुधारें">✏️</button>
                    <button onClick={() => handleDeleteMember(m.id, m.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }} title="हटाएं">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      <hr style={{ margin: '40px 0', borderColor: '#ccc' }} />

      {/* कमेटी कार्यकारिणी की सूची */}
      <h2>🏢 समाज कमेटी कार्यकारिणी सूची</h2>
      {committee.length === 0 ? (
        <p style={{ color: '#666', background: '#fff', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>वर्तमान में कमेटी में कोई पदाधिकारी नियुक्त नहीं है।</p>
      ) : (
        <div style={{ border: '2px solid #ff9800', borderRadius: '8px', padding: '15px', background: '#fffcf7', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff9800', background: '#ffe0b2' }}>
                <th style={{ padding: '10px' }}>पद / दायित्व</th>
                <th style={{ padding: '10px' }}>पदाधिकारी का नाम</th>
                <th style={{ padding: '10px' }}>गोत्र</th>
                <th style={{ padding: '10px' }}>मोबाइल नंबर</th>
                <th style={{ padding: '10px' }}>कार्रवाई</th>
              </tr>
            </thead>
            <tbody>
              {committee.map((c, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#e65100' }}>⭐ {c.designation}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.name}</td>
                  <td style={{ padding: '10px' }}>{c.gotra || '-'}</td>
                  <td style={{ padding: '10px' }}>{c.mobile || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleDeleteCommittee(c.id, c.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold' }}>🗑️ हटाएं</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}