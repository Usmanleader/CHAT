
import React from 'react';

interface TitleBarProps {
  title: string;
  onLogout?: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, onLogout }) => {
  return (
    <div className="flex items-center justify-between h-9 bg-black/40 px-3 text-[11px] text-slate-400 select-none border-b border-white/5">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center shadow-lg">
          <i className="fas fa-shield-alt text-[10px] text-white"></i>
        </div>
        <span className="font-semibold tracking-wide text-slate-300">{title}</span>
      </div>
      
      <div className="flex items-center gap-0 h-full">
        {onLogout && (
          <button 
            onClick={onLogout}
            className="px-3 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest h-full flex items-center bg-white/5 hover:bg-white/10"
          >
            Log Out
          </button>
        )}
        <div className="flex h-full">
          <div className="w-11 h-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
            <i className="fas fa-minus text-[10px]"></i>
          </div>
          <div className="w-11 h-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
            <i className="far fa-square text-[10px]"></i>
          </div>
          <div className="w-11 h-full flex items-center justify-center hover:bg-[#c42b1c] hover:text-white cursor-pointer transition-colors">
            <i className="fas fa-times text-[12px]"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
