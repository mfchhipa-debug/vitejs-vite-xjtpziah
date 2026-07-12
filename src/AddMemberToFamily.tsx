import { useState, useEffect } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCustomOptions, addCustomOption } from './storageHelpers';

const BASE_OPTIONS = {
gotras: ["भाटी", "टाक", "नागोरा", "देवडा", "कूकडा", "राव"],
relations: ["ख़ुद", "बीवी", "बेटा", "बेटी", "बहू", "पिता", "माँ", "पोता", "पोती"],
villageCity: ["सरदार शहर", "लाडनू", "निम्बी", "भादरा", "सीकर", "झुँझुनू", "फतेहपुर", "चूर", "कुचामन सिटी", "सुजानगढ", "राजलदेसर", "गंगानगर", "रायसिंहनगर", "सूरतगढ", "किशनगढ", "राणासर", "डूंगरगढ", "नागोर", "नीमच M P"],
areas: ["झोटवाडा", "नाहरी का नाका", "लंकापुरी", "साँगानेर", "रामगढ मोड", "हसनपुरा", "खबूजा मंडी", "नया खेडा", "चीनी की बुजू", "वैशाली नगर", "खातीपुरा", "भाँकरोटा", "जामिया हिदाया", "पहाडगंज"],
occupations: ["रंगाई", "व्यापार", "दुकान", "नौकरी (सरकारी)", "नौकरी (प्राइवेट)", "छात्र", "गृहणी"],
genders: ["पुरुष", "स्त्री"],
maritalStatuses: ["शादीशुदा", "कुंवारा", "सगाई"],
bloodGroups: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "पता नहीं"]
};

const OTHER_VALUE = '__other__';

export default function AddMemberToFamily({ onClose }: { onClose?: () => void }) {
const [heads, setHeads] = useState<any[]>([]);
const [photoFile, setPhotoFile] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);

const [formData, setFormData] = useState({
familyID: '', memberNo: '', name: '', fatherName: '', gotra: '',
relationToHead: '', dob: '', age_years: '', age_months: '',
gender: '', bloodGroup: '', maritalStatus: '', education: '', occupation: '',
villageCity: '', area: '', address: '', mobile: '', isStudent: false
});

const [gotraIsOther, setGotraIsOther] = useState(false);
const [relationIsOther, setRelationIsOther] = useState(false);
const [genderIsOther, setGenderIsOther] = useState(false);
const [maritalIsOther, setMaritalIsOther] = useState(false);
const [occupationIsOther, setOccupationIsOther] = useState(false);
const [villageCityIsOther, setVillageCityIsOther] = useState(false);
const [areaIsOther, setAreaIsOther] = useState(false);

const customGotras = getCustomOptions('gotras');
const customRelations = getCustomOptions('relations');
const customGenders = getCustomOptions('genders');
const customMaritals = getCustomOptions('maritalStatuses');
const customOccupations = getCustomOptions('occupations');
const customVillageCity = getCustomOptions('villageCity');
const customAreas = getCustomOptions('areas');

const allGotras = [...BASE_OPTIONS.gotras, ...customGotras];
const allRelations = [...BASE_OPTIONS.relations, ...customRelations];
const allGenders = [...BASE_OPTIONS.genders, ...customGenders];
const allMaritals = [...BASE_OPTIONS.maritalStatuses, ...customMaritals];
const allOccupations = [...BASE_OPTIONS.occupations, ...customOccupations];
const allVillageCity = [...BASE_OPTIONS.villageCity, ...customVillageCity];
const allAreas = [...BASE_OPTIONS.areas, ...customAreas];

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

if (gotraIsOther && formData.gotra.trim()) addCustomOption('gotras', formData.gotra.trim());
if (relationIsOther && formData.relationToHead.trim()) addCustomOption('relations', formData.relationToHead.trim());
if (genderIsOther && formData.gender.trim()) addCustomOption('genders', formData.gender.trim());
if (maritalIsOther && formData.maritalStatus.trim()) addCustomOption('maritalStatuses', formData.maritalStatus.trim());
if (occupationIsOther && formData.occupation.trim()) addCustomOption('occupations', formData.occupation.trim());
if (villageCityIsOther && formData.villageCity.trim()) addCustomOption('villageCity', formData.villageCity.trim());
if (areaIsOther && formData.area.trim()) addCustomOption('areas', formData.area.trim());

if (gotraIsOther && !formData.gotra.trim()) {
alert('कृपया "अन्य" गोत्र के लिए कुछ लिखें या कोई मानक गोत्र चुनें।');
return;
}
if (relationIsOther && !formData.relationToHead.trim()) {
alert('कृपया "अन्य" संबंध के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
return;
}
if (genderIsOther && !formData.gender.trim()) {
alert('कृपया "अन्य" लिंग के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
return;
}
if (maritalIsOther && !formData.maritalStatus.trim()) {
alert('कृपया "अन्य" वैवाहिक स्थिति के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
return;
}
if (occupationIsOther && !formData.occupation.trim()) {
alert('कृपया "अन्य" व्यवसाय के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
return;
}
if (villageCityIsOther && !formData.villageCity.trim()) {
alert('कृपया "अन्य" गाँव/शहर के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
return;
}
if (areaIsOther && !formData.area.trim()) {
alert('कृपया "अन्य" एरिया/कॉलोनी के लिए कुछ लिखें या कोई मानक विकल्प चुनें।');
return;
}

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
setGotraIsOther(false);
setRelationIsOther(false);
setGenderIsOther(false);
setMaritalIsOther(false);
setOccupationIsOther(false);
setVillageCityIsOther(false);
setAreaIsOther(false);
setPhotoFile(null);
setPhotoPreview(null);
if (onClose) onClose();
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
width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box',
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
<h2 style={{ margin: '0 0 20px 0', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
✏️ सदस्य जोड़ें
</h2>

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

{renderSelectWithOther(
'गोत्र',
formData.gotra,
gotraIsOther,
allGotras,
(val) => setFormData({...formData, gotra: val}),
setGotraIsOther,
'अन्य गोत्र लिखें...',
'गोत्र चुनें'
)}

{renderSelectWithOther(
'संबंध (मुखिया से)',
formData.relationToHead,
relationIsOther,
allRelations,
(val) => setFormData({...formData, relationToHead: val}),
setRelationIsOther,
'अन्य संबंध लिखें...',
'संबंध चुनें'
)}

<div style={{ marginBottom: '16px' }}>
<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>जन्म तिथि (DOB) <span style={{ color: 'red' }}>*</span></label>
<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
<input type="date" value={formData.dob} onChange={handleDobChange} required style={{ flex: 2, ...inputStyle }} />
<input type="number" placeholder="साल" value={formData.age_years} readOnly style={{ flex: 1, background: '#f0f0f0', ...inputStyle }} />
<input type="number" placeholder="महीने" value={formData.age_months} readOnly style={{ flex: 1, background: '#f0f0f0', ...inputStyle }} />
</div>
<div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>(उम्र स्वतः कैलकुलेट होगी)</div>
</div>

{renderSelectWithOther(
'लिंग',
formData.gender,
genderIsOther,
allGenders,
(val) => setFormData({...formData, gender: val}),
setGenderIsOther,
'अन्य लिंग लिखें...',
'लिंग चुनें'
)}

{renderSelectWithOther(
'वैवाहिक स्थिति',
formData.maritalStatus,
maritalIsOther,
allMaritals,
(val) => setFormData({...formData, maritalStatus: val}),
setMaritalIsOther,
'अन्य स्थिति लिखें...',
'वैवाहिक स्थिति चुनें'
)}

<div style={{ marginBottom: '16px' }}>
<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>शिक्षा</label>
<input type="text" placeholder="जैसे: B.A., M.Sc., 12वीं" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} style={inputStyle} />
</div>

{renderSelectWithOther(
'व्यवसाय',
formData.occupation,
occupationIsOther,
allOccupations,
(val) => setFormData({...formData, occupation: val}),
setOccupationIsOther,
'अन्य व्यवसाय लिखें...',
'व्यवसाय चुनें'
)}

{renderSelectWithOther(
'गाँव/शहर',
formData.villageCity,
villageCityIsOther,
allVillageCity,
(val) => setFormData({...formData, villageCity: val}),
setVillageCityIsOther,
'अन्य गाँव/शहर लिखें...',
'गाँव/शहर चुनें'
)}

{renderSelectWithOther(
'एरिया / कॉलोनी',
formData.area,
areaIsOther,
allAreas,
(val) => setFormData({...formData, area: val}),
setAreaIsOther,
'अन्य एरिया लिखें...',
'एरिया/कॉलोनी चुनें'
)}

<div style={{ marginBottom: '16px' }}>
<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>पूरा पता</label>
<input type="text" placeholder="मकान नंबर, गली, मोहल्ला" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={inputStyle} />
</div>

{/* Single Mobile Number Field */}
<div style={{ marginBottom: '16px' }}>
<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
📱 मोबाइल नंबर
</label>
<input 
type="tel" 
placeholder="10 अंक" 
value={formData.mobile} 
onChange={(e) => setFormData({...formData, mobile: e.target.value})} 
style={inputStyle} 
maxLength={10}
/>
</div>

<div style={{ marginBottom: '16px' }}>
<label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>ब्लड ग्रुप (Blood Group)</label>
<select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} style={inputStyle}>
<option value="">ब्लड ग्रुप चुनें</option>
{BASE_OPTIONS.bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
</select>
</div>

<div style={{ marginBottom: '24px' }}>
<label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
<input type="checkbox" checked={formData.isStudent} onChange={(e) => setFormData({...formData, isStudent: e.target.checked})} style={{ width: '18px', height: '18px' }} />
<span style={{ fontWeight: 'bold', color: '#334155' }}>क्या छात्र हैं?</span>
</label>
</div>

<button
type="submit"
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
cursor: 'pointer'
}}
>
✅ सबमिट
</button>
</form>
</div>
);
}