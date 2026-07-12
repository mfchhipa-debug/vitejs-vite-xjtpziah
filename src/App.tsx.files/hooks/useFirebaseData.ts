// App.tsx.files/hooks/useFirebaseData.ts
import { db, storage } from '../../firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Member, Committee } from '../types';
import * as XLSX from 'xlsx';

export const fetchData = async (dispatch: any) => {
  try {
    const memberSnapshot = await getDocs(collection(db, 'members'));
    const members = memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const committeeSnapshot = await getDocs(collection(db, 'committee'));
    const committee = committeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    dispatch({ type: 'SET_MEMBERS', payload: members });
    dispatch({ type: 'SET_COMMITTEE', payload: committee });
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

export const handleDeleteMember = async (id: string, name: string, dispatch: any) => {
  if (window.confirm(`क्या आप सचमुच ${name} को सूची से हटाना चाहते हैं?`)) {
    await deleteDoc(doc(db, 'members', id));
    alert('सदस्य को हटा दिया गया है।');
    fetchData(dispatch);
  }
};

export const handleDeleteCommittee = async (id: string, name: string, dispatch: any) => {
  if (window.confirm(`क्या आप सचमुच पदाधिकारी ${name} को कमेटी से हटाना चाहते हैं?`)) {
    await deleteDoc(doc(db, 'committee', id));
    alert('पदाधिकारी को कमेटी से हटा दिया गया है।');
    fetchData(dispatch);
  }
};

export const updateCommittee = async (id: string, data: any, dispatch: any) => {
  try {
    await updateDoc(doc(db, 'committee', id), data);
    alert('✅ पदाधिकारी की जानकारी अपडेट कर दी गई है!');
    fetchData(dispatch);
  } catch (error) {
    console.error(error);
    alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
  }
};

export const updateMember = async (id: string, data: any, photoFile: File | null, photoPreview: string | null, dispatch: any) => {
  try {
    let photoURL = photoPreview;
    if (photoFile) {
      const storageRef = ref(storage, `member_photos/${data.familyID || id}_${Date.now()}`);
      await uploadBytes(storageRef, photoFile);
      photoURL = await getDownloadURL(storageRef);
    }
    await updateDoc(doc(db, 'members', id), { ...data, photoURL: photoURL || photoPreview });
    alert('✅ जानकारी अपडेट कर दी गई है!');
    fetchData(dispatch);
  } catch (error) {
    console.error(error);
    alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
  }
};

export const handleFamilyImport = async (e: React.ChangeEvent<HTMLInputElement>, dispatch: any) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    for (const row of json) {
      await addDoc(collection(db, 'members'), {
        name: row['Name'] || row['नाम'] || '',
        fatherName: row['Father Name'] || row['पिता का नाम'] || '',
        gotra: row['Gotra'] || row['गोत्र'] || '',
        villageCity: row['Village/City'] || row['गाँव/शहर'] || '',
        area: row['Area'] || row['एरिया'] || '',
        mobile1: row['Mobile 1'] || row['मोबाइल 1'] || '',
        mobile2: row['Mobile 2'] || row['मोबाइल 2'] || '',
        familyID: row['Family ID'] || '',
        isHead: row['Is Head'] === 'Yes' || false,
      });
    }
    alert('✅ डेटा इम्पोर्ट हो गया!');
    fetchData(dispatch);
  } catch (error) {
    console.error(error);
    alert('❌ इम्पोर्ट में गड़बड़ी!');
  }
  e.target.value = '';
};

export const handleMemberImport = async (e: React.ChangeEvent<HTMLInputElement>, dispatch: any) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    for (const row of json) {
      await addDoc(collection(db, 'members'), {
        name: row['Name'] || row['नाम'] || '',
        fatherName: row['Father Name'] || row['पिता का नाम'] || '',
        gotra: row['Gotra'] || row['गोत्र'] || '',
        relationToHead: row['Relation'] || row['संबंध'] || '',
        villageCity: row['Village/City'] || row['गाँव/शहर'] || '',
        area: row['Area'] || row['एरिया'] || '',
        mobile1: row['Mobile 1'] || row['मोबाइल 1'] || '',
        mobile2: row['Mobile 2'] || row['मोबाइल 2'] || '',
        familyID: row['Family ID'] || '',
        isHead: row['Is Head'] === 'Yes' || false,
      });
    }
    alert('✅ सदस्य इम्पोर्ट हो गए!');
    fetchData(dispatch);
  } catch (error) {
    console.error(error);
    alert('❌ इम्पोर्ट में गड़बड़ी!');
  }
  e.target.value = '';
};