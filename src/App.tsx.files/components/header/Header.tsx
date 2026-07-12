// App.tsx.files/components/header/Header.tsx
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Header = () => {
  const { state, dispatch } = useAppContext();

  return (
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
        onClick={() => dispatch({ type: 'TOGGLE', key: 'showSettings' })}
        style={{
          background: state.showSettings ? '#e2e8f0' : 'transparent',
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
  );
};

export default Header;