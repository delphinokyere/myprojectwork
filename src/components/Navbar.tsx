import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ShoppingCart, User, LogOut, Search, LayoutDashboard, ShieldCheck, Menu, X, GraduationCap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary border-b border-white/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 lg:gap-10">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0 transform rotate-2 group-hover:rotate-0 transition-transform">
                <GraduationCap className="text-primary w-5 h-5 transform -rotate-2 group-hover:rotate-0 transition-transform" />
              </div>
              <div className="hidden lg:block">
                <span className="font-display font-bold text-base tracking-tight text-white block leading-none">UPSA</span>
                <span className="font-display font-bold text-[10px] tracking-[0.1em] text-accent block leading-none uppercase">Marketplace</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {['Home', 'Products', 'Books', 'Electronics', 'Services', 'Messages'].map((item) => (
                <Link 
                  key={item} 
                  to={item === 'Home' ? '/' : item === 'Messages' ? '/messages' : `/products?category=${item.toLowerCase()}`}
                  className="text-xs font-bold text-white/70 hover:text-white transition-colors uppercase tracking-wider"
                >
                  {item}
                </Link>
              ))}
            </div>
            
            <div className="hidden xl:flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 w-64 group focus-within:border-accent transition-colors">
              <Search className="w-3.5 h-3.5 text-white/30 group-focus-within:text-accent" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-transparent border-none focus:ring-0 text-xs ml-2 w-full text-white placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/cart" className="p-2 hover:bg-white/5 rounded-full relative transition-colors">
              <ShoppingCart className="w-5 h-5 text-white/70" />
              <span className="absolute top-1 right-1 bg-accent text-primary text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>
            </Link>

            {user ? (
              <>
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 pl-2 pr-4 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                      {profile?.name?.[0].toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-bold text-white/90 hidden sm:block">{profile?.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 rounded-full text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 hover:bg-white/5 rounded-full text-white/70 transition-colors"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/login" className="text-xs font-bold text-white/70 hover:text-white px-2 uppercase tracking-wider">Log in</Link>
                <Link to="/register" className="px-5 py-2.5 bg-accent text-primary text-xs font-bold rounded-lg hover:bg-accent-light transition-colors uppercase tracking-wider shadow-lg shadow-accent/10">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 mb-6">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search materials..." 
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
                />
              </div>

              {profile?.role === 'seller' && (
                <Link 
                  to="/seller" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-2xl font-bold"
                >
                  <LayoutDashboard size={20} />
                  Vendor Portal Dashboard
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-2xl font-bold"
                >
                  <ShieldCheck size={20} />
                  Admin Control Panel
                </Link>
              )}

              <Link 
                to="/messages" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl text-gray-700 font-medium"
              >
                <MessageSquare size={20} />
                Messages
              </Link>

              <Link 
                to="/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl text-gray-700 font-medium"
              >
                <User size={20} />
                My Profile
              </Link>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-2xl text-red-500 font-medium text-left"
              >
                <LogOut size={20} />
                Logout Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
