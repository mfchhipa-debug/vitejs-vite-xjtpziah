import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function AddCommitteeMember({ onClose }: { onClose?: () => void }) {
  const [designation, setDesignation] = useState('');
  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [mobile, setMobile] = useState('');
  const [tenure, setTenure] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation || !name) {
      alert('कृपया पद और नाम भरें!');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'committee'), {
        designation,
        name,
        gotra: gotra || '',
        mobile: mobile || '',
        tenure: tenure || '',
        createdAt: new Date().toISOString()
      });

      alert('✅ पदाधिकारी सफलतापूर्वक जोड़ा गया!');
      setDesignation('');
      setName('');
      setGotra('');
      setMobile('');
      setTenure('');
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      alert('❌ कुछ गड़बड़ हुई, कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box' as const,
    fontSize: '14px'
  };

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* X Button - Top Right */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-12px',
            right: '-12px',
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 10,
            padding: 0,
            lineHeight: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
          title="बंद करें"
        >
          ✕
        </button>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '0' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#d97706', borderBottom: '2px solid #fde68a', paddingBottom: '10px' }}>
          ⭐ पदाधिकारी जोड़ें
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            पद <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="जैसे: अध्यक्ष, उपाध्यक्ष, सचिव..."
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            नाम <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="पूरा नाम"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            गोत्र
          </label>
          <input
            type="text"
            value={gotra}
            onChange={(e) => setGotra(e.target.value)}
            placeholder="गोत्र"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            📱 मोबाइल
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="10 अंकों का नंबर"
            maxLength={10}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#334155' }}>
            कार्यकाल
          </label>
          <input
            type="text"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            placeholder="जैसे: 2024-2026"
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'block',
            margin: '0 auto',
            width: '35%',
            padding: '5px 16px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.3s'
          }}
        >
          {loading ? '⏳ जमा हो रहा...' : '✅ सबमिट'}
        </button>
      </form>
    </div>
  );
}