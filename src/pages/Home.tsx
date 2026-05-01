import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  GraduationCap,
  Shirt,
  BookOpen,
  Smartphone,
  Coffee,
  Wrench,
  Palette,
  Package,
  Facebook,
  Twitter,
  Instagram,
  PlusCircle
} from 'lucide-react';
import { storage } from '../lib/storage';
import { useAuth } from '../components/AuthProvider';
import { Product } from '../types';

const CATEGORIES = [
  { id: 'Fashion', name: 'Clothing & Fashion', icon: Shirt, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'Books', name: 'Books & Notes', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'Electronics', name: 'Electronics', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'Food', name: 'Food & Beverages', icon: Coffee, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'Services', name: 'Services', icon: Wrench, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'Stationery', name: 'Handmade & Crafts', icon: Palette, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'Other', name: 'Others', icon: Package, color: 'text-gray-500', bg: 'bg-gray-50' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({
    students: 0,
    products: 0,
    orders: 0
  });
  const { profile } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allProducts = await storage.getProducts();
        setProducts(allProducts.slice(0, 4));
        
        // Calculate category counts
        const counts: Record<string, number> = {};
        allProducts.forEach(p => {
          const cat = p.category;
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setCategoryCounts(counts);
        
        let userCount = 1000; // Default placeholder
        let orderCount = 500;  // Default placeholder

        if (profile?.role === 'admin') {
          try {
            const allUsers = await storage.getUsers();
            userCount = allUsers.length;
          } catch (e) {
            console.debug("Limited users access", e);
          }

          try {
            const allOrders = await storage.getOrders();
            orderCount = allOrders.length;
          } catch (e) {
            console.debug("Limited orders access", e);
          }
        }

        setStats({
          students: userCount,
          products: allProducts.length,
          orders: orderCount
        });
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    };

    fetchData();
  }, [profile]);

  const isSeller = profile?.role === 'seller';

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Hero Section */}
      <section className="relative bg-primary pt-20 pb-32 overflow-hidden px-4">
        {/* Decorative Cross Pattern */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 16h2M16 15v2' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px' 
        }}></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-7xl font-display font-bold text-white leading-tight tracking-tight">
              The UPSA Student <br />
              <span className="text-accent underline decoration-accent/30 underline-offset-8">Marketplace</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
              Buy and sell textbooks, gadgets, handmade crafts, services, and more — exclusively for UPSA students.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link to="/products" className="w-full sm:w-auto px-8 py-4 bg-accent text-primary font-bold rounded-xl hover:bg-accent-light transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2">
                Browse Products
              </Link>
              {isSeller ? (
                <Link to="/seller?action=add" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 group">
                  <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
                  List a Product
                </Link>
              ) : (
                <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/20 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 border-2">
                  Start Selling
                </Link>
              )}
            </div>


            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-16 pt-16">
              {[
                { label: 'Students', value: `${stats.students}+` },
                { label: 'Products', value: `${stats.products}+` },
                { label: 'Orders Placed', value: `${stats.orders}+` }
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <p className="text-3xl md:text-4xl font-display font-bold text-accent mb-1 group-hover:scale-110 transition-transform">{stat.value}</p>
                  <p className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-display font-bold text-primary">Shop by Category</h2>
          <Link to="/products" className="px-5 py-2 border border-border-custom text-text-secondary text-xs font-bold rounded-lg hover:border-accent hover:text-accent transition-all uppercase tracking-wider">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <Link key={i} to={`/products?category=${cat.id.toLowerCase()}`} className="bg-bg-alt p-6 rounded-[24px] group border border-transparent hover:border-accent/10 hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col items-center text-center">
                <div className={`w-14 h-14 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform`}>
                  <cat.icon size={28} />
                </div>
                <h3 className="font-bold text-primary text-sm md:text-base mb-1 truncate w-full">{cat.name}</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{count} {count === 1 ? 'item' : 'items'}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 bg-bg-alt">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-bold text-primary">New Arrivals</h2>
            <Link to="/products" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              See all items <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all border border-gray-50 flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="relative h-64 overflow-hidden group">
                  <img 
                    src={product.imageUrls[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                    <Star size={10} className="text-accent fill-current" />
                    <span className="text-[10px] font-bold text-white tracking-widest">NEW</span>
                  </div>
                </Link>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">{product.category}</p>
                    <h3 className="font-display font-bold text-lg text-primary leading-tight group-hover:text-accent transition-colors">{product.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 mb-6">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={10} className={s <= 4 ? "text-yellow-400 fill-current" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-[10px] text-text-muted font-bold ml-1">(4.8)</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="font-display font-bold text-lg text-primary">GH₵{product.price.toLocaleString()}</div>
                    <button className="w-10 h-10 bg-bg-base text-primary border border-gray-100 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all transform active:scale-95 group">
                      <ShoppingBag size={18} className="group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-24 px-4 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -mb-64 -mr-64 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-8">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center transform rotate-2">
                  <GraduationCap className="text-primary w-6 h-6 transform -rotate-2" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl leading-tight">UPSA <span className="text-accent">Marketplace</span></h3>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">STUDENT COMMERCE PLATFORM</p>
                </div>
              </Link>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                The official peer-to-peer marketplace for UPSA students. Buy, sell, and connect safely within our community.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 bg-white/5 hover:bg-accent hover:text-primary rounded-xl flex items-center justify-center transition-all border border-white/10 group">
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {[
              { 
                title: 'Quick Links', 
                links: [
                  { name: 'Home', path: '/' },
                  { name: 'Browse Products', path: '/products' },
                  { name: 'Become a Seller', path: '/register' },
                  { name: 'Account Details', path: '/profile' }
                ] 
              },
              { 
                title: 'Categories', 
                links: [
                  { name: 'Books & Notes', path: '/products?category=books' },
                  { name: 'Electronics', path: '/products?category=electronics' },
                  { name: 'Fashion', path: '/products?category=clothing' },
                  { name: 'Services', path: '/products?category=services' }
                ] 
              },
              { 
                title: 'Support', 
                links: [
                  { name: 'Help Center', path: '#' },
                  { name: 'Safety Tips', path: '#' },
                  { name: 'Terms of Service', path: '#' },
                  { name: 'Contact Us', path: '#' }
                ] 
              }
            ].map((column, i) => (
              <div key={i}>
                <h4 className="font-display font-bold text-lg mb-8 text-white">{column.title}</h4>
                <div className="flex flex-col gap-4">
                  {column.links.map((link, j) => (
                    <Link key={j} to={link.path} className="text-white/40 hover:text-accent transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 bg-white/10 rounded-full group-hover:bg-accent transition-colors"></span>
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/30 text-xs font-medium">© 2026 UPSA Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <Link to="#" className="text-white/20 hover:text-white text-[10px] font-bold uppercase tracking-widest">Privacy Policy</Link>
              <Link to="#" className="text-white/20 hover:text-white text-[10px] font-bold uppercase tracking-widest">Terms of Service</Link>
              <Link to="#" className="text-white/20 hover:text-white text-[10px] font-bold uppercase tracking-widest">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
