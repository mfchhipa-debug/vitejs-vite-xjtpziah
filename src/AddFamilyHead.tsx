import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const OPTIONS = {
  gotras: ["कश्यप", "गर्ग", "भारद्वाज", "वशिष्ठ", "अत्रि", "विश्वमित्र", "अन्य"],
  villages: ["रामपुर", "जयपुर", "दिल्ली", "अन्य"],
  areas: ["शास्त्री नगर", "वैशाली नगर", "मालवीय नगर", "सी-स्कीम", "अन्य"],
  bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "पता नहीं"]
};

export default function AddFamilyHead() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ 
    familyID: '', name: '', fatherName: '', gotra: '', 
    villageCity: '', area: '', mobile: '', bloodGroup: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'members'), { ...data, isHead: true, relationToHead: 'स्वयं (मुखिया)', createdAt: new Date() });
      alert('परिवार मुखिया सफलतापूर्वक जुड़ गया!');
      setData({ familyID: '', name: '', fatherName: '', gotra: '', villageCity: '', area: '', mobile: '', bloodGroup: '' });
      setIsOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="form-card">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ padding: '12px', width: '100%', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {isOpen ? '▲ 1. परिवार मुखिया का फॉर्म बंद करें' : '▼ 1. नया परिवार जोड़ें (मुखिया)'}
      </button>

      {isOpen && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #007bff', borderRadius: '8px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
            <input placeholder="Family ID (क्रम संख्या)" type="number" value={data.familyID} onChange={(e) => setData({...data, familyID: e.target.value})} required />
            <input placeholder="मुखिया का नाम" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} required />
            <input placeholder="पिता का नाम" value={data.fatherName} onChange={(e) => setData({...data, fatherName: e.target.value})} />
            
            <select value={data.gotra} onChange={(e) => setData({...data, gotra: e.target.value})}>
                <option value="">गोत्र चुनें</option>
                {OPTIONS.gotras.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            
            <select value={data.villageCity} onChange={(e) => setData({...data, villageCity: e.target.value})}>
                <option value="">गाँव/शहर चुनें</option>
                {OPTIONS.villages.map(v => <option key={v} value={v}>{v}</option>)}
            </select>

            <select value={data.area} onChange={(e) => setData({...data, area: e.target.value})}>
                <option value="">एरिया चुनें</option>
                {OPTIONS.areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <input placeholder="मोबाइल नंबर" value={data.mobile} onChange={(e) => setData({...data, mobile: e.target.value})} />
            
            <select value={data.bloodGroup} onChange={(e) => setData({...data, bloodGroup: e.target.value})}>
                <option value="">ब्लड ग्रुप (Blood Group)</option>
                {OPTIONS.bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>

            <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              परिवार रजिस्टर करें
            </button>
          </form>
        </div>
      )}
    </div>
  );
}