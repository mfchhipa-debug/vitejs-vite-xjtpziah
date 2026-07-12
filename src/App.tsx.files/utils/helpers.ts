// App.tsx.files/utils/helpers.ts
import { Member } from '../types';

export const dialPhone = (phoneNumber: string) => {
  if (phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
  }
};

export const formatHeadDisplay = (head: any) => {
  let display = head.name;
  if (head.fatherName) {
    display = `${head.name} S/O ${head.fatherName}`;
  }
  if (head.gotra) {
    display += ` ${head.gotra}`;
  }
  return display;
};

export const formatMemberDisplay = (member: any) => {
  if (member.isHead) {
    return formatHeadDisplay(member);
  }
  let display = member.name;
  if (member.relationToHead) {
    display = `${member.name} - ${member.relationToHead}`;
  }
  return display;
};

export const getUniqueValues = (members: any[], key: string) => {
  return [...new Set(members.map(m => m[key]).filter(Boolean))];
};

export const cardWrapperStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  boxSizing: 'border-box' as const
};

export const toggleButtonStyle = (isOpen: boolean, openColor: string, closedColor: string) => ({
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