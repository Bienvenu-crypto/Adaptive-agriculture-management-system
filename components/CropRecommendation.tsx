'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

export default function CropRecommendation() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nitrogen: '40',
    phosphorus: '30',
    potassium: '30',
    ph: '6.5',
    rainfall: '100',
    temperature: '25',
  });

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

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

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
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Crop Intelligence</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AI-driven output optimization</p>
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Rainfall (mm)</label>
              <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Temp (°C)</label>
              <input type="number" name="temperature" value={formData.temperature} onChange={handleChange} className="w-full bg-slate-50 border border-black/5 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing Data...' : 'Recommend Crops'}
          </button>
        </form>

        <div className="relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Running analysis...</p>
            </div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full"
            >
              <div className="h-full bg-emerald-50/50 rounded-[2rem] border border-emerald-100 p-8 overflow-y-auto">
                <div className="prose prose-sm max-w-none prose-emerald">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center p-8">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Awaiting Input Parameters</p>
              <p className="text-sm font-bold text-slate-400 max-w-[240px]">Enter soil and climate data to generate localized crop recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
