'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  Mail, 
  Terminal, 
  LogOut,
  Calendar,
  Database,
  Loader
} from 'lucide-react';

export default function AuthPage() {
  const { user, login, logout, addLog } = usePlayer();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot'
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    addLog(`[AUTH] Initiating authentication socket connection for: ${email || username}`);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: email || username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        addLog(`[AUTH] Handshake success. JWT token cached. Logged in as: ${data.user.username}`);
      } else {
        setError(data.error || 'Authentication compile failure.');
        addLog(`[ERROR] Auth failed: ${data.error}`);
      }
    } catch (err) {
      setError('Connection socket timeout.');
      addLog(`[ERROR] Auth API connection timed out.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    addLog(`[AUTH] Creating new user record: ${username} (${email})`);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
        addLog(`[AUTH] User compiled successfully. Automatic session started.`);
      } else {
        setError(data.error || 'Signup compilation aborted.');
        addLog(`[ERROR] Signup failed: ${data.error}`);
      }
    } catch (err) {
      setError('Connection socket timeout.');
      addLog(`[ERROR] Signup API connection timed out.`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    addLog(`[AUTH] Querying password recovery registry for: ${email}`);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        addLog(`[AUTH] Reset packet dispatched successfully to: ${email}`);
      } else {
        setError(data.error || 'Recovery socket rejected.');
        addLog(`[ERROR] Recovery failed: ${data.error}`);
      }
    } catch (err) {
      setError('Connection socket timeout.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    addLog('[AUTH] Bypassing authorization layer. Guest mode session initialized.');
    addLog('[INFO] Playlists and history will fall back to local disk storage.');
    setMessage('Developer Guest mode enabled successfully. You can now use all playback features!');
  };

  // Render Logged-In User Profile Dashboard
  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col justify-center min-h-[calc(100vh-8rem)] select-none font-mono"
      >
        <div className="bg-bg-secondary/40 border border-border-color/60 rounded-xl p-5 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
              user.role === 'admin' 
                ? 'border-red-500/50 bg-red-500/10 text-red-400' 
                : 'border-accent/50 bg-accent/10 text-accent'
            }`}>
              {user.role} console
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/10 border border-accent flex items-center justify-center text-accent text-2xl md:text-3xl font-extrabold shadow-[0_0_15px_var(--accent-glow)] flex-shrink-0">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-bold text-text-primary flex items-center gap-2 truncate">
                {user.username}
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" title="Socket active" />
              </h2>
              <p className="text-[11px] md:text-xs text-text-secondary truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 md:mb-8 text-xs">
            <div className="bg-bg-tertiary/40 border border-border-color/40 rounded p-4 flex items-center gap-3">
              <Calendar className="text-accent" size={16} />
              <div>
                <span className="text-text-secondary text-[10px] block font-bold">session_start_dt</span>
                <span className="text-text-primary block mt-0.5">2026-06-17</span>
              </div>
            </div>
            <div className="bg-bg-tertiary/40 border border-border-color/40 rounded p-4 flex items-center gap-3">
              <Database className="text-accent" size={16} />
              <div>
                <span className="text-text-secondary text-[10px] block font-bold">cloud_database</span>
                <span className="text-text-primary block mt-0.5">MongoDB Atlas (Connected)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/40 bg-red-500/5 text-red-400 hover:bg-red-500/20 rounded cursor-pointer transition-all text-xs font-bold w-full sm:w-auto"
            >
              <LogOut size={14} />
              <span>LOGOUT SESSION (exit 0)</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render Login / Register forms
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 md:p-6 font-mono select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-bg-secondary/40 border border-border-color/60 rounded-xl p-5 md:p-6 shadow-2xl hover:border-accent/20 transition-colors"
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-border-color/60 pb-3 mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 border border-green-500/60" />
          </div>
          <span className="text-[10px] text-text-secondary font-bold">bash --login.sh</span>
        </div>

        {/* Form Switcher */}
        <div className="flex border-b border-border-color/60 mb-5 bg-bg-tertiary/40 rounded p-0.5">
          <button
            onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
            className={`flex-1 py-1.5 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
              activeTab === 'login' ? 'bg-bg-secondary text-accent border border-border-color/60 shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            01. SIGN IN
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setMessage(''); }}
            className={`flex-1 py-1.5 text-[11px] font-semibold rounded cursor-pointer transition-colors ${
              activeTab === 'register' ? 'bg-bg-secondary text-accent border border-border-color/60 shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            02. REGISTER
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded">
            [COMPILE ERROR] {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-accent/10 border border-accent/30 text-accent text-xs rounded whitespace-pre-wrap">
            {message}
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">email_or_username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. sanjay@dev.com or sanjay"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <User size={13} className="absolute left-3 top-3 text-text-secondary" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[9px] text-accent hover:underline cursor-pointer"
                >
                  forgot_password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <Lock size={13} className="absolute left-3 top-3 text-text-secondary" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-xs font-bold shadow-[0_0_12px_var(--accent-glow)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={13} className="animate-spin" />
                  RUNNING AUTH COMPILER...
                </span>
              ) : 'npm run auth:login'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. sanjay_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <User size={13} className="absolute left-3 top-3 text-text-secondary" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">email_address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="sanjay@dev.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <Mail size={13} className="absolute left-3 top-3 text-text-secondary" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <Lock size={13} className="absolute left-3 top-3 text-text-secondary" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-xs font-bold shadow-[0_0_12px_var(--accent-glow)] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={13} className="animate-spin" />
                  COMPILING NEW USER...
                </span>
              ) : 'npm run auth:signup'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">email_address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="sanjay@dev.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded px-3 py-2 pl-9 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors font-mono"
                />
                <Mail size={13} className="absolute left-3 top-3 text-text-secondary" />
              </div>
            </div>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="flex-1 py-2 border border-border-color text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/20 rounded text-xs font-bold cursor-pointer transition-colors"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-2 bg-accent text-bg-primary hover:bg-accent/90 border border-transparent rounded text-xs font-bold shadow-[0_0_12px_var(--accent-glow)] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'SEARCHING...' : 'git commit -m "reset"'}
              </button>
            </div>
          </form>
        )}

        {/* Guest Mode Trigger */}
        <div className="mt-5 pt-4 border-t border-border-color/60 flex flex-col gap-2.5">
          <div className="text-center text-[9px] text-text-secondary">
            OR PREFER SECURE OFFLINE BYPASS?
          </div>
          <button
            onClick={handleGuestMode}
            type="button"
            className="w-full py-2 border border-accent/30 bg-accent/5 text-accent hover:bg-accent/15 rounded text-xs font-bold cursor-pointer transition-all"
          >
            node bypass_auth.js (Guest Mode)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
