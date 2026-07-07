import { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const OPTIONS = {
  gotras: ["कश्यप", "गर्ग", "भारद्वाज", "वशिष्ठ", "अत्रि", "विश्वमित्र", "अन्य"],
  relations: ["पत्नी", "पुत्र", "पुत्री", "पिता", "माता", "अन्य"],
  villageCity: ["रामपुर", "जयपुर", "दिल्ली", "अन्य"],
  areas: ["शास्त्री नगर", "वैशाली नगर", "मालवीय नगर", "सी-स्कीम", "अन्य"],
  occupations: ["किसान", "व्यापार", "नौकरी (सरकारी)", "नौकरी (प्राइवेट)", "छात्र", "गृहणी", "अन्य"],
  genders: ["पुरुष", "स्त्री", "अन्य"],
  maritalStatuses: ["शादीशुदा", "कुंवारा", "सगाई", "अन्य"],
  bloodGroups: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "पता नहीं"]
};

export default function AddMemberToFamily() {
  const [heads, setHeads] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    familyID: '', memberNo: '', name: '', fatherName: '', gotra: '',
    relationToHead: '', dob: '', age_years: '', age_months: '',
    gender: '', bloodGroup: '', maritalStatus: '', education: '', occupation: '',
    villageCity: '', area: '', address: '', mobile: '', isStudent: false
  });

  useEffect(() => {
    const fetchHeads = async () => {
      const q = query(collection(db, 'members'), where("isHead", "==", true));
      const snapshot = await getDocs(q);
      setHeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchHeads();
  }, []);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobValue = e.target.value;
    if (!dobValue) {
      setFormData({ ...formData, dob: '', age_years: '', age_months: '' });
      return;
    }

    const birthDate = new Date(dobValue);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    setFormData({ 
      ...formData, 
      dob: dobValue, 
      age_years: years.toString(), 
      age_months: months.toString() 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyID) { alert("कृपया Family ID चुनें!"); return; }
    try {
      await addDoc(collection(db, 'members'), { ...formData, isHead: false, createdAt: new Date() });
      alert('सदस्य सफलतापूर्वक जोड़ दिया गया!');
      setFormData({ familyID: '', memberNo: '', name: '', fatherName: '', gotra: '', relationToHead: '', dob: '', age_years: '', age_months: '', gender: '', bloodGroup: '', maritalStatus: '', education: '', occupation: '', villageCity: '', area: '', address: '', mobile: '', isStudent: false });
    } catch (error) { console.error('Error: ', error); }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px' }}>
      <h3>2. सदस्य जोड़ें</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
        
        <select value={formData.familyID} onChange={(e) => setFormData({...formData, familyID: e.target.value})} required>
          <option value="">Family ID चुनें (किस परिवार में जोड़ना है)</option>
          {heads.map(h => <option key={h.id} value={h.familyID}>{h.familyID} - {h.name} का परिवार</option>)}
        </select>

        <input placeholder="सदस्य क्रमांक" value={formData.memberNo} onChange={(e) => setFormData({...formData, memberNo: e.target.value})} />
        <input placeholder="नाम" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        {/* यहाँ मैंने setData बदलकर setFormData कर दिया है */}
        <input placeholder="पिता/पति का नाम" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
        
        <select value={formData.gotra} onChange={(e) => setFormData({...formData, gotra: e.target.value})}>
          <option value="">गोत्र</option>
          {OPTIONS.gotras.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={formData.relationToHead} onChange={(e) => setFormData({...formData, relationToHead: e.target.value})}>
          <option value="">संबंध</option>
          {OPTIONS.relations.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#555' }}>DOB:</span>
          <input type="date" title="जन्म तिथि" value={formData.dob} onChange={handleDobChange} required style={{ flex: 1 }} />
          <input placeholder="साल" type="number" style={{ width: '70px', background: '#f0f0f0' }} value={formData.age_years} readOnly />
          <input placeholder="महीने" type="number" style={{ width: '70px', background: '#f0f0f0' }} value={formData.age_months} readOnly />
        </div>

        <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
          <option value="">लिंग</option>
          {OPTIONS.genders.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}>
          <option value="">वैवाहिक स्थिति</option>
          {OPTIONS.maritalStatuses.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <input placeholder="शिक्षा" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
        
        <select value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})}>
          <option value="">व्यवसाय</option>
          {OPTIONS.occupations.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <select value={formData.villageCity} onChange={(e) => setFormData({...formData, villageCity: e.target.value})}>
          <option value="">गाँव/शहर</option>
          {OPTIONS.villageCity.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})}>
          <option value="">एरिया</option>
          {OPTIONS.areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <input placeholder="पूरा पता" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
        <input placeholder="मोबाइल" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
        
        <select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}>
          <option value="">ब्लड ग्रुप (Blood Group)</option>
          {OPTIONS.bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input type="checkbox" checked={formData.isStudent} onChange={(e) => setFormData({...formData, isStudent: e.target.checked})} /> 
          क्या छात्र हैं?
        </label>
        
        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>सबमिट करें</button>
      </form>
    </div>
  );
}