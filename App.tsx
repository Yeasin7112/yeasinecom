
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Shop from './components/Shop';
import AdminPanel from './components/AdminPanel';
import { Product, Order, ViewType } from './types';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('shop');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header currentView={currentView} setView={setCurrentView} isAdminLoggedIn={isAdminLoggedIn} onLogout={() => {setIsAdminLoggedIn(false); setCurrentView('shop');}} />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-[3rem] max-w-2xl text-center shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-6">সেটআপ এখনও সম্পন্ন হয়নি!</h2>
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl mb-8 text-left">
              <p className="text-red-700 font-bold mb-3 flex items-center gap-2">
                <span className="bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>
                সবচেয়ে গুরুত্বপূর্ণ ধাপ:
              </p>
              <p className="text-red-600 text-sm leading-relaxed mb-4">
                আপনি ভার্সেল ড্যাশবোর্ডে ভেরিয়েবলগুলো যোগ করেছেন, কিন্তু সাইটটি এখনও সেগুলো চিনতে পারছে না। এটি ঠিক করতে আপনাকে <b>Redeploy</b> করতে হবে।
              </p>
              <ol className="text-xs text-red-800 space-y-2 list-decimal ml-4">
                <li>Vercel ড্যাশবোর্ডে আপনার প্রোজেক্টে যান।</li>
                <li><b>Deployments</b> ট্যাবে ক্লিক করুন।</li>
                <li>সর্বশেষ ডেপ্লয়মেন্টের পাশে তিনটি ডট (...) ক্লিক করে <b>Redeploy</b> সিলেক্ট করুন।</li>
              </ol>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl active:scale-95"
            >
              রি-ডেপ্লয় শেষ হলে এখানে ক্লিক করুন
            </button>
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
