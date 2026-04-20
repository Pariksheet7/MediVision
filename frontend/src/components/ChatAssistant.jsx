import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, X, MessageCircle } from 'lucide-react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your MediVision AI. How can I assist with your clinical data today?' }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // 🔥 AXIOS INSTANCE (FIXED BASE URL)
  const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
  });

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input;

    const userMsg = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/api/chat', {
        message: userInput
      });

      // 🔥 SAFE RESPONSE HANDLE
      const reply = res?.data?.reply || "No response from AI";

      setMessages(prev => [
        ...prev,
        { role: 'ai', text: reply }
      ]);

    } catch (error) {
      console.error("CHAT ERROR:", error);

      let errorMsg = "I'm having trouble connecting to the server.";

      // 🔥 BETTER ERROR MESSAGE
      if (error.response) {
        errorMsg = error.response.data?.detail || "Server error occurred";
      } else if (error.request) {
        errorMsg = "Backend not responding. Check server.";
      }

      setMessages(prev => [
        ...prev,
        { role: 'ai', text: errorMsg }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] animate-bounce"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden z-[100] animate-in slide-in-from-bottom-5 duration-300">
          
          {/* HEADER */}
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm">MediVision AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-slate-700 border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="text-[10px] font-bold text-slate-400 animate-pulse">
                AI is analyzing...
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* INPUT */}
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