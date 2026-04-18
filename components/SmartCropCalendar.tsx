'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

interface Task {
  date: string;
  phase: string;
  task: string;
  description: string;
  isCritical: boolean;
}

interface CalendarData {
  tasks: Task[];
  estimatedYieldDate: string;
  generalAdvice: string;
}

export default function SmartCropCalendar() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CalendarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    crop: 'Maize',
    plantingDate: new Date().toISOString().split('T')[0],
    region: 'Central Uganda',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Act as an expert agronomist. I am planting ${formData.crop} in ${formData.region} on ${formData.plantingDate}. 
      
Generate a detailed, chronological crop management calendar. 
Include specific estimated dates (calculated from the planting date) for key phases like:
- Germination/Emergence
- Weeding
- Fertilizer application
- Pest/Disease scouting
- Harvesting

Make the advice highly actionable for a smallholder farmer.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING, description: "Estimated date (e.g., Oct 15, 2026)" },
                    phase: { type: Type.STRING, description: "Crop growth phase (e.g., Germination, Vegetative, Flowering)" },
                    task: { type: Type.STRING, description: "Specific action required (e.g., First Weeding)" },
                    description: { type: Type.STRING, description: "Brief details on how to do it" },
                    isCritical: { type: Type.BOOLEAN, description: "True if this task is critical for yield" }
                  },
                  required: ["date", "phase", "task", "description", "isCritical"]
                }
              },
              estimatedYieldDate: { type: Type.STRING, description: "Estimated harvest date (e.g., Jan 20, 2027)" },
              generalAdvice: { type: Type.STRING, description: "One paragraph of general advice for this crop in this region" }
            },
            required: ["tasks", "estimatedYieldDate", "generalAdvice"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      const parsedData = JSON.parse(jsonStr) as CalendarData;
      setData(parsedData);
    } catch (err) {
      console.error("Calendar Error:", err);
      setError("An error occurred while generating the calendar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px] uppercase tracking-tighter">
          CAL
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Smart Crop Calendar</h2>
          <p className="text-sm text-slate-500 font-bold">AI crop management schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Crop Type</label>
              <input
                type="text"
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                placeholder="e.g., Maize, Beans, Coffee"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Planting Date</label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., Central Uganda"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-colors disabled:opacity-70 mt-2"
            >
              {loading ? 'Processing...' : 'Generate Schedule'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs mb-4 border border-red-100 flex items-start gap-2 font-bold uppercase tracking-wide">
              <p>{error}</p>
            </div>
          )}

          {!data && !loading && !error && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">System Standby</p>
              <p className="text-sm font-bold max-w-xs text-slate-500">Enter your crop details to generate a customized, week-by-week farming schedule.</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-indigo-400 text-center bg-indigo-50/50 rounded-xl border border-indigo-100 p-6">
              <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse mb-2">Analyzing Data</p>
              <p className="text-sm font-bold text-indigo-800">Calculating optimal crop cycles...</p>
            </div>
          )}

          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h3 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Harvest Window</h3>
                  <p className="font-black text-indigo-700 tracking-tighter text-xl">{data.estimatedYieldDate}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-white px-4 py-3 rounded-lg border border-indigo-100 text-xs text-indigo-800 max-w-md font-medium">
                    <span className="font-black block mb-1 uppercase text-[9px] tracking-widest opacity-50 text-indigo-950">System Guidance</span>
                    {data.generalAdvice}
                  </div>
                  <button
                    onClick={async () => {
                      const { jsPDF } = await import('jspdf');
                      const autoTable = (await import('jspdf-autotable')).default;
                      
                      const doc = new jsPDF();
                      
                      // Title
                      doc.setFontSize(22);
                      doc.setTextColor(30, 41, 59); // slate-800
                      doc.text("Smart Crop Calendar", 14, 22);
                      
                      // Info Section
                      doc.setFontSize(10);
                      doc.setTextColor(100, 116, 139); // slate-500
                      doc.text(`Crop: ${formData.crop}`, 14, 32);
                      doc.text(`Region: ${formData.region}`, 14, 38);
                      doc.text(`Planting Date: ${formData.plantingDate}`, 14, 44);
                      doc.text(`Estimated Harvest: ${data.estimatedYieldDate}`, 14, 50);
                      
                      // Advice
                      doc.setFontSize(11);
                      doc.setTextColor(71, 85, 105); // slate-600
                      const splitAdvice = doc.splitTextToSize(`System Guidance: ${data.generalAdvice}`, 180);
                      doc.text(splitAdvice, 14, 60);
                      
                      // Table
                      const tableRows = data.tasks.map(t => [
                        t.date,
                        t.phase,
                        t.task,
                        t.description,
                        t.isCritical ? 'Yes' : 'No'
                      ]);
                      
                      autoTable(doc, {
                        startY: 75,
                        head: [['Date', 'Phase', 'Task', 'Description', 'Critical']],
                        body: tableRows,
                        theme: 'grid',
                        headStyles: { fillColor: [79, 70, 229] }, // indigo-600
                        styles: { fontSize: 9, cellPadding: 3 },
                        columnStyles: {
                          3: { cellWidth: 70 }, // Description column
                        }
                      });
                      
                      doc.save(`crop_calendar_${formData.crop.toLowerCase()}.pdf`);
                    }}
                    className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                {data.tasks.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-6"
                  >
                    <div className={`absolute -left-[10px] top-2 w-4 h-4 rounded-full border-4 border-white ${task.isCritical ? 'bg-red-500' : 'bg-indigo-500'}`}>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
                          {task.date}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${task.isCritical ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {task.phase}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-950 tracking-tighter text-lg leading-none mb-1 flex items-center gap-2">
                        {task.task}
                        {task.isCritical && <span className="text-[8px] font-black text-red-600 border border-red-200 px-1 rounded uppercase tracking-tighter">Critical</span>}
                      </h4>
                      <p className="text-slate-600 text-sm font-medium">{task.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
