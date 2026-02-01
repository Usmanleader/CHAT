
import React, { useState } from 'react';
import { getSupabase } from '../services/supabaseService';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const supabase = getSupabase();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-white max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Sign In' : 'Create Account'}</h2>
      
      <form onSubmit={handleAuth} className="w-full space-y-4">
        <input 
          type="email" 
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all"
          required
        />
        <input 
          type="password" 
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-all"
          required
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold py-3 rounded-lg transition-all"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
      >
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default AuthScreen;
