import { useState, useEffect } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [isOpen, setIsOpen] = useState(false);
  const [heads, setHeads] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
    if (!dobValue) { setFormData({ ...formData, dob: '', age_years: '', age_months: '' }); return; }
    const birthDate = new Date(dobValue);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) months--;
    if (months < 0) { years--; months += 12; }
    setFormData({ ...formData, dob: dobValue, age_years: years.toString(), age_months: months.toString() });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyID) { alert("कृपया Family ID चुनें!"); return; }
    try {
      let photoURL = '';
      if (photoFile) {
        const storageRef = ref(storage, `member_photos/${formData.familyID}_${Date.now()}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'members'), { ...formData, isHead: false, photoURL, createdAt: new Date() });
      alert('✅ सदस्य सफलतापूर्वक जोड़ दिया गया!');
      setFormData({
        familyID: '', memberNo: '', name: '', fatherName: '', gotra: '',
        relationToHead: '', dob: '', age_years: '', age_months: '',
        gender: '', bloodGroup: '', maritalStatus: '', education: '', occupation: '',
        villageCity: '', area: '', address: '', mobile: '', isStudent: false
      });
      setPhotoFile(null); setPhotoPreview(null); setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box' as const,
    fontSize: '14px'
  };

  return (
    <div style={{
      background: 'white', padding: '20px', borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box'
    }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        padding: '15px', width: '100%', background: '#3b82f6', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '18px',   // ⬅️ बड़ा किया
        fontWeight: 'bold',
        fontFamily: "'Poppins', 'Noto Sans', sans-serif"
      }}>
        {isOpen ? '▲ 2. सदस्य जोड़ें' : '▼ 2. सदस्य जोड़ें'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              📸 सदस्य की फोटो (वैकल्पिक)
            </label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }} />
            {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px', border: '2px solid #3b82f6' }} />}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Family ID चुने <span style={{ color: 'red' }}>*</span></label>
            <select value={formData.familyID} onChange={(e) => setFormData({...formData, familyID: e.target.value})} required style={inputStyle}>
              <option value="">-- Family ID चुनें --</option>
              {heads.map(h => <option key={h.id} value={h.familyID}>{h.familyID} - {h.name} का परिवार</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>सदस्य क्रमांक</label>
            <input type="text" placeholder="जैसे: 01, 02, 03..." value={formData.memberNo} onChange={(e) => setFormData({...formData, memberNo: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>नाम <span style={{ color: 'red' }}>*</span></label>
            <input type="text" placeholder="पूरा नाम" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>पिता/पति का नाम</label>
            <input type="text" placeholder="पिता या पति का नाम" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>गोत्र</label>
            <select value={formData.gotra} onChange={(e) => setFormData({...formData, gotra: e.target.value})} style={inputStyle}>
              <option value="">-- गोत्र चुनें --</option>
              {OPTIONS.gotras.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>संबंध (मुखिया से)</label>
            <select value={formData.relationToHead} onChange={(e) => setFormData({...formData, relationToHead: e.target.value})} style={inputStyle}>
              <option value="">-- संबंध चुनें --</option>
              {OPTIONS.relations.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>जन्म तिथि (DOB) <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="date" value={formData.dob} onChange={handleDobChange} required style={{ flex: 2, ...inputStyle }} />
              <input type="number" placeholder="साल" value={formData.age_years} readOnly style={{ flex: 1, background: '#f0f0f0', ...inputStyle }} />
              <input type="number" placeholder="महीने" value={formData.age_months} readOnly style={{ flex: 1, background: '#f0f0f0', ...inputStyle }} />
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>(उम्र स्वतः कैलकुलेट होगी)</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>लिंग</label>
            <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={inputStyle}>
              <option value="">-- लिंग चुनें --</option>
              {OPTIONS.genders.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>वैवाहिक स्थिति</label>
            <select value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} style={inputStyle}>
              <option value="">-- वैवाहिक स्थिति चुनें --</option>
              {OPTIONS.maritalStatuses.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>शिक्षा</label>
            <input type="text" placeholder="जैसे: B.A., M.Sc., 12वीं" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>व्यवसाय</label>
            <select value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} style={inputStyle}>
              <option value="">-- व्यवसाय चुनें --</option>
              {OPTIONS.occupations.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>गाँव/शहर</label>
            <select value={formData.villageCity} onChange={(e) => setFormData({...formData, villageCity: e.target.value})} style={inputStyle}>
              <option value="">-- गाँव/शहर चुनें --</option>
              {OPTIONS.villageCity.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>एरिया / कॉलोनी</label>
            <select value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} style={inputStyle}>
              <option value="">-- एरिया चुनें --</option>
              {OPTIONS.areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>पूरा पता</label>
            <input type="text" placeholder="मकान नंबर, गली, मोहल्ला" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>मोबाइल नंबर</label>
            <input type="tel" placeholder="10 अंकों का नंबर" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>ब्लड ग्रुप (Blood Group)</label>
            <select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} style={inputStyle}>
              <option value="">-- ब्लड ग्रुप चुनें --</option>
              {OPTIONS.bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isStudent} onChange={(e) => setFormData({...formData, isStudent: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontWeight: 'bold', color: '#334155' }}>क्या छात्र हैं?</span>
            </label>
          </div>

          <button type="submit" style={{
            width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px',
            fontWeight: 'bold', cursor: 'pointer'
          }}>
            ✅ सदस्य सबमिट करें
          </button>
        </form>
      )}
    </div>
  );
}