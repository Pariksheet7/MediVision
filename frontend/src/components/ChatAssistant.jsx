import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, X, MessageCircle, Minimize2 } from 'lucide-react';

const ChatAssistant = () => {
  // 1. ADD THIS STATE: Controls if the window is open or closed
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your MediVision AI. How can I assist with your clinical data today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post('http://localhost:8000/api/chat', { message: input });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble reaching the medical server." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* 2. THE FLOATING BUTTON: Only shows when isOpen is false */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] animate-bounce"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* 3. THE CHAT WINDOW: Only shows when isOpen is true */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-300">
          {/* Header with Close Button */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm">MediVision AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Chat Box */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] font-bold text-slate-400 animate-pulse">AI is analyzing...</div>}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ask about patient risks..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;