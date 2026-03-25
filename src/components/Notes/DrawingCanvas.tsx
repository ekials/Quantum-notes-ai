// src/components/Notes/DrawingCanvas.tsx
// Canvas de dibujo con lápiz para tablet/iPad

import { useRef, useState, useEffect } from 'react';
import { Trash2, Pen, Eraser, Download, X } from 'lucide-react';

interface DrawingCanvasProps {
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}

type Tool = 'pen' | 'eraser';

export function DrawingCanvas({ onClose, onInsert }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#a78bfa');
  const [lineWidth, setLineWidth] = useState(3);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPos.current) return;

    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#0f0f1a' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleInsert = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onInsert(dataUrl);
    onClose();
  };

  const COLORS = ['#a78bfa', '#00f5c4', '#f472b6', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#ffffff'];
  const SIZES = [1, 2, 3, 5, 8, 12];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex flex-col rounded-2xl overflow-hidden w-full max-w-3xl"
        style={{
          background: 'rgba(15, 15, 26, 0.99)',
          border: '1px solid rgba(124, 106, 245, 0.25)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-3 border-b border-white/5 flex-wrap">
          {/* Tool selector */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setTool('pen')}
              className="p-1.5 rounded-md transition-all"
              style={{ background: tool === 'pen' ? 'rgba(124,106,245,0.3)' : 'transparent' }}
              title="Lápiz"
            >
              <Pen size={14} className={tool === 'pen' ? 'text-purple-300' : 'text-gray-500'} />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className="p-1.5 rounded-md transition-all"
              style={{ background: tool === 'eraser' ? 'rgba(124,106,245,0.3)' : 'transparent' }}
              title="Borrador"
            >
              <Eraser size={14} className={tool === 'eraser' ? 'text-purple-300' : 'text-gray-500'} />
            </button>
          </div>

          {/* Color picker */}
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool('pen'); }}
                className="w-5 h-5 rounded-full transition-all"
                style={{
                  background: c,
                  outline: color === c && tool === 'pen' ? `2px solid white` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          {/* Line width */}
          <div className="flex items-center gap-1">
            {SIZES.map(s => (
              <button
                key={s}
                onClick={() => setLineWidth(s)}
                className="flex items-center justify-center w-6 h-6 rounded transition-all"
                style={{
                  background: lineWidth === s ? 'rgba(124,106,245,0.3)' : 'transparent',
                }}
              >
                <div className="rounded-full bg-gray-400"
                  style={{ width: Math.min(s * 1.5, 14), height: Math.min(s * 1.5, 14) }}
                />
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Trash2 size={12} /> Limpiar
            </button>
            <button
              onClick={handleInsert}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white font-medium transition-all"
              style={{ background: 'linear-gradient(135deg, #7c6af5, #5b4de0)' }}
            >
              <Download size={12} /> Insertar en nota
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          style={{ display: 'block', background: '#0f0f1a' }}
        />
        <p className="text-center text-[10px] text-gray-700 py-1.5">
          Usa el lápiz de tu tablet o el mouse para dibujar
        </p>
      </div>
    </div>
  );
}
