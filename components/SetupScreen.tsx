
import React, { useState } from 'react';

interface SetupScreenProps {
  onComplete: (url: string, key: string) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) {
      setError('Please provide both Supabase URL and Anon Key');
      return;
    }
    onComplete(url, key);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-white max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-4 mx-auto shadow-xl shadow-blue-500/20">
          <i className="fa-solid fa-ghost text-4xl"></i>
        </div>
        <h1 className="text-3xl font-bold mb-2">SupraChat</h1>
        <p className="text-slate-400 text-sm">Initialize your private secure session with Supabase credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Supabase URL</label>
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-project.supabase.co"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Anon Key</label>
          <input 
            type="password" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="eyJh... (Public Anon Key)"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm"
          />
        </div>
        
        {error && <p className="text-red-400 text-xs italic">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4"
        >
          Initialize App
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>
      </form>
      
      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 text-[10px] text-slate-500 leading-relaxed">
        <p><i className="fa-solid fa-shield-halved mr-1"></i> We do not store your credentials. They are used only for the current session to connect to your Supabase instance.</p>
      </div>
    </div>
  );
};

export default SetupScreen;
