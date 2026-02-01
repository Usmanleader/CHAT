
import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import AuthScreen from './components/AuthScreen';
import ChatWindow from './components/ChatWindow';
import DatabaseSetupModal from './components/DatabaseSetupModal';
import { AppStatus, SupabaseConfig, UserProfile } from './types';
import { initSupabase, checkSession, signOut, syncProfile, fetchUsers } from './services/supabaseService';

const SUPABASE_CONFIG: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.AUTH);
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);

  const initializeAppData = async () => {
    const currentSession = await checkSession();
    setSession(currentSession);
    
    if (currentSession) {
      // Re-initialize check
      setTableMissing(false); 
      
      const { error: syncError } = await syncProfile(currentSession.user);
      if (syncError && (syncError as any).code === 'PGRST205') {
        setTableMissing(true);
      }
      
      const { data: userList, error: fetchError } = await fetchUsers();
      if (fetchError && (fetchError as any).code === 'PGRST205') {
        setTableMissing(true);
      }
      
      if (userList) {
        setUsers(userList.filter((u: any) => u.id !== currentSession.user.id));
      }
      setStatus(AppStatus.CHATTING);
    } else {
      setStatus(AppStatus.AUTH);
    }
  };

  useEffect(() => {
    initSupabase(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    initializeAppData();

    const supabase = initSupabase(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        initializeAppData();
      } else {
        setStatus(AppStatus.AUTH);
        setUsers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (status !== AppStatus.CHATTING || !session?.user?.id || tableMissing) return;

    const supabase = initSupabase(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    const channel = supabase.channel('online-users', {
      config: { presence: { key: session?.user?.id } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setUsers(prev => prev.map(u => ({
          ...u,
          status: state[u.id] ? 'online' : 'offline'
        })));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        const { data } = await fetchUsers();
        if (data) {
          setUsers(data.filter((u: any) => u.id !== session?.user?.id));
        }
      })
      .subscribe(async (subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, session?.user?.id, tableMissing]);

  const handleLogout = async () => {
    await signOut();
    setStatus(AppStatus.AUTH);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#020617] p-4 md:p-8 overflow-hidden font-sans">
      <div className="w-full h-full max-w-6xl max-h-[850px] windows-acrylic rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.7)] flex flex-col transition-all border border-white/10 relative">
        
        <TitleBar 
          title={`SupraChat Windows - ${status === AppStatus.CHATTING ? (session?.user?.email || 'Connected') : 'Secure Access'}`} 
          onLogout={status === AppStatus.CHATTING ? handleLogout : undefined}
        />

        <main className="flex-1 overflow-hidden relative">
          {status === AppStatus.AUTH && (
            <div className="h-full flex flex-col items-center justify-center bg-slate-950/20">
              <div className="mb-8 w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <i className="fas fa-shield-halved text-3xl text-white"></i>
              </div>
              <AuthScreen />
              <div className="mt-8 text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Encrypted End-to-End</div>
            </div>
          )}

          {status === AppStatus.CHATTING && (
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="hidden md:flex w-80 border-r border-white/5 bg-black/20 flex-col">
                <div className="p-5 bg-black/10">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Find a conversation..." 
                      className="w-full bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 ring-blue-500/20 transition-all pl-11 text-white placeholder:text-slate-500"
                    />
                    <i className="fas fa-search absolute left-4 top-4 text-slate-500 text-[12px] group-focus-within:text-blue-500 transition-colors"></i>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                  {tableMissing && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl m-2 mb-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[10px] text-amber-500 font-bold uppercase mb-2 tracking-widest flex items-center gap-2">
                        <i className="fas fa-triangle-exclamation"></i> Sync Required
                      </p>
                      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">Your database schema needs to be updated before you can chat.</p>
                      <button 
                        onClick={() => setShowSetupModal(true)}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/10"
                      >
                        RUN SETUP WIZARD
                      </button>
                    </div>
                  )}

                  <div className="px-3 mb-3 text-[10px] uppercase tracking-[0.2em] font-black text-slate-600 mt-2 flex justify-between items-center">
                    <span>Direct Messages</span>
                    <i className="fas fa-plus cursor-pointer hover:text-white transition-colors"></i>
                  </div>
                  
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                       <div className="w-12 h-12 bg-slate-800/30 rounded-full flex items-center justify-center mb-3">
                        <i className="fas fa-user-plus text-slate-700 text-lg"></i>
                       </div>
                       <p className="text-slate-500 text-[11px] italic leading-tight">No other users have joined this instance yet.</p>
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <div 
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`group p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border ${
                          selectedUser?.id === u.id 
                            ? 'bg-blue-600/20 border-blue-500/30 shadow-lg' 
                            : 'hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-sm font-bold shadow-inner transition-colors ${selectedUser?.id === u.id ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}>
                            {u.email[0].toUpperCase()}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#0f172a] ${u.status === 'online' ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[13px] font-bold text-slate-200 truncate">{u.email.split('@')[0]}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate font-medium">Click to open secure session</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window Container */}
              <div className="flex-1 min-w-0 bg-black/5 overflow-hidden">
                <ChatWindow selectedUser={selectedUser} currentUser={session?.user} />
              </div>
            </div>
          )}
        </main>
        
        {showSetupModal && (
          <DatabaseSetupModal onClose={() => setShowSetupModal(false)} />
        )}
      </div>
    </div>
  );
};

export default App;
