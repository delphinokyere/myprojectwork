import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole, UserProfile } from '../types';
import { storage } from '../lib/storage';
import { useAuth } from '../components/AuthProvider';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShoppingBag, 
  Store,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState<UserRole>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the Terms and Privacy Policy.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create local profile object
      const uid = crypto.randomUUID();
      const newUser: UserProfile = {
        uid,
        name,
        email,
        password, // Store password locally for demo
        role,
        isVerified: role === 'seller' ? false : undefined,
        verificationStatus: role === 'seller' ? 'pending' : undefined,
        createdAt: new Date().toISOString(),
      };

      // 2. Check if user already exists
      const existingUsers = await storage.getUsers();
      if (existingUsers.some(u => u.email === email)) {
        throw new Error('User with this email already exists.');
      }

      // 3. Save to local storage
      await storage.saveUser(newUser);
      
      // 4. Update session and navigate
      storage.setSession(newUser);
      await refreshProfile();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
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
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-8">
            Join the<br />
            <span className="text-accent">community.</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-12">
            Thousands of UPSA students are already buying and selling on campus. Get started in minutes.
          </p>

          <div className="space-y-10">
            {[
              { 
                step: "1", 
                title: "Create your account", 
                desc: "Sign up with your email in under a minute" 
              },
              { 
                step: "2", 
                title: "Verify your student ID", 
                desc: "Required for sellers — buyers can start immediately" 
              },
              { 
                step: "3", 
                title: "Buy or sell anything", 
                desc: "Textbooks, electronics, crafts, services & more" 
              }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0 text-accent font-bold text-sm bg-white/5">
                  {feature.step}
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">{feature.title}</h4>
                  <p className="text-white/50 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs font-medium">© 2026 UPSA Marketplace · All rights reserved</p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full md:w-1/2 bg-bg-base flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.08)] my-8"
        >
          <div className="mb-10">
            <h3 className="text-4xl font-display font-bold text-gray-900 mb-3 flex items-center gap-2">
              Create account <span className="animate-pulse">✨</span>
            </h3>
            <p className="text-gray-400 font-medium">Join thousands of UPSA students on the marketplace</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1">I want to</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`relative p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 text-center ${
                    role === 'buyer' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'buyer' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${role === 'buyer' ? 'text-gray-900' : 'text-gray-500'}`}>Buy Products</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Browse & purchase</p>
                  </div>
                  {role === 'buyer' && (
                    <div className="absolute top-3 right-3 text-primary">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`relative p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 text-center ${
                    role === 'seller' 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'seller' ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <Store size={24} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${role === 'seller' ? 'text-gray-900' : 'text-gray-500'}`}>Sell Products</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Requires verification</p>
                  </div>
                  {role === 'seller' && (
                    <div className="absolute top-3 right-3 text-primary">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-300"
                placeholder="e.g. Kofi Mensah"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-300"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 pr-12 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-300" 
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 pr-12 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-gray-900 placeholder:text-gray-300" 
                    placeholder="Repeat your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 px-1">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-lg border-gray-200 text-primary focus:ring-primary" 
              />
              <label htmlFor="terms" className="text-sm text-gray-500 font-medium leading-relaxed">
                I agree to the <Link to="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-[0.98] disabled:opacity-50 group shadow-lg shadow-primary/10 pt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-base font-medium text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
