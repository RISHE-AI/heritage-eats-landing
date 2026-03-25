import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ShoppingCart, Package, Star, List, Trash2, HelpCircle, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  buttons?: string[];
}

const CHAT_HISTORY_KEY = "heritage_eats_chat_history";

const Chatbot: React.FC = () => {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Welcome to Heritage Eats! I'm your smart assistant.\n\nI can help you with:\n🛒 Products & Prices\n🛍️ Cart Management\n📦 Order Tracking\n🔥 Best Sellers\n❤️ Wishlist\n💚 Ingredients & Benefits\n\nType **help** for all commands!\n\nவரவேற்கிறோம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        buttons: ["Show Products", "Best Sellers", "Help"],
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persist chat history to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Hide pulse animation after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await sendChatMessage(text);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.data?.reply || "Sorry, I couldn't process that. Please try again.",
        buttons: result.data?.buttons || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle special actions
      if (result.data?.action === 'cart_updated') {
        window.dispatchEvent(new CustomEvent('chatbot-cart-updated'));
      }
      if (result.data?.action === 'navigate_checkout') {
        // Will be triggered by "Confirm & Continue" button
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again later.\n\nமன்னிக்கவும், இணைப்பில் சிக்கல் உள்ளது. பின்னர் முயற்சிக்கவும்.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "Confirm & Continue") {
      // Navigate to checkout
      const el = document.querySelector("#checkout") || document.querySelector("[data-checkout]");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.dispatchEvent(new CustomEvent('open-checkout'));
      }
      handleSend("Confirm & Continue");
      return;
    }
    handleSend(buttonText);
  };

  const quickActions = [
    { icon: <List className="h-3 w-3" />, text: "Products", query: "Show all products" },
    { icon: <Star className="h-3 w-3" />, text: "Best Sellers", query: "Show best sellers" },
    { icon: <ShoppingCart className="h-3 w-3" />, text: "My Cart", query: "Show my cart" },
    { icon: <Heart className="h-3 w-3" />, text: "Wishlist", query: "Show my wishlist" },
    { icon: <Sparkles className="h-3 w-3" />, text: "Recommend", query: "Recommend something for me" },
    { icon: <HelpCircle className="h-3 w-3" />, text: "Help", query: "help" },
  ];

  const handleClearChat = () => {
    const welcomeMsg: Message = {
      id: "welcome",
      role: "assistant",
      content: "👋 Welcome to Heritage Eats! I'm your smart assistant.\n\nI can help you with:\n🛒 Products & Prices\n🛍️ Cart Management\n📦 Order Tracking\n🔥 Best Sellers\n❤️ Wishlist\n💚 Ingredients & Benefits\n\nType **help** for all commands!\n\nவரவேற்கிறோம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      buttons: ["Show Products", "Best Sellers", "Help"],
    };
    setMessages([welcomeMsg]);
  };

  // Format inline text: bold (**) and italic (*)
  const formatInline = (text: string, keyPrefix: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyPrefix}-${i}`} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={`${keyPrefix}-${i}`} className="opacity-80 text-[12px]">{part.slice(1, -1)}</em>;
      }
      return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    });
  };

  // Full markdown-like renderer
  const formatContent = (content: string) => {
    const paragraphs = content.split(/\n\n+/);

    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, pIdx) => {
          const lines = paragraph.split('\n');

          if (lines.length === 1 && /^[━─═─-]{3,}$/.test(lines[0].trim())) {
            return <hr key={pIdx} className="border-border/50 my-1" />;
          }

          const isAllList = lines.every(l => /^\s*(•|[-–]|\d+[.\)])\s/.test(l.trim()) || l.trim() === '');
          if (isAllList && lines.some(l => l.trim() !== '')) {
            return (
              <div key={pIdx} className="space-y-0.5">
                {lines.filter(l => l.trim()).map((line, lIdx) => {
                  const cleaned = line.trim().replace(/^\s*(•|[-–]|\d+[.\)])\s*/, '');
                  const marker = line.trim().match(/^(\d+[.\)])/)?.[1];
                  return (
                    <div key={lIdx} className="flex gap-1.5 items-start text-[12.5px] leading-snug">
                      <span className="text-primary/70 shrink-0 mt-px text-[11px]">
                        {marker || '•'}
                      </span>
                      <span>{formatInline(cleaned, `${pIdx}-${lIdx}`)}</span>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={pIdx}>
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();

                if (/^[━─═─-]{3,}$/.test(trimmed)) {
                  return <hr key={lIdx} className="border-border/50 my-1" />;
                }

                if (/^\s*(•|[-–])\s/.test(trimmed)) {
                  const cleaned = trimmed.replace(/^\s*(•|[-–])\s*/, '');
                  return (
                    <div key={lIdx} className="flex gap-1.5 items-start text-[12.5px] leading-snug pl-1">
                      <span className="text-primary/70 shrink-0 mt-px text-[11px]">•</span>
                      <span>{formatInline(cleaned, `${pIdx}-${lIdx}`)}</span>
                    </div>
                  );
                }

                if (/^\d+[.\)]\s/.test(trimmed)) {
                  const num = trimmed.match(/^(\d+[.\)])/)?.[1] || '';
                  const cleaned = trimmed.replace(/^\d+[.\)]\s*/, '');
                  return (
                    <div key={lIdx} className="flex gap-1.5 items-start text-[12.5px] leading-snug pl-1">
                      <span className="text-primary/70 shrink-0 mt-px text-[11px] font-medium">{num}</span>
                      <span>{formatInline(cleaned, `${pIdx}-${lIdx}`)}</span>
                    </div>
                  );
                }

                if (!trimmed) return null;

                return (
                  <p key={lIdx} className="text-[13px] leading-relaxed">
                    {formatInline(trimmed, `${pIdx}-${lIdx}`)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed z-[9999] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bottom-20 right-3 sm:right-4 md:bottom-6 md:right-6",
          isOpen
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            {showPulse && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-ping" />
            )}
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed z-[9999] w-[380px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-background border shadow-2xl transition-all duration-300",
          "bottom-36 right-3 sm:right-4 md:bottom-24 md:right-6",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-sm">Heritage Eats</h3>
              <p className="text-[10px] opacity-80">
                {user ? `Hi ${user.name.split(' ')[0]}!` : "Smart Assistant"} • Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="hover:bg-primary-foreground/20 text-primary-foreground h-7 w-7"
              aria-label="Clear chat"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/20 text-primary-foreground h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[350px] overflow-y-auto p-3 space-y-2.5">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5",
                    message.role === "user"
                      ? "bg-primary/15 text-foreground rounded-br-sm text-[13px] leading-relaxed border border-primary/20"
                      : "bg-card text-foreground rounded-bl-sm border border-border shadow-sm"
                  )}
                >
                  {message.role === "user" ? message.content : formatContent(message.content)}
                </div>
              </div>
              {/* Action Buttons */}
              {message.role === "assistant" && message.buttons && message.buttons.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5 ml-1">
                  {message.buttons.map((btn, btnIdx) => (
                    <button
                      key={btnIdx}
                      onClick={() => handleButtonClick(btn)}
                      disabled={isLoading}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors disabled:opacity-50 border border-primary/20"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card text-foreground rounded-2xl rounded-bl-sm px-4 py-3 border border-border shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {quickActions.map((q) => (
              <button
                key={q.text}
                onClick={() => handleSend(q.query)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50 border border-border/50"
              >
                {q.icon}
                {q.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-2.5 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-1.5"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? "Ask about products, cart, orders..." : "Ask about products, prices..."}
              disabled={isLoading}
              className="flex-1 text-sm h-9"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-9 w-9 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
