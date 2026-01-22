
import React, { useState } from 'react';
import { Product, Order, ViewType } from '../types';
import { generateProductDescription } from '../services/geminiService';
import { apiService } from '../services/apiService';

interface AdminPanelProps {
  view: ViewType;
  setView: (view: ViewType) => void;
  isLoggedIn: boolean;
  onLogin: (password: string) => boolean;
  products: Product[];
  orders: Order[];
  setProducts: (products: Product[]) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  refreshData: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  view, 
  setView, 
  isLoggedIn, 
  onLogin, 
  products, 
  orders, 
  onUpdateOrderStatus,
  onDeleteOrder,
  refreshData
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalRevenue = orders.reduce((sum, o) => o.status === 'completed' ? sum + Number(o.totalPrice) : sum, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError('');
    } else {
      setError('ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);

    try {
      const productToSave: Product = {
        id: editingProduct.id || Math.random().toString(36).substr(2, 9),
        name: editingProduct.name || '',
        price: editingProduct.price || 0,
        image: editingProduct.image || 'https://via.placeholder.com/400',
        description: editingProduct.description || '',
        category: editingProduct.category || 'General'
      };

      await apiService.addProduct(productToSave);
      refreshData();
      setEditingProduct(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!editingProduct?.name) {
      alert('প্রথমে প্রোডাক্টের নাম লিখুন।');
      return;
    }
    setIsAiLoading(true);
    const desc = await generateProductDescription(editingProduct.name);
    setEditingProduct(prev => ({ ...prev, description: desc }));
    setIsAiLoading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছতে চান?')) {
      try {
        await apiService.deleteProduct(id);
        refreshData();
      } catch (err) {
        alert("ডিলিট করতে সমস্যা হয়েছে।");
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">অ্যাডমিন কন্ট্রোল</h2>
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">পাসওয়ার্ড লিখুন</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 outline-none"
              placeholder="পাসওয়ার্ড দিন"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-gray-800 transition shadow-lg"
          >
            লগইন করুন
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-bold uppercase mb-1">মোট বিক্রয়</p>
          <p className="text-3xl font-black text-green-600">৳{totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-bold uppercase mb-1">পেন্ডিং অর্ডার</p>
          <p className="text-3xl font-black text-orange-500">{pendingCount}টি</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm font-bold uppercase mb-1">মোট প্রোডাক্ট</p>
          <p className="text-3xl font-black text-gray-800">{products.length}টি</p>
        </div>
      </div>

      {view === 'admin' ? (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-gray-800">প্রোডাক্ট ম্যানেজমেন্ট</h2>
            <button 
              onClick={() => setEditingProduct({ name: '', price: 0, image: 'https://via.placeholder.com/400', description: '', category: 'General' })}
              className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg shadow-orange-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              নতুন প্রোডাক্ট যুক্ত করুন
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-5">ছবি</th>
                    <th className="px-6 py-5">নাম</th>
                    <th className="px-6 py-5">দাম</th>
                    <th className="px-6 py-5">ক্যাটাগরি</th>
                    <th className="px-6 py-5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <img src={product.image} className="w-14 h-14 rounded-2xl object-cover border border-gray-100" />
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{product.name}</td>
                      <td className="px-6 py-4 text-orange-600 font-black">৳{product.price}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition">এডিট</button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition">ডিলিট</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-3xl font-black text-gray-800 mb-8">কাস্টমার অর্ডারসমূহ</h2>
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">এখনো কোনো অর্ডার আসেনি</p>
              </div>
            ) : (
              orders.map(order => {
                const cName = order.customerName;
                const cPhone = order.customerPhone;
                const totalPrice = order.totalPrice;

                return (
                  <div key={order.id} className={`bg-white p-8 rounded-3xl border-2 transition shadow-sm ${order.status === 'completed' ? 'border-green-100 opacity-75' : 'border-gray-100'}`}>
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs font-black">#{order.id}</span>
                          <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                            order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                            order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order.status === 'pending' ? 'পেন্ডিং' : order.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{cName}</h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                          <span className="font-black text-lg">{cPhone}</span>
                        </p>
                        <p className="text-gray-400 text-xs font-bold">{new Date(order.createdAt).toLocaleString('bn-BD', { dateStyle: 'full', timeStyle: 'short' })}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-2xl flex-grow lg:max-w-md">
                        <p className="text-xs font-black text-gray-400 uppercase mb-3">অর্ডার তালিকা</p>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-800">{item.productName}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                          <span className="font-black text-gray-900">মোট মূল্য:</span>
                          <span className="text-2xl font-black text-orange-600">৳{totalPrice}</span>
                        </div>
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                            className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-green-700 transition grow text-sm"
                          >
                            সম্পন্ন করুন
                          </button>
                        )}
                        <button 
                          onClick={() => { if(confirm('ডিলিট করবেন?')) onDeleteOrder(order.id) }}
                          className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-100 transition grow text-sm"
                        >
                          মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-3xl font-black mb-8 text-gray-800">
              {editingProduct.id ? 'প্রোডাক্ট এডিট' : 'নতুন প্রোডাক্ট'}
            </h2>
            
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">প্রোডাক্টের নাম</label>
                  <input 
                    type="text" required value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">দাম (৳)</label>
                    <input 
                      type="number" required value={editingProduct.price || 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ক্যাটাগরি</label>
                    <input 
                      type="text" required value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ছবির লিঙ্ক</label>
                  <input 
                    type="text" required value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div className="space-y-6 flex flex-col">
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-gray-700">পণ্যের বিবরণ</label>
                    <button 
                      type="button" onClick={handleGenerateAiDescription} disabled={isAiLoading}
                      className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 font-bold transition flex items-center gap-1"
                    >
                      {isAiLoading ? 'AI লিখছে...' : 'AI দিয়ে লিখুন ✨'}
                    </button>
                  </div>
                  <textarea 
                    rows={6} required value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-5 py-3 border border-gray-200 rounded-xl outline-none h-40 resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-700 transition shadow-xl shadow-orange-100 disabled:opacity-50"
                >
                  {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
