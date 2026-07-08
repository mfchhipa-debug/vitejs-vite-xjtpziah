import { useState } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddCommitteeMember() {
  const [isOpen, setIsOpen] = useState(false);
  const [designation, setDesignation] = useState('');
  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [mobile, setMobile] = useState('');
  const [tenure, setTenure] = useState('');
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
    if (!designation || !name) {
      alert('कृपया पद और नाम भरें!');
      return;
    }
    setLoading(true);
    try {
      let photoURL = '';
      if (photoFile) {
        const storageRef = ref(storage, `committee_photos/${designation}_${Date.now()}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      await addDoc(collection(db, 'committee'), {
        designation, name, gotra: gotra || '', mobile: mobile || '',
        tenure: tenure || '', photoURL, createdAt: new Date().toISOString()
      });
      alert('✅ पदाधिकारी सफलतापूर्वक जोड़ा गया!');
      setDesignation(''); setName(''); setGotra(''); setMobile(''); setTenure('');
      setPhotoFile(null); setPhotoPreview(null); setIsOpen(false);
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
      background: 'white', padding: '20px', borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box'
    }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        padding: '15px', width: '100%', background: '#f59e0b', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '18px',   // ⬅️ बड़ा किया
        fontWeight: 'bold',
        fontFamily: "'Poppins', 'Noto Sans', sans-serif"
      }}>
        {isOpen ? '▲ 3. कमेटी' : '▼ 3. कमेटी'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              📸 पदाधिकारी की फोटो (वैकल्पिक)
            </label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }} />
            {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px', border: '2px solid #f59e0b' }} />}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>पद / दायित्व <span style={{ color: 'red' }}>*</span></label>
            <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="जैसे: अध्यक्ष, सचिव, कोषाध्यक्ष" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>पदाधिकारी का नाम <span style={{ color: 'red' }}>*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="पूरा नाम" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>गोत्र</label>
            <select value={gotra} onChange={(e) => setGotra(e.target.value)} style={inputStyle}>
              <option value="">-- गोत्र चुनें --</option>
              {["कश्यप","गर्ग","भारद्वाज","वशिष्ठ","अत्रि","विश्वमित्र","अन्य"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>मोबाइल नंबर</label>
            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10 अंकों का नंबर" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>कार्यकाल (Tenure)</label>
            <input type="text" value={tenure} onChange={(e) => setTenure(e.target.value)} placeholder="जैसे: 2024-2026" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px',
            fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1
          }}>
            {loading ? '⏳ जमा हो रहा...' : '✅ पदाधिकारी जोड़ें'}
          </button>
        </form>
      )}
    </div>
  );
}