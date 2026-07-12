// App.tsx.files/components/settings/SettingsPanel.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { generatePDF } from '../../utils/pdfGenerator';
import { exportData } from '../../utils/exportFunctions';
import { handleFamilyImport, handleMemberImport } from '../../hooks/useFirebaseData';

const SettingsPanel = () => {
  const { state, dispatch } = useAppContext();

  const handleAdminLogin = () => {
    const pwd = prompt('Admin पासवर्ड दर्ज करें:');
    if (pwd === 'admin123') {
      dispatch({ type: 'SET_STATE', payload: { isAdmin: true } });
      alert('✅ Admin मोड सक्रिय!');
    } else if (pwd !== null) {
      alert('❌ गलत पासवर्ड!');
    }
  };

  const handleAdminLogout = () => {
    dispatch({ type: 'SET_STATE', payload: { isAdmin: false } });
    alert('🔒 Admin मोड बंद कर दिया गया।');
  };

  return (
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
            onClick={() => generatePDF('families', state.members, state.committee, state.members)}
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
            onClick={() => generatePDF('committee', state.members, state.committee, state.members)}
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
          {state.isAdmin ? (
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
        {state.isAdmin ? (
          <div>
            <p style={{ color: '#16a34a', fontWeight: 'bold' }}>✅ Admin मोड सक्रिय है</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <button
                onClick={() => generatePDF('all_members', state.members, state.committee, state.members)}
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
                onClick={() => generatePDF('students', state.members, state.committee, state.members)}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
              <div style={{ position: 'relative' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  📤 Import Family
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleFamilyImport(e, dispatch)}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      left: 0,
                      top: 0,
                    }}
                  />
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  📤 Import Members
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => handleMemberImport(e, dispatch)}
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                      left: 0,
                      top: 0,
                    }}
                  />
                </button>
              </div>
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
  );
};

export default SettingsPanel;