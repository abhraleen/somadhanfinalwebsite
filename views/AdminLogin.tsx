
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { translations } from '../translations';
import { getSupabaseClient } from '../services/supabase';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const { language, theme } = useApp();
  const t = translations[language];
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('System not connected to Command Center.');
      setIsAuthenticating(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setError('ACCESS DENIED: INVALID SYSTEM CREDENTIALS.');
      setIsAuthenticating(false);
      return;
    }
    const user = data.user;
    const { data: admins } = await supabase.from('admins').select('user_id').eq('user_id', user.id).limit(1);
    if (!admins || admins.length === 0) {
      await supabase.auth.signOut();
      setError('ACCESS DENIED: NOT AUTHORIZED FOR ADMIN PANEL.');
      setIsAuthenticating(false);
      return;
    }
    onLogin();
  };

  // Keyboard shortcut: Escape to return to public terminal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 grid-pattern transition-colors duration-700 page-enter ${entered ? 'active' : ''} ${theme === 'dark' ? 'bg-black' : 'bg-gray-100'}`}>
      {/* Back to Public Terminal */}
      <button
        onClick={() => navigate('/')}
        aria-label="Go back"
        className={`fixed top-6 left-6 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${theme === 'dark' ? 'bg-white/5 text-white border-white/10' : 'bg-black/5 text-black border-black/10'} hover:bg-orange-500 hover:text-white hover:border-orange-500`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        Back
      </button>
      <div className="w-full max-w-md animate__animated animate__fadeIn">
        <div className="mb-12 text-center">
          <div className="text-orange-500 font-black mb-4 animate-pulse uppercase tracking-[0.5em] text-[10px]">Restricted Domain</div>
          <h1 className={`text-5xl font-black uppercase italic tracking-tighter mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{t.brand}</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30">Command Center Authenticator</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest opacity-30 ml-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>System ID</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amol@somadhan.com"
              className={`w-full border px-6 py-5 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-black uppercase placeholder:opacity-10 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] uppercase font-black tracking-widest opacity-30 ml-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Secure Key</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full border px-6 py-5 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-black placeholder:opacity-10 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
            />
          </div>
          
          {error && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center animate-shake">{error}</p>}
          
          <button
            type="submit"
            disabled={isAuthenticating}
            className={`w-full py-5 rounded-xl font-black uppercase transition-all transform active:scale-95 disabled:opacity-50 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'} hover:bg-orange-500 hover:text-white`}
          >
            {isAuthenticating ? 'Handshaking...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-12 text-center flex flex-col gap-6">
          <div className={`p-6 border rounded-2xl ${theme === 'dark' ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
            <p className="text-[10px] uppercase font-black opacity-20 tracking-widest mb-3">Dev / Owner Access:</p>
            <code className="text-[10px] font-black text-orange-500/60 tracking-widest">Use your admin email / password</code>
          </div>
          <a href="#/" className="text-[10px] uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity font-black">Return to Public Terminal</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
