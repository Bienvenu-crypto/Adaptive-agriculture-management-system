'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';
import WeatherWidget from '@/components/WeatherWidget';
import MarketPrices from '@/components/MarketPrices';
import Marketplace from '@/components/Marketplace';
import AuthModal from '@/components/AuthModal';
import IoTDashboard from '@/components/IoTDashboard';
import CropRecommendation from '@/components/CropRecommendation';
import SmartCropCalendar from '@/components/SmartCropCalendar';
import ResourceLibrary from '@/components/ResourceLibrary';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/components/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';

interface LocationState {
  lat: number;
  lon: number;
  name: string;
}

export default function Page() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [activeView, setActiveView] = useState<string>(user ? 'iot' : 'chat');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [location, setLocation] = useState<LocationState | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let locationName = 'detected location';
          
          try {
            const geoRes = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              locationName = geoData.address?.city || geoData.address?.country || 'current area';
            }
          } catch (e) {
            console.error("Geocoding failed", e);
          }
          
          setLocation({ lat: latitude, lon: longitude, name: locationName });
        },
        (error) => {
          console.warn("Geolocation access denied. App will work with restricted context.", error);
        }
      );
    }
  }, []);

  const switchView = (viewId: string) => {
    setActiveView(viewId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans lg:pl-72">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-black/5 p-8 hidden lg:flex flex-col z-50 overflow-y-auto">
        <div
          className="flex flex-col mb-12 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="text-[1.3rem] font-bold text-[#014D3E] leading-[1.2] tracking-tight">Global Agriculture</span>
          <span className="text-[1.3rem] font-bold text-[#014D3E] leading-[1.2] tracking-tight">Management System</span>
        </div>

        <div className="flex-1 space-y-2 mt-4">
          <button
            onClick={() => switchView('chat')}
            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'chat' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            Advisory
          </button>

          {user && (
            <>
              <button
                onClick={() => switchView('iot')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'iot' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Metrics
              </button>
              <button
                onClick={() => switchView('weather')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'weather' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Weather
              </button>

              <button
                onClick={() => switchView('recommendation')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'recommendation' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Crops
              </button>
              <button
                onClick={() => switchView('calendar')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'calendar' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Calendar
              </button>

              <button
                onClick={() => switchView('market')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'market' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Market
              </button>
              <button
                onClick={() => switchView('marketplace')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'marketplace' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Exchange
              </button>
              <button
                onClick={() => switchView('resources')}
                className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'resources' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Library
              </button>

              <div className="pt-8">
                <Link href="/admin" className="w-full block px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                  Control
                </Link>
              </div>
            </>
          )}
        </div>

        {!user && (
          <div className="mt-auto pt-8 border-t border-black/5 space-y-3">
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-100 w-full"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600 w-full"
            >
              Register
            </button>
          </div>
        )}
      </nav>

      {/* Desktop Top Header */}
      <div className="hidden lg:flex fixed top-0 right-0 left-72 h-24 items-center justify-between px-12 z-40 bg-[#F8F9FA]/50 backdrop-blur-md border-b border-black/5">
        <h1 className="flex flex-col leading-none">
          <span className="text-3xl font-black text-emerald-950 tracking-tighter">
            Smart Farming <span className="text-emerald-600">Intelligence</span>
          </span>
        </h1>
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 py-1.5 px-4 rounded-full border border-black/5 bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs border-2 border-white shadow-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col pr-2">
                <p className="text-sm font-black text-emerald-950 leading-none tracking-tight">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-950 mt-1 lowercase">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => logout()}
                className="px-6 py-2.5 bg-pink-500 shadow-xl shadow-pink-500/20 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-pink-600 transition-all flex items-center gap-2"
              >
                Sign Out
              </button>
              <div className="bg-white shadow-sm hover:shadow-md transition-shadow p-1.5 rounded-full border border-black/5">
                <NotificationBell />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col" onClick={() => switchView(user ? 'iot' : 'chat')}>
            <span className="text-sm font-black tracking-tight text-emerald-900 leading-[1.1]">Global Agriculture</span>
            <span className="text-sm font-black tracking-tight text-emerald-900 leading-[1.1]">Management System</span>
          </div>

          <div className="flex items-center gap-3">
            {user && <NotificationBell />}
            <button
              className="px-3 py-1.5 text-[10px] font-black text-slate-600 bg-slate-50 rounded-xl uppercase tracking-widest"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-4 border-t border-black/5">
                {!user ? (
                  <>
                    <button
                      onClick={() => switchView('chat')}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'chat' ? 'bg-emerald-600 text-white' : 'text-emerald-700 bg-emerald-50'
                        }`}
                    >
                      Advisory
                    </button>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button onClick={() => openAuthModal('login')} className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-50 border border-slate-100">Sign In</button>
                      <button onClick={() => openAuthModal('signup')} className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-emerald-600">Register</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 p-4 mb-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-lg border-2 border-white shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-base font-black text-emerald-950 leading-none tracking-tight">{user.name}</p>
                        <p className="text-xs font-bold text-emerald-950 mt-1 lowercase">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => switchView('chat')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Advisory</button>
                    <button onClick={() => switchView('iot')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'iot' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Metrics</button>
                    <button onClick={() => switchView('recommendation')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'recommendation' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Crops</button>
                    <button onClick={() => switchView('calendar')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'calendar' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Calendar</button>
                    <button onClick={() => switchView('market')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'market' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Market</button>
                    <button onClick={() => switchView('marketplace')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'marketplace' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Exchange</button>
                    <button onClick={() => switchView('weather')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'weather' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Weather</button>
                    <button onClick={() => switchView('resources')} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeView === 'resources' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>Library</button>
                    <Link href="/admin" className="px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 block text-center">
                      Admin Control
                    </Link>
                    <button onClick={() => logout()} className="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 mt-4 opacity-70">
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:pt-32 lg:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'chat' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                    AI Farm Advisory
                  </h2>
                  <p className="text-slate-500 text-lg">Real-time expert guidance for your agricultural journey.</p>
                </div>
                <ChatInterface location={location} />
                {!user && (
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl mt-12">
                    <div className="relative z-10 max-w-2xl px-4">
                      <h3 className="text-3xl font-black mb-4">Unlock Your Full Potential</h3>
                      <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                        Sign up to access real-time soil sensors, localized market price trends, and our secure trade platform for farmers.
                      </p>
                      <button
                        onClick={() => openAuthModal('signup')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                      >
                        Create Your Free Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeView === 'iot' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                    Field Intelligence
                  </h2>
                  <p className="text-slate-500 text-lg">Live telemetry from your smart agricultural nodes.</p>
                </div>
                <IoTDashboard />
              </div>
            )}

            {activeView === 'weather' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Climate Dynamics</h2>
                  <p className="text-slate-500 text-lg">Hyper-local weather awareness for strategic planning.</p>
                </div>
                <WeatherWidget />
              </div>
            )}

            {activeView === 'market' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Market Insight</h2>
                  <p className="text-slate-500 text-lg">Real-time commodity valuation and trend analysis.</p>
                </div>
                <MarketPrices />
              </div>
            )}

            {activeView === 'marketplace' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Farming Exchange</h2>
                  <p className="text-slate-500 text-lg">Secure peer-to-peer commodity marketplace.</p>
                </div>
                <Marketplace />
              </div>
            )}

            {activeView === 'recommendation' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Crop Strategy</h2>
                  <p className="text-slate-500 text-lg">AI-powered variety selection based on your soil profile.</p>
                </div>
                <CropRecommendation location={location} />
              </div>
            )}

            {activeView === 'calendar' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Seasonal Matrix</h2>
                  <p className="text-slate-500 text-lg">Precision scheduling for your entire agricultural cycle.</p>
                </div>
                <SmartCropCalendar />
              </div>
            )}

            {activeView === 'resources' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Knowledge Core</h2>
                  <p className="text-slate-500 text-lg">Curated agricultural insights and best practices.</p>
                </div>
                <ResourceLibrary />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
