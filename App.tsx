
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Shop from './components/Shop';
import AdminPanel from './components/AdminPanel';
import { Product, Order, ViewType } from './types';
import { supabase, saveManualConfig, clearConfig } from './services/supabaseClient';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('shop');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  const isSupabaseConfigured = !!supabase;

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isSupabaseConfigured]);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: productsData } = await supabase.from('products').select('*');
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (productsData) setProducts(productsData);
      if (ordersData) {
        const mappedOrders: Order[] = ordersData.map(o => ({
          id: o.id,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          items: o.items,
          totalPrice: o.total_price,
          status: o.status,
          createdAt: o.created_at
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (newOrder: Order) => {
    if (!supabase) return;
    const { error } = await supabase.from('orders').insert([{
      id: newOrder.id,
      customer_name: newOrder.customerName,
      customer_phone: newOrder.customerPhone,
      items: newOrder.items,
      total_price: newOrder.totalPrice,
      status: newOrder.status,
      created_at: newOrder.createdAt
    }]);

    if (!error) setOrders([newOrder, ...orders]);
    else alert("অর্ডার সেভ করতে সমস্যা হয়েছে।");
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!supabase) return;
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const deleteOrder = async (orderId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (!error) setOrders(orders.filter(o => o.id !== orderId));
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      setCurrentView('admin');
      return true;
    }
    return false;
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[3rem] max-w-xl w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-fade-in">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            
            <h2 className="text-3xl font-black text-gray-800 mb-4">শপ সেটআপ প্রয়োজন</h2>
            <p className="text-gray-500 mb-8 text-sm">
              আপনার সাইটটি চালু করতে সুপাবেস (Supabase) এর সাথে কানেক্ট করতে হবে। আপনি ভার্সেল-এ ভেরিয়েবল সেট করে রি-ডেপ্লয় করতে পারেন অথবা সরাসরি এখানে দিতে পারেন।
            </p>

            {!showManualForm ? (
              <div className="space-y-3">
                <button 
                  onClick={() => setShowManualForm(true)}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg active:scale-95"
                >
                  কি (Key) গুলো সরাসরি ইনপুট দিন
                </button>
                <p className="text-[10px] text-gray-400">অথবা</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-white text-gray-800 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition"
                >
                  ডেপ্লয় শেষ হলে রিফ্রেশ করুন
                </button>
                <button 
                  onClick={clearConfig}
                  className="mt-4 text-[10px] text-red-400 underline hover:text-red-600"
                >
                  সেভ করা ডাটা রিসেট করুন
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); saveManualConfig(manualUrl, manualKey); }} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Supabase URL</label>
                  <input type="text" required value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://xxx.supabase.co" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-orange-500 transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Anon Key</label>
                  <input type="password" required value={manualKey} onChange={(e) => setManualKey(e.target.value)} placeholder="আপনার anon কি-টি দিন" className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-orange-500 transition" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowManualForm(false)} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold text-sm">পিছনে</button>
                  <button type="submit" className="flex-[2] bg-orange-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-orange-700 transition shadow-lg">কানেক্ট করুন</button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentView={currentView} setView={setCurrentView} isAdminLoggedIn={isAdminLoggedIn} onLogout={() => {setIsAdminLoggedIn(false); setCurrentView('shop');}} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            <p className="text-gray-500 animate-pulse font-medium">লোড হচ্ছে...</p>
          </div>
        ) : (
          <>
            {currentView === 'shop' && <Shop products={products} onPlaceOrder={addOrder} />}
            {(currentView === 'admin' || currentView === 'admin_orders') && (
              <AdminPanel view={currentView} setView={setCurrentView} isLoggedIn={isAdminLoggedIn} onLogin={handleAdminLogin} products={products} orders={orders} setProducts={setProducts} onUpdateOrderStatus={updateOrderStatus} onDeleteOrder={deleteOrder} refreshData={fetchData} />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
