import { useState } from "react";
import { Sparkles, Send, TrendingUp, Package, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  subtext?: string;
  timestamp: string;
}

const quickActions = [
  { label: "market sentiment", icon: TrendingUp },
  { label: "overall sales", icon: BarChart3 },
  { label: "today's trends", icon: Sparkles },
  { label: "restock advice", icon: Package },
  { label: "slow movers", icon: AlertCircle },
];

const initialMessages: Message[] = [
  {
    id: "1",
    type: "ai",
    content: "Gold bangles expected to trend up this week by 18%.",
    subtext: "Based on seasonal patterns and market signals",
    timestamp: "10:24 AM",
  },
  {
    id: "2",
    type: "ai",
    content: "Three items are moving slow — discount could clear stock faster.",
    subtext: "Silver chains, rose gold rings, pearl sets",
    timestamp: "10:26 AM",
  },
  {
    id: "3",
    type: "ai",
    content: "You're nearing a reorder point for diamond studs.",
    subtext: "Current stock: 4 pieces, avg. weekly sales: 3",
    timestamp: "10:28 AM",
  },
];

export const JewelAIChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [showNotification, setShowNotification] = useState(true);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Let me analyze that for you...",
        subtext: "Processing your request",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* New Message Notification */}
      {showNotification && (
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 animate-in slide-in-from-top duration-500"
          onClick={() => setShowNotification(false)}
        >
          <div className="bg-gradient-to-r from-primary via-gold-glow to-primary px-6 py-3 rounded-full shadow-gold flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform animate-pulse">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-white font-medium text-sm">New Insight from Jewel AI → Tap to view</span>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-card via-card to-secondary/20 rounded-2xl shadow-lg border border-border/50 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-background via-secondary to-gold-light/20 px-6 py-4 border-b border-border/50 flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-gold-glow flex items-center justify-center shadow-gold">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-success rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Jewel AI</h3>
            <p className="text-xs text-muted-foreground">Your intelligent assistant</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-md",
                    message.type === "ai"
                      ? "bg-gradient-to-br from-primary/10 via-gold-glow/5 to-transparent border border-primary/20 backdrop-blur-sm shadow-gold/50"
                      : "bg-muted"
                  )}
                >
                  <p
                    className={cn(
                      "font-medium leading-relaxed",
                      message.type === "ai" ? "text-foreground font-bold" : "text-foreground"
                    )}
                  >
                    {message.content}
                  </p>
                  {message.subtext && (
                    <p className="text-xs text-muted-foreground mt-1 font-normal">
                      {message.subtext}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/70 mt-2">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-gradient-to-r from-background to-gold-light/5 hover:from-gold-light/10 hover:to-primary/10 hover:border-primary/50 transition-all hover:shadow-gold/30 hover:shadow-md group"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary group-hover:animate-pulse" />
                    <span className="text-xs font-medium text-foreground">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Jewel AI anything..."
              className="flex-1 rounded-full border-primary/30 focus-visible:ring-primary/50 bg-background/50"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full bg-gradient-to-br from-primary to-gold-glow hover:from-primary/90 hover:to-gold-glow/90 shadow-gold"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
