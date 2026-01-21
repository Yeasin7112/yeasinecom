
import React, { useState, useMemo } from 'react';
import { Product, Order } from '../types';

interface ShopProps {
  products: Product[];
  onPlaceOrder: (order: Order) => void;
}

const Shop: React.FC<ShopProps> = ({ products, onPlaceOrder }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerName,
      customerPhone,
      items: [{
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1
      }],
      totalPrice: selectedProduct.price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    onPlaceOrder(newOrder);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedProduct(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">আমাদের কালেকশন</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">সেরা মানের পণ্য, দ্রুত ডেলিভারি এবং সাশ্রয়ী মূল্য। আপনার পছন্দের পণ্যটি আজই অর্ডার করুন।</p>
        
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
          <input 
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-6 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategory === cat 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {cat === 'All' ? 'সবগুলো' : cat}
            </button>
          ))}
        </div>
      </div>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl relative mb-8 text-center shadow-lg animate-fade-in">
          <strong className="font-bold">ধন্যবাদ!</strong>
          <span className="block sm:inline"> আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।</span>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className="text-xs font-bold text-white bg-orange-600/90 px-3 py-1 rounded-full backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <span className="text-2xl font-black text-orange-600">৳{product.price}</span>
                  <button 
                    onClick={() => setSelectedProduct(product)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition shadow-md font-semibold text-sm"
                  >
                    অর্ডার করুন
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">দুঃখিত, কোনো পণ্য পাওয়া যায়নি।</p>
        </div>
      )}

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">অর্ডার নিশ্চিত করুন</h2>
            <div className="flex items-center gap-4 mb-8 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <img src={selectedProduct.image} alt="" className="w-20 h-20 object-cover rounded-xl shadow-sm" />
              <div>
                <p className="font-bold text-gray-800 text-lg">{selectedProduct.name}</p>
                <p className="text-orange-600 font-black text-xl">৳{selectedProduct.price}</p>
              </div>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">আপনার পূর্ণ নাম *</label>
                <input 
                  type="text" 
                  required 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: ইয়াছিন হোসাইন"
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">মোবাইল নম্বর *</label>
                <input 
                  type="tel" 
                  required 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="যেমন: 017XXXXXXXX"
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-700 transition shadow-xl shadow-orange-200 active:scale-95 duration-100"
              >
                অর্ডার সম্পন্ন করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
