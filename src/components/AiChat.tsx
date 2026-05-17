import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { ChartResult, ScoringResult } from "../types";

export default function AiChat({
  chartData,
  scoringData,
  messages,
  setMessages
}: {
  chartData: ChartResult | null;
  scoringData: ScoringResult | null;
  messages: {role: 'ai' | 'user', text: string}[];
  setMessages: React.Dispatch<React.SetStateAction<{role: 'ai' | 'user', text: string}[]>>;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          chartContext: chartData ? {
            meta: chartData.meta,
            planets: chartData.planets,
            houses: chartData.houses
          } : null,
          scoringContext: scoringData ? {
            matches: scoringData.matches.slice(0, 3).map(m => m.name)
          } : null,
          history: messages
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "A disruption occurred in the ethereal network. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-900/50">
      {/* Context Badge */}
      <div className="flex items-center space-x-2 px-4 py-2 border-b border-stone-800 bg-stone-800/80 text-xs">
        <span className="text-stone-400">Current Context:</span>
        {chartData ? (
          <span className="text-amber-500 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            Chart Active
          </span>
        ) : (
          <span className="text-stone-500">No chart loaded</span>
        )}
        {scoringData && (
          <span className="text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            Archetypes Extracted
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-stone-700 ml-4' 
                  : 'bg-gradient-to-tr from-amber-500 to-rose-500 mr-4 shadow-lg shadow-amber-500/20'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-stone-300" /> : <Bot className="w-4 h-4 text-stone-900" />}
              </div>
              
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-stone-700 border border-stone-600 text-stone-200'
                  : 'bg-stone-800/80 border border-stone-700/50 text-stone-300 shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 mr-4 shadow-lg flex items-center justify-center opacity-50">
                <Loader2 className="w-4 h-4 text-stone-900 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-stone-800/80 border-t border-stone-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Mani to interpret the current signature..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-4 pr-12 py-3.5 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans text-sm shadow-inner"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-lg bg-amber-500 text-stone-900 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
