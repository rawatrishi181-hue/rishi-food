import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, ChevronLeft, Phone, MoreVertical, CheckCheck, Smile, Paperclip } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const RiderChat = ({ riderName = "Rishi Kumar", onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm at the restaurant picking up your order.", sender: 'rider', time: '1:12 PM' },
    { id: 2, text: "Okay, thanks for the update!", sender: 'user', time: '1:13 PM' },
    { id: 3, text: "Traffic is a bit heavy, but I'll be there as soon as possible.", sender: 'rider', time: '1:15 PM' },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate Rider Reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Got it! Almost there.",
        sender: 'rider',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px' }}>
            <ChevronLeft size={24} color="#1e293b" />
          </button>
          <div style={{ position: 'relative' }}>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf" 
              alt="Rider" 
              style={{ width: '45px', height: '45px', borderRadius: '15px', border: '2px solid #f1f5f9' }} 
            />
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}></div>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{riderName}</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#10b981', fontWeight: '700' }}>Active Now</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '15px', color: '#64748b' }}>
          <Phone size={20} style={{ cursor: 'pointer' }} />
          <MoreVertical size={20} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              backgroundColor: msg.sender === 'user' ? '#ef4444' : '#fff',
              color: msg.sender === 'user' ? '#fff' : '#1e293b',
              padding: '12px 18px',
              borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              fontSize: '14px',
              fontWeight: '600',
              lineHeight: '1.5',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              border: msg.sender === 'user' ? 'none' : '1px solid #f1f5f9'
            }}>
              {msg.text}
            </div>
            <div style={{ 
              marginTop: '5px', 
              fontSize: '10px', 
              color: '#94a3b8', 
              fontWeight: '700', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px' 
            }}>
              {msg.time} {msg.sender === 'user' && <CheckCheck size={12} color="#3b82f6" />}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', gap: '15px', color: '#94a3b8' }}>
          <Smile size={24} style={{ cursor: 'pointer' }} />
          <Paperclip size={24} style={{ cursor: 'pointer' }} />
        </div>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 20px',
            borderRadius: '15px',
            backgroundColor: '#f1f5f9',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            outline: 'none',
            color: '#1e293b'
          }}
        />
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '15px',
            backgroundColor: inputText.trim() ? '#ef4444' : '#f1f5f9',
            color: inputText.trim() ? '#fff' : '#94a3b8',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Send size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RiderChat;