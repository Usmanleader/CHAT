
import React, { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../services/supabaseService';
import { getAIResponse } from '../services/geminiService';
import { Message, UserProfile } from '../types';

interface ChatWindowProps {
  selectedUser: UserProfile | null;
  currentUser: any;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedUser || !currentUser) return;
    
    const supabase = getSupabase();
    
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    const channelName = `chat_${[currentUser.id, selectedUser.id].sort().join('_')}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selectedUser.id) ||
          (newMsg.sender_id === selectedUser.id && newMsg.receiver_id === currentUser.id)
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (e?: React.FormEvent, customContent?: string, type: 'text' | 'image' | 'file' = 'text', fileName?: string) => {
    if (e) e.preventDefault();
    const content = customContent || newMessage;
    if (!content.trim() || !currentUser || !selectedUser) return;

    if (!customContent) setNewMessage('');

    const isAiTrigger = content.toLowerCase().startsWith('ai:');
    const supabase = getSupabase();

    const { error } = await supabase
      .from('messages')
      .insert([{ 
        content, 
        sender_id: currentUser.id, 
        receiver_id: selectedUser.id,
        message_type: type,
        file_name: fileName
      }]);

    if (error && error.code === '42P01') {
      const localMsg: Message = {
        id: Date.now().toString(),
        content,
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        created_at: new Date().toISOString(),
        message_type: type,
        file_name: fileName
      };
      setMessages(prev => [...prev, localMsg]);
    }

    if (isAiTrigger) handleAiResponse(content);
  };

  const handleAiResponse = async (userPrompt: string) => {
    setIsTyping(true);
    const cleanPrompt = userPrompt.replace(/^ai:\s*/i, '');
    const context = messages.slice(-5).map(m => m.content);
    const aiResponse = await getAIResponse(cleanPrompt, context);
    
    const aiMsg: Message = {
      id: 'ai-' + Date.now().toString(),
      content: aiResponse,
      sender_id: 'gemini-ai',
      receiver_id: currentUser.id,
      created_at: new Date().toISOString(),
      is_ai: true,
      message_type: 'text'
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      sendMessage(undefined, base64String, type, file.name);
    };
    reader.readAsDataURL(file);
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/10">
        <div className="w-24 h-24 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-6 shadow-xl">
          <i className="fas fa-comment-dots text-4xl opacity-20"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-300">Secure Desktop Messaging</h2>
        <p className="text-sm mt-2 max-w-xs text-center opacity-60 px-4">Select a contact from the sidebar to start an end-to-end encrypted private session.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg font-bold shadow-lg">
              {selectedUser.email[0].toUpperCase()}
            </div>
            {selectedUser.status === 'online' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#0f172a]"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{selectedUser.email.split('@')[0]}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {selectedUser.status === 'online' ? '● Online now' : 'Private session'}
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-slate-400 mr-2">
          <i className="fas fa-phone cursor-pointer hover:text-white transition-all"></i>
          <i className="fas fa-video cursor-pointer hover:text-white transition-all"></i>
          <i className="fas fa-info-circle cursor-pointer hover:text-white transition-all"></i>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/20">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUser?.id;
          const isAi = msg.is_ai || msg.sender_id === 'gemini-ai';
          
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                isMine 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : isAi 
                    ? 'bg-purple-900/60 border border-purple-500/30 text-purple-100 rounded-tl-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                {isAi && (
                  <div className="flex items-center gap-1.5 mb-1.5 opacity-70">
                    <i className="fas fa-magic text-[10px]"></i>
                    <span className="text-[9px] uppercase tracking-[0.15em] font-extrabold">Gemini Engine</span>
                  </div>
                )}
                
                {msg.message_type === 'image' ? (
                  <img src={msg.content} alt="shared" className="rounded-lg max-w-full h-auto cursor-zoom-in hover:scale-[1.01] transition-transform" onClick={() => window.open(msg.content)} />
                ) : msg.message_type === 'file' ? (
                  <a href={msg.content} download={msg.file_name} className="flex items-center gap-4 p-3 bg-black/30 rounded-xl hover:bg-black/40 transition-colors border border-white/5">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-download text-lg text-blue-400"></i>
                    </div>
                    <div className="overflow-hidden flex-1">
                       <p className="text-xs font-bold truncate">{msg.file_name || 'Attachment'}</p>
                       <p className="text-[9px] text-slate-400">Click to secure download</p>
                    </div>
                  </a>
                ) : (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}

                <div className={`text-[9px] mt-1.5 opacity-40 font-mono ${isMine ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl px-4 py-2 flex gap-1.5 items-center">
              <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Processing</span>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Input */}
      <div className="p-4 bg-black/20 border-t border-white/5">
        <form onSubmit={sendMessage} className="relative flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-700 hover:text-white transition-all border border-white/5"
          >
            <i className="fas fa-plus text-sm"></i>
          </div>
          
          <div className="flex-1 relative">
             <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder='Message contact... (ai: for help)'
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 px-5 pr-12 outline-none focus:border-blue-500/50 focus:ring-1 ring-blue-500/20 transition-all text-sm text-white"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 flex gap-4">
               <i className="far fa-face-smile cursor-pointer hover:text-white transition-colors"></i>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/30"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
