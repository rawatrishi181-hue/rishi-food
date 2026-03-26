import { useState, useEffect } from 'react';
import { couponService } from '../services/apiService';
import toast from 'react-hot-toast';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Plus, Edit2, Trash2, Calendar, Percent, DollarSign, Tag } from 'lucide-react';
import { Button } from '../components/common/Button';

const dummyCoupons = [
  { code: 'RISHIFREE10', discountType: 'percentage', discountValue: 10, minOrderAmount: 250, maxDiscount: 100, expiryDate: '2026-04-30', isActive: true },
  { code: 'WELCOME50', discountType: 'fixed', discountValue: 50, minOrderAmount: 350, expiryDate: '2026-05-31', isActive: true },
  { code: 'WEEKEND30', discountType: 'percentage', discountValue: 30, minOrderAmount: 500, maxDiscount: 150, expiryDate: '2026-06-15', isActive: true },
];

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', expiryDate: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponService.getAll();
      const data = response?.data?.data || response?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setCoupons(data);
      } else {
        setCoupons(dummyCoupons);
      }
    } catch (error) {
      setCoupons(dummyCoupons);
      toast.error('Failed to fetch coupons, showing sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiryDate: new Date(form.expiryDate),
        isActive: true,
      };

      await couponService.create(payload);
      toast.success('Coupon created successfully');
      setShowModal(false);
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', expiryDate: '' });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create coupon');
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-800 italic tracking-tight mb-2">Manage <span className="text-primary">Coupons</span></h1>
            <p className="text-gray-500 font-medium italic">Create, activate and review coupon campaigns for customers.</p>
          </div>
          <Button className="gap-2 px-8 py-4 rounded-2xl shadow-xl shadow-primary/20" onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5" /> Add Coupon
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon.code} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-black uppercase tracking-wider text-lg text-gray-900">{coupon.code}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-black ${coupon.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}</div>
                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Min ₹{coupon.minOrderAmount || 0}</div>
                  {coupon.discountType === 'percentage' && coupon.maxDiscount ? (
                    <div className="flex items-center gap-2"><Percent className="w-4 h-4" /> Max ₹{coupon.maxDiscount}</div>
                  ) : null}
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Expires on {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 font-black text-sm hover:bg-blue-100">Edit <Edit2 className="w-4 h-4 inline" /></button>
                  <button className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100">Delete <Trash2 className="w-4 h-4 inline" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-800">Create New Coupon</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 font-black text-xl">×</button>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddCoupon}>
                <label className="text-sm font-black uppercase tracking-widest text-gray-600">Coupon Code
                  <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="ENTERCODE" />
                </label>

                <label className="text-sm font-black uppercase tracking-widest text-gray-600">Discount Type
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </label>

                <label className="text-sm font-black uppercase tracking-widest text-gray-600">Discount Value
                  <input required value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} type="number" min="1" className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="10" />
                </label>

                <label className="text-sm font-black uppercase tracking-widest text-gray-600">Min Order Amount
                  <input required value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} type="number" min="0" className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="100" />
                </label>

                <label className="text-sm font-black uppercase tracking-widest text-gray-600">Max Discount (optional)
                  <input value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} type="number" min="0" className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="100" />
                </label>

                <label className="text-sm font-black uppercase tracking-widest text-gray-600">Expiry Date
                  <input required value={form.expiryDate} min={todayDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} type="date" className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200" />
                </label>

                <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                  <Button type="submit" className="flex-1 py-3 rounded-xl">
                    Save Coupon
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
