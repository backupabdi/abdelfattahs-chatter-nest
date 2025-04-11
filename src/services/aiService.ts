
import { toast } from "@/hooks/use-toast";

// Get API URL from environment variables, with fallback
const API_URL = import.meta.env.VITE_API_URL || '/api';
const MODEL_NAME = "qwen2.5:7b";

export type AIRequestPayload = {
  prompt: string;
};

export type AIResponseData = {
  response: string;
};

export const generateAIResponse = async (payload: AIRequestPayload): Promise<string> => {
  try {
    // In development, this will use the proxy (/api/generate)
    // In production, it will use VITE_API_URL from .env.production
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: payload.prompt,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    toast({
      title: "Connection Error",
      description: "Failed to connect to Ollama service. Please check if Ollama is running.",
      variant: "destructive",
    });
    return "I'm sorry, I couldn't process your request at the moment. Please make sure the Ollama server is running.";
  }
};

export const createNewChatWithAI = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: "Start a new conversation",
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error creating new chat:', error);
    toast({
      title: "Connection Error",
      description: "Failed to initialize new chat. Make sure Ollama is running.",
      variant: "destructive",
    });
    return "Welcome, Abdelfattah! How may I assist you today?";
  }
};
