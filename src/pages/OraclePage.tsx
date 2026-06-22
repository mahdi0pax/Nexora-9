import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, Sparkles, Lightbulb } from 'lucide-react';
import { Card, IconBox, Button } from '../design-system';

interface Message {
  id: string;
  role: 'user' | 'oracle';
  text: string;
}

export default function OraclePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'oracle',
      text: 'Greetings, seeker. I am the Nexora Oracle. Ask me anything about Science, History, Technology, Crypto, or Web3. I shall guide your learning path.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const oracleMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        text: 'The Oracle is contemplating your question. In the full release, AI-powered responses will be delivered here with citations and learning paths.',
      };
      setMessages(prev => [...prev, oracleMsg]);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-4 py-4 flex-shrink-0 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(124,92,252,0.1)' }}>
        <IconBox variant="violet" size="md"><Brain size={18} /></IconBox>
        <div>
          <div className="font-title font-semibold text-sm nx-text-primary">Nexora Oracle</div>
          <div className="text-2xs flex items-center gap-1 nx-text-emerald">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00C896' }} />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'rgba(124,92,252,0.15)' : 'rgba(28,38,64,0.7)',
                border: msg.role === 'user' ? '1px solid rgba(124,92,252,0.2)' : '1px solid rgba(230,237,247,0.06)',
                color: msg.role === 'user' ? '#E6EDF7' : 'rgba(230,237,247,0.75)',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              }}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(28,38,64,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}>
              <Sparkles size={14} className="animate-pulse nx-text-violet" />
              <span className="text-xs nx-text-muted">The Oracle is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(124,92,252,0.1)' }}>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: 'rgba(28,38,64,0.7)', border: '1px solid rgba(230,237,247,0.08)' }}>
          <Lightbulb size={16} className="nx-text-faint" />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask the Oracle anything..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(230,237,247,0.15)] nx-text-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: input.trim() ? 'rgba(124,92,252,0.2)' : 'transparent',
              color: input.trim() ? '#7C5CFC' : 'rgba(230,237,247,0.2)',
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
