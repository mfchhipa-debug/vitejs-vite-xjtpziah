import { useState } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddFamilyHead() {
  const [isOpen, setIsOpen] = useState(false);
  const [familyID, setFamilyID] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gotra, setGotra] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [area, setArea] = useState('');
  const [mobile, setMobile] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    if (!familyID || !name) {
      alert('कृपया Family ID और मुखिया का नाम भरें!');
      return;
    }
    setLoading(true);
    try {
      let photoURL = '';
      if (photoFile) {
        const storageRef = ref(storage, `family_photos/${familyID}_${Date.now()}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'members'), {
        familyID,
        name,
        fatherName: fatherName || '',
        gotra: gotra || '',
        villageCity: villageCity || '',
        area: area || '',
        mobile: mobile || '',
        bloodGroup: bloodGroup || '',
        photoURL,
        isHead: true,
        relationToHead: 'स्वयं मुखिया',
        createdAt: new Date().toISOString()
      });
      alert('✅ परिवार मुखिया सफलतापूर्वक जोड़ा गया!');
      setFamilyID('');
      setName('');
      setFatherName('');
      setGotra('');
      setVillageCity('');
      setArea('');
      setMobile('');
      setBloodGroup('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
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
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '15px',
          width: '100%',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '18px',   // ⬅️ बड़ा किया
          fontWeight: 'bold',
          fontFamily: "'Poppins', 'Noto Sans', sans-serif"
        }}
      >
        {isOpen ? '▲ 1. परिवार' : '▼ 1. परिवार'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              📸 मुखिया की फोटो (वैकल्पिक)
            </label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }} />
            {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px', border: '2px solid #8b5cf6' }} />}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>Family ID (क्रम संख्या) <span style={{ color: 'red' }}>*</span></label>
            <input type="text" value={familyID} onChange={(e) => setFamilyID(e.target.value)} placeholder="जैसे: 001" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>मुखिया का नाम <span style={{ color: 'red' }}>*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="पूरा नाम" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>पिता का नाम</label>
            <input type="text" value={fatherName} onChange={(e) => setFatherName(e.target.value)} placeholder="पिता का पूरा नाम" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>गोत्र चुने</label>
            <select value={gotra} onChange={(e) => setGotra(e.target.value)} style={inputStyle}>
              <option value="">-- गोत्र चुनें --</option>
              {["कश्यप","गर्ग","भारद्वाज","वशिष्ठ","अत्रि","विश्वमित्र","अन्य"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>गाँव/शहर</label>
            <input type="text" value={villageCity} onChange={(e) => setVillageCity(e.target.value)} placeholder="गाँव या शहर" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>एरिया/कॉलोनी</label>
            <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="जैसे: वैशाली नगर" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>मोबाइल नंबर</label>
            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10 अंकों का नंबर" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>ब्लड ग्रुप (Blood Group)</label>
            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={inputStyle}>
              <option value="">-- ब्लड ग्रुप चुनें --</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px',
            fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1
          }}>
            {loading ? '⏳ जमा हो रहा...' : '✅ परिवार रजिस्टर करें'}
          </button>
        </form>
      )}
    </div>
  );
}