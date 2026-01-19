import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEnquiries } from '../hooks/useEnquiries';
import { EnquiryStatus } from '../types';
import { translations } from '../translations';
import { useApp } from '../App';
import { useToast } from '../hooks/useToast';
import { getSupabaseClient } from '../services/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { enquiries, updateEnquiryStatus, deleteEnquiry } = useEnquiries();
  const { language, setLanguage, theme, toggleTheme } = useApp();
  const t = translations[language];
  const [filter, setFilter] = useState<EnquiryStatus | 'ALL'>('ALL');
  const { pushToast } = useToast();
  const [entered, setEntered] = useState(false);

  const filteredEnquiries = filter === 'ALL' 
    ? enquiries 
    : enquiries.filter(e => e.status === filter);

  const statusColors: Record<EnquiryStatus, string> = {
    [EnquiryStatus.NEW]: 'bg-orange-500 text-white',
    [EnquiryStatus.CONTACTED]: 'bg-blue-600 text-white',
    [EnquiryStatus.ASSIGNED]: 'bg-indigo-600 text-white',
    [EnquiryStatus.COMPLETED]: 'bg-emerald-600 text-white',
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`min-h-screen flex overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'}`}>
      {/* Dynamic Sidebar */}
      <aside className={`w-80 border-r flex flex-col p-10 fixed h-full z-50 ${theme === 'dark' ? 'bg-black border-white/5' : 'bg-gray-50 border-black/5'}`}>
        <div className="flex items-center gap-4 mb-20">
          <Link to="/" className="text-2xl font-black uppercase italic tracking-tighter">{t.brand}</Link>
          <div className="px-2 py-0.5 bg-orange-500 text-[8px] font-black rounded uppercase text-white">Admin</div>
        </div>
        
        <nav className="space-y-12 flex-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] font-black opacity-20 mb-6">Operations</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-black text-sm text-orange-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Dashboard
              </li>
              <li className="flex items-center gap-3 font-black text-sm opacity-40 hover:opacity-100 cursor-pointer transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/10"></div>
                Analytics
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-[0.5em] font-black opacity-20 mb-2">Display Settings</p>
            <div className="flex gap-2">
              <button onClick={() => setLanguage('en')} className={`text-[10px] font-black border p-2 flex-1 rounded-lg ${language === 'en' ? 'bg-orange-500 border-orange-500 text-white' : 'border-black/10 opacity-40'}`}>EN</button>
              <button onClick={() => setLanguage('bn')} className={`text-[10px] font-black border p-2 flex-1 rounded-lg ${language === 'bn' ? 'bg-orange-500 border-orange-500 text-white' : 'border-black/10 opacity-40'}`}>BN</button>
            </div>
            <button onClick={toggleTheme} className="text-[10px] font-black border border-black/10 p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all">
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-10 border-t border-black/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-black italic">A</div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Amol</p>
              <p className="text-[8px] uppercase font-bold opacity-30">System Owner</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const supabase = getSupabaseClient();
              if (supabase) supabase.auth.signOut();
              onLogout();
            }}
            className={`w-full py-4 text-[10px] uppercase tracking-[0.4em] font-black border rounded-lg hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-300 ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
          >
            Terminal Exit
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className={`flex-1 ml-80 p-12 bg-grid-pattern overflow-y-auto page-enter ${entered ? 'active' : ''}`}>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Command Center</h1>
            <p className="text-xs uppercase tracking-[0.4em] font-bold opacity-20">Active resolution log / {filteredEnquiries.length} Targets</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              Public Terminal
            </Link>

            <div className={`flex gap-2 p-1 rounded-xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
            {['ALL', ...Object.values(EnquiryStatus)].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === s ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}
              >
                {s}
              </button>
            ))}
            </div>
          </div>
        </header>

        <div className="animate__animated animate__fadeIn">
          {filteredEnquiries.length === 0 ? (
            <div className="border border-dashed rounded-3xl p-32 text-center opacity-10">
              <p className="text-xs uppercase tracking-[0.5em] font-black italic">No Enquiries Logged in Sector</p>
            </div>
          ) : (
            <div className={`border rounded-3xl overflow-hidden backdrop-blur-xl ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              <table className="w-full text-left">
                <thead className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <tr>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Client</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Target Service</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Protocol Type</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Location</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Preferred</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Contact</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Timestamp</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Status</th>
                    <th className="px-10 py-8 text-[10px] uppercase tracking-[0.4em] font-black">Operation</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-black/5'}`}>
                  {filteredEnquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-orange-500/5 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black tracking-widest">{e.name || '—'}</span>
                          <span className="text-[10px] opacity-40 font-black">{e.phone}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xl font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">{t.services[e.service as keyof typeof t.services]}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                          {t.categories[e.category as keyof typeof t.categories]} {e.landCondition ? `• ${t.categories[e.landCondition as keyof typeof t.categories]}` : ''}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-sm font-black tracking-widest">{e.address || '—'}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-[10px] opacity-40 font-black tracking-widest">{(e.preferredDate || 'N/A')}{e.preferredTime ? ` • ${e.preferredTime}` : ''}</span>
                      </td>
                      <td className="px-10 py-8">
                        <a href={`tel:${e.phone}`} className="text-sm font-black tracking-widest hover:text-orange-500 transition-colors">{e.phone}</a>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-[10px] opacity-20 font-bold tracking-widest">
                          {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <select
                          value={e.status}
                          onChange={(ev) => {
                            updateEnquiryStatus(e.id, ev.target.value as EnquiryStatus);
                            pushToast('Status updated', 'info');
                          }}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer border transition-all ${statusColors[e.status]} ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}`}
                        >
                          {Object.values(EnquiryStatus).map(s => (
                            <option key={s} value={s} className="bg-black text-white">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-10 py-8">
                        <button 
                          onClick={() => {
                            if(confirm('Archive this log entry?')) {
                              deleteEnquiry(e.id);
                              pushToast('Entry archived', 'warning');
                            }
                          }}
                          className="text-[10px] uppercase font-black text-red-500 opacity-20 hover:opacity-100 tracking-widest transition-all"
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
