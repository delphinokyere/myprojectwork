import { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Product, Order, Chat } from '../types';
import { useAuth } from '../components/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Package, TrendingUp, ShoppingBag, X, Upload, LayoutDashboard, Settings, CheckCircle, AlertCircle, Clock, MessageSquare } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Food', 'Services', 'Stationery', 'Other'];

export default function SellerDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setIsAddingProduct(true);
      // Clean up URL
      navigate('/seller', { replace: true });
    }
  }, [location.search, navigate]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stockStatus: 'in_stock' as const,
    imageUrls: ['', '', '']
  });

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSellerProducts();
      fetchSellerOrders();
      fetchSellerChats();
    }
  }, [user]);

  const fetchSellerProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await storage.getProducts();
      const sellerProducts = allProducts.filter(p => p.sellerId === user?.uid);
      setProducts(sellerProducts);
    } catch (error) {
      console.error("Error fetching seller products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    if (user) {
      const sellerOrders = await storage.getOrdersBySeller(user.uid);
      setOrders(sellerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const fetchSellerChats = async () => {
    if (user) {
      const userChats = await storage.getChats(user.uid);
      setChats(userChats);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await storage.updateOrder(orderId, { status });
    await fetchSellerOrders();
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stockStatus: product.stockStatus,
      imageUrls: [...product.imageUrls, '', '', ''].slice(0, 3)
    });
    setIsAddingProduct(true);
  };

  const handleCloseForm = () => {
    setIsAddingProduct(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Electronics',
      stockStatus: 'in_stock',
      imageUrls: ['', '', '']
    });
  };

  const handleImageChange = (index: number, file: File | null) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newUrls = [...formData.imageUrls];
      newUrls[index] = base64String;
      setFormData({ ...formData, imageUrls: newUrls });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validImages = formData.imageUrls.filter(url => url.trim() !== '');
    if (validImages.length === 0) {
      alert("Please provide at least one image URL.");
      return;
    }

    const price = parseFloat(formData.price);
    const now = new Date().toISOString();

    try {
      if (editingProduct) {
        await storage.updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          price: price,
          category: formData.category,
          stockStatus: formData.stockStatus,
          imageUrls: validImages,
          updatedAt: now
        });
      } else {
        const newProduct: Product = {
          id: Math.random().toString(36).substring(7),
          name: formData.name,
          description: formData.description,
          price: price,
          category: formData.category,
          stockStatus: formData.stockStatus,
          imageUrls: validImages,
          sellerId: user.uid,
          createdAt: now,
          updatedAt: now
        };
        await storage.saveProduct(newProduct);
      }
      handleCloseForm();
      await fetchSellerProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await storage.deleteProduct(productId);
      await fetchSellerProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleIdUpload = async (file: File | null) => {
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await storage.submitForVerification(user.uid, base64String);
      await refreshProfile();
    };
    reader.readAsDataURL(file);
  };

  if (profile?.role !== 'seller') {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-500 max-w-sm mx-auto">Only UPSA student entrepreneurs can access the seller portal. Please register as a seller with your student email.</p>
      </div>
    );
  }

  if (profile?.role === 'seller' && (!profile?.isVerified || profile?.verificationStatus === 'rejected')) {
    const isRejected = profile?.verificationStatus === 'rejected';
    const isPending = !!profile?.studentIdImageUrl && profile?.verificationStatus === 'pending';

    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${isRejected ? 'bg-red-100 text-red-500' : isPending ? 'bg-amber-100 text-amber-500 animate-pulse' : 'bg-primary/10 text-primary'}`}>
          {isRejected ? <X size={48} /> : isPending ? <Clock size={48} /> : <Upload size={48} />}
        </div>
        
        <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
          {isRejected ? 'Application Rejected' : isPending ? 'Verification in Progress' : 'Verify Your Identity'}
        </h2>
        
        {isRejected ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-8 mb-12 max-w-xl mx-auto shadow-sm">
            <p className="text-red-600 font-bold mb-2 flex items-center justify-center gap-2">
              <AlertCircle size={20} />
              Rejection Reason
            </p>
            <p className="text-red-900 font-medium italic text-lg mb-4">
              "{profile.rejectionReason || 'Your credentials could not be verified.'}"
            </p>
            <p className="text-sm text-red-500">
              Please review the feedback above and re-upload a clear image of your Student ID card.
            </p>
          </div>
        ) : (
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            {isPending 
              ? 'Our admins are currently reviewing your documents. This usually takes less than 24 hours. Please visit the office if you need urgent approval.' 
              : 'To start selling on the UPSA Marketplace, you must upload a clear photo of your Student ID card for our team to verify your student status.'}
          </p>
        )}

        {(!profile?.studentIdImageUrl || isRejected) ? (
          <div className="max-w-md mx-auto">
            <label className="group relative block cursor-pointer">
              <div className="p-12 border-4 border-dashed border-gray-200 rounded-[40px] transition-all group-hover:border-primary group-hover:bg-primary/5">
                <Upload className="mx-auto text-gray-300 mb-4 group-hover:text-primary group-hover:scale-110 transition-all" size={40} />
                <p className="font-bold text-gray-400 group-hover:text-primary">Click to upload Student ID</p>
                <p className="text-xs text-gray-300 mt-2">JPG, PNG up to 2MB</p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleIdUpload(e.target.files?.[0] || null)}
              />
            </label>
            {isRejected && (
              <div className="mt-8 flex items-center gap-2 justify-center text-red-500 font-bold text-sm">
                <AlertCircle size={16} />
                <span>Please ensure your full name and student ID are clearly visible.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl inline-block text-left max-w-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-100 shadow-sm">
                  <img src={profile.studentIdImageUrl} alt="Uploaded ID" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-lg">Document Under Review</p>
                    <Clock size={16} className="text-amber-500" />
                  </div>
                  <p className="text-xs text-gray-500">Submitted on {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">1</div>
                  <p className="text-sm text-gray-600">Our team is verifying your campus credentials.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">2</div>
                  <p className="text-sm text-gray-400">Approval usually takes 30-60 minutes during office hours.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-gray-900">Seller Dashboard</h1>
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-green-100 uppercase tracking-wider">
              <CheckCircle size={12} />
              Verified UPSA Seller
            </div>
          </div>
          <p className="text-gray-500">Manage your product listings and vendor operations.</p>
        </div>
        <button 
          onClick={() => setIsAddingProduct(true)}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} />
          List New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        {[
          { label: 'Active Listings', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Revenue (GH₵)', value: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Messages', value: chats.length, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', link: '/messages' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => stat.link && navigate(stat.link)}
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 ${stat.link ? 'cursor-pointer hover:border-primary transition-all' : ''}`}
          >
            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-400 truncate">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-display font-bold text-gray-900 truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 mb-12">
        {/* Recent Orders */}
        <div className="xl:col-span-1 space-y-6">
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Clock className="text-amber-500" />
            Recent Orders
          </h2>
          
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-10 rounded-[32px] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-medium italic text-sm">No orders received yet.</p>
              </div>
            ) : (
              orders.slice(0, 5).map(order => {
                const product = products.find(p => p.id === order.productId);
                return (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                      <ShoppingBag size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate text-sm">{product?.name || 'Product Deleted'}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">Order #{order.id.slice(-6)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary">GH₵{order.totalAmount.toFixed(2)}</p>
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`text-[10px] font-bold uppercase tracking-widest bg-transparent outline-none cursor-pointer ${
                          order.status === 'delivered' ? 'text-green-500' : 
                          order.status === 'cancelled' ? 'text-red-500' : 
                          'text-amber-500'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Listings Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-display font-bold text-xl">Your Products</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <LayoutDashboard size={20} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/20" />
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden bg-gray-100 shadow-sm shrink-0">
                          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-sm md:text-base text-gray-900 group-hover:text-primary transition-colors truncate">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-900">GH₵{product.price}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.stockStatus === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stockStatus === 'in_stock' ? 'Active' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 md:p-3 bg-white text-gray-400 hover:text-primary hover:border-primary border border-gray-200 rounded-lg md:rounded-xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 md:p-3 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 border border-gray-200 rounded-lg md:rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-gray-400 font-medium italic">You haven't listed any products yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseForm}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">{editingProduct ? 'Edit Product' : 'List New Product'}</h2>
                <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all" 
                        placeholder="Premium Canvas Bag"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full h-40 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none" 
                        placeholder="Handmade durable canvas bag for everyday use..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Price (GH₵)</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all" 
                          placeholder="25.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Status</label>
                        <select 
                          value={formData.stockStatus}
                        onChange={(e) => setFormData({...formData, stockStatus: e.target.value as 'in_stock' | 'out_of_stock'})}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-900 mb-1">Product Images (Max 3)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.imageUrls.map((url, i) => (
                          <div key={i} className="relative group aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all hover:border-primary">
                            {url ? (
                              <>
                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newUrls = [...formData.imageUrls];
                                    newUrls[i] = '';
                                    setFormData({...formData, imageUrls: newUrls});
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-primary/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2 text-center">
                                <Upload className="text-gray-400 mb-1" size={20} />
                                <span className="text-[10px] font-bold text-gray-400">Select Image</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageChange(i, e.target.files?.[0] || null)}
                                />
                              </label>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium italic">* Images are saved locally. Max 2MB per file.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    type="button" 
                    onClick={handleCloseForm}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all font-display"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] font-display"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
