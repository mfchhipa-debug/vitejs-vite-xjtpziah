// ============================================================
// SECTION 1: IMPORTS
// ============================================================
import { useState, useEffect } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AddFamilyHead from './AddFamilyHead';
import AddMemberToFamily from './AddMemberToFamily';
import AddCommitteeMember from './AddCommitteeMember';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ============================================================
// SECTION 2: APP COMPONENT & STATE DECLARATIONS
// ============================================================
export default function App() {
  const [members, setMembers] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedHead, setSelectedHead] = useState<any>(null);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  // Committee options dropdown states
  const [showCommitteeOptionsDropdown, setShowCommitteeOptionsDropdown] = useState(false);
  const [showCommitteeExportDropdown, setShowCommitteeExportDropdown] = useState(false);
  const [committeeViewMode, setCommitteeViewMode] = useState('list');
  const [isCommitteeFormOpen, setIsCommitteeFormOpen] = useState(false);
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<any>(null);
  const [isCommitteeEditModalOpen, setIsCommitteeEditModalOpen] = useState(false);
  const [committeeEditFormData, setCommitteeEditFormData] = useState<any>(null);

  // Existing states
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [familySearchTerm, setFamilySearchTerm] = useState('');
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [isFamilyFormOpen, setIsFamilyFormOpen] = useState(false);
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);

  const [showFamilyList, setShowFamilyList] = useState(false);
  const [showAllMembersList, setShowAllMembersList] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [showCommitteeList, setShowCommitteeList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [viewMode, setViewMode] = useState('card');
  const [listViewMode, setListViewMode] = useState('list');

  // Advanced Search States - Family
  const [showFamilySearchPopup, setShowFamilySearchPopup] = useState(false);
  const [familySearchSpecialText, setFamilySearchSpecialText] = useState('');
  const [familySearchVillage, setFamilySearchVillage] = useState('');
  const [familySearchArea, setFamilySearchArea] = useState('');
  const [familySearchGotra, setFamilySearchGotra] = useState('');
  const [familySearchGender, setFamilySearchGender] = useState('');
  const [familySearchMarital, setFamilySearchMarital] = useState('');
  const [familySearchOccupation, setFamilySearchOccupation] = useState('');
  const [familySearchEducation, setFamilySearchEducation] = useState('');
  const [familySearchAgeMin, setFamilySearchAgeMin] = useState('');
  const [familySearchAgeMax, setFamilySearchAgeMax] = useState('');
  const [familySearchResults, setFamilySearchResults] = useState<any[]>([]);
  const [familySearched, setFamilySearched] = useState(false);

  // Advanced Search States - Members
  const [showMemberSearchPopup, setShowMemberSearchPopup] = useState(false);
  const [memberSearchSpecialText, setMemberSearchSpecialText] = useState('');
  const [memberSearchVillage, setMemberSearchVillage] = useState('');
  const [memberSearchArea, setMemberSearchArea] = useState('');
  const [memberSearchGotra, setMemberSearchGotra] = useState('');
  const [memberSearchGender, setMemberSearchGender] = useState('');
  const [memberSearchMarital, setMemberSearchMarital] = useState('');
  const [memberSearchOccupation, setMemberSearchOccupation] = useState('');
  const [memberSearchEducation, setMemberSearchEducation] = useState('');
  const [memberSearchAgeMin, setMemberSearchAgeMin] = useState('');
  const [memberSearchAgeMax, setMemberSearchAgeMax] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [memberSearched, setMemberSearched] = useState(false);

  // Filter states for main search
  const [filterType, setFilterType] = useState('text');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGotra, setSearchGotra] = useState('');
  const [searchBlood, setSearchBlood] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  // ============================================================
  // SECTION 3: DATA FETCHING & CRUD OPERATIONS
  // ============================================================
  const fetchData = async () => {
    try {
      const memberSnapshot = await getDocs(collection(db, 'members'));
      setMembers(memberSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const committeeSnapshot = await getDocs(collection(db, 'committee'));
      setCommittee(committeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`क्या आप सचमुच ${name} को सूची से हटाना चाहते हैं?`)) {
      await deleteDoc(doc(db, 'members', id));
      alert('सदस्य को हटा दिया गया है।');
      fetchData();
      setSelectedMember(null);
      setSelectedHead(null);
    }
  };

  const handleDeleteCommittee = async (id: string, name: string) => {
    if (window.confirm(`क्या आप सचमुच पदाधिकारी ${name} को कमेटी से हटाना चाहते हैं?`)) {
      await deleteDoc(doc(db, 'committee', id));
      alert('पदाधिकारी को कमेटी से हटा दिया गया है।');
      fetchData();
    }
  };

  // ============================================================
  // SECTION 3.5: IMPORT FUNCTIONS
  // ============================================================
  const handleFamilyImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      fetchData();
    } catch (error) {
      console.error(error);
      alert('❌ इम्पोर्ट में गड़बड़ी!');
    }
    e.target.value = '';
  };

  const handleMemberImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      fetchData();
    } catch (error) {
      console.error(error);
      alert('❌ इम्पोर्ट में गड़बड़ी!');
    }
    e.target.value = '';
  };

  // Committee Edit Functions
  const openCommitteeEditModal = (member: any) => {
    setEditingCommitteeMember(member);
    setCommitteeEditFormData({
      designation: member.designation || '',
      name: member.name || '',
      gotra: member.gotra || '',
      mobile: member.mobile || '',
      tenure: member.tenure || '',
    });
    setIsCommitteeEditModalOpen(true);
  };

  const handleCommitteeEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitteeMember) return;

    try {
      await updateDoc(doc(db, 'committee', editingCommitteeMember.id), {
        ...committeeEditFormData,
      });
      alert('✅ पदाधिकारी की जानकारी अपडेट कर दी गई है!');
      fetchData();
      setIsCommitteeEditModalOpen(false);
      setEditingCommitteeMember(null);
    } catch (error) {
      console.error(error);
      alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
    }
  };

  // ============================================================
  // SECTION 4: EDIT MODALS - OPEN, PHOTO & SUBMIT
  // ============================================================
  const openHeadEditModal = (head: any) => {
    setEditingMember(head);
    setEditFormData({
      name: head.name || '',
      fatherName: head.fatherName || '',
      gotra: head.gotra || '',
      villageCity: head.villageCity || '',
      area: head.area || '',
      mobile1: head.mobile1 || '',
      mobile2: head.mobile2 || '',
      bloodGroup: head.bloodGroup || '',
    });
    setEditPhotoPreview(head.photoURL || null);
    setEditPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const openMemberEditModal = (member: any) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name || '',
      fatherName: member.fatherName || '',
      gotra: member.gotra || '',
      relationToHead: member.relationToHead || '',
      dob: member.dob || '',
      gender: member.gender || '',
      maritalStatus: member.maritalStatus || '',
      education: member.education || '',
      occupation: member.occupation || '',
      villageCity: member.villageCity || '',
      area: member.area || '',
      address: member.address || '',
      mobile1: member.mobile1 || '',
      mobile2: member.mobile2 || '',
      bloodGroup: member.bloodGroup || '',
      isStudent: member.isStudent || false,
      memberNo: member.memberNo || '',
    });
    setEditPhotoPreview(member.photoURL || null);
    setEditPhotoFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      let photoURL = editPhotoPreview;
      if (editPhotoFile) {
        const storageRef = ref(storage, `member_photos/${editFormData.familyID || editingMember.familyID}_${Date.now()}`);
        await uploadBytes(storageRef, editPhotoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'members', editingMember.id), {
        ...editFormData,
        photoURL: photoURL || editPhotoPreview,
      });
      alert('✅ जानकारी अपडेट कर दी गई है!');
      fetchData();
      setIsEditModalOpen(false);
      setEditingMember(null);
      setSelectedMember(null);
      setSelectedHead(null);
    } catch (error) {
      console.error(error);
      alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
    }
  };

  // ============================================================
  // SECTION 5: HELPER FUNCTIONS (Phone Dial, Format Display)
  // ============================================================
  const dialPhone = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const formatHeadDisplay = (head: any) => {
    let display = head.name;
    if (head.fatherName) {
      display = `${head.name} S/O ${head.fatherName}`;
    }
    if (head.gotra) {
      display += ` ${head.gotra}`;
    }
    return display;
  };

  const formatMemberDisplay = (member: any) => {
    if (member.isHead) {
      return formatHeadDisplay(member);
    }
    let display = member.name;
    if (member.relationToHead) {
      display = `${member.name} - ${member.relationToHead}`;
    }
    return display;
  };

  // ============================================================
  // SECTION 6: DATA CALCULATIONS, FILTERS & GROUPING
  // ============================================================
  const todayStr = new Date().toISOString().substring(5, 10);
  const birthdayFolks = members.filter(m => {
    if (!m.dob) return false;
    return m.dob.substring(5, 10) === todayStr;
  });

  const heads = members.filter(m => m.isHead === true);
  const nonHeads = members.filter(m => !m.isHead);
  const totalFamilies = heads.length;
  const totalMembers = nonHeads.length;
  const totalKids = nonHeads.filter(m => parseInt(m.age_years || '0') < 10).length;
  const totalAdults = nonHeads.filter(m => parseInt(m.age_years || '0') >= 10).length;
  const totalStudents = nonHeads.filter(m => m.occupation === 'छात्र' || m.occupation_isStudent === true).length;

  const filteredMembers = members.filter((m) => {
    const matchesText = !searchTerm ||
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.villageCity && m.villageCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.area && m.area.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGotra = !searchGotra || (m.gotra === searchGotra);
    const matchesBlood = !searchBlood || (m.bloodGroup === searchBlood);
    const age = parseInt(m.age_years || '0');
    const min = minAge ? parseInt(minAge) : 0;
    const max = maxAge ? parseInt(maxAge) : 999;
    const matchesAge = age >= min && age <= max;

    return matchesText && matchesGotra && matchesAge && matchesBlood;
  });

  const filteredHeads = filteredMembers.filter(m => m.isHead === true);
  const filteredNonHeads = filteredMembers.filter(m => !m.isHead);

  const nonHeadGrouped = filteredNonHeads.reduce((acc: any, m: any) => {
    const fid = m.familyID ? m.familyID.toString().trim() : '';
    if (fid) {
      if (!acc[fid]) acc[fid] = [];
      acc[fid].push(m);
    }
    return acc;
  }, {});

  const allGrouped = filteredMembers.reduce((acc: any, m: any) => {
    const fid = m.familyID ? m.familyID.toString().trim() : '';
    if (fid) {
      if (!acc[fid]) acc[fid] = [];
      acc[fid].push(m);
    }
    return acc;
  }, {});

  // Get unique values for filters
  const getUniqueValues = (key: string) => {
    return [...new Set(members.map(m => m[key]).filter(Boolean))];
  };

  // ============================================================
  // FAMILY SEARCH FUNCTION
  // ============================================================
  const performFamilySearch = () => {
    const results = members.filter((m) => {
      let matches = true;

      if (familySearchSpecialText) {
        const text = familySearchSpecialText.toLowerCase();
        matches = matches && (
          (m.name && m.name.toLowerCase().includes(text)) ||
          (m.fatherName && m.fatherName.toLowerCase().includes(text)) ||
          (m.gotra && m.gotra.toLowerCase().includes(text)) ||
          (m.villageCity && m.villageCity.toLowerCase().includes(text)) ||
          (m.area && m.area.toLowerCase().includes(text)) ||
          (m.occupation && m.occupation.toLowerCase().includes(text)) ||
          (m.education && m.education.toLowerCase().includes(text)) ||
          (m.mobile1 && m.mobile1.includes(text)) ||
          (m.mobile2 && m.mobile2.includes(text))
        );
      }

      if (familySearchVillage) {
        matches = matches && m.villageCity === familySearchVillage;
      }
      if (familySearchArea) {
        matches = matches && m.area === familySearchArea;
      }
      if (familySearchGotra) {
        matches = matches && m.gotra === familySearchGotra;
      }
      if (familySearchGender) {
        matches = matches && m.gender === familySearchGender;
      }
      if (familySearchMarital) {
        matches = matches && m.maritalStatus === familySearchMarital;
      }
      if (familySearchOccupation) {
        matches = matches && m.occupation === familySearchOccupation;
      }
      if (familySearchEducation) {
        matches = matches && m.education === familySearchEducation;
      }
      if (familySearchAgeMin || familySearchAgeMax) {
        const age = parseInt(m.age_years || '0');
        const min = familySearchAgeMin ? parseInt(familySearchAgeMin) : 0;
        const max = familySearchAgeMax ? parseInt(familySearchAgeMax) : 999;
        matches = matches && age >= min && age <= max;
      }

      return matches;
    });

    setFamilySearchResults(results);
    setFamilySearched(true);
    setShowFamilySearchPopup(false);
  };

  const resetFamilySearch = () => {
    setFamilySearchSpecialText('');
    setFamilySearchVillage('');
    setFamilySearchArea('');
    setFamilySearchGotra('');
    setFamilySearchGender('');
    setFamilySearchMarital('');
    setFamilySearchOccupation('');
    setFamilySearchEducation('');
    setFamilySearchAgeMin('');
    setFamilySearchAgeMax('');
    setFamilySearchResults([]);
    setFamilySearched(false);
  };

  // ============================================================
  // MEMBER SEARCH FUNCTION
  // ============================================================
  const performMemberSearch = () => {
    const results = members.filter((m) => {
      let matches = true;

      if (memberSearchSpecialText) {
        const text = memberSearchSpecialText.toLowerCase();
        matches = matches && (
          (m.name && m.name.toLowerCase().includes(text)) ||
          (m.fatherName && m.fatherName.toLowerCase().includes(text)) ||
          (m.gotra && m.gotra.toLowerCase().includes(text)) ||
          (m.villageCity && m.villageCity.toLowerCase().includes(text)) ||
          (m.area && m.area.toLowerCase().includes(text)) ||
          (m.occupation && m.occupation.toLowerCase().includes(text)) ||
          (m.education && m.education.toLowerCase().includes(text)) ||
          (m.mobile1 && m.mobile1.includes(text)) ||
          (m.mobile2 && m.mobile2.includes(text))
        );
      }

      if (memberSearchVillage) {
        matches = matches && m.villageCity === memberSearchVillage;
      }
      if (memberSearchArea) {
        matches = matches && m.area === memberSearchArea;
      }
      if (memberSearchGotra) {
        matches = matches && m.gotra === memberSearchGotra;
      }
      if (memberSearchGender) {
        matches = matches && m.gender === memberSearchGender;
      }
      if (memberSearchMarital) {
        matches = matches && m.maritalStatus === memberSearchMarital;
      }
      if (memberSearchOccupation) {
        matches = matches && m.occupation === memberSearchOccupation;
      }
      if (memberSearchEducation) {
        matches = matches && m.education === memberSearchEducation;
      }
      if (memberSearchAgeMin || memberSearchAgeMax) {
        const age = parseInt(m.age_years || '0');
        const min = memberSearchAgeMin ? parseInt(memberSearchAgeMin) : 0;
        const max = memberSearchAgeMax ? parseInt(memberSearchAgeMax) : 999;
        matches = matches && age >= min && age <= max;
      }

      return matches;
    });

    setMemberSearchResults(results);
    setMemberSearched(true);
    setShowMemberSearchPopup(false);
  };

  const resetMemberSearch = () => {
    setMemberSearchSpecialText('');
    setMemberSearchVillage('');
    setMemberSearchArea('');
    setMemberSearchGotra('');
    setMemberSearchGender('');
    setMemberSearchMarital('');
    setMemberSearchOccupation('');
    setMemberSearchEducation('');
    setMemberSearchAgeMin('');
    setMemberSearchAgeMax('');
    setMemberSearchResults([]);
    setMemberSearched(false);
  };

  // ============================================================
  // SECTION 7: PDF GENERATION & EXPORT FUNCTIONS
  // ============================================================
  const generatePDF = (reportType: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let reportTitle = '';
    let tableHeaders = '';
    let tableRows = '';

    if (reportType === 'all_members') {
      reportTitle = '📋 सभी सदस्य (Family ID व ग्रुप के साथ)';
      tableHeaders = `<tr><th>Family ID</th><th>सदस्य का नाम</th><th>संबंध</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल 1</th><th>मोबाइल 2</th><th>शहर/गाँव</th></tr>`;
      Object.keys(allGrouped).forEach(fid => {
        allGrouped[fid].forEach((m: any) => {
          const displayName = m.isHead ? m.name : (m.fatherName ? `${m.name} S/O ${m.fatherName}` : m.name);
          tableRows += `
            <tr>
              <td><strong>${fid}</strong></td>
              <td>${displayName} ${m.isHead ? '<span style="color:#2ecc71;font-weight:bold;">(मुखिया)</span>' : ''}</td>
              <td>${m.isHead ? 'स्वयं मुखिया' : (m.relationToHead || 'सदस्य')}</td>
              <td>${m.gotra || '-'}</td>
              <td>${m.age_years || '-'} वर्ष</td>
              <td>${m.mobile1 || '-'}</td>
              <td>${m.mobile2 || '-'}</td>
              <td>${m.villageCity || '-'}</td>
            </tr>
          `;
        });
      });
    } else if (reportType === 'students') {
      reportTitle = '🎓 छात्र / छात्राएं सूची';
      tableHeaders = `<tr><th>Family ID</th><th>नाम</th><th>गोत्र</th><th>उम्र</th><th>शहर/गाँव</th><th>मोबाइल 1</th><th>मोबाइल 2</th></tr>`;
      const students = nonHeads.filter((m: any) => m.occupation === 'छात्र' || m.occupation_isStudent === true);
      students.forEach((m: any) => {
        const displayName = m.fatherName ? `${m.name} S/O ${m.fatherName}` : m.name;
        tableRows += `
          <tr>
            <td>${m.familyID || '-'}</td>
            <td><strong>${displayName}</strong></td>
            <td>${m.gotra || '-'}</td>
            <td>${m.age_years || '-'} वर्ष</td>
            <td>${m.villageCity || '-'}</td>
            <td>${m.mobile1 || '-'}</td>
            <td>${m.mobile2 || '-'}</td>
          </tr>
        `;
      });
    } else if (reportType === 'families') {
      reportTitle = '🏠 परिवार मुखिया सूची';
      tableHeaders = `<tr><th>Family ID</th><th>मुखिया का नाम</th><th>गोत्र</th><th>उम्र</th><th>मोबाइल 1</th><th>मोबाइल 2</th><th>शहर/गाँव</th></tr>`;
      const headsList = filteredMembers.filter((m: any) => m.isHead === true);
      headsList.forEach((m: any) => {
        tableRows += `
          <tr>
            <td><strong>${m.familyID || '-'}</strong></td>
            <td><strong>${m.name}</strong></td>
            <td>${m.gotra || '-'}</td>
            <td>${m.age_years || '-'} वर्ष</td>
            <td>${m.mobile1 || '-'}</td>
            <td>${m.mobile2 || '-'}</td>
            <td>${m.villageCity || '-'}</td>
          </tr>
        `;
      });
    } else if (reportType === 'committee') {
      reportTitle = '🏢 समाज कमेटी पदाधिकारी सूची';
      tableHeaders = `<tr><th>पद</th><th>नाम</th><th>गोत्र</th><th>मोबाइल</th><th>कार्यकाल</th></tr>`;
      committee.forEach((c: any) => {
        tableRows += `
          <tr>
            <td style="color:#e65100; font-weight:bold;">⭐ ${c.designation}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.gotra || '-'}</td>
            <td>${c.mobile || '-'}</td>
            <td>${c.tenure || '-'}</td>
          </tr>
        `;
      });
    }

    printWindow.document.write(`
      <html>
      <head><title>${reportTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #333; }
        .header-box { text-align: center; border-bottom: 3px double #2c3e50; padding-bottom: 12px; margin-bottom: 20px; }
        h2 { margin: 0; color: #2c3e50; font-size: 22px; }
        .meta-info { display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-top: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
        th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8fafc; }
        @media print { body { padding: 0; } }
      </style>
      </head>
      <body>
        <div class="header-box">
          <h2>${reportTitle}</h2>
          <div class="meta-info">
            <span>कुल रिकॉर्ड: ${tableRows.split('<tr>').length - 1}</span>
            <span>तिथि: ${new Date().toLocaleDateString('hi-IN')}</span>
          </div>
        </div>
        <table>
          <thead>${tableHeaders}</thead>
          <tbody>${tableRows || '<tr><td colspan="10" style="text-align:center; color:#888;">कोई डेटा नहीं</td></tr>'}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ============================================================
  // EXPORT FUNCTION FOR MEMBERS DATA
  // ============================================================
  const exportData = (format: string) => {
    const data = members.map(m => ({
      'Family ID': m.familyID || '',
      'Member No': m.memberNo || '',
      'Name': m.name || '',
      'Father Name': m.fatherName || '',
      'Gotra': m.gotra || '',
      'Relation': m.relationToHead || '',
      'DOB': m.dob || '',
      'Age Years': m.age_years || '',
      'Age Months': m.age_months || '',
      'Gender': m.gender || '',
      'Marital Status': m.maritalStatus || '',
      'Education': m.education || '',
      'Occupation': m.occupation || '',
      'Village/City': m.villageCity || '',
      'Area': m.area || '',
      'Address': m.address || '',
      'Mobile 1': m.mobile1 || '',
      'Mobile 2': m.mobile2 || '',
      'Blood Group': m.bloodGroup || '',
      'Is Student': m.isStudent ? 'Yes' : 'No',
      'Is Head': m.isHead ? 'Yes' : 'No'
    }));

    const headers = Object.keys(data[0] || {});
    const rows = data.map(obj => headers.map(key => obj[key as keyof typeof obj]));

    if (format === 'xlsx') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members');
      XLSX.writeFile(wb, `members_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (format === 'csv') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else if (format === 'xml') {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<members>\n';
      data.forEach(m => {
        xml += '  <member>\n';
        Object.entries(m).forEach(([key, value]) => {
          xml += `    <${key}>${value}</${key}>\n`;
        });
        xml += '  </member>\n';
      });
      xml += '</members>';
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_export_${new Date().toISOString().split('T')[0]}.xml`;
      a.click();
    } else if (format === 'html') {
      let html = '<!DOCTYPE html><html><head><title>Members Export</title></head><body><table border="1">\n';
      html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>\n';
      rows.forEach(row => {
        html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>\n';
      });
      html += '</table></body></html>';
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_export_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
    } else if (format === 'tsv') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const tsv = XLSX.utils.sheet_to_csv(ws, { FS: '\t' });
      const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `members_export_${new Date().toISOString().split('T')[0]}.tsv`;
      a.click();
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('CSJ Report - Members List', 14, 20);
      const tableData = rows.map(row => row.map(cell => String(cell || '')));
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [102, 126, 234] }
      });
      doc.save(`members_export_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  // ============================================================
  // EXPORT FUNCTION FOR COMMITTEE DATA
  // ============================================================
  const exportCommitteeData = (format: string) => {
    const data = committee.map(c => ({
      'पद': c.designation || '',
      'नाम': c.name || '',
      'गोत्र': c.gotra || '',
      'मोबाइल': c.mobile || '',
      'कार्यकाल': c.tenure || '',
    }));

    const headers = Object.keys(data[0] || {});
    const rows = data.map(obj => headers.map(key => obj[key as keyof typeof obj]));

    if (format === 'xlsx') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Committee');
      XLSX.writeFile(wb, `committee_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else if (format === 'csv') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `committee_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `committee_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else if (format === 'xml') {
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<committee>\n';
      data.forEach(c => {
        xml += '  <member>\n';
        Object.entries(c).forEach(([key, value]) => {
          xml += `    <${key}>${value}</${key}>\n`;
        });
        xml += '  </member>\n';
      });
      xml += '</committee>';
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `committee_export_${new Date().toISOString().split('T')[0]}.xml`;
      a.click();
    } else if (format === 'html') {
      let html = '<!DOCTYPE html><html><head><title>Committee Export</title></head><body><table border="1">\n';
      html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>\n';
      rows.forEach(row => {
        html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>\n';
      });
      html += '</table></body></html>';
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `committee_export_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
    } else if (format === 'tsv') {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const tsv = XLSX.utils.sheet_to_csv(ws, { FS: '\t' });
      const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `committee_export_${new Date().toISOString().split('T')[0]}.tsv`;
      a.click();
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('CSJ Report - Committee Members', 14, 20);
      const tableData = rows.map(row => row.map(cell => String(cell || '')));
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] }
      });
      doc.save(`committee_export_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  // ============================================================
  // SECTION 8: ADMIN FUNCTIONS
  // ============================================================
  const handleAdminLogin = () => {
    const pwd = prompt('Admin पासवर्ड दर्ज करें:');
    if (pwd === 'admin123') {
      setIsAdmin(true);
      alert('✅ Admin मोड सक्रिय!');
    } else if (pwd !== null) {
      alert('❌ गलत पासवर्ड!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    alert('🔒 Admin मोड बंद कर दिया गया।');
  };

  // ============================================================
  // SECTION 9: STYLES & UI HELPERS
  // ============================================================
  const toggleButtonStyle = (isOpen: boolean, openColor: string, closedColor: string) => ({
    width: '100%',
    padding: '14px 18px',
    background: isOpen ? openColor : closedColor,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: "'Poppins', 'Noto Sans', sans-serif",
    transition: 'all 0.3s ease'
  });

  const cardWrapperStyle = {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    boxSizing: 'border-box' as const
  };

  // ============================================================
  // SECTION 10: EDIT MODALS (HEAD & MEMBER)
  // ============================================================
  const HeadEditModal = () => {
    if (!isEditModalOpen || !editFormData || !editingMember?.isHead) return null;

    const inputStyle = {
      width: '100%',
      padding: '8px 10px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      boxSizing: 'border-box' as const,
      fontSize: '13px'
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }} onClick={() => setIsEditModalOpen(false)}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsEditModalOpen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ✕
          </button>

          <h2 style={{ margin: '0 0 20px 0', color: '#7c3aed', borderBottom: '2px solid #ede9fe', paddingBottom: '10px' }}>
            👑 परिवार मुखिया एडिट करें
          </h2>

          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>📸 फोटो</label>
              <input type="file" accept="image/*" onChange={handleEditPhotoChange} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }} />
              {editPhotoPreview && <img src={editPhotoPreview} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '2px solid #8b5cf6' }} />}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>नाम <span style={{ color: 'red' }}>*</span></label>
              <input type="text" placeholder="पूरा नाम" value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>पिता का नाम</label>
              <input type="text" placeholder="पिता का नाम" value={editFormData.fatherName || ''} onChange={(e) => setEditFormData({...editFormData, fatherName: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>गोत्र</label>
              <input type="text" placeholder="गोत्र" value={editFormData.gotra || ''} onChange={(e) => setEditFormData({...editFormData, gotra: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>गाँव/शहर</label>
              <input type="text" placeholder="गाँव/शहर" value={editFormData.villageCity || ''} onChange={(e) => setEditFormData({...editFormData, villageCity: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>एरिया / कॉलोनी</label>
              <input type="text" placeholder="एरिया/कॉलोनी" value={editFormData.area || ''} onChange={(e) => setEditFormData({...editFormData, area: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>📱 मोबाइल 1</label>
                <input type="tel" placeholder="10 अंक" value={editFormData.mobile1 || ''} onChange={(e) => setEditFormData({...editFormData, mobile1: e.target.value})} style={inputStyle} maxLength={10} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>📱 मोबाइल 2</label>
                <input type="tel" placeholder="10 अंक" value={editFormData.mobile2 || ''} onChange={(e) => setEditFormData({...editFormData, mobile2: e.target.value})} style={inputStyle} maxLength={10} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>ब्लड ग्रुप</label>
              <select value={editFormData.bloodGroup || ''} onChange={(e) => setEditFormData({...editFormData, bloodGroup: e.target.value})} style={inputStyle}>
                <option value="">ब्लड ग्रुप चुनें</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="पता नहीं">पता नहीं</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <button
                type="submit"
                style={{ 
                  padding: '6px 20px', 
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                ✅ सबमिट
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const MemberEditModal = () => {
    if (!isEditModalOpen || !editFormData || editingMember?.isHead) return null;

    const inputStyle = {
      width: '100%',
      padding: '8px 10px',
      borderRadius: '6px',
      border: '1px solid #cbd5e1',
      boxSizing: 'border-box' as const,
      fontSize: '13px'
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }} onClick={() => setIsEditModalOpen(false)}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setIsEditModalOpen(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ✕
          </button>

          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            ✏️ सदस्य एडिट करें
          </h2>

          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>📸 फोटो</label>
              <input type="file" accept="image/*" onChange={handleEditPhotoChange} style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }} />
              {editPhotoPreview && <img src={editPhotoPreview} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '2px solid #3b82f6' }} />}
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>सदस्य क्रमांक</label>
              <input type="text" placeholder="जैसे: 01, 02, 03..." value={editFormData.memberNo || ''} onChange={(e) => setEditFormData({...editFormData, memberNo: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>नाम <span style={{ color: 'red' }}>*</span></label>
                <input type="text" placeholder="पूरा नाम" value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>पिता/पति का नाम</label>
                <input type="text" placeholder="पिता या पति का नाम" value={editFormData.fatherName || ''} onChange={(e) => setEditFormData({...editFormData, fatherName: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>गोत्र</label>
                <input type="text" placeholder="गोत्र" value={editFormData.gotra || ''} onChange={(e) => setEditFormData({...editFormData, gotra: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>संबंध (मुखिया से)</label>
                <input type="text" placeholder="खुद, बेटा, बीवी..." value={editFormData.relationToHead || ''} onChange={(e) => setEditFormData({...editFormData, relationToHead: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>जन्म तिथि (DOB)</label>
                <input type="date" value={editFormData.dob || ''} onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>लिंग</label>
                <select value={editFormData.gender || ''} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} style={inputStyle}>
                  <option value="">-- चुने --</option>
                  <option value="पुरुष">पुरुष</option>
                  <option value="स्त्री">स्त्री</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>वैवाहिक स्थिति</label>
                <select value={editFormData.maritalStatus || ''} onChange={(e) => setEditFormData({...editFormData, maritalStatus: e.target.value})} style={inputStyle}>
                  <option value="">-- चुने --</option>
                  <option value="शादीशुदा">शादीशुदा</option>
                  <option value="कुंवारा">कुंवारा</option>
                  <option value="सगाई">सगाई</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>शिक्षा</label>
                <input type="text" placeholder="जैसे: B.A., M.Sc., 12वीं" value={editFormData.education || ''} onChange={(e) => setEditFormData({...editFormData, education: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>व्यवसाय</label>
                <input type="text" placeholder="व्यवसाय" value={editFormData.occupation || ''} onChange={(e) => setEditFormData({...editFormData, occupation: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>गाँव/शहर</label>
                <input type="text" placeholder="गाँव/शहर" value={editFormData.villageCity || ''} onChange={(e) => setEditFormData({...editFormData, villageCity: e.target.value})} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>एरिया / कॉलोनी</label>
                <input type="text" placeholder="एरिया/कॉलोनी" value={editFormData.area || ''} onChange={(e) => setEditFormData({...editFormData, area: e.target.value})} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>पूरा पता</label>
              <input type="text" placeholder="मकान नंबर, गली, मोहल्ला" value={editFormData.address || ''} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>📱 मोबाइल 1</label>
                <input type="tel" placeholder="10 अंक" value={editFormData.mobile1 || ''} onChange={(e) => setEditFormData({...editFormData, mobile1: e.target.value})} style={inputStyle} maxLength={10} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>📱 मोबाइल 2</label>
                <input type="tel" placeholder="10 अंक" value={editFormData.mobile2 || ''} onChange={(e) => setEditFormData({...editFormData, mobile2: e.target.value})} style={inputStyle} maxLength={10} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>ब्लड ग्रुप</label>
              <select value={editFormData.bloodGroup || ''} onChange={(e) => setEditFormData({...editFormData, bloodGroup: e.target.value})} style={inputStyle}>
                <option value="">ब्लड ग्रुप चुनें</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="पता नहीं">पता नहीं</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={editFormData.isStudent || false} onChange={(e) => setEditFormData({...editFormData, isStudent: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontWeight: 'bold', color: '#334155' }}>क्या छात्र हैं?</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <button
                type="submit"
                style={{ 
                  padding: '6px 20px', 
                  background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                ✅ सबमिट
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION 11: MEMBER DETAIL CARD (POPUP)
  // ============================================================
  const MemberDetailCard = ({ member, onClose }: { member: any, onClose: () => void }) => {
    if (!member) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }} onClick={onClose}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              zIndex: 1
            }}
          >
            ✕
          </button>
          
          <span
            onClick={() => { onClose(); setTimeout(() => openMemberEditModal(member), 100); }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '50px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#4a4a4a',
              zIndex: 1,
              fontWeight: 'bold',
              letterSpacing: '2px',
              padding: '2px 4px',
              userSelect: 'none'
            }}
            title="एडिट करें"
          >
            ⋯
          </span>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {member.photoURL ? (
              <img src={member.photoURL} alt="Photo" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #3b82f6' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', background: '#e2e8f0', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#94a3b8', border: '4px solid #3b82f6' }}>
                👤
              </div>
            )}
          </div>
          
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '22px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
            {member.isHead ? '👑 ' : ''}{member.name}
            {member.memberNo && <span style={{ fontSize: '14px', color: '#64748b', display: 'block' }}>क्रमांक: {member.memberNo}</span>}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: '14px' }}>
            {member.fatherName && (
              <>
                <div style={{ color: '#64748b' }}>पिता/पति</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.fatherName}</div>
              </>
            )}
            {member.gotra && (
              <>
                <div style={{ color: '#64748b' }}>गोत्र</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.gotra}</div>
              </>
            )}
            {member.relationToHead && !member.isHead && (
              <>
                <div style={{ color: '#64748b' }}>रिश्ता</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.relationToHead}</div>
              </>
            )}
            {member.villageCity && (
              <>
                <div style={{ color: '#64748b' }}>गाँव/शहर</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.villageCity}</div>
              </>
            )}
            {member.dob && (
              <>
                <div style={{ color: '#64748b' }}>जन्म तारीख</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.dob}</div>
              </>
            )}
            {member.age_years && (
              <>
                <div style={{ color: '#64748b' }}>उम्र (साल)</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.age_years}</div>
              </>
            )}
            {member.age_months && (
              <>
                <div style={{ color: '#64748b' }}>उम्र (महीने)</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.age_months}</div>
              </>
            )}
            {member.gender && (
              <>
                <div style={{ color: '#64748b' }}>M/F</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.gender}</div>
              </>
            )}
            {member.maritalStatus && (
              <>
                <div style={{ color: '#64748b' }}>शादी</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.maritalStatus}</div>
              </>
            )}
            {member.education && (
              <>
                <div style={{ color: '#64748b' }}>शिक्षा</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.education}</div>
              </>
            )}
            {member.occupation && (
              <>
                <div style={{ color: '#64748b' }}>काम</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.occupation}</div>
              </>
            )}
            {member.area && (
              <>
                <div style={{ color: '#64748b' }}>एरिया</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.area}</div>
              </>
            )}
            {(member.mobile1 || member.mobile2) && (
              <>
                <div style={{ color: '#64748b' }}>मोबाइल</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>
                  {member.mobile1 && (
                    <div 
                      style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => dialPhone(member.mobile1)}
                    >
                      📞 {member.mobile1}
                    </div>
                  )}
                  {member.mobile2 && (
                    <div 
                      style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => dialPhone(member.mobile2)}
                    >
                      📞 {member.mobile2}
                    </div>
                  )}
                </div>
              </>
            )}
            {member.bloodGroup && (
              <>
                <div style={{ color: '#64748b' }}>Blood Group</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{member.bloodGroup}</div>
              </>
            )}
            {member.isStudent && (
              <>
                <div style={{ color: '#64748b' }}>छात्र</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>हाँ</div>
              </>
            )}
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button
              onClick={() => { onClose(); setTimeout(() => openMemberEditModal(member), 100); }}
              style={{ padding: '8px 24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', color: '#16a34a', fontWeight: 'bold' }}
            >
              ✏️ एडिट
            </button>
            <button
              onClick={() => { handleDeleteMember(member.id, member.name); onClose(); }}
              style={{ padding: '8px 24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}
            >
              🗑️ हटाएं
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION 12: HEAD DETAIL CARD (POPUP)
  // ============================================================
  const HeadDetailCard = ({ head, onClose }: { head: any, onClose: () => void }) => {
    if (!head) return null;
    
    const familyMembers = members.filter(m => m.familyID === head.familyID);
    const nonHeadMembers = familyMembers.filter(m => !m.isHead);
    const headKids = nonHeadMembers.filter(m => parseInt(m.age_years || '0') < 10).length;
    const headAdults = nonHeadMembers.filter(m => parseInt(m.age_years || '0') >= 10).length;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }} onClick={onClose}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative'
        }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              zIndex: 1
            }}
          >
            ✕
          </button>
          
          <span
            onClick={() => { onClose(); setTimeout(() => openHeadEditModal(head), 100); }}
            style={{
              position: 'absolute',
              top: '4px',
              right: '50px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#4a4a4a',
              zIndex: 1,
              fontWeight: 'bold',
              letterSpacing: '2px',
              padding: '2px 4px',
              userSelect: 'none'
            }}
            title="एडिट करें"
          >
            ⋯
          </span>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {head.photoURL ? (
              <img src={head.photoURL} alt="Photo" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #8b5cf6' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', background: '#ede9fe', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#8b5cf6', border: '4px solid #8b5cf6' }}>
                👑
              </div>
            )}
          </div>
          
          <h2 style={{ margin: '0 0 20px 0', color: '#7c3aed', fontSize: '22px', textAlign: 'center', borderBottom: '2px solid #ede9fe', paddingBottom: '10px' }}>
            👑 {head.name}
            {head.memberNo && <span style={{ fontSize: '14px', color: '#64748b', display: 'block' }}>क्रमांक: {head.memberNo}</span>}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', fontSize: '14px' }}>
            {head.fatherName && (
              <>
                <div style={{ color: '#64748b' }}>पिता का नाम</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{head.fatherName}</div>
              </>
            )}
            {head.gotra && (
              <>
                <div style={{ color: '#64748b' }}>गोत्र</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{head.gotra}</div>
              </>
            )}
            {head.villageCity && (
              <>
                <div style={{ color: '#64748b' }}>गाँव/शहर</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{head.villageCity}</div>
              </>
            )}
            {head.area && (
              <>
                <div style={{ color: '#64748b' }}>पता</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{head.area}</div>
              </>
            )}
            {(head.mobile1 || head.mobile2) && (
              <>
                <div style={{ color: '#64748b' }}>मोबाइल</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>
                  {head.mobile1 && (
                    <div 
                      style={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => dialPhone(head.mobile1)}
                    >
                      📞 {head.mobile1}
                    </div>
                  )}
                  {head.mobile2 && (
                    <div 
                      style={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => dialPhone(head.mobile2)}
                    >
                      📞 {head.mobile2}
                    </div>
                  )}
                </div>
              </>
            )}
            {head.bloodGroup && (
              <>
                <div style={{ color: '#64748b' }}>Blood Group</div>
                <div style={{ fontWeight: '500', color: '#1e293b' }}>{head.bloodGroup}</div>
              </>
            )}
          </div>
          
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 'bold', color: '#475569', marginBottom: '8px', textAlign: 'center' }}>🏠 परिवार सारांश</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
              <div><strong>कुल सदस्य:</strong> {nonHeadMembers.length}</div>
              <div><strong>बच्चे:</strong> {headKids}</div>
              <div><strong>बड़े:</strong> {headAdults}</div>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button
              onClick={() => { onClose(); setTimeout(() => openHeadEditModal(head), 100); }}
              style={{ padding: '8px 24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', color: '#16a34a', fontWeight: 'bold' }}
            >
              ✏️ एडिट
            </button>
            <button
              onClick={() => { handleDeleteMember(head.id, head.name); onClose(); }}
              style={{ padding: '8px 24px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}
            >
              🗑️ हटाएं
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION 13: SEARCH POPUP COMPONENT (Family)
  // ============================================================
  const FamilySearchPopup = () => {
    if (!showFamilySearchPopup) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        padding: '20px',
      }} onClick={() => setShowFamilySearchPopup(false)}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowFamilySearchPopup(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            ✕
          </button>

          <h3 style={{ marginTop: 0, color: '#7c3aed', borderBottom: '2px solid #ede9fe', paddingBottom: '10px' }}>
            🔍 परिवार खोजें
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>विशेष सर्च</label>
              <input
                type="text"
                placeholder="कुछ भी लिखें..."
                value={familySearchSpecialText}
                onChange={(e) => setFamilySearchSpecialText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>गाँव/शहर</label>
              <select
                value={familySearchVillage}
                onChange={(e) => setFamilySearchVillage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('villageCity').map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>एरिया/कॉलोनी</label>
              <select
                value={familySearchArea}
                onChange={(e) => setFamilySearchArea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('area').map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>गोत्र</label>
              <select
                value={familySearchGotra}
                onChange={(e) => setFamilySearchGotra(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('gotra').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>लिंग</label>
              <select
                value={familySearchGender}
                onChange={(e) => setFamilySearchGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('gender').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>वैवाहिक स्थिति</label>
              <select
                value={familySearchMarital}
                onChange={(e) => setFamilySearchMarital(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('maritalStatus').map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>काम/व्यवसाय</label>
              <select
                value={familySearchOccupation}
                onChange={(e) => setFamilySearchOccupation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('occupation').map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>शिक्षा</label>
              <select
                value={familySearchEducation}
                onChange={(e) => setFamilySearchEducation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('education').map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>उम्र (बीच में)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="न्यूनतम"
                  value={familySearchAgeMin}
                  onChange={(e) => setFamilySearchAgeMin(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="number"
                  placeholder="अधिकतम"
                  value={familySearchAgeMax}
                  onChange={(e) => setFamilySearchAgeMax(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button
              onClick={resetFamilySearch}
              style={{
                padding: '8px 24px',
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              रिसेट
            </button>
            <button
              onClick={performFamilySearch}
              style={{
                padding: '8px 24px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              सबमिट
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION 14: SEARCH POPUP COMPONENT (Members)
  // ============================================================
  const MemberSearchPopup = () => {
    if (!showMemberSearchPopup) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        padding: '20px',
      }} onClick={() => setShowMemberSearchPopup(false)}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '25px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMemberSearchPopup(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            ✕
          </button>

          <h3 style={{ marginTop: 0, color: '#0891b2', borderBottom: '2px solid #cffafe', paddingBottom: '10px' }}>
            🔍 सदस्य खोजें
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>विशेष सर्च</label>
              <input
                type="text"
                placeholder="कुछ भी लिखें..."
                value={memberSearchSpecialText}
                onChange={(e) => setMemberSearchSpecialText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>गाँव/शहर</label>
              <select
                value={memberSearchVillage}
                onChange={(e) => setMemberSearchVillage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('villageCity').map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>एरिया/कॉलोनी</label>
              <select
                value={memberSearchArea}
                onChange={(e) => setMemberSearchArea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('area').map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>गोत्र</label>
              <select
                value={memberSearchGotra}
                onChange={(e) => setMemberSearchGotra(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('gotra').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>लिंग</label>
              <select
                value={memberSearchGender}
                onChange={(e) => setMemberSearchGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('gender').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>वैवाहिक स्थिति</label>
              <select
                value={memberSearchMarital}
                onChange={(e) => setMemberSearchMarital(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('maritalStatus').map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>काम/व्यवसाय</label>
              <select
                value={memberSearchOccupation}
                onChange={(e) => setMemberSearchOccupation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('occupation').map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>शिक्षा</label>
              <select
                value={memberSearchEducation}
                onChange={(e) => setMemberSearchEducation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">सभी</option>
                {getUniqueValues('education').map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>उम्र (बीच में)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="न्यूनतम"
                  value={memberSearchAgeMin}
                  onChange={(e) => setMemberSearchAgeMin(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="number"
                  placeholder="अधिकतम"
                  value={memberSearchAgeMax}
                  onChange={(e) => setMemberSearchAgeMax(e.target.value)}
                  style={{
                    width: '50%',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <button
              onClick={resetMemberSearch}
              style={{
                padding: '8px 24px',
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              रिसेट
            </button>
            <button
              onClick={performMemberSearch}
              style={{
                padding: '8px 24px',
                background: '#0891b2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              सबमिट
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // SECTION 15: MAIN RETURN
  // ============================================================
  return (
    <>
      <div
        style={{
          padding: '20px',
          fontFamily: "'Noto Sans', 'Poppins', sans-serif",
          maxWidth: '1000px',
          margin: '0 auto',
          background: '#f8f9fa',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginBottom: '30px',
            padding: '8px 10px 16px 10px',
            borderBottom: '2px solid #e2e8f0',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '40px', lineHeight: '1' }}>🏛️</span>
            <div>
              <h1
                style={{
                  margin: '0',
                  fontSize: '2.2rem',
                  fontWeight: '800',
                  lineHeight: '1.2',
                  letterSpacing: '1px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 12px rgba(102, 126, 234, 0.25)',
                  fontFamily: "'Playfair Display', serif",
                  paddingBottom: '2px',
                }}
              >
                Chhipa Samaj Jaipur
              </h1>
              <h2
                style={{
                  margin: '-4px 0 0 0',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  letterSpacing: '4px',
                  fontStyle: 'italic',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 10px rgba(245, 87, 108, 0.2)',
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Digital Directory
              </h2>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: showSettings ? '#e2e8f0' : 'transparent',
              border: 'none',
              fontSize: '2.2rem',
              cursor: 'pointer',
              padding: '5px 10px',
              borderRadius: '8px',
              transition: 'background 0.3s',
            }}
            title="Settings"
          >
            ⚙️
          </button>
        </div>

        {/* SETTINGS PANEL */}
        {showSettings && (
          <div
            style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              marginBottom: '30px',
              border: '1px solid #cbd5e1',
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: '#1e3a8a',
                borderBottom: '2px solid #e2e8f0',
                paddingBottom: '10px',
              }}
            >
              ⚙️ सेटिंग्स
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#334155', marginBottom: '10px' }}>📥 Public Downloads</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  onClick={() => generatePDF('families')}
                  style={{
                    padding: '8px 16px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  🏠 परिवार लिस्ट
                </button>
                <button
                  onClick={() => generatePDF('committee')}
                  style={{
                    padding: '8px 16px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  🏢 कमेटी लिस्ट
                </button>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '10px',
                }}
              >
                <h4 style={{ color: '#334155', margin: 0 }}>🔐 Admin Area</h4>
                {isAdmin ? (
                  <button
                    onClick={handleAdminLogout}
                    style={{
                      padding: '4px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={handleAdminLogin}
                    style={{
                      padding: '4px 12px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Admin Login
                  </button>
                )}
              </div>
              {isAdmin ? (
                <div>
                  <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ Admin मोड सक्रिय है</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <button
                      onClick={() => generatePDF('all_members')}
                      style={{
                        padding: '8px 16px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      📋 सभी सदस्य
                    </button>
                    <button
                      onClick={() => generatePDF('students')}
                      style={{
                        padding: '8px 16px',
                        background: '#06b6d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      🎓 छात्र/छात्राएं
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                  Admin लॉगिन करें ताकि आप सभी सदस्य, छात्र लिस्ट डाउनलोड कर सकें और Excel/CSV बल्क
                  इम्पोर्ट का उपयोग कर सकें।
                </p>
              )}
            </div>
          </div>
        )}

        {/* BIRTHDAY NOTIFICATION */}
        {birthdayFolks.length > 0 && (
          <div
            style={{
              background: '#fff3cd',
              border: '1px solid #ffeeba',
              color: '#856404',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '24px' }}>🎉</span>
            <div>
              <strong>आज समाज में उत्सव का दिन है!</strong> निम्नलिखित सदस्यों को जन्मदिन की हार्दिक
              बधाई:
              <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#d9534f' }}>
                {birthdayFolks.map((f) => `${f.name} (Family ID: ${f.familyID})`).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* DASHBOARD CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px',
            maxWidth: '550px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '14px',
              padding: '12px 8px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.35)',
            }}
          >
            <div style={{ fontSize: '28px' }}>🏠</div>
            <div style={{ fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>परिवार</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalFamilies}</div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              borderRadius: '14px',
              padding: '12px 8px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(17, 153, 142, 0.35)',
            }}
          >
            <div style={{ fontSize: '28px' }}>👥</div>
            <div style={{ fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>कुल सदस्य</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalMembers}</div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '14px',
              padding: '12px 8px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.35)',
            }}
          >
            <div style={{ fontSize: '28px' }}>👶</div>
            <div style={{ fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>बच्चे (&lt;10)</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalKids}</div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '14px',
              padding: '12px 8px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.35)',
            }}
          >
            <div style={{ fontSize: '28px' }}>👨</div>
            <div style={{ fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>बड़े सदस्य</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalAdults}</div>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '14px',
              padding: '12px 8px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 4px 15px rgba(250, 112, 154, 0.35)',
            }}
          >
            <div style={{ fontSize: '28px' }}>🎓</div>
            <div style={{ fontSize: '16px', fontWeight: '600', opacity: 0.9 }}>छात्र</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalStudents}</div>
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
            style={{
              padding: '4px 12px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
            }}
          >
            {viewMode === 'card' ? '📋 लिस्ट व्यू' : '🃏 कार्ड व्यू'}
          </button>
        </div>

        <hr style={{ margin: '35px 0', borderColor: '#e2e8f0' }} />

        {/* =========================================================
            SECTION 19: UTILITY BUTTONS - CLEAN BUTTONS
        ========================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {/* समाज कमेटी */}
          <div style={cardWrapperStyle}>
            <button
              onClick={() => setShowCommitteeList(!showCommitteeList)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: "'Poppins', 'Noto Sans', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              🏢 समाज कमेटी
            </button>

            {showCommitteeList && (
              <div
                style={{
                  marginTop: '15px',
                  border: '1px solid #fcd34d',
                  borderRadius: '12px',
                  padding: '15px',
                  background: '#fffbeb',
                  overflowX: 'auto',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '15px',
                  borderBottom: '2px solid #fde68a',
                  paddingBottom: '12px',
                }}>
                  <h2 style={{ margin: 0, color: '#d97706', fontSize: '18px' }}>
                    🏢 समाज कमेटी
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowCommitteeOptionsDropdown(!showCommitteeOptionsDropdown)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#333',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="विकल्प"
                    >
                      ⋯
                    </button>
                    <button
                      onClick={() => setIsCommitteeFormOpen(true)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="जोड़ें"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showCommitteeOptionsDropdown && (
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '8px 0',
                    marginBottom: '12px',
                  }}>
                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Show As
                    </div>
                    <div
                      onClick={() => { setCommitteeViewMode('list'); setShowCommitteeOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: committeeViewMode === 'list' ? '#f59e0b' : '#334155' }}>•</span> List
                    </div>
                    <div
                      onClick={() => { setCommitteeViewMode('card'); setShowCommitteeOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: committeeViewMode === 'card' ? '#f59e0b' : '#334155' }}>•</span> Card
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Print
                    </div>
                    <div
                      onClick={() => { generatePDF('committee'); setShowCommitteeOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🖨️ Print as list
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Export
                    </div>
                    <div
                      onClick={() => setShowCommitteeExportDropdown(!showCommitteeExportDropdown)}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {showCommitteeExportDropdown ? '▼' : '▶'} Export formats
                    </div>

                    {showCommitteeExportDropdown && (
                      <div style={{ paddingLeft: '16px' }}>
                        {['XLSX', 'PDF', 'HTML', 'XML', 'JSON', 'CSV', 'TSV'].map((format) => (
                          <div
                            key={format}
                            onClick={() => {
                              exportCommitteeData(format.toLowerCase());
                              setShowCommitteeOptionsDropdown(false);
                              setShowCommitteeExportDropdown(false);
                            }}
                            style={{ padding: '4px 20px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            {format}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {committee.length === 0 ? (
                  <p style={{ color: '#92400e', background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    कोई पदाधिकारी नहीं।
                  </p>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: committeeViewMode === 'card' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                    gap: '12px',
                  }}>
                    {committee.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          padding: '12px 15px',
                          background: committeeViewMode === 'card' ? '#f8fafc' : 'transparent',
                          borderRadius: committeeViewMode === 'card' ? '10px' : '0',
                          border: committeeViewMode === 'card' ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
                          borderBottom: committeeViewMode === 'card' ? '1px solid #e2e8f0' : 'none',
                          display: committeeViewMode === 'card' ? 'block' : 'grid',
                          gridTemplateColumns: committeeViewMode === 'card' ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: '8px',
                        }}
                      >
                        {committeeViewMode === 'card' ? (
                          <>
                            <div style={{ fontSize: '14px', color: '#ea580c', fontWeight: 'bold' }}>
                              ⭐ {c.designation}
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                              {c.name}
                            </div>
                            {c.gotra && <div style={{ color: '#475569', fontSize: '14px' }}>गोत्र: {c.gotra}</div>}
                            {c.mobile && (
                              <div
                                style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
                                onClick={() => dialPhone(c.mobile)}
                              >
                                📞 {c.mobile}
                              </div>
                            )}
                            {c.tenure && <div style={{ color: '#64748b', fontSize: '12px' }}>कार्यकाल: {c.tenure}</div>}
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => openCommitteeEditModal(c)}
                                style={{ padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', color: '#16a34a', fontSize: '12px' }}
                              >
                                ✏️ एडिट
                              </button>
                              <button
                                onClick={() => handleDeleteCommittee(c.id, c.name)}
                                style={{ padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', color: '#dc2626', fontSize: '12px' }}
                              >
                                🗑️ हटाएं
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span><strong>पद:</strong> {c.designation}</span>
                            <span><strong>नाम:</strong> {c.name}</span>
                            <span><strong>गोत्र:</strong> {c.gotra || '-'}</span>
                            <span><strong>मोबाइल:</strong> {c.mobile || '-'}</span>
                            <span><strong>कार्यकाल:</strong> {c.tenure || '-'}</span>
                            <span>
                              <button onClick={() => openCommitteeEditModal(c)} style={{ padding: '2px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer', color: '#16a34a', fontSize: '11px' }}>✏️</button>
                              <button onClick={() => handleDeleteCommittee(c.id, c.name)} style={{ padding: '2px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', color: '#dc2626', fontSize: '11px', marginLeft: '4px' }}>🗑️</button>
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* सभी परिवार */}
          <div style={cardWrapperStyle}>
            <button
              onClick={() => setShowFamilyList(!showFamilyList)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: "'Poppins', 'Noto Sans', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              🏠 सभी परिवार
            </button>

            {showFamilyList && (
              <div
                style={{
                  marginTop: '15px',
                  background: 'white',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid #c084fc',
                  maxHeight: '500px',
                  overflowY: 'auto',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '15px',
                  borderBottom: '2px solid #ede9fe',
                  paddingBottom: '12px',
                }}>
                  <h2 style={{ margin: 0, color: '#7c3aed', fontSize: '18px' }}>
                    🏠 सभी परिवार
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#333',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="विकल्प"
                    >
                      ⋯
                    </button>
                    <button
                      onClick={() => setIsFamilyFormOpen(true)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="जोड़ें"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setShowFamilySearchPopup(true)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="खोजें"
                    >
                      🔍
                    </button>
                  </div>
                </div>

                {showOptionsDropdown && (
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '8px 0',
                    marginBottom: '12px',
                  }}>
                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Show As
                    </div>
                    <div
                      onClick={() => { setListViewMode('list'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: listViewMode === 'list' ? '#8b5cf6' : '#334155' }}>•</span> List
                    </div>
                    <div
                      onClick={() => { setListViewMode('spreadsheet'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: listViewMode === 'spreadsheet' ? '#8b5cf6' : '#334155' }}>•</span> Spreadsheet
                    </div>
                    <div
                      onClick={() => { setListViewMode('kanban'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: listViewMode === 'kanban' ? '#8b5cf6' : '#334155' }}>•</span> Kanban
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Print
                    </div>
                    <div
                      onClick={() => { generatePDF('families'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🖨️ Print as list
                    </div>
                    <div
                      onClick={() => { generatePDF('all_members'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🖨️ Print as Summary
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Import
                    </div>
                    <div style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px', position: 'relative' }}>
                      <label style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📁 Upload Family List</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => handleFamilyImport(e)}
                          style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', left: 0, top: 0 }}
                        />
                      </label>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Export
                    </div>
                    <div
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {showExportDropdown ? '▼' : '▶'} Export formats
                    </div>

                    {showExportDropdown && (
                      <div style={{ paddingLeft: '16px' }}>
                        {['XLSX', 'PDF', 'HTML', 'XML', 'JSON', 'CSV', 'TSV'].map((format) => (
                          <div
                            key={format}
                            onClick={() => { exportData(format.toLowerCase()); setShowOptionsDropdown(false); setShowExportDropdown(false); }}
                            style={{ padding: '4px 20px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            {format}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Family Search Results */}
                {familySearched ? (
                  familySearchResults.length > 0 ? (
                    <>
                      <div style={{
                        fontSize: '14px',
                        color: '#475569',
                        marginBottom: '12px',
                        padding: '8px 12px',
                        background: '#f3e8ff',
                        borderRadius: '6px',
                      }}>
                        मिले: {familySearchResults.length} सदस्य
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            viewMode === 'card' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                          gap: '15px',
                        }}
                      >
                        {familySearchResults
                          .filter((m) => m.isHead === true)
                          .map((head, index) => {
                            const familyMembers = members.filter((m) => m.familyID === head.familyID);
                            const nonHeadMembers = familyMembers.filter((m) => !m.isHead);
                            const headKids = nonHeadMembers.filter(
                              (m) => parseInt(m.age_years || '0') < 10
                            ).length;
                            const headAdults = nonHeadMembers.filter(
                              (m) => parseInt(m.age_years || '0') >= 10
                            ).length;
                            const cardId = `head-${head.id}`;

                            return viewMode === 'card' ? (
                              <div
                                key={index}
                                className="card-container"
                                style={{
                                  background: '#f8fafc',
                                  padding: '12px 15px',
                                  borderRadius: '10px',
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  position: 'relative',
                                }}
                                onMouseEnter={() => setHoveredCard(cardId)}
                                onMouseLeave={() => setHoveredCard(null)}
                              >
                                <div
                                  className="card-hover-actions"
                                  style={{ position: 'absolute', top: '2px', right: '6px' }}
                                >
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openHeadEditModal(head);
                                    }}
                                    style={{
                                      cursor: 'pointer',
                                      fontSize: '18px',
                                      color: '#4a4a4a',
                                      fontWeight: 'bold',
                                      letterSpacing: '2px',
                                      padding: '2px 4px',
                                      userSelect: 'none',
                                    }}
                                    title="एडिट करें"
                                  >
                                    ⋯
                                  </span>
                                </div>

                                <div onClick={() => setSelectedHead(head)}>
                                  <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '600' }}>
                                    {head.memberNo || index + 1}
                                  </div>
                                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7c3aed' }}>
                                    {formatHeadDisplay(head)}
                                  </div>

                                  <div style={{ color: '#475569', fontSize: '14px', marginTop: '2px' }}>
                                    {head.villageCity || '-'} {head.area ? `• ${head.area}` : ''}
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: '12px',
                                      color: '#475569',
                                      fontSize: '13px',
                                      marginTop: '2px',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    {head.mobile1 && (
                                      <span
                                        style={{
                                          color: '#2563eb',
                                          cursor: 'pointer',
                                          textDecoration: 'underline',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dialPhone(head.mobile1);
                                        }}
                                      >
                                        📞 {head.mobile1}
                                      </span>
                                    )}
                                    {head.mobile2 && (
                                      <span
                                        style={{
                                          color: '#2563eb',
                                          cursor: 'pointer',
                                          textDecoration: 'underline',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          dialPhone(head.mobile2);
                                        }}
                                      >
                                        📞 {head.mobile2}
                                      </span>
                                    )}
                                    {!head.mobile1 && !head.mobile2 && (
                                      <span style={{ color: '#94a3b8' }}>कोई मोबाइल नहीं</span>
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      marginTop: '8px',
                                      borderTop: '1px solid #e2e8f0',
                                      paddingTop: '8px',
                                      display: 'flex',
                                      gap: '15px',
                                      fontSize: '13px',
                                      color: '#64748b',
                                      justifyContent: 'space-around',
                                    }}
                                  >
                                    <span>
                                      <strong>कुल:</strong> {nonHeadMembers.length}
                                    </span>
                                    <span>
                                      <strong>बच्चे:</strong> {headKids}
                                    </span>
                                    <span>
                                      <strong>बड़े:</strong> {headAdults}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                key={index}
                                style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}
                              >
                                <div>
                                  <strong>ID:</strong> {head.familyID}
                                </div>
                                <div>
                                  <strong>क्र.सं.:</strong> {head.memberNo || index + 1}
                                </div>
                                <div>
                                  <strong>मुखिया:</strong> {formatHeadDisplay(head)}
                                </div>
                                <div>
                                  <strong>गाँव/शहर:</strong> {head.villageCity || '-'}
                                </div>
                                <div>
                                  <strong>एरिया:</strong> {head.area || '-'}
                                </div>
                                <div>
                                  <strong>मोबाइल 1:</strong> {head.mobile1 || '-'}
                                </div>
                                <div>
                                  <strong>मोबाइल 2:</strong> {head.mobile2 || '-'}
                                </div>
                                <div>
                                  <strong>सदस्य:</strong> {nonHeadMembers.length}
                                </div>
                                <div>
                                  <strong>बच्चे:</strong> {headKids}
                                </div>
                                <div>
                                  <strong>बड़े:</strong> {headAdults}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}>
                      कोई सदस्य नहीं मिला
                    </div>
                  )
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}>
                    सर्च करने के लिए 🔍 बटन पर क्लिक करें
                  </div>
                )}
              </div>
            )}
          </div>

          {/* सभी सदस्य */}
          <div style={cardWrapperStyle}>
            <button
              onClick={() => setShowAllMembersList(!showAllMembersList)}
              style={{
                width: '100%',
                padding: '14px 18px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: "'Poppins', 'Noto Sans', sans-serif",
                transition: 'all 0.3s ease',
              }}
            >
              👥 सभी सदस्य
            </button>

            {showAllMembersList && (
              <div
                style={{
                  marginTop: '15px',
                  background: 'white',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '1px solid #67e8f9',
                  maxHeight: '500px',
                  overflowY: 'auto',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '15px',
                  borderBottom: '2px solid #cffafe',
                  paddingBottom: '12px',
                }}>
                  <h2 style={{ margin: 0, color: '#0891b2', fontSize: '18px' }}>
                    👥 सभी सदस्य
                  </h2>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#333',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="विकल्प"
                    >
                      ⋯
                    </button>
                    <button
                      onClick={() => setIsMemberFormOpen(true)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="जोड़ें"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setShowMemberSearchPopup(true)}
                      style={{
                        padding: '6px 10px',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minWidth: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="खोजें"
                    >
                      🔍
                    </button>
                  </div>
                </div>

                {showOptionsDropdown && (
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: '8px 0',
                    marginBottom: '12px',
                  }}>
                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Show As
                    </div>
                    <div
                      onClick={() => { setListViewMode('list'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: listViewMode === 'list' ? '#8b5cf6' : '#334155' }}>•</span> List
                    </div>
                    <div
                      onClick={() => { setListViewMode('spreadsheet'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: listViewMode === 'spreadsheet' ? '#8b5cf6' : '#334155' }}>•</span> Spreadsheet
                    </div>
                    <div
                      onClick={() => { setListViewMode('kanban'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <span style={{ color: listViewMode === 'kanban' ? '#8b5cf6' : '#334155' }}>•</span> Kanban
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Print
                    </div>
                    <div
                      onClick={() => { generatePDF('all_members'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🖨️ Print as list
                    </div>
                    <div
                      onClick={() => { generatePDF('students'); setShowOptionsDropdown(false); }}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      🖨️ Print as Summary
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Import
                    </div>
                    <div style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px', position: 'relative' }}>
                      <label style={{ cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📁 Upload Members List</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => handleMemberImport(e)}
                          style={{ position: 'absolute', opacity: 0, cursor: 'pointer', width: '100%', height: '100%', left: 0, top: 0 }}
                        />
                      </label>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 16px' }}></div>

                    <div style={{ padding: '4px 16px', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                      Export
                    </div>
                    <div
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      style={{ padding: '4px 16px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {showExportDropdown ? '▼' : '▶'} Export formats
                    </div>

                    {showExportDropdown && (
                      <div style={{ paddingLeft: '16px' }}>
                        {['XLSX', 'PDF', 'HTML', 'XML', 'JSON', 'CSV', 'TSV'].map((format) => (
                          <div
                            key={format}
                            onClick={() => { exportData(format.toLowerCase()); setShowOptionsDropdown(false); setShowExportDropdown(false); }}
                            style={{ padding: '4px 20px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            {format}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Member Search Results */}
                {memberSearched ? (
                  memberSearchResults.length > 0 ? (
                    <>
                      <div style={{
                        fontSize: '14px',
                        color: '#475569',
                        marginBottom: '12px',
                        padding: '8px 12px',
                        background: '#e0f2fe',
                        borderRadius: '6px',
                      }}>
                        मिले: {memberSearchResults.length} सदस्य
                      </div>
                      <div>
                        {Object.keys(
                          memberSearchResults
                            .filter((m) => !m.isHead)
                            .reduce((acc: any, m: any) => {
                              const fid = m.familyID ? m.familyID.toString().trim() : '';
                              if (fid) {
                                if (!acc[fid]) acc[fid] = [];
                                acc[fid].push(m);
                              }
                              return acc;
                            }, {})
                        ).map((fid) => {
                          const familyMembers = memberSearchResults.filter((m) => m.familyID === fid && !m.isHead);
                          return (
                            <div
                              key={fid}
                              style={{
                                marginBottom: '12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  background: '#0891b2',
                                  color: 'white',
                                  padding: '6px 12px',
                                  fontWeight: 'bold',
                                  fontSize: '13px',
                                }}
                              >
                                🏠 Family ID: {fid} ({familyMembers.length} सदस्य)
                              </div>
                              <div style={{ padding: '8px 12px' }}>
                                {familyMembers.map((m: any, idx: number) => (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedMember(m)}
                                    style={{
                                      padding: '6px 10px',
                                      borderBottom: idx !== familyMembers.length - 1 ? '1px solid #e2e8f0' : 'none',
                                      background: idx % 2 === 0 ? '#fafafa' : 'white',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      fontSize: '14px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#e0f2fe'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fafafa' : 'white'}
                                  >
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                                      {m.memberNo || idx + 1}.
                                    </span>
                                    <span>{formatMemberDisplay(m)}</span>
                                    {m.villageCity && (
                                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        📍 {m.villageCity}
                                      </span>
                                    )}
                                    {m.gotra && (
                                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        🧬 {m.gotra}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}>
                      कोई सदस्य नहीं मिला
                    </div>
                  )
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}>
                    सर्च करने के लिए 🔍 बटन पर क्लिक करें
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <hr style={{ margin: '35px 0', borderColor: '#e2e8f0' }} />

        {/* =========================================================
            SECTION 24: POPUPS & MODALS
        ========================================================= */}
        {selectedMember && MemberDetailCard({ member: selectedMember, onClose: () => setSelectedMember(null) })}

        {selectedHead && HeadDetailCard({ head: selectedHead, onClose: () => setSelectedHead(null) })}

        {HeadEditModal()}
        {MemberEditModal()}

        {/* Family Form Modal */}
        {isFamilyFormOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
              padding: '20px',
            }}
            onClick={() => setIsFamilyFormOpen(false)}
          >
            <div
              style={{
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'transparent',
                padding: '0 4px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AddFamilyHead onClose={() => setIsFamilyFormOpen(false)} />
            </div>
          </div>
        )}

        {/* Member Form Modal */}
        {isMemberFormOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
              padding: '20px',
            }}
            onClick={() => setIsMemberFormOpen(false)}
          >
            <div
              style={{
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'transparent',
                padding: '0 4px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AddMemberToFamily onClose={() => setIsMemberFormOpen(false)} />
            </div>
          </div>
        )}

        {/* Committee Form Modal */}
        {isCommitteeFormOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
              padding: '20px',
            }}
            onClick={() => setIsCommitteeFormOpen(false)}
          >
            <div
              style={{
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'transparent',
                padding: '0 4px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AddCommitteeMember onClose={() => setIsCommitteeFormOpen(false)} />
            </div>
          </div>
        )}

        {/* Committee Edit Modal */}
        {isCommitteeEditModalOpen && committeeEditFormData && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
            onClick={() => setIsCommitteeEditModalOpen(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '25px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCommitteeEditModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                ✕
              </button>

              <h2 style={{ margin: '0 0 20px 0', color: '#d97706', borderBottom: '2px solid #fde68a', paddingBottom: '10px' }}>
                ✏️ पदाधिकारी एडिट करें
              </h2>

              <form onSubmit={handleCommitteeEditSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    पद <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे: अध्यक्ष, उपाध्यक्ष, सचिव..."
                    value={committeeEditFormData.designation || ''}
                    onChange={(e) => setCommitteeEditFormData({...committeeEditFormData, designation: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    नाम <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="पूरा नाम"
                    value={committeeEditFormData.name || ''}
                    onChange={(e) => setCommitteeEditFormData({...committeeEditFormData, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    गोत्र
                  </label>
                  <input
                    type="text"
                    placeholder="गोत्र"
                    value={committeeEditFormData.gotra || ''}
                    onChange={(e) => setCommitteeEditFormData({...committeeEditFormData, gotra: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    📱 मोबाइल
                  </label>
                  <input
                    type="tel"
                    placeholder="10 अंक"
                    value={committeeEditFormData.mobile || ''}
                    onChange={(e) => setCommitteeEditFormData({...committeeEditFormData, mobile: e.target.value})}
                    maxLength={10}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
                    कार्यकाल
                  </label>
                  <input
                    type="text"
                    placeholder="जैसे: 2024-2026"
                    value={committeeEditFormData.tenure || ''}
                    onChange={(e) => setCommitteeEditFormData({...committeeEditFormData, tenure: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '6px 20px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    }}
                  >
                    ✅ सबमिट
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Search Popups */}
      {FamilySearchPopup()}
      {MemberSearchPopup()}
    </>
  );
} 