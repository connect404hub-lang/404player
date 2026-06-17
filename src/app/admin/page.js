'use client';

import React, { useEffect, useState } from 'react';
import { usePlayer } from '@/lib/store';
import { 
  Terminal, 
  ShieldAlert, 
  Users, 
  Database, 
  Heart, 
  History,
  Lock,
  Unlock,
  Trash2,
  Cpu
} from 'lucide-react';

export default function AdminPage() {
  const { user, token, addLog } = usePlayer();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    addLog('[ADMIN] Requesting master stats packets...');
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users || []);
        addLog('[ADMIN] System statistics read successfully.');
      } else {
        const errData = await res.json();
        setError(errData.error || 'Admin compile exception.');
        addLog(`[ERROR] Admin fetch failure: ${errData.error}`);
      }
    } catch (e) {
      setError('Connection socket timeout.');
      addLog('[ERROR] Connection timeout fetching admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleUserAction = async (targetUserId, action) => {
    addLog(`[ADMIN] Dispatching control request: action=${action.toUpperCase()} target=${targetUserId}`);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        addLog(`[ADMIN] Control action completed: ${data.message}`);
        fetchAdminData();
      } else {
        addLog(`[ERROR] Admin control rejected: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto flex flex-col justify-center h-full select-none font-mono min-h-[calc(100vh-8rem)]">
        <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-5 md:p-6 text-center shadow-2xl">
          <ShieldAlert className="text-red-500 mx-auto mb-4 animate-bounce" size={40} />
          <h2 className="text-red-500 font-bold text-xs uppercase tracking-wider mb-2">ACCESS VIOLATION - EXCEPTION 403</h2>
          <p className="text-[11px] text-text-secondary leading-relaxed mb-4">
            Security kernel has blocked client request. Administrator privileges are required to bind to this port.
          </p>
          <span className="text-[10px] text-text-secondary block border border-border-color bg-bg-tertiary p-2 rounded text-left font-mono">
            $ whoami <br />
            {user ? user.username : 'guest'} (Permission Denied)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 font-mono select-none flex flex-col gap-5 md:gap-6 pb-20 md:pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border-color pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="text-red-500" size={14} />
          <span className="text-[11px] text-text-secondary">// ROOT: MASTER_CONTROL.sh</span>
        </div>
        <span className="text-[9px] text-red-400 font-bold px-2 py-0.5 border border-red-500/30 bg-red-500/5 rounded">
          SECURE KERNEL
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-accent text-xs animate-pulse">
          <Cpu className="animate-spin text-red-500" size={13} />
          <span>[SYSTEM] Fetching global registries...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-xs">[EXCEPTION] {error}</div>
      ) : (
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Stats widgets */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-3 md:p-4 flex items-center gap-3.5">
                <Users className="text-red-500" size={20} />
                <div>
                  <span className="text-text-secondary text-[9px] block font-bold uppercase">Accounts</span>
                  <span className="text-sm md:text-base font-extrabold text-text-primary mt-0.5">{stats.totalUsers}</span>
                </div>
              </div>
              <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-3 md:p-4 flex items-center gap-3.5">
                <Database className="text-blue-500" size={20} />
                <div>
                  <span className="text-text-secondary text-[9px] block font-bold uppercase">Playlists</span>
                  <span className="text-sm md:text-base font-extrabold text-text-primary mt-0.5">{stats.totalPlaylists}</span>
                </div>
              </div>
              <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-3 md:p-4 flex items-center gap-3.5">
                <Heart className="text-purple-500" size={20} />
                <div>
                  <span className="text-text-secondary text-[9px] block font-bold uppercase">Likes</span>
                  <span className="text-sm md:text-base font-extrabold text-text-primary mt-0.5">{stats.totalFavorites}</span>
                </div>
              </div>
              <div className="bg-bg-secondary/30 border border-border-color/60 rounded-lg p-3 md:p-4 flex items-center gap-3.5">
                <History className="text-accent" size={20} />
                <div>
                  <span className="text-text-secondary text-[9px] block font-bold uppercase">Streams</span>
                  <span className="text-sm md:text-base font-extrabold text-text-primary mt-0.5">{stats.totalHistory}</span>
                </div>
              </div>
            </div>
          )}

          {/* User management table */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[10px] md:text-xs text-red-500 font-bold uppercase tracking-wider">registered_users_table</h3>
            <div className="border border-border-color rounded-lg overflow-hidden bg-bg-secondary/20">
              <div className="grid grid-cols-3 md:grid-cols-4 bg-bg-secondary border-b border-border-color p-3 text-[9px] md:text-[10px] text-text-secondary font-bold uppercase">
                <div>username</div>
                <div className="hidden md:block">email_address</div>
                <div>system_role</div>
                <div className="text-right">actions_matrix</div>
              </div>
              {users.map((item) => (
                <div 
                  key={item._id}
                  className="grid grid-cols-3 md:grid-cols-4 p-3 border-b border-border-color/30 hover:bg-bg-secondary/40 transition-colors items-center text-xs text-text-secondary"
                >
                  <div className="font-semibold text-text-primary truncate">{item.username}</div>
                  <div className="hidden md:block truncate pr-2">{item.email}</div>
                  <div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      item.role === 'admin' 
                        ? 'border-red-500/40 bg-red-500/5 text-red-400' 
                        : 'border-accent/40 bg-accent/5 text-accent'
                    }`}>
                      {item.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    {item.role !== 'admin' && (
                      <>
                        {item.isBanned ? (
                          <button
                            onClick={() => handleUserAction(item._id, 'unban')}
                            className="p-1 hover:text-green-400 transition-colors flex items-center gap-1 border border-green-500/20 bg-green-500/5 px-2 py-0.5 rounded text-[9px] cursor-pointer"
                          >
                            <Unlock size={10} />
                            <span className="hidden sm:inline">UNBAN</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(item._id, 'ban')}
                            className="p-1 hover:text-red-400 transition-colors flex items-center gap-1 border border-red-500/20 bg-red-500/5 px-2 py-0.5 rounded text-[9px] cursor-pointer"
                          >
                            <Lock size={10} />
                            <span className="hidden sm:inline">BAN</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleUserAction(item._id, 'delete')}
                          className="p-1 hover:text-red-500 transition-colors text-text-secondary cursor-pointer"
                          title="Purge user file"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
