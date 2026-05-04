'use client';

import React from 'react';
import { motion } from 'motion/react';

const FEATURES = [
  {
    title: 'AI Advisory',
    description: 'Expert agricultural guidance powered by advanced AI models.',
    rating: 4.9
  },
  {
    title: 'Smart Calendar',
    description: 'Optimize your planting and harvesting cycles with precision.',
    rating: 4.8
  },
  {
    title: 'Market Intelligence',
    description: 'Real-time price tracking and commodity exchange.',
    rating: 4.7
  },
  {
    title: 'Climate Dynamics',
    description: 'Hyper-local weather forecasting for strategic farming.',
    rating: 4.9
  }
];

export default function AboutPage() {
  const [stats, setStats] = React.useState({ participants: 0, trades: 0, accuracy: '95.0', listings: 0 });

  React.useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.participants !== undefined) setStats(data);
      })
      .catch(() => { });
  }, []);

  return (
    <div className="space-y-16">
      <section>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">
          Empowering Farmers with <span className="text-emerald-600">Intelligence</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-3xl leading-relaxed">
          The Agriculture Management System (AMS) is a state-of-the-art platform designed to modernize 
          farming practices through data-driven insights, AI-powered advisory, and secure market access.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {FEATURES.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tighter">{feature.title}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed max-w-sm">{feature.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Rating:</span>
              <span className="text-sm font-black text-emerald-600">{feature.rating}/5.0</span>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-12">Performance Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter">{stats.trades > 10 ? `#${Math.floor(stats.trades / 100) + 1}` : '#1'}</div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Regional Market Leader</p>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter">{stats.accuracy}%</div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Predictive Accuracy</p>
            </div>
            <div>
              <div className="text-5xl font-black mb-2 tracking-tighter">{stats.participants.toLocaleString()}</div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Verified Participants</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tighter">Operational Support</h3>
            <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Strategic Communication Channels</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-12">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Voice Comms</p>
              <p className="text-lg font-black text-slate-900 tracking-tighter">+256 700 000 000</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Digital Inquiry</p>
              <p className="text-lg font-black text-slate-900 tracking-tighter">admin@agrisystem.ug</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
