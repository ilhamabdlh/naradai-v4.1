import { useState } from "react";
import { Sparkles, Send, Lightbulb, X, Minimize2 } from "lucide-react";

export function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([
    {
      type: 'ai',
      content: 'Hi! I\'m your AI Intelligence Assistant. I can help you understand trends, analyze sentiment, and recommend actions based on your social intelligence data. What would you like to know?'
    }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);

  const suggestions = [
    "What's causing the sentiment drop this week?",
    "Show me top product complaints",
    "Compare our performance vs competitors",
    "What actions should I prioritize?",
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the data, the sentiment drop is primarily driven by packaging complaints (23% increase) and customer service delays (40% longer wait times). I recommend addressing the packaging issue first as it has the highest impact.",
        "The top product complaints are: 1) Packaging damage (1,847 mentions, -0.68 sentiment), 2) Customer service delays (2,341 mentions, -0.54 sentiment), and 3) Shipping speed issues (1,654 mentions). Would you like me to create action items for these?",
        "Your brand leads with 32% share of voice, but Competitor B is gaining ground at 24% (+8% this month). Their sentiment score is higher at 75 vs your 72. I suggest monitoring their customer service strategy.",
        "Top priority: Address packaging complaints (High impact, Medium effort). Second: Respond to customer service backlash (Critical impact, Low effort). Third: Capitalize on dark mode feature requests (Medium impact, High effort)."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { type: 'ai', content: randomResponse }]);
    }, 1000);
    
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[400px] border-l border-slate-200 bg-white flex flex-col h-[calc(100vh-73px)] sticky top-[73px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-slate-900">AI Assistant</h3>
            <p className="text-xs text-slate-500">Always here to help</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Minimize2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {message.type === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`flex-1 rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-violet-500 text-white ml-8'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-slate-700">You</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Try asking:</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:border-violet-300 hover:bg-violet-50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-200 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </aside>
  );
}