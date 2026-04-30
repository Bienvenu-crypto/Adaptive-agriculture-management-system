const fs = require('fs');
const path = 'app/admin/page.tsx';
let c = fs.readFileSync(path, 'utf8');

// The block to remove: from {/* Listings & Orders Grid */} to the closing )} of the marketplace tab
const startMarker = '\n\n                  {/* Listings & Orders Grid */}';

// Find where the marketplace tab closing )} is — after the trades section
// The marketplace tab ends with:  "                </div>\n              )}\n"
// We search from the startMarker position forward for that closing
const si = c.indexOf(startMarker);
if (si === -1) { console.log('ERROR: start marker not found'); process.exit(1); }

// The section ends at the line:    "              )}" which closes the activeTab === 'marketplace' block
// That is at line 607 in the original. Find it after si.
const closingPattern = '                </div>\n              )}';
const ei = c.indexOf(closingPattern, si);
if (ei === -1) { console.log('ERROR: closing pattern not found'); process.exit(1); }

const endIdx = ei + closingPattern.length;

// Build the replacement: close the marketplace tab, then add three new tabs
const replacement = `
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-1">Active Listings</h2>
                      <p className="text-slate-400 text-xs font-medium">{adminData.listings.length} crop listings on the market</p>
                    </div>
                    <span className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{adminData.listings.length} Listings</span>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900 text-left">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Crop</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Seller</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Price / kg</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {adminData.listings.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-300 text-sm">No active listings</td></tr>}
                          {adminData.listings.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-900">{item.crop}</td>
                              <td className="px-6 py-4 text-slate-500 text-sm">{item.seller_name}</td>
                              <td className="px-6 py-4 text-slate-600 text-sm">{item.quantity_kg} kg</td>
                              <td className="px-6 py-4 font-bold text-slate-900 text-sm">{item.currency} {item.price_per_kg?.toLocaleString()}</td>
                              <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase">{item.status}</span></td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingItem({ type: 'listing', item })} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">Edit</button>
                                  <button onClick={() => handleDelete('listing', item.id)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-1">Buy Orders</h2>
                      <p className="text-slate-400 text-xs font-medium">{adminData.orders.length} open purchase requests</p>
                    </div>
                    <span className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{adminData.orders.length} Orders</span>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900 text-left">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Crop</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Buyer</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Max Price / kg</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {adminData.orders.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-300 text-sm">No buy orders yet</td></tr>}
                          {adminData.orders.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4 font-semibold text-slate-900">{item.crop}</td>
                              <td className="px-6 py-4 text-slate-500 text-sm">{item.buyer_name}</td>
                              <td className="px-6 py-4 text-slate-600 text-sm">{item.quantity_kg} kg</td>
                              <td className="px-6 py-4 font-bold text-slate-900 text-sm">{item.currency} {item.max_price_per_kg?.toLocaleString()}</td>
                              <td className="px-6 py-4"><span className={\`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase \${item.status === 'open' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}\`}>{item.status}</span></td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingItem({ type: 'order', item })} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">Edit</button>
                                  <button onClick={() => handleDelete('order', item.id)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'trades' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-1">Transaction Ledger</h2>
                      <p className="text-slate-400 text-xs font-medium">{adminData.trades.length} completed and pending trades</p>
                    </div>
                    <span className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{adminData.trades.length} Trades</span>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900 text-left">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Commodity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Seller</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Buyer</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Value</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {adminData.trades.length === 0 && <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-300 text-sm">No trades recorded yet</td></tr>}
                          {adminData.trades.map((t: any) => (
                            <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-slate-900 text-sm uppercase">{t.crop}</p>
                                <p className="text-slate-400 text-xs">{t.quantity_kg} kg</p>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">{t.seller_name?.charAt(0).toUpperCase()}</div>
                                  <span className="text-sm text-slate-700">{t.seller_name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-700">{t.buyer_name?.charAt(0).toUpperCase()}</div>
                                  <span className="text-sm text-slate-700">{t.buyer_name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 text-sm">UGX {t.total_value?.toLocaleString()}</p>
                                <p className="text-slate-400 text-xs">{t.agreed_price_per_kg}/kg</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase \${t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}\`}>
                                  <span className={\`w-1.5 h-1.5 rounded-full \${t.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}\`} />
                                  {t.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete('trade', t.id)} className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}`;

// Replace from startMarker to endIdx with the new replacement
const before = c.slice(0, si);
const after = c.slice(endIdx);
const result = before + replacement + after;

fs.writeFileSync(path, result, 'utf8');
console.log('SUCCESS: file written, total length:', result.length);
