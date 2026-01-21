
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

  // Initial Fetch
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
        // Map snake_case database fields to camelCase types for consistency in the UI
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
    if (!supabase) {
      alert("Supabase কনফিগার করা নেই।");
      return;
    }
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
      console.error("Error adding order to Supabase:", error);
      alert("অর্ডার সেভ করতে সমস্যা হয়েছে। ডাটাবেস টেবিল চেক করুন।");
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
        <Header 
          currentView={currentView} 
          setView={setCurrentView} 
          isAdminLoggedIn={isAdminLoggedIn} 
          onLogout={() => {setIsAdminLoggedIn(false); setCurrentView('shop');}}
        />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 p-8 rounded-3xl max-w-lg text-center shadow-xl">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Supabase কনফিগারেশন ত্রুটি</h2>
            <p className="text-red-600 mb-6 leading-relaxed">
              ডাটাবেস কানেকশন স্থাপন করা সম্ভব হচ্ছে না। আপনার ক্রেডেনশিয়ালগুলো সঠিক কি না যাচাই করুন।
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        currentView={currentView} 
        setView={setCurrentView} 
        isAdminLoggedIn={isAdminLoggedIn} 
        onLogout={() => {setIsAdminLoggedIn(false); setCurrentView('shop');}}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            {currentView === 'shop' && (
              <Shop products={products} onPlaceOrder={addOrder} />
            )}
            
            {(currentView === 'admin' || currentView === 'admin_orders') && (
              <AdminPanel 
                view={currentView}
                setView={setCurrentView}
                isLoggedIn={isAdminLoggedIn}
                onLogin={handleAdminLogin}
                products={products}
                orders={orders}
                setProducts={handleUpdateProducts}
                onUpdateOrderStatus={updateOrderStatus}
                onDeleteOrder={deleteOrder}
                refreshData={fetchData}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
