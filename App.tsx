
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Shop from './components/Shop';
import AdminPanel from './components/AdminPanel';
import { Product, Order, ViewType } from './types';
import { supabase, saveManualConfig } from './services/supabaseClient';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('shop');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Manual Config States
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
      const { data: productsData, error: pError } = await supabase
        .from('products')
        .select('*');
      
      const { data: ordersData, error: oError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

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
      console.error("Error fetching from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  const addOrder = async (newOrder: Order) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('orders')
      .insert([{
        id: newOrder.id,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        items: newOrder.items,
        total_price: newOrder.totalPrice,
        status: newOrder.status,
        created_at: newOrder.createdAt
      }]);

    if (!error) {
      setOrders([newOrder, ...orders]);
    } else {
      alert("অর্ডার সেভ করতে সমস্যা হয়েছে।");
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAdminLoggedIn(true);
      setCurrentView('admin');
      return true;
    }
    return false;
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl && manualKey) {
      saveManualConfig(manualUrl, manualKey);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header currentView={currentView} setView={setCurrentView} isAdminLoggedIn={isAdminLoggedIn} onLogout={() => {setIsAdminLoggedIn(false); setCurrentView('shop');}} />
        <main className="flex-grow flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] max-w-xl w-full text-center shadow-2xl border border-gray-100 animate-fade-in">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-black text-gray-800 mb-4">সেটআপ কাজ করছে না?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              আপনি ভার্সেল-এ ভেরিয়েবল সেট করেছেন, কিন্তু ব্রাউজার সেগুলো পাচ্ছে না। এটি সাধারণত ঘটে যদি আপনি ভেরিয়েবল যোগ করার পর <b>Redeploy</b> না করেন।
            </p>

            {!showManualForm ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-left mb-6">
                  <h4 className="font-bold text-blue-800 mb-2">সমাধান ১ (প্রস্তাবিত):</h4>
                  <p className="text-sm text-blue-700">Vercel ড্যাশবোর্ডে গিয়ে <b>Deployments</b> ট্যাবে যান এবং সর্বশেষ ডেপ্লয়মেন্টের পাশে <b>Redeploy</b> বাটনে ক্লিক করুন।</p>
                </div>
                
                <button 
                  onClick={() => setShowManualForm(true)}
                  className="w-full bg-white text-gray-800 py-4 rounded-2xl font-bold border-2 border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition"
                >
                  অথবা ম্যানুয়ালি কি (Key) ইনপুট দিন
                </button>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-lg"
                >
                  রি-ডেপ্লয় শেষ হলে পেজ রিফ্রেশ করুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleManualSave} className="space-y-4 text-left animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Supabase URL</label>
                  <input 
                    type="text" 
                    required 
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://xxx.supabase.co"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Supabase Anon Key</label>
                  <input 
                    type="password" 
                    required 
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="আপনার লম্বা anon কি-টি পেস্ট করুন"
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                  >
                    পিছনে যান
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-100"
                  >
                    সেভ ও কানেক্ট করুন
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-4">
                  *এটি আপনার ব্রাউজারের LocalStorage-এ সেভ থাকবে।
                </p>
              </form>
            )}
          </div>
        </main>
        <Footer />
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
            <p className="text-gray-500 animate-pulse font-medium">আপনার শপ লোড হচ্ছে...</p>
          </div>
        ) : (
          <>
            {currentView === 'shop' && <Shop products={products} onPlaceOrder={addOrder} />}
            {(currentView === 'admin' || currentView === 'admin_orders') && (
              <AdminPanel view={currentView} setView={setCurrentView} isLoggedIn={isAdminLoggedIn} onLogin={handleAdminLogin} products={products} orders={orders} setProducts={handleUpdateProducts} onUpdateOrderStatus={updateOrderStatus} onDeleteOrder={deleteOrder} refreshData={fetchData} />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
