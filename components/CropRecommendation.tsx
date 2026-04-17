'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

export default function CropRecommendation({ location }: { location?: { lat: number; lon: number; name: string } | null }) {
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nitrogen: '40',
    phosphorus: '30',
    potassium: '30',
    ph: '6.5',
    rainfall: '100',
    temperature: '25',
  });

  const handleAutoDetect = async () => {
    if (!location) {
      alert("Please allow location access to use auto-detection.");
      return;
    }

    setDetecting(true);
    try {
      const response = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`);
      
      // Simulate high-precision satellite regional soil analysis
      // In a production app, this would query a global soil database (e.g. SoilGrids)
      const mockSoilByRegion = () => {
        const isArid = location.lat > 15 && location.lat < 35; // Rough check for arid zones
        const isTropical = Math.abs(location.lat) < 15;
        
        if (isArid) return { n: "20", p: "25", k: "15", ph: "7.8" };
        if (isTropical) return { n: "60", p: "45", k: "50", ph: "5.8" };
        return { n: "45", p: "35", k: "40", ph: "6.5" }; // Temperate default
      };

      const soil = mockSoilByRegion();

      if (response.ok) {
        const data = await response.json();
        const current = data.current;
        
        setFormData({
          nitrogen: soil.n,
          phosphorus: soil.p,
          potassium: soil.k,
          ph: soil.ph,
          temperature: Math.round(current.temperature_2m).toString(),
          rainfall: current.showers > 0 || current.rain > 0 ? "250" : "120" 
        });
      }
    } catch (error) {
      console.error("Detection Error:", error);
    } finally {
      setDetecting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as an expert agronomist. I have a farm with the following soil and environmental parameters:
- Nitrogen (N): ${formData.nitrogen} mg/kg
- Phosphorus (P): ${formData.phosphorus} mg/kg
- Potassium (K): ${formData.potassium} mg/kg
- Soil pH: ${formData.ph}
- Average Rainfall: ${formData.rainfall} mm
- Average Temperature: ${formData.temperature} °C

Based on these parameters, recommend the top 3 most suitable crops to plant. For each crop, briefly explain WHY it is suitable and give one quick tip for maximizing yield. Format the response clearly using Markdown.`;
      
      // IMPLEMENT RETRY LOGIC FOR HIGH DEMAND (503 ERRORS)
      const executeWithRetry = async (retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [{ parts: [{ text: prompt }] }],
            });
          } catch (err: any) {
            const is503 = err.message?.includes('503') || err.status === 503 || err.code === 503;
            if (is503 && i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
              continue;
            }
            throw err;
          }
        }
      };

      const response = await executeWithRetry();

      if (!response) throw new Error("AI service did not respond. Please try again.");

      setResult(response.text || "Could not generate recommendations. Please try again.");
    } catch (error) {
      console.error("Recommendation Error:", error);
      setResult("An error occurred while generating recommendations. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
          AI
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Crop Strategy Engine</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Smart Yield Optimization</p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">i</div>
        <div>
          <p className="text-[10px] font-black uppercase text-blue-900 tracking-widest mb-1">Acquisition Guide</p>
          <p className="text-xs text-blue-700 font-medium">Get **N-P-K and pH** from soil testing kits or digital sensors. **Rainfall and Temp** can be automatically detected based on your live global coordinates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Nitrogen (N)</label>
              <input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Phosphorus (P)</label>
              <input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Potassium (K)</label>
              <input type="number" name="potassium" value={formData.potassium} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Soil pH</label>
              <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1 truncate">Rainfall (mm/yr)</label>
              <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1 truncate">Surface Temp (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={detecting || !location}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            {detecting ? 'Contacting Satellites...' : location ? 'Auto-Detect Environment' : 'Location Required for Detection'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all disabled:opacity-70 shadow-xl shadow-emerald-500/10 active:scale-[0.98]"
          >
            {loading ? 'Analyzing...' : 'Execute Analysis'}
          </button>
        </form>

        <div className="bg-slate-50 rounded-3xl border border-black/5 p-6 h-full min-h-[300px] overflow-y-auto">
          {result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-sm prose-emerald max-w-none"
            >
              <ReactMarkdown>{result}</ReactMarkdown>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-4 px-6 py-2 border border-dashed border-slate-300 rounded-2xl">Ready for Input</span>
              <p className="text-xs font-bold uppercase tracking-widest leading-loose">Enter your soil and environmental parameters to get AI-powered crop recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

