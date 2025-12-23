import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ResultViewProps {
  history: ChatMessage[];
  onContinue: (script: string) => void;
  isLoading: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ history, onContinue, isLoading }) => {
  const [newScript, setNewScript] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when history changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewScript(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!newScript.trim()) return;
    onContinue(newScript);
    setNewScript('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* History Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {history.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-5 shadow-md border ${
                msg.role === 'user'
                  ? 'bg-blue-900/40 border-blue-700/50 text-blue-100 rounded-br-none'
                  : msg.isError
                  ? 'bg-red-900/40 border-red-700/50 text-red-100'
                  : 'bg-gray-800 border-gray-700 text-gray-100 rounded-bl-none'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">
                {msg.role === 'user' ? 'Script mới của bạn' : 'App Visualizer'}
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {msg.content}
              </pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start animate-pulse">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-none p-5 shadow-md">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                <span className="text-sm text-gray-400 ml-2">Đang tạo Source Context và Prompts...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-gray-400 text-sm px-1">
                <span>Tiếp tục story...</span>
                <label className="cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-1">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                     Úp file script tiếp theo
                     <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md" />
                </label>
            </div>
          <textarea
            value={newScript}
            onChange={(e) => setNewScript(e.target.value)}
            placeholder="Dán nội dung đoạn script tiếp theo vào đây..."
            className="w-full h-24 bg-gray-900 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          ></textarea>
          <button
            onClick={handleSubmit}
            disabled={!newScript.trim() || isLoading}
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              !newScript.trim() || isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg active:scale-95'
            }`}
          >
             Gửi Script Tiếp Theo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
