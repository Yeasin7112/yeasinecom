
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- API Service (Local PHP Backend) ---
const API_URL = 'api.php';
const apiService = {
  async request(route, method = 'GET', body = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(`${API_URL}?route=${route}`, options);
    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'API request failed');
    }
    return response.json();
  },
  getProducts: () => apiService.request('products'),
  getOrders: () => apiService.request('orders'),
  addProduct: (product) => apiService.request('add_product', 'POST', product),
  deleteProduct: (id) => apiService.request('delete_product', 'POST', { id }),
  placeOrder: (order) => apiService.request('place_order', 'POST', order),
  updateOrderStatus: (id, status) => apiService.request('update_order_status', 'POST', { id, status }),
  deleteOrder: (id) => apiService.request('delete_order', 'POST', { id }),
};

// --- Gemini AI Service ---
const generateAIDescription = async (name) => {
  const key = window.APP_CONFIG?.API_KEY;
  if (!key) return "চমৎকার একটি পণ্য।";
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `পণ্য: "${name}"। এই পণ্যের জন্য ২ বাক্যের একটি আকর্ষণীয় বাংলা বিবরণ লিখুন।`,
    });
    return res.text || "চমৎকার একটি পণ্য।";
  } catch (e) {
    return "বিবরণ তৈরিতে সমস্যা হয়েছে।";
  }
};

// --- UI Components ---

const Header = ({ currentView, setView, isLoggedIn, onLogout }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="text-2xl font-black text-orange-600 cursor-pointer flex items-center gap-2" 
        onClick={() => setView('shop')}
      >
        <div className="bg-orange-600 p-1.5 rounded-lg text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <span>Yeasin<span className="text-slate-900">Ecom</span></span>
      </div>
      <nav className="flex items-center gap-2">
        <button onClick={() => setView('shop')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${currentView === 'shop' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-100'}`}>শপ</button>
        {isLoggedIn ? (
          <>
            <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${currentView === 'admin' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-100'}`}>অ্যাডমিন</button>
            <button onClick={onLogout} className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-bold ml-2">লগআউট</button>
          </>
        ) : (
          <button onClick={() => setView('admin')} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition">অ্যাডমিন</button>
        )}
      </nav>
    </div>
  </header>
);

const Shop = ({ products, onOrder }) => {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert("সব তথ্য দিন");
    setBusy(true);
    const order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerName: form.name,
      customerPhone: form.phone,
      items: [{ productId: selected.id, productName: selected.name, price: selected.price, quantity: 1 }],
      totalPrice: selected.price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    try {
      await onOrder(order);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setSelected(null); }, 3000);
      setForm({ name: '', phone: '' });
    } catch (e) { alert("অর্ডার ব্যর্থ হয়েছে!"); }
    setBusy(false);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto py-10">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4 text-slate-900 tracking-tight">আপনার পছন্দের পণ্য <span className="text-orange-600">খুঁজুন</span> ✨</h1>
        <p className="text-slate-500 text-lg">সেরা মানের পণ্য এবং দ্রুত ডেলিভারির নিশ্চয়তা।</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold">বর্তমানে কোনো পণ্য নেই। অ্যাডমিন প্যানেল থেকে পণ্য যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-5 bg-slate-100">
                 <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
              </div>
              <h3 className="font-bold text-lg mb-1 px-2">{p.name}</h3>
              <p className="text-slate-400 text-sm mb-4 px-2 line-clamp-1">{p.description}</p>
              <div className="flex items-center justify-between px-2 pb-2">
                 <span className="text-xl font-black text-orange-600">৳{p.price}</span>
                 <button onClick={() => setSelected(p)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition shadow-lg shadow-slate-200">অর্ডার দিন</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full relative shadow-2xl border border-slate-100">
            <button onClick={() => setSelected(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition">✕</button>
            {success ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                <h2 className="text-3xl font-bold mb-2">ধন্যবাদ!</h2>
                <p className="text-slate-500">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">অর্ডার নিশ্চিত করুন</h2>
                <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex items-center gap-4 border border-slate-100">
                  <img src={selected.image} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-base">{selected.name}</p>
                    <p className="text-orange-600 font-black text-lg">৳{selected.price}</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">আপনার নাম</label>
                    <input type="text" placeholder="পুরো নাম লিখুন" required className="w-full p-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">মোবাইল নম্বর</label>
                    <input type="tel" placeholder="017XXXXXXXX" required className="w-full p-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <button type="submit" disabled={busy} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-700 transition active:scale-95 disabled:opacity-50">
                    {busy ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Admin = ({ products, orders, onRefresh, setView, activeView }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newP, setNewP] = useState({ name: '', price: '', image: '', description: '', category: 'General' });
  const [busy, setBusy] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newP.name || !newP.price || !newP.image) return alert("তথ্য পূরণ করুন");
    setBusy(true);
    try {
      await apiService.addProduct({ ...newP, id: Date.now().toString() });
      setIsAdding(false);
      setNewP({ name: '', price: '', image: '', description: '', category: 'General' });
      onRefresh();
    } catch (e) { alert("ব্যর্থ হয়েছে!"); }
    setBusy(false);
  };

  const handleAI = async () => {
    if (!newP.name) return alert("আগে পণ্যের নাম লিখুন");
    setAiLoading(true);
    const desc = await generateAIDescription(newP.name);
    setNewP({...newP, description: desc});
    setAiLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-black text-slate-900">অ্যাডমিন ড্যাশবোর্ড</h2>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
           <button onClick={() => setView('admin')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition ${activeView === 'admin' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>পণ্যসমূহ</button>
           <button onClick={() => setView('admin_orders')} className={`px-8 py-2.5 rounded-xl text-sm font-bold transition ${activeView === 'admin_orders' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>অর্ডারসমূহ</button>
        </div>
      </div>

      {activeView === 'admin' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">পণ্য তালিকা ({products.length})</h3>
            <button onClick={() => setIsAdding(true)} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition">+ নতুন পণ্য</button>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-xs font-black uppercase text-slate-400">পণ্য</th>
                  <th className="p-6 text-xs font-black uppercase text-slate-400">মূল্য</th>
                  <th className="p-6 text-xs font-black uppercase text-slate-400 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-6 flex items-center gap-4">
                      <img src={p.image} className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
                      <span className="font-bold text-slate-800">{p.name}</span>
                    </td>
                    <td className="p-6 font-black text-orange-600">৳{p.price}</td>
                    <td className="p-6 text-right">
                      <button onClick={async () => { if(confirm('ডিলিট করবেন?')) { await apiService.deleteProduct(p.id); onRefresh(); } }} className="text-red-500 hover:bg-red-50 px-5 py-2 rounded-xl text-sm font-bold transition">মুছুন</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">এখনো কোনো অর্ডার আসেনি।</p>
            </div>
          ) : (
            orders.map(o => (
              <div key={o.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:border-orange-200 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block">ID: #{o.id}</span>
                    <h3 className="font-black text-2xl text-slate-900">{o.customer_name}</h3>
                    <p className="text-slate-500 font-bold mt-1">📞 {o.customer_phone}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${o.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    {o.status === 'pending' ? 'পেন্ডিং' : 'সম্পন্ন'}
                  </span>
                </div>
                <div className="border-t border-slate-50 pt-6 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-2">অর্ডারকৃত পণ্য:</p>
                    {o.items.map((item, i) => (
                      <p key={i} className="text-sm font-bold text-slate-700">{item.productName} (x{item.quantity})</p>
                    ))}
                    <p className="text-3xl font-black text-orange-600 mt-4">৳{o.total_price}</p>
                  </div>
                  <div className="flex gap-3">
                     {o.status === 'pending' && <button onClick={async () => { await apiService.updateOrderStatus(o.id, 'completed'); onRefresh(); }} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">সম্পন্ন</button>}
                     <button onClick={async () => { if(confirm('অর্ডারটি মুছবেন?')) { await apiService.deleteOrder(o.id); onRefresh(); } }} className="bg-red-50 text-red-500 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition">মুছুন</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <form onSubmit={handleAdd} className="bg-white p-10 rounded-[2.5rem] max-w-md w-full space-y-5 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">নতুন পণ্য যোগ করুন</h2>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">পণ্যের নাম</label>
              <input type="text" placeholder="যেমন: প্রিমিয়াম টি-শার্ট" required className="w-full p-4 bg-slate-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={newP.name} onChange={e => setNewP({...newP, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">মূল্য (৳)</label>
              <input type="number" placeholder="যেমন: ৯৯৯" required className="w-full p-4 bg-slate-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={newP.price} onChange={e => setNewP({...newP, price: e.target.value})} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-bold text-slate-400">বিবরণ (Description)</label>
                <button type="button" onClick={handleAI} disabled={aiLoading} className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-1 rounded-lg hover:bg-orange-100">
                  {aiLoading ? 'লিখছে...' : 'AI দিয়ে লিখুন ✨'}
                </button>
              </div>
              <textarea placeholder="পণ্যের সংক্ষিপ্ত বর্ণনা..." rows="3" className="w-full p-4 bg-slate-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={newP.description} onChange={e => setNewP({...newP, description: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 ml-1">ছবির লিঙ্ক (URL)</label>
              <input type="text" placeholder="https://..." required className="w-full p-4 bg-slate-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" value={newP.image} onChange={e => setNewP({...newP, image: e.target.value})} />
            </div>
            <div className="pt-6 flex flex-col gap-3">
              <button type="submit" disabled={busy} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-100 hover:bg-slate-800 transition">
                {busy ? 'লোডিং...' : 'পণ্য সেভ করুন'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600">বাতিল</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const p = await apiService.getProducts();
      const o = await apiService.getOrders();
      setProducts(p || []);
      setOrders(o || []);
    } catch (e) { console.error("Data Load Error:", e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const pass = e.target.password.value;
    if (pass === 'admin123') { setIsLogged(true); setView('admin'); }
    else alert('ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
      <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-orange-600 font-black text-xl animate-pulse">লোড হচ্ছে... দয়া করে অপেক্ষা করুন</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-100 selection:text-orange-600">
      <Header currentView={view} setView={setView} isLoggedIn={isLogged} onLogout={() => { setIsLogged(false); setView('shop'); }} />
      <main className="flex-grow container mx-auto px-4">
        {view === 'shop' && <Shop products={products} onOrder={async (o) => { await apiService.placeOrder(o); load(); }} />}
        {(view === 'admin' || view === 'admin_orders') && (
          isLogged ? (
            <Admin products={products} orders={orders} onRefresh={load} setView={setView} activeView={view} />
          ) : (
            <div className="max-w-md mx-auto mt-24 animate-fade-in">
               <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <h2 className="text-3xl font-black mb-8 text-slate-900">অ্যাডমিন প্রবেশ</h2>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <input name="password" type="password" placeholder="পাসওয়ার্ড লিখুন" required className="w-full p-5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-center font-bold tracking-widest" />
                    <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-slate-100 hover:bg-orange-600 transition duration-300">লগইন করুন</button>
                  </form>
               </div>
            </div>
          )
        )}
      </main>
      <footer className="bg-white border-t border-slate-100 py-12 text-center mt-20">
        <p className="text-slate-400 font-bold">© ২০২৪ Yeasin Ecom। সর্বস্বত্ব সংরক্ষিত।</p>
        <p className="text-slate-300 text-xs mt-2 uppercase tracking-widest font-black">Built with Passion</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
