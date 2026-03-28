'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { CATEGORIES, getCategoryById } from '@/utils/categories';
import ImageUpload from '@/components/ImageUpload';
import { 
  ShieldCheck, LockSimple, ChartBar, Storefront, 
  CalendarCheck, Megaphone, PlusCircle, Gear, 
  Trash, Pencil, Star, SealCheck, RocketLaunch, 
  ArrowUpRight, Info, Check, X, ArrowLeft
} from '@phosphor-icons/react';

const ADMIN_PASS = 'AARADH@2009';

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState('dashboard');
  
  const {
    settings, updateSettings,
    businesses, allBusinesses, bookings, deals,
    addBusinessFree, approveListing, rejectListing, deleteBusiness, updateBusiness, 
    toggleFeatured, toggleTopRated, 
    addDeal, removeDeal, seedDatabase
  } = useAppContext();

  const [newBiz, setNewBiz] = useState({ name: '', category: '', phone: '', address: '', description: '', image: '', isFeatured: false });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#0a0e13]">
      <div className="w-full max-w-sm clay-card p-8 text-center bg-[#151a20] border-outline-variant/10 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
           <LockSimple size={32} weight="fill" className="text-primary" />
        </div>
        <h2 className="font-display text-xl font-black text-white mb-2">Admin Access</h2>
        <p className="font-body text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest mb-8">Enter Secure Password</p>
        
        <div className="space-y-4">
           <input 
             type="password" 
             value={pass} 
             onChange={e => setPass(e.target.value)} 
             onKeyDown={e => e.key === 'Enter' && (pass === ADMIN_PASS ? setAuthed(true) : alert('❌ Locked Out'))}
             placeholder="••••••••"
             className="w-full h-12 rounded-xl bg-[#0a0e13] border border-outline-variant/10 px-4 text-center font-display text-lg tracking-widest text-white outline-none focus:border-primary/50 transition-all"
           />
           <button 
             onClick={() => pass === ADMIN_PASS ? setAuthed(true) : alert('❌ Access Denied')}
             className="w-full h-12 rounded-xl bg-primary text-on-primary font-display font-black shadow-lg shadow-primary/20 active:scale-95 transition-transform"
           >
             LOGIN
           </button>
        </div>
      </div>
    </div>
  );

  const pendingCount = (allBusinesses || []).filter(b => b.status === 'pending').length;

  const tabs = [
    { id: 'dashboard', label: 'Stats', icon: ChartBar },
    { id: 'listings', label: 'Listings', icon: Storefront },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'content', label: 'Content', icon: Megaphone },
    { id: 'settings', label: 'System', icon: Gear },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e13] text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#151a20]/80 backdrop-blur-xl border-b border-outline-variant/10 px-5 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2.5">
           <ShieldCheck size={24} weight="fill" className="text-primary" />
           <div>
              <h1 className="font-display text-base font-black text-white leading-none">Admin Console</h1>
              <p className="font-body text-[8px] font-black text-primary uppercase tracking-[0.2em] mt-1">v4.0 Secure · Patna Suvidha</p>
           </div>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/10 font-display text-[10px] font-black uppercase text-on-surface-variant active:scale-95 transition-transform"
        >
           <ArrowLeft size={12} weight="bold" /> Site
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto px-5 py-4 border-b border-outline-variant/5 hide-scrollbar bg-[#151a20]/20">
         {tabs.map(t => {
           const Icon = t.icon;
           return (
             <button 
               key={t.id} 
               onClick={() => setTab(t.id)}
               className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-display text-[11px] font-black uppercase transition-all ${tab === t.id ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' : 'bg-surface-container/50 border border-outline-variant/10 text-on-surface-variant'}`}
             >
               <Icon size={16} weight={tab === t.id ? 'fill' : 'bold'} />
               {t.label}
               {t.id === 'listings' && pendingCount > 0 && (
                 <span className="w-4 h-4 rounded-full bg-error text-white text-[8px] flex items-center justify-center animate-pulse">{pendingCount}</span>
               )}
             </button>
           );
         })}
      </div>

      <main className="p-5 max-w-4xl mx-auto animate-fade-in">
         
         {tab === 'dashboard' && (
           <div className="space-y-6">
              <h2 className="font-display text-xl font-black mb-4">Operations Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Live Listings', value: (allBusinesses || []).length, color: 'text-primary' },
                   { label: 'Pending Approval', value: pendingCount, color: pendingCount > 0 ? 'text-amber-400' : 'text-on-surface-variant/40' },
                   { label: 'Active Deals', value: (deals || []).length, color: 'text-secondary' },
                   { label: 'Total Bookings', value: (bookings || []).length, color: 'text-blue-400' }
                 ].map((stat, idx) => (
                   <div key={idx} className="clay-card p-5 bg-[#151a20]">
                      <p className="font-display text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className={`font-display text-2xl font-black ${stat.color}`}>{stat.value}</p>
                   </div>
                 ))}
              </div>
           </div>
         )}

         {tab === 'listings' && (
           <div className="space-y-4">
              <h2 className="font-display text-xl font-black mb-4">Manage Listings</h2>
              {(allBusinesses || []).map((biz, idx) => {
                const isPending = biz.status === 'pending';
                return (
                  <div key={biz.id || idx} className="clay-card p-4 flex gap-4 bg-[#151a20] border-outline-variant/10 group">
                     {biz.image && <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/5"><img src={biz.image} className="w-full h-full object-cover" /></div>}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-display text-sm font-black truncate">{biz.name}</h4>
                           {isPending && <span className="text-[8px] font-black bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded uppercase self-center">PENDING</span>}
                        </div>
                        <p className="font-body text-[10px] font-bold text-on-surface-variant/60">{biz.category} • {biz.phone}</p>
                     </div>
                     <div className="flex gap-2">
                        {isPending ? (
                          <>
                             <button onClick={() => approveListing(biz.id)} className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center active:scale-95 transition-transform"><Check size={16} weight="bold" /></button>
                             <button onClick={() => rejectListing(biz.id)} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center active:scale-95 transition-transform"><X size={16} weight="bold" /></button>
                          </>
                        ) : (
                          <>
                             <button onClick={() => toggleFeatured(biz.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-transform ${biz.isFeatured ? 'bg-amber-400/20 text-amber-400 shadow-inner' : 'bg-surface-container/30 text-white/20'}`}><Star size={16} weight="fill" /></button>
                             <button onClick={() => deleteBusiness(biz.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 flex items-center justify-center active:scale-95 transition-transform"><Trash size={16} weight="fill" /></button>
                          </>
                        )}
                     </div>
                  </div>
                );
              })}
           </div>
         )}

         {tab === 'bookings' && (
           <div className="space-y-4">
              <h2 className="font-display text-xl font-black mb-4">Real-Time Bookings</h2>
              {bookings.length > 0 ? [...bookings].reverse().map((bk, idx) => (
                <div key={idx} className="clay-card p-5 bg-[#151a20] border-outline-variant/10">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><CalendarCheck size={20} className="text-primary" /></div>
                         <div>
                            <h4 className="font-display text-sm font-black text-white">{bk.businessName}</h4>
                            <p className="font-body text-[10px] font-black text-primary uppercase tracking-wider">{bk.service}</p>
                         </div>
                      </div>
                      <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full border border-green-500/10 uppercase tracking-widest">WhatsApp Sent</span>
                   </div>
                   <div className="grid grid-cols-2 gap-y-3 gap-x-6 p-4 rounded-xl bg-black/20 border border-white/5">
                      <div><p className="text-[8px] font-black text-white/20 uppercase mb-1">Customer</p><p className="text-xs font-bold">{bk.customerName}</p></div>
                      <div><p className="text-[8px] font-black text-white/20 uppercase mb-1">Phone</p><p className="text-xs font-bold">{bk.customerPhone}</p></div>
                      <div><p className="text-[8px] font-black text-white/20 uppercase mb-1">Preferred Slot</p><p className="text-xs font-bold">{bk.date} • {bk.time}</p></div>
                      <div><p className="text-[8px] font-black text-white/20 uppercase mb-1">Received At</p><p className="text-[10px] font-bold text-white/40">{new Date(bk.createdAt).toLocaleTimeString()}</p></div>
                   </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-20">
                   <p className="font-display font-black uppercase text-sm">Waiting for incoming bookings...</p>
                </div>
              )}
           </div>
         )}

         {tab === 'settings' && (
           <div className="space-y-6">
              <h2 className="font-display text-xl font-black mb-4">System Configuration</h2>
              <div className="clay-card p-6 bg-[#151a20] border-primary/20 space-y-6">
                 <div>
                    <h3 className="font-display text-sm font-black mb-4 text-primary">🌱 Content Seeding</h3>
                    <p className="font-body text-xs text-on-surface-variant/60 mb-4 leading-relaxed">If you're starting with a fresh Firestore (Spark Plan), use this to populate Patna Suvidha with 30+ service providers instantly.</p>
                    <button 
                      onClick={() => { if(confirm('Seed database?')) seedDatabase(); }}
                      className="px-6 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-display text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
                    >
                       Populate Sample Data
                    </button>
                 </div>
                 <div className="pt-6 border-t border-white/5">
                    <h3 className="font-display text-sm font-black mb-4 text-error">⚠️ Danger Zone</h3>
                    <button 
                      onClick={() => { localStorage.clear(); window.location.reload(); }}
                      className="px-6 py-3 rounded-xl bg-error/10 border border-error/30 text-error font-display text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
                    >
                       Reset Global State
                    </button>
                 </div>
              </div>
           </div>
         )}

      </main>
    </div>
  );
}
