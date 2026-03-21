import { useState, useEffect } from 'react';
import { supportService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { 
  HelpCircle, MessageCircle, Phone, Mail, Send, 
  ChevronDown, ChevronUp, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, ShieldQuestion
} from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('faq'); // 'faq', 'tickets', 'contact'
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const faqRes = await supportService.getFAQs();
      setFaqs(faqRes.data || []);
      
      if (user) {
        const ticketRes = await supportService.getMyTickets();
        setTickets(ticketRes.data || []);
      }
    } catch (error) {
      console.error('Support data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to raise a ticket');
    
    try {
      setLoading(true);
      await supportService.createTicket({
        ...ticketForm,
        name: user.name,
        email: user.email
      });
      toast.success('Ticket raised successfully!');
      setTicketForm({ subject: '', message: '' });
      const ticketRes = await supportService.getMyTickets();
      setTickets(ticketRes.data || []);
      setActiveTab('tickets');
    } catch (error) {
      toast.error('Failed to raise ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'in-progress': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'resolved': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading && faqs.length === 0) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fadeIn px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-gray-800 italic tracking-tight mb-4">
          Help & <span className="text-primary">Support</span>
        </h1>
        <p className="text-gray-500 font-medium italic text-lg">
          We're here to help you with anything you need.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-12 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'faq', icon: <HelpCircle className="w-5 h-5" />, label: 'FAQs' },
          { id: 'tickets', icon: <MessageSquare className="w-5 h-5" />, label: 'My Tickets' },
          { id: 'contact', icon: <Phone className="w-5 h-5" />, label: 'Contact Us' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black italic tracking-tight transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* FAQ Content */}
      {activeTab === 'faq' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200 shadow-sm">
              <ShieldQuestion className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold italic text-xl tracking-tight">No FAQs available at the moment.</p>
            </div>
          ) : (
            faqs.map((faq, index) => (
              <div key={faq._id} className="bg-white rounded-[40px] border border-gray-50 shadow-xl overflow-hidden group flex flex-col card-hover">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={faq.image || `https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=500&q=80`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={faq.question} 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl font-black text-[10px] text-primary shadow-lg uppercase tracking-widest">
                    {faq.category || 'General'}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-black text-gray-800 italic tracking-tight mb-4 leading-tight group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <p className="text-gray-500 font-medium italic text-sm leading-relaxed mb-6 flex-grow">
                    {faq.answer}
                  </p>
                  
                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Helpful Resource</span>
                    <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tickets Content */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Ticket Form */}
          <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 h-fit">
            <h3 className="text-2xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              Raise a Ticket
            </h3>
            <form onSubmit={handleTicketSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Subject</label>
                <input 
                  required
                  className="w-full px-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium"
                  placeholder="What's the issue?"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Message</label>
                <textarea 
                  required
                  rows="4"
                  className="w-full px-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium resize-none"
                  placeholder="Describe your problem in detail..."
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                />
              </div>
              <Button type="submit" loading={loading} className="w-full py-4 rounded-2xl shadow-xl shadow-primary/20 font-black italic text-lg tracking-tight">
                Submit Ticket <Send className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>

          {/* Ticket List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-gray-800 mb-8 italic flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              Recent History
            </h3>
            {tickets.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold italic text-sm">No tickets raised yet.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket._id} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm card-hover">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-gray-800 line-clamp-1">{ticket.subject}</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ticket.message}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>ID: #{ticket._id.slice(-6)}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ticket.reply && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-xs text-primary font-bold italic mb-1">Admin Reply:</p>
                      <p className="text-sm text-gray-700 italic">{ticket.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contact Content */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ContactCard 
            icon={<Phone className="w-8 h-8 text-blue-500" />}
            title="Call Us"
            value="+91 70672 63151"
            link="tel:+917067263151"
            color="blue"
          />
          <ContactCard 
            icon={<Mail className="w-8 h-8 text-primary" />}
            title="Email Us"
            value="rawatrishi181@gmail.com"
            link="mailto:rawatrishi181@gmail.com"
            color="red"
          />
          <ContactCard 
            icon={<MessageCircle className="w-8 h-8 text-green-500" />}
            title="WhatsApp"
            value="Chat with us"
            link="https://wa.me/919876543210"
            color="green"
          />
        </div>
      )}
    </div>
  );
};

const ContactCard = ({ icon, title, value, link, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-100',
    red: 'bg-red-50 border-red-100',
    green: 'bg-green-50 border-green-100'
  };

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={`bg-white p-10 rounded-[40px] border border-gray-50 shadow-xl card-hover text-center group`}>
      <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 ${colors[color]}`}>
        {icon}
      </div>
      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{title}</h4>
      <p className="text-xl font-black text-gray-800 italic tracking-tight">{value}</p>
    </a>
  );
};

export default Support;
