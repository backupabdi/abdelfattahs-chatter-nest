
import { toast } from "@/hooks/use-toast";

const API_URL = 'http://your-server-ip:11434/api/generate';

export type AIRequestPayload = {
  prompt: string;
};

export type AIResponseData = {
  response: string;
};

export const generateAIResponse = async (payload: AIRequestPayload): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data: AIResponseData = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    toast({
      title: "Connection Error",
      description: "Failed to connect to AI service. Please try again.",
      variant: "destructive",
    });
    return "I'm sorry, I couldn't process your request at the moment. Please try again later.";
  }
};

export const createNewChatWithAI = async (): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Start a new conversation",
      }),
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data: AIResponseData = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error creating new chat:', error);
    toast({
      title: "Connection Error",
      description: "Failed to initialize new chat. Using default welcome message.",
      variant: "destructive",
    });
    return "Welcome, Abdelfattah! How may I assist you today?";
  }
};
