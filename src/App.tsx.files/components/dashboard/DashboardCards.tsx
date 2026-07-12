// App.tsx.files/components/dashboard/DashboardCards.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const DashboardCards = () => {
  const { state } = useAppContext();
  const { members } = state;

  const heads = members.filter((m: any) => m.isHead === true);
  const nonHeads = members.filter((m: any) => !m.isHead);
  const totalFamilies = heads.length;
  const totalMembers = nonHeads.length;
  const totalKids = nonHeads.filter((m: any) => parseInt(m.age_years || '0') < 10).length;
  const totalAdults = nonHeads.filter((m: any) => parseInt(m.age_years || '0') >= 10).length;
  const totalStudents = nonHeads.filter((m: any) => m.occupation === 'छात्र' || m.occupation_isStudent === true).length;

  return (
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
  );
};

export default DashboardCards;