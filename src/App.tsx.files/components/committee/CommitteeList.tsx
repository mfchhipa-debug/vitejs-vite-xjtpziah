// App.tsx.files/components/committee/CommitteeList.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { dialPhone } from '../../utils/helpers';
import { handleDeleteCommittee } from '../../hooks/useFirebaseData';

const CommitteeList = () => {
  const { state, dispatch } = useAppContext();
  const { committee, showCommitteeList, showCommitteeOptionsDropdown, committeeViewMode } = state;

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      boxSizing: 'border-box' as const,
    }}>
      <button
        onClick={() => dispatch({ type: 'TOGGLE', key: 'showCommitteeList' })}
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
                onClick={() => dispatch({ type: 'TOGGLE', key: 'showCommitteeOptionsDropdown' })}
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
                onClick={() => dispatch({ type: 'SET_STATE', payload: { isCommitteeFormOpen: true } })}
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

          {/* Committee Options Dropdown */}
          {showCommitteeOptionsDropdown && (
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              padding: '8px 0',
              marginBottom: '12px',
            }}>
              {/* Dropdown items - यहाँ आपको कमेटी के ऑप्शन्स डालने हैं */}
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommitteeList;