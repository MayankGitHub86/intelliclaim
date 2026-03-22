import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { apiClient } from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export function ClaimChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string}[]>([
    { role: 'bot', text: 'Hi! I am your IntelliClaim assistant. I can help you fast-track your claim natively right now. Can you tell me what happened?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/chatbot', {
        message: userText,
        history: messages
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to AI right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full shadow-2xl text-white hover:scale-105 transition-transform z-50 flex items-center justify-center group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-background/90 text-foreground px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border">
          AI Claim Assistant
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 z-50 shadow-2xl"
          >
            <Card className="border-border shadow-2xl overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white p-4 flex flex-row items-center justify-between shadow-sm flex-shrink-0">
                <CardTitle className="text-md font-bold flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>AI Claim Assistant</span>
                </CardTitle>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors text-white">
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-background">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-l from-purple-600 to-cyan-500 text-white rounded-tr-sm' 
                        : 'bg-muted/50 border border-border/50 rounded-tl-sm text-foreground'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 border border-border/50 rounded-2xl p-4 rounded-tl-sm flex space-x-2 w-16 items-center justify-center">
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3 border-t bg-background flex-shrink-0">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Type your claim details..."
                      className="flex-1 rounded-full bg-muted/50 focus-visible:ring-1 focus-visible:ring-purple-500 border-none"
                    />
                    <button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="p-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
