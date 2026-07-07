import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const DESIGNATIONS = ["अध्यक्ष", "उपाध्यक्ष", "सचिव", "सह-सचिव", "कोषाध्यक्ष", "कार्यकारिणी सदस्य", "सलाहकार", "अन्य"];

// आपके समाज के गोत्र की लिस्ट
const GOTRAS = ["कश्यप", "गर्ग", "भारद्वाज", "वशिष्ठ", "अन्य"]; 

export default function AddCommitteeMember() {
  const [formData, setFormData] = useState({
    designation: '', name: '', fatherName: '', gotra: '', familyID: '', mobile: '', tenure: '2026-2027', notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation) {
      alert("कृपया नाम और पद दोनों अवश्य भरें!");
      return;
    }
    try {
      await addDoc(collection(db, 'committee'), {
        ...formData,
        createdAt: new Date()
      });
      alert('कमेटी पदाधिकारी सफलतापूर्वक नियुक्त कर दिए गए! 🎉');
      // फॉर्म को खाली (Reset) करना
      setFormData({ designation: '', name: '', fatherName: '', gotra: '', familyID: '', mobile: '', tenure: '2026-2027', notes: '' });
    } catch (error) {
      console.error("Error: ", error);
      alert("डेटा सुरक्षित करने में समस्या आई!");
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ff9800', borderRadius: '8px', marginBottom: '20px', background: '#fffcf9' }}>
      <h3 style={{ color: '#e65100', marginTop: 0 }}>3. समाज कमेटी पदाधिकारी जोड़ें (कार्यकारिणी फॉर्म)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
        
        {/* पद चुनें */}
        <select value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} required style={{ padding: '8px' }}>
          <option value="">-- पद / दायित्व चुनें * --</option>
          {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        
        {/* नाम और पिता का नाम */}
        <input placeholder="पदाधिकारी का name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '8px' }} />
        <input placeholder="पिता/पति का नाम" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} style={{ padding: '8px' }} />
        
        {/* गोत्र ड्रापडाउन (नया विकल्प जोड़ा गया) */}
        <select value={formData.gotra} onChange={(e) => setFormData({...formData, gotra: e.target.value})} style={{ padding: '8px' }}>
          <option value="">-- गोत्र चुनें --</option>
          {GOTRAS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* बाकी अन्य जानकारियां */}
        <input placeholder="Family ID (यदि उपलब्ध हो)" type="number" value={formData.familyID} onChange={(e) => setFormData({...formData, familyID: e.target.value})} style={{ padding: '8px' }} />
        <input placeholder="कार्यकाल (जैसे: 2026-2027)" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} style={{ padding: '8px' }} />
        <input placeholder="मोबाइल नंबर" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} style={{ padding: '8px' }} />
        <input placeholder="विशेष जिम्मेदारी / विवरण (वैकल्पिक)" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ padding: '8px' }} />
        
        <button type="submit" style={{ padding: '10px', background: '#ff9800', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
          कमेटी में नियुक्त करें 🤝
        </button>
      </form>
    </div>
  );
}