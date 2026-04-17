'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

type Tab = 'overview' | 'marketplace' | 'chats' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // All Data state
  const [adminData, setAdminData] = useState<{
    appUsers: any[],
    marketplaceUsers: any[],
    chats: any[],
    listings: any[],
    orders: any[],
    trades: any[]
  }>({ appUsers: [], marketplaceUsers: [], chats: [], listings: [], orders: [], trades: [] });
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit State
  const [editingItem, setEditingItem] = useState<{ type: string, item: any } | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'agrobot-admin-2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    router.push('/');
  };

  const fetchAllData = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`/api/admin/data?secret=agrobot-admin-2026`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdminData(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/admin/data?secret=agrobot-admin-2026`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) fetchAllData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/data?secret=agrobot-admin-2026`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.item.id,
          data: editingItem.item
        }),
      });
      if (res.ok) {
        setEditingItem(null);
        fetchAllData();
      }
    } catch (err) {
      alert('Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>

        <Link href="/" className="absolute top-12 left-12 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-all z-10 px-6 py-2.5 border border-white/10 rounded-full hover:bg-white/5">
          Return
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-3xl p-12 rounded-[3.5rem] w-full max-w-md relative z-10 border border-white/10 shadow-3xl"
        >
          <div className="flex justify-center mb-10">
            <div className="bg-cyan-500/10 px-6 py-2 rounded-full text-cyan-400 font-black text-[10px] uppercase tracking-[0.5em] border border-cyan-500/20">
              Admin Vault
            </div>
          </div>
          <h1 className="text-4xl font-black text-center text-white mb-3 uppercase tracking-tighter">Console</h1>
          <p className="text-[10px] font-bold text-slate-500 text-center mb-12 px-4 uppercase tracking-[0.2em] leading-loose opacity-60">Authorize Secure Portal Access</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ACCESS TOKEN"
                className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 outline-none transition-all font-black text-[12px] uppercase tracking-[0.3em] placeholder:text-slate-700"
              />
            </div>
            {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center">ERROR: {error}</p>}
            <button
              type="submit"
              className="w-full bg-cyan-500 text-slate-950 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-cyan-400 active:scale-[0.98] transition-all shadow-2xl shadow-cyan-500/20"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const TabButton = ({ id, label }: { id: Tab, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full text-left px-5 py-3.5 rounded-xl font-bold text-sm transition-all relative flex items-center gap-3 ${activeTab === id
        ? 'bg-cyan-50 text-cyan-600'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
        }`}
    >
      {activeTab === id && <div className="w-1 h-5 bg-cyan-600 rounded-full mr-2" />}
      <span className="flex-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1C1E] font-sans">
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 p-6 hidden lg:flex flex-col z-50">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
          <span className="text-lg font-bold text-[#1A1C1E]">AAMS Portal</span>
        </div>

        <nav className="flex-1 space-y-1">
          <TabButton id="overview" label="Dashboard Overview" />
          <TabButton id="marketplace" label="Marketplace Manager" />
          <TabButton id="chats" label="Service Logs" />
          <TabButton id="users" label="Farmer Manager" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-2">
          <Link href="/" className="px-5 py-3 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors">
            Exit to Application
          </Link>
          <button onClick={handleLogout} className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
            Signed Termination
          </button>
        </div>
      </aside>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="px-10 py-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 bg-white border border-slate-200 rounded-xl lg:hidden text-slate-600"
            >
              Menu
            </button>
            <h2 className="text-3xl font-extrabold text-[#1A1C1E] tracking-tight">
              {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchAllData}
              disabled={dataLoading}
              className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 hover:border-cyan-500 hover:text-cyan-500 transition-all"
            >
              {dataLoading ? 'Syncing...' : 'Reload Data'}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              className="fixed inset-0 z-50 bg-slate-900 p-8 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-black text-white uppercase tracking-tighter leading-none">Management</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Close</button>
              </div>
              <nav className="space-y-2 mb-12">
                <TabButton id="overview" label="Overview" />
                <TabButton id="marketplace" label="Marketplace" />
                <TabButton id="chats" label="Chat Logs" />
                <TabButton id="users" label="User Manager" />
              </nav>
              <button onClick={handleLogout} className="mt-auto block text-red-500 font-black text-[10px] uppercase tracking-widest">
                Log Termination
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-10 lg:p-16 flex-1 overflow-x-hidden">
          {dataLoading && adminData.chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="px-10 py-5 bg-slate-950 rounded-full text-cyan-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">
                Analyzing
              </div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em]">Extracting Strategic Database Layers...</p>
            </div>
          ) : (
            <div className="space-y-16">

              {activeTab === 'overview' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <StatCard label="Total Interactions" val={adminData.chats.length} grow="2 new" type="LOGS" color="emerald" />
                    <StatCard label="Active Matches" val={adminData.trades.length} grow="1 new" type="TRADES" color="blue" />
                    <StatCard label="Market Listings" val={adminData.listings.length} grow="3 active" type="LISTINGS" color="amber" />
                    <StatCard label="Farmer Directory" val={adminData.appUsers.length} grow="Verified" type="MEMBERS" color="purple" />
                    <StatCard label="Global Users" val={adminData.marketplaceUsers.length} grow="Live" type="USERS" color="cyan" />
                    <StatCard label="Critical Alerts" val={adminData.trades.filter((t: any) => t.status === 'pending').length} grow="Pending" type="ALERTS" color="red" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 py-10">
                      <div className="flex items-center justify-between mb-12">
                        <h3 className="text-base font-black tracking-[0.4em] flex items-center gap-4 uppercase text-slate-950">
                          <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                          Interaction Flow
                        </h3>
                        <button onClick={() => setActiveTab('chats')} className="text-[10px] font-black text-cyan-600 hover:tracking-[0.2em] transition-all flex items-center gap-1 uppercase tracking-widest">Global View</button>
                      </div>
                      <div className="space-y-6">
                        {adminData.chats.slice(0, 6).map((chat: any) => (
                          <div key={chat.id} className="flex items-start gap-6 p-6 hover:bg-slate-50 transition-all rounded-[2rem] group border border-transparent hover:border-slate-100">
                            <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${chat.role === 'user' ? 'bg-cyan-400' : 'bg-emerald-400'}`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-base font-black text-slate-900 truncate uppercase tracking-tighter">{chat.user_email}</p>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{format(new Date(chat.timestamp), 'HH:mm')}</span>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{chat.content}</p>
                            </div>
                            <button onClick={() => handleDelete('chat', chat.id)} className="px-5 py-2.5 bg-slate-50 text-[9px] font-black text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-[0.2em] rounded-full">Terminate</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200">
                        <h4 className="text-lg font-black mb-6 flex items-center gap-2 text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">Market Pulse</h4>
                        <div className="space-y-6">
                          <PulseItem label="Avg Listing Price" val="UGX 2,400" type="VAL" />
                          <PulseItem label="Popular Crop" val="Maize" type="TOP" />
                          <PulseItem label="Top District" val="Wakiso" type="LOC" />
                        </div>
                        <button onClick={() => setActiveTab('marketplace')} className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm transition-all border border-white/5">Go to Marketplace</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chats' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="py-10 border-b border-slate-100 flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-950 uppercase leading-none mb-2">Interaction Vault</h2>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">Secure record of all conversations</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-950 text-white px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-[0.4em] border border-slate-800">{adminData.chats.length} LOGS</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-left text-[0.65rem] font-black uppercase text-slate-500 tracking-[0.3em]">
                          <th className="px-6 py-4 border-b border-r border-slate-200">Sender</th>
                          <th className="px-6 py-4 border-b border-r border-slate-200">Role</th>
                          <th className="px-6 py-4 border-b border-r border-slate-200 min-w-[300px]">Content</th>
                          <th className="px-6 py-4 border-b border-r border-slate-200">Timestamp</th>
                          <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.chats.map((chat: any) => (
                          <tr key={chat.id} className="group hover:bg-slate-50 transition-all">
                            <td className="px-6 py-5 border-r border-slate-100 text-slate-900 font-bold text-sm">{chat.user_email}</td>
                            <td className="px-6 py-5 border-r border-slate-100">
                              <span className={`text-[0.6rem] font-black uppercase px-3 py-1.5 rounded-full border ${chat.role === 'user' ? 'bg-cyan-50 border-cyan-100 text-cyan-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>{chat.role}</span>
                            </td>
                            <td className="px-6 py-5 border-r border-slate-100 text-slate-600 text-[13px] font-medium leading-relaxed max-w-lg">{chat.content}</td>
                            <td className="px-6 py-5 border-r border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest">{format(new Date(chat.timestamp), 'MMM dd, HH:mm')}</td>
                            <td className="px-6 py-5 text-right">
                              <button onClick={() => handleDelete('chat', chat.id)} className="px-4 py-2 bg-slate-50 group-hover:bg-red-50 text-[9px] font-bold text-slate-400 group-hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 uppercase tracking-[0.2em]">Kill</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="py-10 border-b border-slate-100 bg-transparent flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-950 uppercase mb-2">Farmer Directory</h2>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">Strategic Network Database</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-slate-950 text-white px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-[0.4em] border border-slate-800">{adminData.appUsers.length} MEMBERS</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[0.65rem] font-black uppercase text-slate-500 tracking-[0.3em]">
                          <th className="px-6 py-4 border-b border-r border-slate-200">Member Identity</th>
                          <th className="px-8 py-4 border-b border-r border-slate-200">Strategic Location</th>
                          <th className="px-8 py-4 border-b border-r border-slate-200">Deployment Date</th>
                          <th className="px-8 py-4 border-b border-slate-200 text-right">Operational Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminData.appUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                            <td className="px-6 py-5 border-r border-slate-100">
                              <div className="font-bold text-slate-950 text-sm">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-bold lowercase mt-0.5">{u.email}</div>
                            </td>
                            <td className="px-8 py-5 border-r border-slate-100 text-slate-500 font-bold uppercase tracking-tight text-[12px]">{u.district || 'Unknown Area'}</td>
                            <td className="px-8 py-5 border-r border-slate-100 text-slate-300 text-[10px] font-bold uppercase tracking-widest">{format(new Date(u.created_at), 'MMMM dd, yyyy')}</td>
                            <td className="px-8 py-5 text-right flex justify-end gap-3 translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all items-center">
                              <button onClick={() => setEditingItem({ type: 'app-user', item: u })} className="px-5 py-2 bg-slate-50 text-[9px] font-bold text-slate-400 hover:bg-cyan-600 hover:text-white rounded-lg uppercase tracking-widest transition-all">Mod</button>
                              <button onClick={() => handleDelete('app-user', u.id)} className="px-5 py-2 bg-slate-50 text-[9px] font-bold text-slate-400 hover:bg-red-500 hover:text-white rounded-lg uppercase tracking-widest transition-all">Del</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'marketplace' && (
                <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="">
                    <div className="py-10 border-b border-slate-100 flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black text-slate-950 flex items-center gap-4 uppercase tracking-tighter">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        Market Topology
                      </h3>
                      <div className="bg-slate-950 text-white px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-[0.4em] border border-slate-800">{adminData.marketplaceUsers.length} MEMBERS</div>
                    </div>
                    <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50 text-[0.65rem] font-bold uppercase text-slate-500 tracking-[0.2em]">
                            <th className="px-8 py-4 border-b border-r border-slate-200">Participant Name</th>
                            <th className="px-8 py-4 border-b border-r border-slate-200">Market Role</th>
                            <th className="px-8 py-4 border-b border-r border-slate-200">Status</th>
                            <th className="px-8 py-4 border-b border-slate-200 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminData.marketplaceUsers.map((u: any) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-all group">
                              <td className="px-8 py-6 border-r border-slate-100">
                                <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                              </td>
                              <td className="px-8 py-6 border-r border-slate-100">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${u.role === 'seller' ? 'text-emerald-500' : 'text-blue-500'}`}>{u.role}</span>
                              </td>
                              <td className="px-8 py-6 border-r border-slate-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right space-x-2">
                                <button onClick={() => setEditingItem({ type: 'marketplace-user', item: u })} className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 hover:text-cyan-600 rounded-lg uppercase tracking-widest transition-all">Mod</button>
                                <button onClick={() => handleDelete('marketplace-user', u.id)} className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-400 hover:text-red-500 rounded-lg uppercase tracking-widest transition-all">Del</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <MarketTable label="Active Listings" data={adminData.listings} type="listing" badge="SALE" col="emerald" onEdit={(i: any) => setEditingItem({ type: 'listing', item: i })} onDelete={(id: string) => handleDelete('listing', id)} />
                    <MarketTable label="Buy Orders" data={adminData.orders} type="order" badge="BUY" col="blue" onEdit={(i: any) => setEditingItem({ type: 'order', item: i })} onDelete={(id: string) => handleDelete('order', id)} />
                  </div>

                  {/* TRADES LOG */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <h3 className="text-base font-bold px-8 py-6 bg-slate-50 border-b border-slate-200 text-slate-950 uppercase tracking-widest">
                       Transaction Vault
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/50 text-[0.65rem] font-bold uppercase text-slate-500 tracking-[0.2em]">
                            <th className="px-6 py-4 border-b border-r border-slate-200">Commodity</th>
                            <th className="px-6 py-4 border-b border-r border-slate-200">Participants</th>
                            <th className="px-6 py-4 border-b border-r border-slate-200">Economics</th>
                            <th className="px-6 py-4 border-b border-slate-200 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminData.trades.map((t: any) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-all group">
                              <td className="px-6 py-6 border-r border-slate-100">
                                <p className="font-bold text-slate-950 uppercase tracking-tight text-[13px]">{t.crop}</p>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.quantity_kg} KG Total</span>
                              </td>
                              <td className="px-6 py-6 border-r border-slate-100">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div> S: {t.seller_name}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div> B: {t.buyer_name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-6 border-r border-slate-100">
                                <p className="text-sm font-black text-slate-900 tracking-tighter text-sm">UGX {t.total_value.toLocaleString()}</p>
                                <span className="text-[9px] font-bold text-slate-400 lowercase italic">UGX {t.agreed_price_per_kg}/kg</span>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {adminData.trades.length === 0 && <p className="text-center py-20 text-slate-300 font-bold italic uppercase tracking-widest text-[10px]">Vault Empty</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingItem(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl relative shrink-0 overflow-hidden"
            >
              <div className="p-8 sm:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="px-5 py-2 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">MOD</div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Modify Asset</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{editingItem.type.replace('-', ' ')}</p>
                  </div>
                </div>
                <button onClick={() => setEditingItem(null)} className="px-5 py-2 bg-white text-[10px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest border border-slate-200 rounded-2xl transition-all">Close</button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 sm:p-10 space-y-6">
                {editingItem.type.includes('user') && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                      <input type="text" value={editingItem.item.name} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, name: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Primary Email</label>
                      <input type="email" value={editingItem.item.email} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, email: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">{editingItem.type === 'app-user' ? 'Registered Location' : 'Market District'}</label>
                      <input type="text" value={editingItem.type === 'app-user' ? (editingItem.item.location || '') : (editingItem.item.district || '')}
                        onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, [editingItem.type === 'app-user' ? 'location' : 'district']: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                  </div>
                )}

                {(editingItem.type === 'listing' || editingItem.type === 'order') && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Product Description</label>
                      <input type="text" value={editingItem.item.crop} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, crop: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Stock (kg)</label>
                        <input type="number" value={editingItem.item.quantity_kg} onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, quantity_kg: e.target.value } })}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">{editingItem.type === 'listing' ? 'UGX / kg' : 'Max UGX / kg'}</label>
                        <input type="number" value={editingItem.type === 'listing' ? editingItem.item.price_per_kg : editingItem.item.max_price_per_kg}
                          onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, [editingItem.type === 'listing' ? 'price_per_kg' : 'max_price_per_kg']: e.target.value } })}
                          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold text-slate-900" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-4.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
                  <button type="submit" disabled={editLoading} className="flex-1 py-4.5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl transition-all">
                    {editLoading ? 'Syncing...' : 'Commit Changes'}
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

function StatCard({ label, val, grow, type, color }: any) {
  const borderColors: any = {
    emerald: 'border-[#1E2B3C]', // Navy
    blue: 'border-[#E6B143]', // Gold/Amber
    amber: 'border-[#27AE60]', // Green
    purple: 'border-[#6C5CE7]',
    cyan: 'border-[#00BCD4]',
    red: 'border-[#FF4757]'
  }
  const textColors: any = {
    emerald: 'text-[#1E2B3C]',
    blue: 'text-[#E6B143]',
    amber: 'text-[#27AE60]',
    purple: 'text-[#6C5CE7]',
    cyan: 'text-[#00BCD4]',
    red: 'text-[#FF4757]'
  }
  return (
    <div className={`bg-white rounded-[1.5rem] shadow-sm border-t-4 ${borderColors[color] || 'border-slate-200'} p-8 relative overflow-hidden flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <p className={`text-4xl font-extrabold ${textColors[color] || 'text-[#1A1C1E]'} tracking-tight`}>{val}</p>
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${color === 'amber' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
          {grow} {type.toLowerCase()}
        </span>
      </div>
      <div>
        <p className="text-[11px] font-black text-[#1A1C1E] uppercase tracking-[0.15em] opacity-100">{label}</p>
      </div>
    </div>
  );
}

function PulseItem({ label, val, type }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="px-3 py-1 bg-white/10 rounded-xl text-white/50 font-black text-[9px] uppercase tracking-widest">{type}</div>
      <div>
        <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em]">{label}</p>
        <p className="font-bold text-white tracking-tight">{val}</p>
      </div>
    </div>
  );
}

function MarketTable({ label, data, type, badge, col, onEdit, onDelete }: any) {
  const color = col === 'emerald' ? 'text-emerald-500' : 'text-cyan-500';
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-6 py-6 flex items-center justify-between bg-slate-50 border-b border-slate-200">
        <h4 className="font-bold text-slate-950 flex items-center gap-3 uppercase tracking-widest text-[11px]">
          <div className={`w-1.5 h-4 bg-current rounded-full ${color}`}></div>
          {label}
        </h4>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.length} Total</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/50 text-[0.65rem] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-3 border-b border-r border-slate-200">Commodity</th>
              <th className="px-6 py-3 border-b border-r border-slate-200">Volume</th>
              <th className="px-6 py-3 border-b border-slate-200 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item: any) => (
              <tr key={item.id} className="group hover:bg-slate-50 transition-all">
                <td className="px-6 py-4 border-r border-slate-100">
                  <div className="font-bold text-slate-950 uppercase tracking-tight text-[12px]">{item.crop}</div>
                  <p className="text-[9px] font-bold text-slate-400 lowercase mt-0.5">{item.seller_name || item.buyer_name}</p>
                </td>
                <td className="px-6 py-4 border-r border-slate-100 font-bold text-slate-700 text-sm tracking-tighter">{item.quantity_kg}kg</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => onEdit(item)} className="px-3 py-1 bg-slate-50 text-[9px] font-bold text-slate-400 hover:text-cyan-600 rounded-lg transition-all opacity-0 group-hover:opacity-100 uppercase tracking-widest">Mod</button>
                  <button onClick={() => onDelete(item.id)} className="px-3 py-1 bg-slate-50 text-[9px] font-bold text-slate-400 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 uppercase tracking-widest">Del</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">No Data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
