import { useState, useEffect } from 'react';
import { notificationService } from '../services/apiService';
import { Bell, CheckCircle2, Trash2, Clock, Info, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.get();
      setNotifications(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-fadeIn px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-gray-800 italic tracking-tight">Notifications</h1>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
            {notifications.filter(n => !n.read).length} New
          </span>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={fetchNotifications}
            className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center shadow-xl border border-gray-50">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-12 h-12 text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 italic mb-2">No notifications yet</h2>
          <p className="text-gray-500 max-w-xs mx-auto italic">We'll notify you when something important happens.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`bg-white p-6 rounded-[32px] border transition-all flex gap-6 group relative ${
                notif.read ? 'border-gray-50 opacity-75' : 'border-primary/10 shadow-lg shadow-primary/5 ring-1 ring-primary/5'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                notif.read ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'
              }`}>
                {notif.type === 'order' ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
              </div>

              <div className="flex-grow pr-8">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-black italic tracking-tight ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm font-medium leading-relaxed ${notif.read ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notif.message}
                </p>
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.read && (
                  <button 
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(notif._id)}
                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
