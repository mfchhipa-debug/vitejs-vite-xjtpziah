import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const DESIGNATIONS = ["अध्यक्ष", "उपाध्यक्ष", "सचिव", "सह-सचिव", "कोषाध्यक्ष", "कार्यकारिणी सदस्य", "सलाहकार", "अन्य"];
const GOTRAS = ["कश्यप", "गर्ग", "भारद्वाज", "वशिष्ठ", "अन्य"]; 

export default function AddCommitteeMember() {
  const [isOpen, setIsOpen] = useState(false); // फॉर्म खोलने/बंद करने के लिए स्टेट
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
      await addDoc(collection(db, 'committee'), { ...formData, createdAt: new Date() });
      alert('कमेटी पदाधिकारी सफलतापूर्वक नियुक्त कर दिए गए! 🎉');
      setFormData({ designation: '', name: '', fatherName: '', gotra: '', familyID: '', mobile: '', tenure: '2026-2027', notes: '' });
      setIsOpen(false); // सबमिट करने के बाद फॉर्म बंद हो जाएगा
    } catch (error) {
      console.error("Error: ", error);
      alert("डेटा सुरक्षित करने में समस्या आई!");
    }
  };

  return (
    <div className="form-card">
      {/* बटन: क्लिक करने पर फॉर्म खुलेगा/बंद होगा */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ padding: '12px', width: '100%', background: '#ff9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {isOpen ? '▲ 3. कमेटी फॉर्म बंद करें' : '▼ 3. समाज कमेटी पदाधिकारी जोड़ें (कार्यकारिणी)'}
      </button>

      {/* अगर isOpen 'true' है, तभी फॉर्म दिखेगा */}
      {isOpen && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ff9800', borderRadius: '8px', background: '#fffcf9' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px' }}>
            <select value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} required style={{ padding: '8px' }}>
              <option value="">-- पद / दायित्व चुनें * --</option>
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            
            <input placeholder="पदाधिकारी का नाम *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ padding: '8px' }} />
            <input placeholder="पिता/पति का नाम" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} style={{ padding: '8px' }} />
            
            <select value={formData.gotra} onChange={(e) => setFormData({...formData, gotra: e.target.value})} style={{ padding: '8px' }}>
              <option value="">-- गोत्र चुनें --</option>
              {GOTRAS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <input placeholder="Family ID (यदि उपलब्ध हो)" type="number" value={formData.familyID} onChange={(e) => setFormData({...formData, familyID: e.target.value})} style={{ padding: '8px' }} />
            <input placeholder="कार्यकाल (जैसे: 2026-2027)" value={formData.tenure} onChange={(e) => setFormData({...formData, tenure: e.target.value})} style={{ padding: '8px' }} />
            <input placeholder="मोबाइल नंबर" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} style={{ padding: '8px' }} />
            <input placeholder="विशेष जिम्मेदारी / विवरण" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ padding: '8px' }} />
            
            <button type="submit" style={{ padding: '10px', background: '#ff9800', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
              कमेटी में नियुक्त करें 🤝
            </button>
          </form>
        </div>
      )}
    </div>
  );
}