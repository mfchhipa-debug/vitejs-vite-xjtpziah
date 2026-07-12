// App.tsx.files/context/AppContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Member, Committee } from '../types';

const initialState: AppState = {
  members: [],
  committee: [],
  selectedMember: null,
  selectedHead: null,
  editingMember: null,
  editFormData: null,
  editPhotoFile: null,
  editPhotoPreview: null,
  isEditModalOpen: false,
  hoveredCard: null,
  showCommitteeOptionsDropdown: false,
  showCommitteeExportDropdown: false,
  committeeViewMode: 'list',
  isCommitteeFormOpen: false,
  editingCommitteeMember: null,
  isCommitteeEditModalOpen: false,
  committeeEditFormData: null,
  showOptionsDropdown: false,
  showExportDropdown: false,
  familySearchTerm: '',
  memberSearchTerm: '',
  isFamilyFormOpen: false,
  isMemberFormOpen: false,
  showFamilyList: false,
  showAllMembersList: false,
  showSearchBox: false,
  showCommitteeList: false,
  showSettings: false,
  isAdmin: false,
  viewMode: 'card',
  listViewMode: 'list',
  showFamilySearchPopup: false,
  familySearchSpecialText: '',
  familySearchVillage: '',
  familySearchArea: '',
  familySearchGotra: '',
  familySearchGender: '',
  familySearchMarital: '',
  familySearchOccupation: '',
  familySearchEducation: '',
  familySearchAgeMin: '',
  familySearchAgeMax: '',
  familySearchResults: [],
  familySearched: false,
  showMemberSearchPopup: false,
  memberSearchSpecialText: '',
  memberSearchVillage: '',
  memberSearchArea: '',
  memberSearchGotra: '',
  memberSearchGender: '',
  memberSearchMarital: '',
  memberSearchOccupation: '',
  memberSearchEducation: '',
  memberSearchAgeMin: '',
  memberSearchAgeMax: '',
  memberSearchResults: [],
  memberSearched: false,
  filterType: 'text',
  searchTerm: '',
  searchGotra: '',
  searchBlood: '',
  minAge: '',
  maxAge: '',
};

type Action =
  | { type: 'SET_MEMBERS'; payload: Member[] }
  | { type: 'SET_COMMITTEE'; payload: Committee[] }
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'TOGGLE'; key: keyof AppState; value?: boolean }
  | { type: 'SET_FAMILY_SEARCH_RESULTS'; payload: Member[] }
  | { type: 'SET_MEMBER_SEARCH_RESULTS'; payload: Member[] };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_MEMBERS':
      return { ...state, members: action.payload };
    case 'SET_COMMITTEE':
      return { ...state, committee: action.payload };
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'TOGGLE':
      return { ...state, [action.key]: action.value !== undefined ? action.value : !state[action.key] };
    case 'SET_FAMILY_SEARCH_RESULTS':
      return { ...state, familySearchResults: action.payload, familySearched: true };
    case 'SET_MEMBER_SEARCH_RESULTS':
      return { ...state, memberSearchResults: action.payload, memberSearched: true };
    default:
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};