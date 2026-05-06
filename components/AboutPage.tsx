'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  Calendar, 
  Sprout, 
  ShoppingCart, 
  CloudSun, 
  Megaphone,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  onGetStarted?: () => void;
}

const FEATURES = [
  {
    icon: <Bot className="w-8 h-8 text-slate-500" />,
    title: 'AI Chatbot',
    description: 'Get instant answers to your farming questions from our intelligent agricultural assistant available 24/7.'
  },
  {
    icon: <Calendar className="w-8 h-8 text-red-500" />,
    title: 'Smart Crop Calendar',
    description: 'Plan your planting and harvest schedule with AI-powered recommendations based on local conditions.'
  },
  {
    icon: <Sprout className="w-8 h-8 text-emerald-500" />,
    title: 'Crop Recommendations',
    description: 'Receive personalized crop suggestions based on soil type, climate, and regional market demand.'
  },
  {
    icon: <ShoppingCart className="w-8 h-8 text-blue-500" />,
    title: 'Marketplace Listings',
    description: 'Buy and sell agricultural products directly with other farmers and buyers on our secure platform.'
  },
  {
    icon: <CloudSun className="w-8 h-8 text-slate-700" />,
    title: 'Weather Monitoring',
    description: 'Real-time weather data and 7-day forecasts tailored to your farm\'s specific geographic location.'
  },
  {
    icon: <Megaphone className="w-8 h-8 text-orange-500" />,
    title: 'Advertising Tools',
    description: 'Promote your farm products and services to a targeted audience of farmers and agribusinesses.'
  }
];

export default function AboutPage({ onGetStarted }: AboutPageProps) {
  return (
    <div className="space-y-12 pb-20">
      {/* Badge */}
      <div className="flex">
        <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest">
          About
        </span>
      </div>

      {/* Hero Section */}
      <section className="bg-emerald-50/50 rounded-[40px] p-12 text-center border border-emerald-100/50">
        <div className="max-w-3xl mx-auto space-y-8">
          <h3 className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.4em]">
            Agriculture Management System
          </h3>
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-[1.1]">
            Empowering Farmers with <br />
            <span className="text-emerald-600">Smart Technology</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            A comprehensive digital platform connecting farmers, buyers, and experts through AI-powered tools, real-time weather, smart crop calendars, and an intelligent marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-emerald-800 text-white rounded-2xl text-sm font-black hover:bg-emerald-900 transition-all shadow-xl shadow-emerald-800/20 w-full sm:w-auto"
            >
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-white text-emerald-800 border-2 border-emerald-100 rounded-2xl text-sm font-black hover:bg-emerald-50 transition-all w-full sm:w-auto">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Our Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[32px] border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm hover:shadow-xl hover:shadow-emerald-500/5"
            >
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 w-fit group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-emerald-50/50 rounded-[32px] p-12 text-center border border-emerald-100/50">
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-emerald-700 font-black text-lg tracking-tight">Our Mission</h3>
          <p className="text-slate-600 text-sm leading-relaxed font-semibold">
            To transform African agriculture by providing farmers with digital tools that improve productivity, reduce waste, and connect them to fair markets — making smart farming accessible to all.
          </p>
        </div>
      </section>
    </div>
  );
}
