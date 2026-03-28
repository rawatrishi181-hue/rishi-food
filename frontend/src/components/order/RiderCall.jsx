import { motion } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Grid, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const RiderCall = ({ riderName = "Rishi Kumar", onClose }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        backgroundColor: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 20px',
        color: '#fff',
        fontFamily: 'system-ui'
      }}
    >
      {/* Background Blur Effect */}
      <div style={{
        position: 'absolute',
        top: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        zIndex: -1
      }} />

      <div style={{ textAlign: 'center' }}>
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.1)',
            marginBottom: '20px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)'
          }}
        >
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf" 
            alt="Rider" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </motion.div>
        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>{riderName}</h2>
        <div style={{ fontSize: '18px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', animate: 'pulse 1s infinite' }}></div>
          {formatTime(duration)}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontWeight: '600' }}>Rishi Food Delivery Partner</p>
      </div>

      <div style={{ width: '100%', maxWidth: '300px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {[
          { icon: isMuted ? MicOff : Mic, label: 'Mute', active: isMuted, onClick: () => setIsMuted(!isMuted) },
          { icon: Grid, label: 'Keypad' },
          { icon: Volume2, label: 'Speaker' },
          { icon: Phone, label: 'Add call' },
          { icon: User, label: 'Video' },
          { icon: MessageSquare, label: 'Message' }
        ].map((btn, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={btn.onClick}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: btn.active ? '#fff' : 'rgba(255,255,255,0.1)',
                border: 'none',
                color: btn.active ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <btn.icon size={28} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{btn.label}</span>
          </div>
        ))}
      </div>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(239,68,68,0.4)'
        }}
      >
        <PhoneOff size={36} style={{ transform: 'rotate(135deg)' }} />
      </motion.button>
    </motion.div>
  );
};

const MessageSquare = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

export default RiderCall;