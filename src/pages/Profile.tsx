import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Shield, School, Camera, Save, LogOut, ShieldCheck, ShoppingBag, Clock, CheckCircle2, Trash2, XCircle, MessageSquare } from 'lucide-react';
import { storage } from '../lib/storage';
import { Link } from 'react-router-dom';
import { Order, Product } from '../types';

export default function Profile() {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchOrders();
        const allProducts = await storage.getProducts();
        setProducts(allProducts);
      }
    };
    fetchData();
  }, [user]);

  const fetchOrders = async () => {
    if (user) {
      const allOrders = await storage.getOrdersByBuyer(user.uid);
      setOrders(allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel and delete this order?")) {
      await storage.deleteOrder(id);
      await fetchOrders();
    }
  };

  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await storage.updateUser(user.uid, { name });
      
      // Update session if it's the current user
      const session = storage.getSession();
      if (session && session.uid === user.uid) {
        storage.setSession({ ...session, name });
      }
      
      await refreshProfile();
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-500">Manage your profile information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl font-display font-bold text-gray-400 border-4 border-white shadow-xl">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="text-xl font-bold font-display">{profile?.name}</h3>
            <p className="text-sm text-gray-400 font-medium mb-6">{profile?.email}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${profile?.role === 'seller' ? 'bg-primary text-white' : profile?.role === 'admin' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Shield size={12} />
              {profile?.role}
            </div>
          </div>

          {profile?.role === 'admin' && (
            <Link 
              to="/admin"
              className="w-full py-4 px-6 flex items-center justify-between bg-black text-white font-bold rounded-2xl transition-all hover:bg-gray-800 shadow-xl shadow-gray-200"
            >
              <span className="flex items-center gap-3">
                <ShieldCheck size={20} />
                Admin Panel Access
              </span>
              <span>→</span>
            </Link>
          )}

          <Link 
            to="/messages"
            className="w-full py-4 px-6 flex items-center justify-between bg-white text-primary border border-primary font-bold rounded-2xl transition-all hover:bg-primary/5"
          >
            <span className="flex items-center gap-3">
              <MessageSquare size={20} />
              My Conversations
            </span>
            <span>→</span>
          </Link>

          <button 
            onClick={() => logout()}
            className="w-full py-4 px-6 flex items-center justify-between text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors group"
          >
            <span className="flex items-center gap-3">
              <LogOut size={20} />
              Sign Out
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>

        {/* Form */}
        <div className="md:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8"
          >
            <div className="flex justify-between items-center pb-6 border-b border-gray-50">
              <h2 className="text-2xl font-display font-bold">Personal Information</h2>
              <button 
                onClick={() => setEditing(!editing)}
                className="text-sm font-bold text-gray-400 hover:text-primary uppercase tracking-widest transition-colors"
              >
                {editing ? 'Cancel' : 'Edit Info'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                {editing ? (
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold"
                  />
                ) : (
                  <p className="text-lg font-bold text-gray-900 px-5 py-3">{profile?.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <p className="text-lg font-bold text-gray-400 px-5 py-3">{profile?.email}</p>
              </div>

              {profile?.role === 'seller' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <School size={14} /> Student ID
                  </label>
                  <p className="text-lg font-bold text-gray-900 px-5 py-3">{profile?.studentId}</p>
                </div>
              )}
            </div>

            {editing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Saving changes...' : 'Update Profile'}
                </button>
              </motion.div>
            )}
          </motion.div>

          <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 flex items-start gap-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg mb-1">Account Security</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Your account data is stored locally in your browser. Since this is a demo environment, no information is sent to a remote server. Ensure you use a secure personal device.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              <ShoppingBag className="text-primary" />
              My Orders
            </h2>
            
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-medium">You haven't placed any orders yet.</p>
                <Link to="/" className="text-primary font-bold text-sm mt-2 inline-block hover:underline">Start browsing →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {orders.map((order) => {
                    const product = getProduct(order.productId);
                    return (
                      <motion.div 
                        layout
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6"
                      >
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                          {product ? (
                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-full h-full p-4 text-gray-300" />
                          )}
                        </div>
                        
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="font-bold text-gray-900">{product?.name || 'Unknown Product'}</h4>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                              GH₵{order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border ${
                            order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                            order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {order.status === 'delivered' ? <CheckCircle2 size={12} /> : 
                             order.status === 'cancelled' ? <XCircle size={12} /> : 
                             <Clock size={12} />}
                            {order.status}
                          </div>
                          
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Cancel & Delete Order"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
