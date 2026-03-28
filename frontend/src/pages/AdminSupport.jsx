import { useState, useEffect } from 'react';
import { supportService } from '../services/apiService';
import { Button } from '../components/common/Button';
import { 
  MessageSquare, Clock, CheckCircle2, AlertCircle, 
  Send, X, Search, Filter, MessageCircle, User, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

import { AdminLayout } from '../components/admin/AdminLayout';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportService.getAllTickets();
      setTickets(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      await supportService.updateTicket(ticketId, updateData);
      toast.success('Ticket updated successfully');
      setSelectedTicket(null);
      setReplyText('');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update ticket');
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

  const filteredTickets = tickets.filter(t => 
    (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || t.status === statusFilter)
  );

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto pb-20 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-800 italic tracking-tight mb-2">Support <span className="text-primary">Tickets</span></h1>
            <p className="text-gray-500 font-medium italic">Manage user queries and technical issues.</p>
          </div>
        </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by subject or user name..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-primary outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-bold italic text-xl">No tickets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket._id} 
              className={`bg-white p-8 rounded-[32px] border border-gray-50 shadow-xl card-hover relative group ${ticket.status === 'open' ? 'ring-2 ring-primary/5' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">#{ticket._id.slice(-6)}</span>
              </div>

              <h3 className="text-xl font-black text-gray-800 mb-4 line-clamp-1 italic">{ticket.subject}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                  <User className="w-4 h-4 text-primary" /> {ticket.name}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Mail className="w-4 h-4" /> {ticket.email}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex gap-3">
                <Button 
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex-grow rounded-xl font-bold uppercase tracking-widest text-[10px] py-3"
                >
                  View & Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-8">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 inline-block ${getStatusStyle(selectedTicket.status)}`}>
                {selectedTicket.status}
              </span>
              <h2 className="text-3xl font-black text-gray-800 italic tracking-tight">{selectedTicket.subject}</h2>
              <p className="text-gray-500 font-medium mt-4 bg-gray-50 p-6 rounded-2xl italic border border-gray-100">
                "{selectedTicket.message}"
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Change Status</label>
                <div className="flex gap-2">
                  {['open', 'in-progress', 'resolved'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdateTicket(selectedTicket._id, { status: s })}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        selectedTicket.status === s 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                          : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Your Reply</label>
                <textarea 
                  rows="4"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium resize-none"
                  placeholder="Type your response to the user..."
                  value={replyText || selectedTicket.reply}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <Button 
                onClick={() => handleUpdateTicket(selectedTicket._id, { reply: replyText })}
                className="w-full py-5 rounded-2xl shadow-xl shadow-primary/20 font-black italic text-lg tracking-tight"
              >
                Send Reply <Send className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;























































































































































































































































































































































