import { useState } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCustomOptions, addCustomOption } from './storageHelpers';

// ===== पद (Designation) के लिए मूल ऑप्शन =====
const BASE_DESIGNATIONS = ["सदर", "उप सदर", "सचिव", "ख़ज़ाँची", "सलाहकार", "सदस्य"];

// ===== बाकी फील्ड्स के लिए ऑप्शन =====
const BASE_OPTIONS = {
  gotras: ["भाटा", "टाक", "नागोरा", "देवडा", "कूकडा", "राव"],
  bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "पता नहीं"]
};

const OTHER_VALUE = '__other__';

export default function AddCommitteeMember() {
  const [isOpen, setIsOpen] = useState(false);
  const [designation, setDesignation] = useState('');
  const [designationIsOther, setDesignationIsOther] = useState(false);
  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [mobile, setMobile] = useState('');
  const [tenure, setTenure] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const customDesignations = getCustomOptions('designations');
  const allDesignations = [...BASE_DESIGNATIONS, ...customDesignations];

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

    if (designationIsOther && designation.trim()) {
      addCustomOption('designations', designation.trim());
    }

    if (designationIsOther && !designation.trim()) {
      alert('कृपया "अन्य" पद के लिए कुछ लिखें या कोई मानक पद चुनें।');
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
        designation: designation.trim(),
        name: name.trim(),
        gotra: gotra || '',
        mobile: mobile || '',
        tenure: tenure || '',
        photoURL,
        createdAt: new Date().toISOString()
      });

      alert('✅ पदाधिकारी सफलतापूर्वक जोड़ा गया!');
      setDesignation('');
      setDesignationIsOther(false);
      setName('');
      setGotra('');
      setMobile('');
      setTenure('');
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

  const renderSelectWithOther = (
    label: string,
    value: string,
    isOther: boolean,
    options: string[],
    onChange: (val: string) => void,
    onOtherToggle: (isOther: boolean) => void,
    placeholderText: string = 'कुछ लिखें...',
    defaultOptionText: string = '-- चुने --'
  ) => {
    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === OTHER_VALUE) {
        onOtherToggle(true);
        onChange('');
      } else {
        onOtherToggle(false);
        onChange(val);
      }
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
          {label}
        </label>
        <select
          value={isOther ? OTHER_VALUE : value}
          onChange={handleSelect}
          style={inputStyle}
        >
          <option value="">{defaultOptionText}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          <option value={OTHER_VALUE}>अन्य</option>
        </select>
        {isOther && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderText}
            style={{ ...inputStyle, marginTop: '8px' }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: 'white', padding: '20px', borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box'
    }}>
      {/* ===== टॉगल बटन ===== */}
      <button onClick={() => setIsOpen(!isOpen)} style={{
        padding: '15px', width: '100%', background: '#f59e0b', color: 'white',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
        fontSize: '18px', fontWeight: 'bold',
        fontFamily: "'Poppins', 'Noto Sans', sans-serif"
      }}>
        {isOpen ? '▲ कमेटी' : '▼ कमेटी'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          {/* 📸 फोटो */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              📸 पदाधिकारी की फोटो (वैकल्पिक)
            </label>
            <input type="file" accept="image/*" onChange={handlePhotoChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }} />
            {photoPreview && <img src={photoPreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px', border: '2px solid #f59e0b' }} />}
          </div>

          {/* ===== पद (Designation) – Dropdown + "अन्य" ===== */}
          {renderSelectWithOther(
            'पद / दायित्व',
            designation,
            designationIsOther,
            allDesignations,
            setDesignation,
            setDesignationIsOther,
            'अन्य पद लिखें...',
            'पद चुनें'
          )}

          {/* नाम */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              पदाधिकारी का नाम <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="पूरा नाम"
              required
              style={inputStyle}
            />
          </div>

          {/* गोत्र */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              गोत्र
            </label>
            <select
              value={gotra}
              onChange={(e) => setGotra(e.target.value)}
              style={inputStyle}
            >
              <option value="">गोत्र चुनें</option>
              {BASE_OPTIONS.gotras.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* मोबाइल */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              मोबाइल नंबर
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10 अंकों का नंबर"
              style={inputStyle}
            />
          </div>

          {/* कार्यकाल */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
              कार्यकाल (Tenure)
            </label>
            <input
              type="text"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              placeholder="जैसे: 2024-2026"
              style={inputStyle}
            />
          </div>

          {/* ===== सबमिट बटन – अब ✅ सबमिट ===== */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block',
              margin: '0 auto',
              width: '35%',
              padding: '5px 16px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s'
            }}
          >
            {loading ? '⏳ जमा हो रहा...' : '✅ सबमिट'}
          </button>
        </form>
      )}
    </div>
  );
}