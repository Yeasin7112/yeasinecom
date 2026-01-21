
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
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
            <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-6">কনফিগারেশন সেটআপ প্রয়োজন</h2>
            <div className="space-y-4 text-left bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
              <p className="text-gray-700 font-medium">আপনার সাইটটি চালু করতে ভার্সেল (Vercel)-এ নিচের কি (Key) গুলো যোগ করুন:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <code className="bg-white px-2 py-1 rounded border text-sm font-mono flex-grow">SUPABASE_URL</code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <code className="bg-white px-2 py-1 rounded border text-sm font-mono flex-grow">SUPABASE_ANON_KEY</code>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">(এটি "anon" "public" কি)</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              ভেরিয়েবলগুলো যোগ করার পর প্রোজেক্টটি <b>Redeploy</b> করতে ভুলবেন না।
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl"
            >
              সেটআপ শেষ হলে রিলোড দিন
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
            <p className="text-gray-500 animate-pulse font-medium">ডাটা লোড হচ্ছে...</p>
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
