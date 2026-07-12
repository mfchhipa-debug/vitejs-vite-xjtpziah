import { useState } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCustomOptions, addCustomOption } from './storageHelpers';

const BASE_OPTIONS = {
  gotras: ["भाटी", "टाक", "नागोरा", "देवडा", "कूकडा", "राव"],
  villageCity: ["सरदार शहर", "लाडनू", "निम्बी", "भादरा", "सीकर", "झुँझूनू", "फतेहपुर", "चूर", "कुचामन सिटी", "सुजानगढ", "राजलदेसर", "गंगानगर", "रायसिंहनगर", "सूरतगढ", "किशनगढ", "राणासर", "डूंगरगढ", "नागोर", "नीमच M P"],
  areas: ["झोटवाडा", "नाहरी का नाका", "लंकापुरी", "साँगानेर", "रामगढ मोड", "हसनपुरा", "खबूजा मंडी", "नया खेडा", "चीनी की बुजू", "वैशाली नगर", "खातीपुरा", "भाँकरोटा", "जामिया हिदाया", "पहाडगंज"],
  bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "पता नहीं"]
};

const OTHER_VALUE = '__other__';

export default function AddFamilyHead({ onClose }: { onClose?: () => void }) {
  const [familyID, setFamilyID] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gotra, setGotra] = useState('');
  const [gotraIsOther, setGotraIsOther] = useState(false);
  const [villageCity, setVillageCity] = useState('');
  const [villageCityIsOther, setVillageCityIsOther] = useState(false);
  const [area, setArea] = useState('');
  const [areaIsOther, setAreaIsOther] = useState(false);
  const [mobile1, setMobile1] = useState('');
  const [mobile2, setMobile2] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const customGotras = getCustomOptions('gotras');
  const customVillageCity = getCustomOptions('villageCity');
  const customAreas = getCustomOptions('areas');

  const allGotras = [...BASE_OPTIONS.gotras, ...customGotras];
  const allVillageCity = [...BASE_OPTIONS.villageCity, ...customVillageCity];
  const allAreas = [...BASE_OPTIONS.areas, ...customAreas];

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

    if (gotraIsOther && gotra.trim()) addCustomOption('gotras', gotra.trim());
    if (villageCityIsOther && villageCity.trim()) addCustomOption('villageCity', villageCity.trim());
    if (areaIsOther && area.trim()) addCustomOption('areas', area.trim());

    if (gotraIsOther && !gotra.trim()) {
      alert('कृपया "अन्य" गोत्र के लिए कुछ लिखें या कोई मानक गोत्र चुनें।');
      return;
    }
    if (villageCityIsOther && !villageCity.trim()) {
      alert('कृपया "अन्य" गाँव/शहर के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
      return;
    }
    if (areaIsOther && !area.trim()) {
      alert('कृपया "अन्य" एरिया/कॉलोनी के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
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
        mobile1: mobile1 || '',
        mobile2: mobile2 || '',
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
      setGotraIsOther(false);
      setVillageCity('');
      setVillageCityIsOther(false);
      setArea('');
      setAreaIsOther(false);
      setMobile1('');
      setMobile2('');
      setBloodGroup('');
      setPhotoFile(null);
      setPhotoPreview(null);
      if (onClose) onClose();
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
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* X Button - Top Right */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
            padding: 0,
            lineHeight: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
          title="बंद करें"
        >
          ✕
        </button>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '0' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#7c3aed', borderBottom: '2px solid #ede9fe', paddingBottom: '10px' }}>
          👑 परिवार मुखिया जोड़ें
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            📸 मुखिया की फोटो (वैकल्पिक)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px', border: '2px solid #8b5cf6' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            Family ID (क्रम संख्या) <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={familyID}
            onChange={(e) => setFamilyID(e.target.value)}
            placeholder="जैसे: 001"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            मुखिया का नाम <span style={{ color: 'red' }}>*</span>
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

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            पिता का नाम
          </label>
          <input
            type="text"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
            placeholder="पिता का पूरा नाम"
            style={inputStyle}
          />
        </div>

        {renderSelectWithOther(
          'गोत्र',
          gotra,
          gotraIsOther,
          allGotras,
          setGotra,
          setGotraIsOther,
          'अन्य गोत्र लिखें...',
          'गोत्र चुनें'
        )}

        {renderSelectWithOther(
          'गाँव/शहर',
          villageCity,
          villageCityIsOther,
          allVillageCity,
          setVillageCity,
          setVillageCityIsOther,
          'अन्य गाँव/शहर लिखें...',
          'गाँव/शहर चुनें'
        )}

        {renderSelectWithOther(
          'एरिया/कॉलोनी',
          area,
          areaIsOther,
          allAreas,
          setArea,
          setAreaIsOther,
          'अन्य एरिया लिखें...',
          'एरिया/कॉलोनी चुनें'
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            📱 मोबाइल 1
          </label>
          <input
            type="tel"
            value={mobile1}
            onChange={(e) => setMobile1(e.target.value)}
            placeholder="10 अंकों का नंबर"
            style={inputStyle}
            maxLength={10}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            📱 मोबाइल 2
          </label>
          <input
            type="tel"
            value={mobile2}
            onChange={(e) => setMobile2(e.target.value)}
            placeholder="10 अंकों का नंबर"
            style={inputStyle}
            maxLength={10}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            ब्लड ग्रुप (Blood Group)
          </label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            style={inputStyle}
          >
            <option value="">ब्लड ग्रुप चुनें</option>
            {BASE_OPTIONS.bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>

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
    </div>
  );
}