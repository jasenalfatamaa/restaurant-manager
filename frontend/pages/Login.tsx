import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Lock, User as UserIcon, Shield, Utensils, MonitorCheck, LayoutGrid } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  const demoUsers = [
    { label: 'Manager', user: 'manager', pass: '123', icon: <LayoutGrid size={16} />, color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { label: 'Admin', user: 'admin', pass: '123', icon: <Shield size={16} />, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { label: 'Kitchen', user: 'kitchen', pass: '123', icon: <Utensils size={16} />, color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
    { label: 'Cashier', user: 'cashier', pass: '123', icon: <MonitorCheck size={16} />, color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  ];

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">

        {/* Left Side: Form */}
        <div className="flex-1 flex flex-col">
          <div className="p-8 text-center bg-beige">
            <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center mx-auto mb-4 text-beige shadow-lg">
              <ChefHat size={32} />
            </div>
            <h1 className="font-serif text-3xl font-bold text-forest">Rustic Roots</h1>
            <p className="text-stone-500 text-sm uppercase tracking-widest mt-1">Staff Access</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6 flex-1">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold animate-pulse">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 text-stone-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-forest text-charcoal"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-stone-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-forest text-charcoal"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-terracotta text-white font-bold rounded-xl hover:bg-terracotta/90 transition shadow-lg"
            >
              Login
            </button>
          </form>

          <div className="bg-stone-100 p-4 text-center text-xs text-stone-400 border-t border-stone-200">
            Protected Area • Authorized Personnel Only
          </div>
        </div>

        {/* Right Side: Demo Accounts */}
        <div className="bg-stone-50 p-8 border-l border-stone-200 md:w-80 flex flex-col justify-center">
          <h3 className="font-bold text-charcoal mb-4 uppercase text-xs tracking-wider text-center md:text-left">Quick Demo Access</h3>
          <div className="space-y-3">
            {demoUsers.map((demo) => (
              <button
                key={demo.label}
                type="button"
                onClick={() => fillCredentials(demo.user, demo.pass)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 group text-left ${demo.color}`}
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {demo.icon}
                </div>
                <div>
                  <div className="font-bold text-sm">{demo.label}</div>
                  <div className="text-[10px] opacity-70">User: {demo.user}</div>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-stone-400 text-center leading-relaxed">
            Click any role above to auto-fill credentials for testing purposes.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;