import React, { useState } from 'react';
import { MessageCircle, Send, X, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MedicalChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your MediVision AI. How can I help you with your health data today?" }
  ]);
  const [input, setInput] = useState('');
  const { token, api } = useAuth();

  if (!token) return null; // Only show if logged in

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const { data } = await api.post('/api/chat', { message: input });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the server." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 h-[500px] shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
              <Bot className="h-5 w-5" /> MediVision AI
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded"><X /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
            <input 
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your risk factors..."
              className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
      )}
    </div>
  );
};

export default MedicalChatbot;