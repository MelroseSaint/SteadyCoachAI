import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  volume: number;
  isAiSpeaking: boolean;
  active: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume, isAiSpeaking, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const draw = () => {
      if (!active) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Dynamic color based on who is "dominant"
      const color = isAiSpeaking ? '#60A5FA' : '#34D399'; // Blue for AI, Green for User
      
      // If AI is speaking, we simulate a waveform since we don't have direct access to its output stream analysis easily 
      // without extra nodes. We can just use a sine wave modulation if isAiSpeaking is true.
      // If User is speaking, we use the `volume` prop to modulate amplitude.
      
      let amplitude = 0;
      if (isAiSpeaking) {
        amplitude = 30 + Math.sin(Date.now() / 100) * 10; // Simulated activity
      } else {
         // Logarithmic scaling for better visual feel from raw volume (0-255)
         amplitude = Math.max(2, (volume / 255) * 100);
      }

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;

      for (let x = 0; x < width; x++) {
        // Create a wave
        const frequency = isAiSpeaking ? 0.05 : 0.02;
        const y = centerY + Math.sin(x * frequency + offset) * amplitude * Math.sin(x / width * Math.PI); // Windowing to taper ends
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.stroke();

      offset += 0.2;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [volume, isAiSpeaking, active]);

  return (
    <div className="w-full h-32 bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700 shadow-inner">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={128} 
        className="w-full h-full"
      />
    </div>
  );
};
