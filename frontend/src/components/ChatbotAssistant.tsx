import { Icons } from './Icons';
import { Logo } from './Logo';
import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../utils/aiService';
import type { SequenceMetadata } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotAssistantProps {
  sequences?: SequenceMetadata[];
  currentView?: string;
}

export function ChatbotAssistant({ sequences, currentView }: ChatbotAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your DNA analysis assistant. I can help you understand your sequences, explain genetic concepts, and suggest next steps. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(input, { sequences, currentView });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What's an ORF?",
    "Explain GC content",
    "How do I improve sequence quality?",
    "What should I do next?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 rounded-full shadow-lg hover:shadow-2xl transition-all flex items-center justify-center text-white group hover:scale-105 z-50"
          title="Open DNA Assistant"
        >
          {/* Animated pulsing ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 animate-ping opacity-20" />
          
          {/* DNA Helix Logo */}
          <div className="relative z-10 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:rotate-180 transition-transform duration-700 ease-in-out"
            >
              <path d="M12 4 Q8 12, 12 20 Q16 28, 12 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
              <path d="M28 4 Q32 12, 28 20 Q24 28, 28 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />
              <line x1="12" y1="10" x2="28" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <line x1="12" y1="30" x2="28" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <circle cx="20" cy="10" r="1.5" fill="white" />
              <circle cx="20" cy="20" r="1.5" fill="white" />
              <circle cx="20" cy="30" r="1.5" fill="white" />
            </svg>
          </div>
          
          {/* Active status indicator with glow */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-lg z-20">
            <span className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-purple-200 dark:border-purple-700">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="animate-pulse"
                >
                  <path d="M12 4 Q8 12, 12 20 Q16 28, 12 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M28 4 Q32 12, 28 20 Q24 28, 28 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <line x1="12" y1="10" x2="28" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <line x1="12" y1="30" x2="28" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  <circle cx="20" cy="10" r="1.5" fill="white" />
                  <circle cx="20" cy="20" r="1.5" fill="white" />
                  <circle cx="20" cy="30" r="1.5" fill="white" />
                </svg>
              </div>
              <div>
                <h3 className="text-white">DNA Assistant</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  Online & Ready
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover:rotate-90 duration-300 group shadow-lg hover:shadow-xl"
              title="Close chat"
            >
              <Icons.X className="w-6 h-6 text-white group-hover:scale-125 transition-transform" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs rounded-full transition-all border border-purple-200 dark:border-purple-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.Upload className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
