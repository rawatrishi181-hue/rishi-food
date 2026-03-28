import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Phone, MessageSquare, 
  Bike, CheckCircle, Clock, X, Star, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import RiderCall from './RiderCall';
import RiderChat from './RiderChat';
import { orderService } from '../../services/apiService';

const LiveTracking = ({ order, onClose }) => {
  const [riderPos, setRiderPos] = useState({ x: 30, y: 70 });
  const [eta, setEta] = useState(15);
  const [activeView, setActiveView] = useState('tracking'); // 'tracking', 'call', 'chat', 'delivered'
  
  // Use localStorage to persist the start time for this specific order
  const startTimeRef = useRef(null);
  const isDeliveredRef = useRef(false);
  const duration = 20000; // 20 seconds for a quick simulation to verify fix

  useEffect(() => {
    const storageKey = `tracking_start_${order._id}`;
    const deliveredKey = `tracking_delivered_${order._id}`;
    
    // Check if already delivered in this session
    if (localStorage.getItem(deliveredKey) === 'true') {
      isDeliveredRef.current = true;
      setActiveView('delivered');
      setEta(0);
      return;
    }

    const savedStart = localStorage.getItem(storageKey);
    if (savedStart) {
      startTimeRef.current = parseInt(savedStart, 10);
    } else {
      const now = Date.now();
      startTimeRef.current = now;
      localStorage.setItem(storageKey, now.toString());
    }

    // Clean up old tracking data
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('tracking_start_') || key.startsWith('tracking_delivered_')) {
        const timeStr = localStorage.getItem(key);
        if (timeStr && !isNaN(timeStr)) {
          const time = parseInt(timeStr, 10);
          if (now - time > 3600000) localStorage.removeItem(key);
        }
      }
    });
  }, [order._id]);

  const handleCall = () => {
    setActiveView('call');
  };

  const handleChat = () => {
    setActiveView('chat');
  };

  const markAsDelivered = async () => {
    try {
      await orderService.updateStatus(order._id, 'delivered');
      localStorage.setItem(`tracking_delivered_${order._id}`, 'true');
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };
  
  // Create a persistent route path to avoid re-renders
  const routePath = useMemo(() => {
    return "M 30 70 L 30 50 L 50 50 L 50 30 L 70 30";
  }, []);

  useEffect(() => {
    let frame;
    
    const tick = () => {
      if (isDeliveredRef.current || !startTimeRef.current) {
        if (!startTimeRef.current && !isDeliveredRef.current) frame = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      
      // Calculate position along the route
      let currentX, currentY;
      if (p < 0.25) { // Vertical 70 to 50
        currentX = 30;
        currentY = 70 - (20 * (p / 0.25));
      } else if (p < 0.5) { // Horizontal 30 to 50
        currentX = 30 + (20 * ((p - 0.25) / 0.25));
        currentY = 50;
      } else if (p < 0.75) { // Vertical 50 to 30
        currentX = 50;
        currentY = 50 - (20 * ((p - 0.5) / 0.25));
      } else { // Horizontal 50 to 70
        currentX = 50 + (20 * ((p - 0.75) / 0.25));
        currentY = 30;
      }

      setRiderPos({ x: currentX, y: currentY });
      const remainingEta = Math.max(0, Math.floor(15 * (1 - p)));
      setEta(remainingEta);

      if (p >= 1) {
        isDeliveredRef.current = true;
        cancelAnimationFrame(frame);
        setActiveView('delivered');
        markAsDelivered();
        toast.success('Order Delivered! Enjoy your meal.', {
          icon: '🎁',
          duration: 5000,
          style: {
            borderRadius: '15px',
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold'
          }
        });
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  if (!order) return null;

  const content = (
    <AnimatePresence mode="wait">
      {activeView === 'tracking' && (
        <motion.div 
          key="tracking"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <motion.div 
            initial={{ y: 50, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            style={{
              backgroundColor: '#fff',
              width: '100%',
              maxWidth: '1200px',
              height: '90vh',
              borderRadius: '32px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'row',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
          >
            {/* ... tracking content ... */}
          {/* Close Button Mobile */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 100,
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              padding: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>

          {/* Real-time Map Feel (Swiggy/Zomato Style) */}
          <div style={{ flex: 1, backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
            {/* SVG Map Container */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* City Grid Background */}
              <rect width="100" height="100" fill="#f8fafc" />
              
              {/* Buildings / Blocks */}
              <rect x="10" y="10" width="15" height="15" rx="2" fill="#e2e8f0" />
              <rect x="35" y="10" width="15" height="15" rx="2" fill="#e2e8f0" />
              <rect x="60" y="10" width="15" height="15" rx="2" fill="#e2e8f0" />
              <rect x="85" y="10" width="5" height="15" rx="2" fill="#e2e8f0" />

              <rect x="10" y="35" width="15" height="15" rx="2" fill="#e2e8f0" />
              <rect x="35" y="35" width="10" height="10" rx="2" fill="#cbd5e1" /> {/* Park Area */}
              <rect x="60" y="35" width="15" height="15" rx="2" fill="#e2e8f0" />
              
              <rect x="10" y="60" width="15" height="15" rx="2" fill="#e2e8f0" />
              <rect x="35" y="60" width="15" height="15" rx="2" fill="#e2e8f0" />
              <rect x="60" y="60" width="15" height="15" rx="2" fill="#e2e8f0" />

              {/* Roads */}
              <path d="M 0 27.5 L 100 27.5" stroke="#fff" strokeWidth="4" />
              <path d="M 0 52.5 L 100 52.5" stroke="#fff" strokeWidth="4" />
              <path d="M 0 77.5 L 100 77.5" stroke="#fff" strokeWidth="4" />
              
              <path d="M 27.5 0 L 27.5 100" stroke="#fff" strokeWidth="4" />
              <path d="M 52.5 0 L 52.5 100" stroke="#fff" strokeWidth="4" />
              <path d="M 77.5 0 L 77.5 100" stroke="#fff" strokeWidth="4" />

              {/* Route Line (Glowing Path) */}
              <path 
                d={routePath} 
                stroke="#60a5fa" 
                strokeWidth="1.5" 
                fill="none" 
                strokeDasharray="2,2"
                style={{ filter: 'drop-shadow(0 0 2px rgba(96,165,250,0.5))' }}
              />
            </svg>

            {/* Restaurant Marker */}
            <motion.div 
              style={{ position: 'absolute', left: '30%', top: '70%', transform: 'translate(-50%, -100%)', zIndex: 10 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#fff', padding: '4px 10px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#1e293b' }}>{order?.restaurantId?.name || 'Restaurant'}</span>
                </div>
                <div style={{ backgroundColor: '#ef4444', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(239,68,68,0.3)' }}>
                  <MapPin size={18} style={{ margin: 'auto' }} fill="currentColor" />
                </div>
              </div>
            </motion.div>

            {/* Home Marker */}
            <motion.div 
              style={{ position: 'absolute', left: '70%', top: '30%', transform: 'translate(-50%, -100%)', zIndex: 10 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#fff', padding: '4px 10px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#1e293b' }}>YOU</span>
                </div>
                <div style={{ backgroundColor: '#3b82f6', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                  <Navigation size={18} style={{ margin: 'auto', transform: 'rotate(45deg)' }} fill="currentColor" />
                </div>
              </div>
            </motion.div>

            {/* Moving Rider */}
            <div style={{ 
              position: 'absolute', 
              left: `${riderPos.x}%`, 
              top: `${riderPos.y}%`, 
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
              transition: 'all 0.1s linear'
            }}>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ 
                  backgroundColor: '#fff', 
                  padding: '8px', 
                  borderRadius: '16px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                  border: '2px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '10px' }}>
                  <Bike size={20} color="#ef4444" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444', lineHeight: 1 }}>RISHI</span>
                  <span style={{ fontSize: '8px', color: '#64748b', fontWeight: '600' }}>ON THE WAY</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Side Panel (Zomato Style) */}
          <div style={{ width: '380px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #f1f5f9' }}>
            {/* Delivery Status Header */}
            <div style={{ padding: '30px', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={24} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Food is on the way!</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Order ID: #{order._id?.slice(-8).toUpperCase()}</p>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Arrival in</span>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', fontVariantNumeric: 'tabular-nums' }}>{eta} MINS</div>
                  </div>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <Clock size={20} color="#ef4444" />
                  </div>
                </div>
                <div style={{ marginTop: '15px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: `${(15-eta)/15 * 100}%` }}
                    style={{ height: '100%', backgroundColor: '#ef4444' }}
                  />
                </div>
              </div>
            </div>

            {/* Rider Profile */}
            <div style={{ padding: '30px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf" 
                    alt="Rider" 
                    style={{ width: '64px', height: '64px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #f1f5f9' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                    4.9 <Star size={10} fill="#f59e0b" color="#f59e0b" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Rishi Kumar</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Your delivery partner</div>
                </div>
              </div>

              {/* Order Items Summary */}
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Order Details</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '5px' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{item.quantity} x {item.name}</span>
                      <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '700' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCall}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(239,68,68,0.2)' }}
                >
                  <Phone size={18} fill="currentColor" /> Call
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChat}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                >
                  <MessageSquare size={18} /> Chat
                </motion.button>
              </div>
            </div>

            {/* Safety Footer */}
              <div style={{ padding: '20px 30px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Rishi is following all safety protocols</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeView === 'call' && (
        <RiderCall 
          riderName="Rishi Kumar" 
          onClose={() => setActiveView('tracking')} 
        />
      )}

      {activeView === 'chat' && (
        <RiderChat 
          riderName="Rishi Kumar" 
          onClose={() => setActiveView('tracking')} 
        />
      )}

      {activeView === 'delivered' && (
        <motion.div 
          key="delivered"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center'
          }}
        >
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ width: '200px', height: '200px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}
          >
            <CheckCircle size={100} color="#10b981" />
          </motion.div>
          
          <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#1e293b', margin: '0 0 10px 0' }}>Order Delivered!</h2>
          <p style={{ fontSize: '18px', color: '#64748b', fontWeight: '600', marginBottom: '40px' }}>Hope you enjoy your delicious meal from {order?.restaurantId?.name}</p>

          <div style={{ display: 'flex', gap: '15px' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              style={{ padding: '18px 40px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(239,68,68,0.2)' }}
            >
              Done
            </motion.button>
          </div>

          <div style={{ marginTop: '50px', borderTop: '1px solid #f1f5f9', paddingTop: '30px', width: '100%', maxWidth: '400px' }}>
            <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '700', marginBottom: '20px' }}>RATE YOUR EXPERIENCE</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={32} fill="#f1f5f9" color="#cbd5e1" style={{ cursor: 'pointer' }} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default LiveTracking;
