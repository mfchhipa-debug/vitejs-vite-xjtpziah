// App.tsx.files/components/dashboard/BirthdayNotification.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const BirthdayNotification = () => {
  const { state } = useAppContext();
  const { members } = state;

  const todayStr = new Date().toISOString().substring(5, 10);
  const birthdayFolks = members.filter((m: any) => {
    if (!m.dob) return false;
    return m.dob.substring(5, 10) === todayStr;
  });

  if (birthdayFolks.length === 0) return null;

  return (
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
          {birthdayFolks.map((f: any) => `${f.name} (Family ID: ${f.familyID})`).join(', ')}
        </span>
      </div>
    </div>
  );
};

export default BirthdayNotification;