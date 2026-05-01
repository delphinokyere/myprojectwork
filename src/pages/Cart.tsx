import { useCart } from '../components/CartProvider';
import { useAuth } from '../components/AuthProvider';
import { storage } from '../lib/storage';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, CreditCard, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // Use Promise.all to save all orders in parallel
      await Promise.all(items.map(item => {
        const order: Order = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          buyerId: user.uid,
          sellerId: item.sellerId,
          productId: item.id,
          quantity: item.quantity,
          totalAmount: item.price * item.quantity,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        return storage.saveOrder(order);
      }));

      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">Your order has been sent to the vendors. You can track your orders in your profile.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/profile" className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl">
            View My Orders
          </Link>
          <Link to="/" className="px-8 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300"
        >
          <ShoppingBag size={40} />
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-10 max-w-sm mx-auto">Looks like you haven't added any products to your cart yet. Explore the marketplace to find unique items.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl">
          Start Shopping
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-10">Shopping Cart ({totalItems})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 relative group"
              >
                <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <Link to={`/product/${item.id}`} className="font-display font-bold text-xl hover:underline decoration-2 text-primary">{item.name}</Link>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 font-medium">{item.category}</p>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-400 hover:text-primary leading-none"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-400 hover:text-primary leading-none"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display font-bold text-xl">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={clearCart}
            className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest pl-2"
          >
            Clear All Items
          </button>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl sticky top-28">
            <h2 className="text-2xl font-display font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-gray-900">GH₵{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Delivery</span>
                <span className="text-green-600 font-bold italic">Contact Vendor</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-3xl font-display font-bold text-primary">GH₵{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] mb-6 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={20} />
                  Checkout Now
                </>
              )}
            </button>

            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest justify-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Secure Transaction Guaranteed
            </div>
          </div>
          
          <div className="mt-8 bg-gray-50 p-8 rounded-[32px] border border-dashed border-gray-200">
            <h4 className="font-bold text-sm mb-2">Vendor Information</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Transactions are settled directly between buyers and student entrepreneurs. Please coordinate payment and pick-up/delivery once the order is confirmed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
