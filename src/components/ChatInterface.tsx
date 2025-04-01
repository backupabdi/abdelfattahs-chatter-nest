
import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Menu, Plus, Feather, Copy, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { generateAIResponse, createNewChatWithAI } from '@/services/aiService';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [
        {
          id: '1',
          text: "Welcome, Abdelfattah! How may I assist you today?",
          sender: 'ai',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reset copy icon after delay
  useEffect(() => {
    if (copying) {
      const timer = setTimeout(() => {
        setCopying(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copying]);

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat) || chats[0];
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const currentChat = getCurrentChat();
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    // Update the chat with the user message first
    const updatedChatsWithUserMessage = chats.map(chat => {
      if (chat.id === currentChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newUserMessage],
        };
      }
      return chat;
    });

    setChats(updatedChatsWithUserMessage);
    setMessage('');
    setIsDrawerOpen(false);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call API for AI response
      const aiResponseText = await generateAIResponse({ prompt: message });
      
      // Add AI response
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      // Update the chat with the AI message
      const updatedChats = updatedChatsWithUserMessage.map(chat => {
        if (chat.id === currentChat.id) {
          return {
            ...chat,
            messages: [...chat.messages, newAiMessage],
          };
        }
        return chat;
      });
      
      setChats(updatedChats);
    } catch (error) {
      console.error('Error in chat flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    setIsLoading(true);
    
    try {
      const welcomeMessage = await createNewChatWithAI();
      
      const newChat: Chat = {
        id: Date.now().toString(),
        title: `Chat ${chats.length + 1}`,
        messages: [
          {
            id: Date.now().toString(),
            text: welcomeMessage,
            sender: 'ai',
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
      };

      setChats([...chats, newChat]);
      setActiveChat(newChat.id);
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setIsLoading(false);
      // Focus on input after creating a new chat
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopying(id);
        toast({
          title: "Copied to clipboard",
          description: "The message has been copied to your clipboard.",
          duration: 2000,
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  // Function to format code blocks
  const formatMessageWithCodeBlocks = (text: string) => {
    // Check if text contains code block markers ```
    if (!text.includes('```')) {
      return <p className="text-sm whitespace-pre-wrap">{text}</p>;
    }

    // Split by code block markers
    const segments = text.split(/(```(?:[\s\S]*?)```)/g);
    
    return (
      <div className="text-sm whitespace-pre-wrap">
        {segments.map((segment, index) => {
          if (segment.startsWith('```') && segment.endsWith('```')) {
            // Extract code without the backticks
            const code = segment.slice(3, -3).trim();
            return (
              <div key={index} className="relative my-2 rounded-md bg-slate-900 p-4 text-slate-50 overflow-x-auto">
                <div className="absolute right-2 top-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    onClick={() => copyToClipboard(code, `code-${index}`)}
                  >
                    {copying === `code-${index}` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Code className="h-4 w-4 inline-block mr-2 text-slate-400" />
                <code>{code}</code>
              </div>
            );
          }
          return <span key={index}>{segment}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-nest-background text-nest-text relative">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-nest-accent/20">
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-nest-text">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] bg-nest-secondaryBg text-nest-text border-nest-accent/20">
            <div className="p-4">
              <Button 
                onClick={createNewChat} 
                className="w-full mb-4 bg-nest-accent text-white hover:bg-nest-accent/80"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" /> New Chat
              </Button>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-2">Recent Chats</h3>
                {chats.map((chat) => (
                  <Button
                    key={chat.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left",
                      activeChat === chat.id ? "bg-nest-accent/20" : ""
                    )}
                    onClick={() => {
                      setActiveChat(chat.id);
                      setIsDrawerOpen(false);
                    }}
                  >
                    {chat.title}
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <h1 className="text-xl font-semibold flex items-center">
          <Feather className="h-5 w-5 mr-2" /> 
          Abdelfattah's Nest
        </h1>
        <div className="w-10"></div> {/* Spacer to center the title */}
      </header>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 p-4 chat-scrollbar">
        <div className="space-y-4">
          {getCurrentChat().messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "p-3 rounded-lg max-w-[85%] animate-fade-in relative group",
                msg.sender === 'user'
                  ? "ml-auto bg-nest-accent text-white"
                  : "mr-auto bg-nest-messageBg"
              )}
            >
              {formatMessageWithCodeBlocks(msg.text)}
              <div className="flex justify-between items-center mt-2">
                <div className="text-xs opacity-70">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(msg.text, msg.id)}
                >
                  {copying === msg.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-nest-accent/20">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex space-x-2"
        >
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-nest-secondaryBg border-nest-accent/20 text-nest-text placeholder:text-nest-text/50"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim() || isLoading}
            className="bg-nest-accent hover:bg-nest-accent/80"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default ChatInterface;
