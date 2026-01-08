import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio-utils';
import { SAMPLE_RATE_INPUT, SAMPLE_RATE_OUTPUT, MODEL_NAME } from '../constants';

interface UseLiveApiProps {
  systemInstruction: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  apiKey: string;
}

export const useLiveApi = ({ systemInstruction, onConnect, onDisconnect, onError, apiKey }: UseLiveApiProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [volume, setVolume] = useState(0); // 0 to 100 for visualizer

  // Audio Contexts
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  
  // Processing Nodes
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Playback state
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Gemini Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const connect = useCallback(async () => {
    try {
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE_INPUT });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE_OUTPUT });
      
      // Setup Output path for audio
      const outputNode = outputContextRef.current.createGain();
      outputNode.connect(outputContextRef.current.destination);

      // Get User Media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Volume Metering (Visualizer)
      const audioContext = inputContextRef.current;
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      // Animation loop for volume
      const updateVolume = () => {
        if (!inputContextRef.current) return;
        analyzer.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(avg);
        if (isConnected || inputContextRef.current.state === 'running') {
             requestAnimationFrame(updateVolume);
        }
      };

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: systemInstruction,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            onConnect?.();
            
            // Start input streaming
            inputSourceRef.current = source;
            // 4096 buffer size, 1 channel input, 1 channel output
            processorRef.current = audioContext.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(audioContext.destination);
            
            // Start volume visualizer
            updateVolume();
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current) {
              setIsAiSpeaking(true);
              const ctx = outputContextRef.current;
              
              // Ensure we schedule seamlessly
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                 base64ToUint8Array(base64Audio),
                 ctx,
                 SAMPLE_RATE_OUTPUT,
                 1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                   setIsAiSpeaking(false);
                }
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiSpeaking(false);
            }
          },
          onclose: () => {
            setIsConnected(false);
            onDisconnect?.();
          },
          onerror: (err) => {
            console.error("Session Error:", err);
            onError?.(new Error("Connection error occurred."));
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
      onError?.(err);
      console.error(err);
    }
  }, [systemInstruction, onConnect, onDisconnect, onError, apiKey]);

  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
      // Clean up audio nodes
      if (inputSourceRef.current) inputSourceRef.current.disconnect();
      if (processorRef.current) processorRef.current.disconnect();
      if (inputContextRef.current) inputContextRef.current.close();
      if (outputContextRef.current) outputContextRef.current.close();
      
      // Stop all playing sources
      sourcesRef.current.forEach(s => {
        try { s.stop(); } catch (e) {}
      });
      sourcesRef.current.clear();

      try {
        const session = await sessionPromiseRef.current;
        // Typescript safe cast for closure if needed, though library usually handles cleanup on close
        (session as any).close?.();
      } catch (e) {
        console.warn("Error closing session", e);
      }
      
      setIsConnected(false);
      setIsAiSpeaking(false);
      sessionPromiseRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isAiSpeaking,
    volume
  };
};