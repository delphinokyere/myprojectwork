import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../lib/storage';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Eye, EyeOff, GraduationCap, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Local Auth Login
      const users = await storage.getUsers();
      const profile = users.find(u => u.email === email && u.password === password);
      
      if (!profile) {
        throw new Error('Invalid email or password. Please try again.');
      }

      storage.setSession(profile);
      await refreshProfile();
      navigate(profile.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Panel - Branding */}
      <div className="w-full md:w-1/2 bg-primary relative overflow-hidden flex flex-col justify-between p-8 md:p-16">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 16h2M16 15v2' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px' 
        }}></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center transform rotate-3">
            <GraduationCap className="text-primary w-7 h-7 transform -rotate-3" />
          </div>
          <div>
            <h2 className="text-white font-display font-bold text-xl leading-tight">UPSA Marketplace</h2>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">STUDENT COMMERCE PLATFORM</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg my-12 md:my-0">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-8">
            Your campus.<br />
            Your <span className="text-accent">marketplace.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-12">
            Buy textbooks, sell gadgets, discover handmade crafts — all within the UPSA student community.
          </p>

          <div className="space-y-6">
            {[
              { icon: ShieldCheck, text: "Verified UPSA students only", color: "bg-white/10 text-accent" },
              { icon: Zap, text: "Fast, secure transactions on campus", color: "bg-white/10 text-accent" },
              { icon: MessageSquare, text: "Direct chat with buyers & sellers", color: "bg-white/10 text-accent" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`${feature.color} p-2.5 rounded-lg`}>
                  <feature.icon size={20} />
                </div>
                <span className="text-white font-medium text-sm md:text-base">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs font-medium">© 2026 UPSA Marketplace · All rights reserved</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 bg-bg-base flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] relative z-10"
        >
          <div className="mb-8">
            <h3 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center gap-2">
              Welcome back <span className="animate-bounce-slow">👋</span>
            </h3>
            <p className="text-gray-400 font-medium">Log in to your UPSA Marketplace account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-300"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <button type="button" className="text-xs font-bold text-primary/60 hover:text-accent transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-300" 
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="remember" className="text-xs text-gray-500 font-medium">Remember me for 30 days</label>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale group shadow-lg shadow-primary/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-300 font-bold tracking-widest">or</span></div>
            </div>
            
            <p className="text-sm font-medium text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">Sign Up</Link>
            </p>
          </div>

          {/* Admin Hint */}
          <div className="mt-8 p-4 bg-[#F8FAFC] border border-gray-100 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 bg-accent/20 text-accent rounded-lg shrink-0 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">🔑 Demo Admin</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-gray-500">
                <span className="truncate">admin@upsa.edu.gh</span>
                <span className="text-gray-300">·</span>
                <span>Admin@UPSA2024</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
