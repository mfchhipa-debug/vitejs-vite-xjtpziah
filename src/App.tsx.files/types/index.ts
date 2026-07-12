// App.tsx.files/types/index.ts
export interface Member {
    id?: string;
    name: string;
    fatherName?: string;
    gotra?: string;
    villageCity?: string;
    area?: string;
    mobile1?: string;
    mobile2?: string;
    bloodGroup?: string;
    familyID?: string;
    isHead?: boolean;
    memberNo?: string;
    relationToHead?: string;
    dob?: string;
    gender?: string;
    maritalStatus?: string;
    education?: string;
    occupation?: string;
    address?: string;
    isStudent?: boolean;
    age_years?: string;
    age_months?: string;
    photoURL?: string;
  }
  
  export interface Committee {
    id?: string;
    designation: string;
    name: string;
    gotra?: string;
    mobile?: string;
    tenure?: string;
  }
  
  export interface AppState {
    members: Member[];
    committee: Committee[];
    selectedMember: Member | null;
    selectedHead: Member | null;
    editingMember: Member | null;
    editFormData: any;
    editPhotoFile: File | null;
    editPhotoPreview: string | null;
    isEditModalOpen: boolean;
    hoveredCard: string | null;
    showCommitteeOptionsDropdown: boolean;
    showCommitteeExportDropdown: boolean;
    committeeViewMode: string;
    isCommitteeFormOpen: boolean;
    editingCommitteeMember: Committee | null;
    isCommitteeEditModalOpen: boolean;
    committeeEditFormData: any;
    showOptionsDropdown: boolean;
    showExportDropdown: boolean;
    familySearchTerm: string;
    memberSearchTerm: string;
    isFamilyFormOpen: boolean;
    isMemberFormOpen: boolean;
    showFamilyList: boolean;
    showAllMembersList: boolean;
    showSearchBox: boolean;
    showCommitteeList: boolean;
    showSettings: boolean;
    isAdmin: boolean;
    viewMode: string;
    listViewMode: string;
    // Family Search
    showFamilySearchPopup: boolean;
    familySearchSpecialText: string;
    familySearchVillage: string;
    familySearchArea: string;
    familySearchGotra: string;
    familySearchGender: string;
    familySearchMarital: string;
    familySearchOccupation: string;
    familySearchEducation: string;
    familySearchAgeMin: string;
    familySearchAgeMax: string;
    familySearchResults: Member[];
    familySearched: boolean;
    // Member Search
    showMemberSearchPopup: boolean;
    memberSearchSpecialText: string;
    memberSearchVillage: string;
    memberSearchArea: string;
    memberSearchGotra: string;
    memberSearchGender: string;
    memberSearchMarital: string;
    memberSearchOccupation: string;
    memberSearchEducation: string;
    memberSearchAgeMin: string;
    memberSearchAgeMax: string;
    memberSearchResults: Member[];
    memberSearched: boolean;
    // Filters
    filterType: string;
    searchTerm: string;
    searchGotra: string;
    searchBlood: string;
    minAge: string;
    maxAge: string;
  }