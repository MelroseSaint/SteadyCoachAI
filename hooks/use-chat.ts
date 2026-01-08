import { useState, useCallback, useRef } from 'react';
import { ApiConfig, Message } from '../types';
import { streamCompletion } from '../utils/api-client';
import { GoogleGenAI } from "@google/genai";

export const useChat = (apiConfig: ApiConfig) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track the current response being built
  const currentResponseRef = useRef('');

  const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setError(null);
    const userMsg = addMessage('user', content);
    setIsLoading(true);

    // Create a placeholder for assistant response
    const assistantMsgId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);
    currentResponseRef.current = '';

    try {
      if (apiConfig.provider === 'gemini') {
        const apiKey = apiConfig.apiKey || (typeof process !== 'undefined' && process.env?.API_KEY);
        if (!apiKey) throw new Error("API Key missing");

        const ai = new GoogleGenAI({ apiKey });
        
        // Convert history for Gemini
        const systemMessage = messages.find(m => m.role === 'system');
        const historyMessages = messages.filter(m => m.role !== 'system');
        
        const history = historyMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const chat = ai.chats.create({
          model: apiConfig.model,
          history: history,
          config: {
            systemInstruction: systemMessage?.content,
            // Mode 2: Provider Context (On-Demand)
            // Enable Google Search only if config allows and user has opted in
            tools: apiConfig.enableContextualGrounding ? [{ googleSearch: {} }] : undefined
          }
        });

        const resultStream = await chat.sendMessageStream({ message: content });
        
        let collectedGroundingMetadata: any = null;

        for await (const chunk of resultStream) {
           if (chunk.text) {
            currentResponseRef.current += chunk.text;
           }
           
           // Capture grounding metadata if present in the chunk
           if (chunk.candidates?.[0]?.groundingMetadata) {
              collectedGroundingMetadata = chunk.candidates[0].groundingMetadata;
           }

           setMessages(prev => prev.map(m => 
              m.id === assistantMsgId ? { 
                  ...m, 
                  content: currentResponseRef.current,
                  groundingMetadata: collectedGroundingMetadata || m.groundingMetadata
              } : m
           ));
        }
        setIsLoading(false);
      } else {
        // OpenAI / Generic Logic (Mode 1 Only as other providers don't have this specific tool integration yet)
        const history = [...messages, userMsg];
        
        await streamCompletion(
          history,
          apiConfig,
          (chunk) => {
            currentResponseRef.current += chunk;
            setMessages(prev => prev.map(m => 
              m.id === assistantMsgId ? { ...m, content: currentResponseRef.current } : m
            ));
          },
          () => {
            setIsLoading(false);
          },
          (err) => {
            throw err;
          }
        );
      }
    } catch (err: any) {
      // Failure Mode A: Provider Fails / Times Out
      // If tool call fails specifically, we could retry without tools, but prompt says "No retries without user action."
      const isGroundingError = apiConfig.enableContextualGrounding && err.message?.includes('grounding');
      
      const errorMessage = isGroundingError 
        ? "External context unavailable. Responding using local context only. (Please disable retrieval or try again)" 
        : (err.message || 'An error occurred');

      setError(errorMessage);
      setIsLoading(false);
      
      // Remove the empty assistant message if it failed immediately/completely
      if (!currentResponseRef.current) {
        setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
      }
    }
  }, [messages, apiConfig, addMessage, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    addMessage,
    isLoading,
    error,
    clearChat
  };
};