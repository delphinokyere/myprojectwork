import { useState, useEffect } from 'react';
import { UserProfile, Order, Product } from '../types';
import { storage } from '../lib/storage';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  LogOut, 
  X, 
  Eye, 
  LayoutDashboard, 
  Globe, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Zap,
  Menu
} from 'lucide-react';

export default function AdminPanel() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdImage, setSelectedIdImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allUsers = await storage.getUsers();
      const allOrders = await storage.getOrders();
      const allProducts = await storage.getProducts();
      
      setUsers(allUsers);
      setOrders(allOrders);
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (uid: string) => {
    await storage.verifyUser(uid);
    await fetchData();
  };

  const handleReject = async (uid: string) => {
    const defaultReason = 'Your Student ID document was unclear or invalid. Please provide a clear, full-color image of your official UPSA student ID.';
    const reason = window.prompt('Enter specific rejection reason (leave blank for default):', defaultReason);
    if (reason === null) return;
    await storage.rejectUser(uid, reason.trim() || defaultReason);
    await fetchData();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: 'BUYERS', value: users.filter(u => u.role === 'buyer').length, icon: Users, color: 'bg-[#5B8E7D]' },
    { label: 'SELLERS', value: users.filter(u => u.role === 'seller').length, icon: ShoppingBag, color: 'bg-[#E6AA4F]' },
    { label: 'ACTIVE PRODUCTS', value: products.length, icon: Package, color: 'bg-[#4392B4]' },
    { label: 'TOTAL ORDERS', value: orders.length, icon: ShoppingBag, color: 'bg-[#954BB3]' },
    { label: 'REVENUE DELIVERED', value: `GH₵ ${orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}`, icon: TrendingUp, color: 'bg-[#2D7A4D]' },
    { label: 'PENDING VERIF.', value: users.filter(u => u.role === 'seller' && u.verificationStatus === 'pending').length, icon: Clock, color: 'bg-[#D37D3D]' },
    { label: 'OPEN REPORTS', value: '0', icon: AlertTriangle, color: 'bg-[#C94747]' },
    { label: 'PENDING ORDERS', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: 'bg-[#3A8999]' },
  ];

  const menuItems = [
    { group: 'OVERVIEW', items: [
      { name: 'Dashboard', icon: LayoutDashboard },
      { name: 'Analytics', icon: TrendingUp }
    ]},
    { group: 'MANAGEMENT', items: [
      { name: 'Users', icon: Users },
      { name: 'Products', icon: Package },
      { name: 'Orders', icon: ShoppingBag },
      { name: 'Reviews', icon: Star }
    ]},
    { group: 'VERIFICATION & SAFETY', items: [
      { name: 'Verifications', icon: ShieldCheck },
      { name: 'Fraud Reports', icon: AlertTriangle }
    ]},
    { group: 'ACCOUNT', items: [
      { name: 'View Live Site', icon: Globe, path: '/' },
      { name: 'Logout', icon: LogOut, action: handleLogout, color: 'text-red-400' }
    ]}
  ];

  return (
    <div className="flex min-h-screen bg-bg-base relative">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-primary-dark text-white flex flex-col z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-[10px] flex items-center justify-center transform rotate-2">
              <ShieldCheck size={24} className="text-white transform -rotate-2" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">UPSA Market</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ADMIN PANEL</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {menuItems.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] font-bold text-gray-500 mb-4 px-2 uppercase tracking-widest">{group.group}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.action) item.action();
                        else if (item.path) navigate(item.path);
                        else setActiveTab(item.name);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                        isActive 
                          ? 'bg-primary/20 text-primary shadow-sm shadow-primary/10' 
                          : item.color || 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-display font-bold text-gray-900 border-r border-gray-100 pr-4 mr-4 hidden sm:block">Dashboard — UPSA Marketplace</h2>
            <h2 className="font-display font-bold text-gray-900 sm:hidden">Dashboard</h2>
            <div className="text-xs text-gray-400 hidden xl:flex items-center gap-2">
              <Clock size={14} />
              {new Date().toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
              <p className="font-bold text-sm text-gray-900">UPSA Admin</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              U
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'Dashboard' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-black/5`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                          <stat.icon size={14} />
                        </div>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-white/80">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-display font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Left Column - Tables */}
                  <div className="xl:col-span-2 space-y-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
                      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                          <ShoppingBag className="text-primary" size={20} />
                          Recent Orders
                        </h3>
                        <button className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">View All</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50/50">
                            <tr>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Order #</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Buyer</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Amount</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm italic">No orders yet</td>
                              </tr>
                            ) : (
                              orders.slice(0, 5).map(order => (
                                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()}</td>
                                  <td className="px-6 py-4 text-sm font-medium">{users.find(u => u.uid === order.buyerId)?.name}</td>
                                  <td className="px-6 py-4 text-sm font-bold text-right text-primary">GH₵ {order.totalAmount.toFixed(2)}</td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                      order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-xs text-gray-400 text-right">{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recently Joined Users */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
                      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2">
                          <Users className="text-primary" size={20} />
                          Recently Joined Users
                        </h3>
                        <button 
                          onClick={() => setActiveTab('Users')}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary transition-all hover:text-white"
                        >
                          Manage Users
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50/50">
                            <tr>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Name</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Email</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Role</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Joined</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase">Status</th>
                              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.slice(-5).reverse().map(u => (
                              <tr key={u.uid} className="border-t border-gray-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                                      {u.name[0]}
                                    </div>
                                    <span className="text-sm font-bold truncate max-w-[120px]">{u.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400">{u.email}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${
                                    u.role === 'seller' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                                    u.verificationStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                                  }`}>
                                    Active
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all">
                                    Suspend
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Widgets */}
                  <div className="space-y-8">
                    {/* Top Sellers */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
                      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                        <TrendingUp className="text-primary" size={20} />
                        <h3 className="font-display font-bold text-lg">Top Sellers</h3>
                      </div>
                      <div className="p-12 text-center">
                        <p className="text-gray-400 text-sm font-medium italic">No delivered orders yet</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
                      <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                        <Zap className="text-primary" size={20} />
                        <h3 className="font-display font-bold text-lg">Quick Actions</h3>
                      </div>
                      <div className="p-6 space-y-3">
                        {[
                          { name: 'Review Verifications', icon: ShieldCheck, tab: 'Verifications' },
                          { name: 'Fraud Reports', icon: AlertTriangle, tab: 'Fraud Reports' },
                          { name: 'Flagged Products', icon: Package },
                          { name: 'Manage Users', icon: Users, tab: 'Users' },
                          { name: 'Analytics', icon: TrendingUp, tab: 'Analytics' },
                          { name: 'Pending Orders', icon: ShoppingBag, tab: 'Orders' },
                        ].map((action, i) => (
                          <button
                            key={i}
                            onClick={() => action.tab && setActiveTab(action.tab)}
                            className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <action.icon size={16} />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{action.name}</span>
                            </div>
                            <MoreVertical size={14} className="text-gray-300 group-hover:text-primary" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'Verifications' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-gray-900">Seller Verifications</h2>
                    <p className="text-gray-500 mt-1">Approve or reject pending seller applications after reviewing their IDs</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {users.filter(u => u.role === 'seller' && (u.verificationStatus === 'pending' || !u.verificationStatus)).length === 0 ? (
                    <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="text-gray-400 font-medium">Clear! No pending verifications at the moment.</p>
                    </div>
                  ) : (
                    users.filter(u => u.role === 'seller' && (u.verificationStatus === 'pending' || !u.verificationStatus)).map(seller => (
                      <motion.div 
                        layout
                        key={seller.uid}
                        className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-center gap-8"
                      >
                        <div className="flex items-center gap-6 flex-1 w-full">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                            {seller.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-xl text-gray-900">{seller.name}</h4>
                            <p className="text-gray-400 text-sm">{seller.email}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-1 rounded-lg">ID: {seller.studentId}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase italic">Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full xl:w-auto h-32 aspect-video bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden relative group cursor-pointer"
                           onClick={() => setSelectedIdImage(seller.studentIdImageUrl || null)}>
                          {seller.studentIdImageUrl ? (
                            <>
                              <img src={seller.studentIdImageUrl} alt="ID" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye className="text-white" size={24} />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                              <AlertTriangle size={24} />
                              <span className="text-[9px] font-bold uppercase tracking-widest">No Image Uploaded</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 w-full xl:w-auto">
                          <button 
                            onClick={() => handleReject(seller.uid)}
                            className="flex-1 xl:flex-none px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                          <button 
                            onClick={() => handleVerify(seller.uid)}
                            disabled={!seller.studentIdImageUrl}
                            className="flex-1 xl:flex-none px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                          >
                            <CheckCircle2 size={18} />
                            Approve
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200"
              >
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LayoutDashboard size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{activeTab} Section</h3>
                <p className="text-gray-500 max-w-sm mx-auto italic">This section is currently under development. Please check back later for detailed {activeTab.toLowerCase()} management features.</p>
                <button 
                  onClick={() => setActiveTab('Dashboard')}
                  className="mt-8 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ID Image Modal */}
      <AnimatePresence>
        {selectedIdImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 p-10 flex items-center justify-center"
            onClick={() => setSelectedIdImage(null)}
          >
            <button className="absolute top-10 right-10 text-white p-3 hover:bg-white/10 rounded-full">
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedIdImage} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              alt="Expanded ID"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

