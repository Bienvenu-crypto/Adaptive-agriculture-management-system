'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MpUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  district: string;
  role: 'seller' | 'buyer';
}

interface Listing {
  id: string;
  seller_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  currency: string;
  description: string | null;
  status: string;
  created_at: string;
  seller_name: string;
  seller_district: string;
  seller_phone: string | null;
}

interface BuyOrder {
  id: string;
  buyer_id: string;
  crop: string;
  quantity_kg: number;
  max_price_per_kg: number;
  currency: string;
  description: string | null;
  status: string;
  created_at: string;
  buyer_name: string;
  buyer_district: string;
  buyer_phone: string | null;
}

interface Trade {
  id: string;
  crop: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  total_value: number;
  currency: string;
  status: string;
  payment_status: 'unpaid' | 'pending' | 'paid';
  payment_method: string | null;
  payment_phone: string | null;
  created_at: string;
  seller_name: string;
  seller_phone: string | null;
  seller_district: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_district: string;
  seller_id: string;
  buyer_id: string;
  completed_at?: string;
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({
  onClose,
  onSuccess,
  defaultRole,
}: {
  onClose: () => void;
  onSuccess: (user: MpUser) => void;
  defaultRole: 'seller' | 'buyer';
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'seller' | 'buyer'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint =
        mode === 'signup'
          ? '/api/marketplace/auth/register'
          : '/api/marketplace/auth/login';

      const body =
        mode === 'signup'
          ? { ...form, role }
          : { email: form.email, password: form.password, phone: form.phone, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          Close
        </button>

        <div className="p-8">
          {/* Role selector */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            {(['seller', 'buyer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest capitalize transition-all ${role === r
                    ? r === 'seller'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {r === 'seller' ? 'Seller' : 'Buyer'}
              </button>
            ))}
          </div>

          <div className={`flex justify-center mb-4`}>
            <div className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${role === 'seller' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {role === 'seller' ? 'Store' : 'Cart'}
            </div>
          </div>

          <h2 className="text-2xl font-black text-center text-slate-900 mb-1 uppercase tracking-tighter">
            {mode === 'login' ? 'Welcome back' : `Join as ${role}`}
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm">
            {mode === 'login'
              ? `Sign in to your ${role} account`
              : role === 'seller'
                ? 'List your crops and connect with buyers'
                : 'Find the best crop deals from local farmers'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">District</label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    placeholder="e.g. Wakiso"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Manual district entry</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="tel"
                required={mode === 'signup'}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="+256 700..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 flex gap-2 items-center">
                <span className="flex-shrink-0 bg-red-600 text-white px-2 py-0.5 rounded-lg text-[8px]">ERROR</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70 ${role === 'seller' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className={`font-bold hover:underline ${role === 'seller' ? 'text-emerald-600' : 'text-blue-600'}`}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>

          {mode === 'signup' && (
            <p className="mt-3 text-center text-xs text-slate-400">
              💡 You can create both a seller and buyer account using the same email.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Listing Modal ───────────────────────────────────────────────────────
function AddListingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    crop: '', 
    quantity_kg: '', 
    price_per_kg: '', 
    currency: 'UGX',
    description: '' 
  });

  const currencies = ['UGX', 'KES', 'RWF', 'TZS', 'NGN', 'GHS', 'ZAR', 'USD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity_kg: parseFloat(form.quantity_kg),
          price_per_kg: parseFloat(form.price_per_kg),
          currency: form.currency,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Close</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 px-3 py-1.5 rounded-xl text-emerald-600 font-black text-[10px] uppercase tracking-widest">New</div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">New Listing</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Post your crop for sale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Crop Name</label>
              <input type="text" required value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                placeholder="e.g. Maize" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Currency</label>
              <select 
                value={form.currency} 
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold appearance-none"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quantity (kg)</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity_kg} onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                placeholder="500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price/kg</label>
              <input type="number" required min="1" value={form.price_per_kg} onChange={e => setForm({ ...form, price_per_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                placeholder="1200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none font-medium"
              rows={2} placeholder="Grade A, freshly harvested..." />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-70 shadow-lg shadow-emerald-600/20">
            {loading ? 'Processing...' : `Post Listing (${form.currency})`}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Add Buy Order Modal ─────────────────────────────────────────────────────
function AddBuyOrderModal({
  onClose,
  onSuccess,
  prefillCrop,
  prefillCurrency = 'UGX',
}: {
  onClose: () => void;
  onSuccess: (trade: Trade | null) => void;
  prefillCrop?: string;
  prefillCurrency?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    crop: prefillCrop || '', 
    quantity_kg: '', 
    max_price_per_kg: '', 
    currency: prefillCurrency,
    description: '' 
  });

  const currencies = ['UGX', 'KES', 'RWF', 'TZS', 'NGN', 'GHS', 'ZAR', 'USD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/buy-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity_kg: parseFloat(form.quantity_kg),
          max_price_per_kg: parseFloat(form.max_price_per_kg),
          currency: form.currency,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.trade);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Close</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 px-3 py-1.5 rounded-xl text-blue-600 font-black text-[10px] uppercase tracking-widest">Order</div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">New Buy Order</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Request a crop</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Crop Name</label>
              <input type="text" required value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                placeholder="e.g. Maize" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Currency</label>
              <select 
                value={form.currency} 
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold appearance-none"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quantity (kg)</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity_kg} onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                placeholder="200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Max Price/kg</label>
              <input type="number" required min="1" value={form.max_price_per_kg} onChange={e => setForm({ ...form, max_price_per_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                placeholder="1500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none font-medium"
              rows={2} placeholder="Preferred grade, delivery notes..." />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-lg shadow-blue-600/20">
            {loading ? 'Submitting...' : `Submit Order (${form.currency})`}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Trade Success Toast ─────────────────────────────────────────────────────
function TradeToast({ trade, onDismiss }: { trade: Trade; onDismiss: () => void }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -60 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-emerald-100 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="bg-emerald-100 px-3 py-1.5 rounded-xl text-emerald-600 flex-shrink-0 font-black text-[9px] uppercase tracking-widest">
          Match
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-xs uppercase tracking-tighter">🎉 Trade Matched!</p>
          <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest leading-loose">
            <strong>{trade.quantity_kg} KG</strong> of <strong>{trade.crop}</strong> at <strong>{trade.currency} {trade.agreed_price_per_kg.toLocaleString()}/KG</strong>
          </p>
          <p className="text-[10px] text-emerald-700 font-black mt-1 uppercase tracking-[0.2em]">
            TOTAL VALUE: {trade.currency} {trade.total_value.toLocaleString()}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-50">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none px-1">Contact Intelligence</p>
            <div className="bg-slate-50 rounded-xl px-3 py-1.5">
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Seller ID: {trade.seller_name}</span>
               <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter block">{trade.seller_phone || 'REDACTED'}</span>
            </div>
          </div>
        </div>
        <button onClick={onDismiss} className="px-3 py-1.5 bg-slate-50 text-[9px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest border border-slate-100 rounded-lg transition-colors">Dismiss</button>
      </div>
    </motion.div>
  );
}

// ─── Main Marketplace Component ───────────────────────────────────────────────
export default function Marketplace() {
  const [mpUser, setMpUser] = useState<MpUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'buy-orders' | 'trades'>('browse');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<'seller' | 'buyer'>('seller');
  const [showAddListing, setShowAddListing] = useState(false);
  const [showAddBuyOrder, setShowAddBuyOrder] = useState(false);
  const [prefillCrop, setPrefillCrop] = useState('');
  const [prefillCurrency, setPrefillCurrency] = useState('UGX');
  const [tradeToast, setTradeToast] = useState<Trade | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch('/api/marketplace/auth/session')
      .then(r => r.json())
      .then(d => { setMpUser(d.user); setLoadingUser(false); })
      .catch(() => setLoadingUser(false));
  }, []);

  const fetchListings = useCallback(async () => {
    const res = await fetch('/api/marketplace/listings');
    const data = await res.json();
    setListings(data.listings || []);
  }, []);

  const fetchBuyOrders = useCallback(async () => {
    const res = await fetch('/api/marketplace/buy-orders');
    const data = await res.json();
    setBuyOrders(data.orders || []);
  }, []);

  const fetchTrades = useCallback(async () => {
    const res = await fetch('/api/marketplace/trades');
    const data = await res.json();
    setTrades(data.trades || []);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    await Promise.all([fetchListings(), fetchBuyOrders(), ...(mpUser ? [fetchTrades()] : [])]);
    setLoadingData(false);
  }, [fetchListings, fetchBuyOrders, fetchTrades, mpUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = async () => {
    await fetch('/api/marketplace/auth/session', { method: 'DELETE' });
    setMpUser(null);
    setActiveTab('browse');
    setTrades([]);
  };

  const confirmReceipt = async (tradeId: string) => {
    try {
      const res = await fetch('/api/marketplace/trades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tradeId, status: 'completed' }),
      });
      if (res.ok) {
        setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'completed' } : t));
      }
    } catch (err) {
      console.error('Failed to complete trade');
    }
  };

  const cancelListing = async (id: string) => {
    await fetch('/api/marketplace/listings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchListings();
  };

  const cancelBuyOrder = async (id: string) => {
    await fetch('/api/marketplace/buy-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchBuyOrders();
  };

  const myListings = listings.filter(l => mpUser && l.seller_id === mpUser.id);
  const myBuyOrders = buyOrders.filter(o => mpUser && o.buyer_id === mpUser.id);

  if (loadingUser) {
    return (
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-8 flex items-center justify-center min-h-[300px]">
        <div className="px-8 py-3 bg-emerald-100 rounded-xl text-emerald-600 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
          Exchanging
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <AuthModal
            key="auth-modal"
            onClose={() => setShowAuthModal(false)}
            onSuccess={(user) => { setMpUser(user); fetchAll(); }}
            defaultRole={authRole}
          />
        )}
        {showAddListing && (
          <AddListingModal
            key="add-listing-modal"
            onClose={() => setShowAddListing(false)}
            onSuccess={() => { fetchListings(); setActiveTab('my-listings'); }}
          />
        )}
        {showAddBuyOrder && (
          <AddBuyOrderModal
            key="add-buy-order-modal"
            onClose={() => setShowAddBuyOrder(false)}
            prefillCrop={prefillCrop}
            prefillCurrency={prefillCurrency}
            onSuccess={(trade) => {
              fetchAll();
              if (trade) setTradeToast(trade);
              setActiveTab('trades');
            }}
          />
        )}
        {tradeToast && (
          <TradeToast key="trade-toast" trade={tradeToast} onDismiss={() => setTradeToast(null)} />
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-black uppercase tracking-tighter">AgroMarket</h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Verified</span>
              </div>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                Agricultural Output Exchange
              </p>
            </div>

            {mpUser ? (
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="font-black text-sm uppercase tracking-tighter">{mpUser.name}</p>
                  <p className="text-emerald-200 text-[9px] uppercase tracking-widest font-black">{mpUser.role} · {mpUser.district}</p>
                </div>
                <button onClick={handleLogout} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                  className="bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Sell
                </button>
                <button
                  onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  Buy
                </button>
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 mt-4 text-xs">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{listings.length}</span>
              <span className="text-emerald-200 ml-1">listings</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{buyOrders.length}</span>
              <span className="text-emerald-200 ml-1">buy orders</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{trades.filter(t => t.status === 'pending' || t.status === 'completed').length}</span>
              <span className="text-emerald-200 ml-1">trades</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-slate-50 border-b border-black/5 overflow-x-auto">
          {([
            { key: 'browse', label: 'Browse' },
            ...(mpUser?.role === 'seller' ? [{ key: 'my-listings', label: 'Listings' }] : []),
            ...(mpUser?.role === 'buyer' ? [{ key: 'buy-orders', label: 'Orders' }] : []),
            ...(mpUser ? [{ key: 'trades', label: 'Trades' }] : []),
          ] as { key: string; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={fetchAll} className="px-3 py-2 text-[9px] font-black text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-colors uppercase tracking-widest" title="Refresh">
            {loadingData ? '...' : 'Sync'}
          </button>
        </div>

        <div className="p-5">
          {/* BROWSE TAB */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Active Listings */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Available Listings
                  </h4>
                  {mpUser?.role === 'seller' && (
                    <button onClick={() => setShowAddListing(true)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                      New Listing
                    </button>
                  )}
                  {!mpUser && (
                    <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                      className="text-[10px] text-emerald-600 font-black uppercase tracking-widest hover:underline">
                      Sell your crops
                    </button>
                  )}
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Output</p>
                    <p className="text-sm font-bold mt-1">Be the first to list a crop</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {listings.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black text-[9px] uppercase tracking-tighter flex-shrink-0">
                            CROP
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">{listing.crop}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {listing.seller_district} · {listing.seller_name}
                              {listing.seller_phone && ` · ${listing.seller_phone}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{listing.quantity_kg.toLocaleString()} kg</p>
                            <p className="text-xs text-emerald-700 font-bold">{listing.currency} {listing.price_per_kg.toLocaleString()}/kg</p>
                          </div>
                          {mpUser?.role === 'buyer' && (
                            <button
                              onClick={() => { 
                                setPrefillCrop(listing.crop); 
                                setPrefillCurrency(listing.currency);
                                setShowAddBuyOrder(true); 
                              }}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buy Orders */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Current Demand
                  </h4>
                  {mpUser?.role === 'buyer' && (
                    <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
                      New Order
                    </button>
                  )}
                  {!mpUser && (
                    <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                      className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">
                      Post a buy order
                    </button>
                  )}
                </div>

                {buyOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Demand</p>
                    <p className="text-sm font-bold mt-1">Post your crop requirements</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {buyOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-black text-[9px] uppercase tracking-tighter flex-shrink-0">
                            BUY
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">{order.crop}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {order.buyer_district} · {order.buyer_name}
                              {order.buyer_phone && ` · ${order.buyer_phone}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm tracking-tighter">{order.quantity_kg.toLocaleString()} KG</p>
                          <p className="text-[9px] text-blue-700 font-black uppercase tracking-widest">MAX {order.currency} {order.max_price_per_kg.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY LISTINGS TAB (seller) */}
          {activeTab === 'my-listings' && mpUser?.role === 'seller' && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Managed Listings ({myListings.length})</h4>
                <button onClick={() => setShowAddListing(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                  Add Listing
                </button>
              </div>
              {myListings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Active Output</p>
                  <p className="text-sm font-bold mt-1 text-slate-500">Add your first crop listing to start selling</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map(listing => (
                    <div key={listing.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-black text-slate-950 uppercase tracking-tighter">{listing.crop}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{listing.quantity_kg} KG · {listing.currency} {listing.price_per_kg.toLocaleString()}/KG</p>
                        {listing.description && <p className="text-xs text-slate-400 mt-1 font-medium">{listing.description}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase tracking-widest">{listing.status}</span>
                        <button onClick={() => cancelListing(listing.id)}
                          className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY BUY ORDERS TAB (buyer) */}
          {activeTab === 'buy-orders' && mpUser?.role === 'buyer' && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Orders ({myBuyOrders.length})</h4>
                <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
                  New Order
                </button>
              </div>
              {myBuyOrders.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Active Demand</p>
                  <p className="text-sm font-bold mt-1 text-slate-500">Post what you want to buy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBuyOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-black text-slate-950 uppercase tracking-tighter">{order.crop}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{order.quantity_kg} KG · MAX {order.currency} {order.max_price_per_kg.toLocaleString()}/KG</p>
                        {order.description && <p className="text-xs text-slate-400 mt-1 font-medium">{order.description}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 text-[9px] font-black rounded uppercase tracking-widest ${order.status === 'open' ? 'bg-blue-100 text-blue-700' : order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{order.status}</span>
                        {order.status === 'open' && (
                          <button onClick={() => cancelBuyOrder(order.id)}
                            className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRADES TAB */}
          {activeTab === 'trades' && mpUser && (
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Escrowed Trades ({trades.length})</h4>
              {trades.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest">No Trade Activity</p>
                  <p className="text-sm font-bold mt-2 text-slate-500 max-w-xs mx-auto">
                    {mpUser.role === 'buyer'
                      ? 'Post a buy order to automatically match with a seller.'
                      : 'Trades will appear here once a match is found.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Crop</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parties</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed On</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {trades.map(trade => {
                        const isSeller = trade.seller_id === mpUser.id;
                        return (
                          <motion.tr 
                            key={trade.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="font-black text-slate-900 uppercase tracking-tight">{trade.crop}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-600">{trade.quantity_kg} KG</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-black text-slate-900">{trade.currency} {trade.total_value.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black text-slate-900 uppercase">S: {trade.seller_name}</span>
                                <span className="text-[10px] font-black text-slate-900 uppercase">B: {trade.buyer_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest ${
                                trade.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                {trade.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                {trade.completed_at ? format(new Date(trade.completed_at), 'dd MMM yyyy') : '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {trade.status === 'pending' && isSeller && (
                                <button
                                  onClick={() => confirmReceipt(trade.id)}
                                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                  Finalize
                                </button>
                              )}
                              {trade.status === 'pending' && !isSeller && (
                                <span className="text-[9px] font-black text-slate-300 uppercase italic">Awaiting Seller</span>
                              )}
                              {trade.status === 'completed' && (
                                <span className="text-emerald-500 font-black text-[9px] uppercase">Verified</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Sign-in CTA (unauthenticated) */}
          {!mpUser && activeTab !== 'browse' && (
            <div className="text-center py-16">
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tighter mb-2">Restricted Access</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Create an account to participate in the exchange</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-colors">
                  Join as Seller
                </button>
                <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-colors">
                  Join as Buyer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
