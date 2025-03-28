
import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
          text: "Welcome to Abdelfattah's Nest. How can I assist you today?",
          sender: 'ai',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ]);
  const [activeChat, setActiveChat] = useState<string>('1');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === activeChat) || chats[0];
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const currentChat = getCurrentChat();
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    // Simulate AI response
    const newAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: `I received your message: "${message}". This is a simulated response.`,
      sender: 'ai',
      timestamp: new Date(),
    };

    // Update the chat with both messages
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newUserMessage, newAiMessage],
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setMessage('');
    setIsDrawerOpen(false);
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      messages: [
        {
          id: Date.now().toString(),
          text: "Welcome to a new conversation. How can I help you?",
          sender: 'ai',
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    setChats([...chats, newChat]);
    setActiveChat(newChat.id);
    setIsDrawerOpen(false);
    
    // Focus on input after creating a new chat
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-nest-background text-nest-text relative">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-nest-accent/20">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="text-nest-text">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80%] bg-nest-secondaryBg text-nest-text border-nest-accent/20">
            <div className="p-4">
              <Button 
                onClick={createNewChat} 
                className="w-full mb-4 bg-nest-accent text-white hover:bg-nest-accent/80"
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
          </DrawerContent>
        </Drawer>
        
        <h1 className="text-xl font-semibold">Abdelfattah's Nest</h1>
        <div className="w-10"></div> {/* Spacer to center the title */}
      </header>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 p-4 chat-scrollbar">
        <div className="space-y-4">
          {getCurrentChat().messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "p-3 rounded-lg max-w-[85%] animate-fade-in",
                msg.sender === 'user'
                  ? "ml-auto bg-nest-accent text-white"
                  : "mr-auto bg-nest-messageBg"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <div className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!message.trim()}
            className="bg-nest-accent hover:bg-nest-accent/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
