
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
          <div className="bg-red-50 border border-red-200 p-10 rounded-[2.5rem] max-w-xl text-center shadow-2xl animate-fade-in">
            <div className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-red-800 mb-4">Supabase কানেকশন নেই</h2>
            <p className="text-red-700 mb-8 leading-relaxed text-lg">
              আপনার ভার্সেল (Vercel) ড্যাশবোর্ডে এনভায়রনমেন্ট ভেরিয়েবলগুলো (Environment Variables) সঠিকভাবে সেট করা হয়নি অথবা ডেপ্লয়মেন্টটি আপডেট করা প্রয়োজন।
            </p>
            <div className="bg-white/50 p-6 rounded-2xl text-left border border-red-100 mb-8">
              <p className="text-sm font-bold text-red-900 mb-2">কিভাবে সমাধান করবেন:</p>
              <ul className="text-sm text-red-700 space-y-2 list-disc ml-5">
                <li>Vercel Project Settings > Environment Variables এ যান।</li>
                <li><b>SUPABASE_URL</b> এবং <b>SUPABASE_ANON_KEY</b> যোগ করুন।</li>
                <li>সেভ করার পর প্রোজেক্টটি আবার <b>Redeploy</b> করুন।</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition shadow-xl shadow-red-100"
            >
              পেজটি রিলোড করুন
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
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
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
