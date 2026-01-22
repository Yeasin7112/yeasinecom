
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Shop from './components/Shop';
import AdminPanel from './components/AdminPanel';
import { Product, Order, ViewType } from './types';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('shop');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pData = await apiService.getProducts();
      const oData = await apiService.getOrders();
      setProducts(pData || []);
      setOrders(oData || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (newOrder: Order) => {
    try {
      await apiService.placeOrder(newOrder);
      setOrders([newOrder, ...orders]);
    } catch (err) {
      alert("অর্ডার সেভ করতে সমস্যা হয়েছে।");
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert("অর্ডার আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await apiService.deleteOrder(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      alert("অর্ডার মুছতে সমস্যা হয়েছে।");
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        setView={setCurrentView} 
        isAdminLoggedIn={isAdminLoggedIn} 
        onLogout={() => {setIsAdminLoggedIn(false); setCurrentView('shop');}} 
      />
      
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
              <AdminPanel 
                view={currentView} 
                setView={setCurrentView} 
                isLoggedIn={isAdminLoggedIn} 
                onLogin={handleAdminLogin} 
                products={products} 
                orders={orders} 
                setProducts={setProducts} 
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
