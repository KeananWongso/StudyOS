'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasStroke, CanvasPoint } from '@/lib/types';
import { Pen, Eraser, RotateCcw, RotateCw, Trash2, Grid3x3 } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onCanvasChange?: (imageData: string) => void;
  className?: string;
  initialData?: string;
}

export default function DrawingCanvas({ 
  width = 600, 
  height = 400, 
  onCanvasChange, 
  className = '',
  initialData
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [penSize, setPenSize] = useState(3);
  const [penColor, setPenColor] = useState('#000000');
  const [showGrid, setShowGrid] = useState(false);
  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const [undoStack, setUndoStack] = useState<CanvasStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<CanvasStroke[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<CanvasPoint[]>([]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((canvas: HTMLCanvasElement) => {
      if (onCanvasChange) {
        onCanvasChange(canvas.toDataURL('image/png'));
      }
    }, 1000),
    [onCanvasChange]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Configure context for smooth drawing
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;

    // Load initial data if provided
    if (initialData) {
      loadImageData(initialData);
    } else {
      // Clear and redraw everything
      redrawCanvas();
    }
  }, [width, height, strokes, showGrid, initialData]);

  const loadImageData = (imageData: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid if enabled
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Redraw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    if (currentStroke.length > 0) {
      const tempStroke: CanvasStroke = {
        points: currentStroke,
        color: penColor,
        size: penSize,
        timestamp: Date.now()
      };
      drawStroke(ctx, tempStroke);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    const gridSize = 20;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: CanvasStroke) => {
    if (stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalCompositeOperation = stroke.color === 'transparent' ? 'destination-out' : 'source-over';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      const prevPoint = stroke.points[i - 1];
      const currentPoint = stroke.points[i];
      
      // Use quadratic curves for smoother lines
      const midX = (prevPoint.x + currentPoint.x) / 2;
      const midY = (prevPoint.y + currentPoint.y) / 2;
      
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
    }
    
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  };

  const getPointFromEvent = (e: React.TouchEvent | React.MouseEvent): CanvasPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number, pressure = 1;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Try to get pressure from touch (for Apple Pencil)
      pressure = (e.touches[0] as any).force || 1;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      pressure = (e as any).pressure || 1;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      pressure
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointFromEvent(e);
    setCurrentStroke([point]);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getPointFromEvent(e);
    setCurrentStroke(prev => [...prev, point]);
    redrawCanvas();
  };

  const stopDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      const newStroke: CanvasStroke = {
        points: currentStroke,
        color: tool === 'eraser' ? 'transparent' : penColor,
        size: tool === 'eraser' ? penSize * 2 : penSize,
        timestamp: Date.now()
      };

      // Save state for undo
      setUndoStack(prev => [...prev, strokes]);
      setRedoStack([]);
      setStrokes(prev => [...prev, newStroke]);
      
      // Auto-save
      const canvas = canvasRef.current;
      if (canvas) {
        debouncedSave(canvas);
      }
    }
    
    setCurrentStroke([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [strokes, ...prev]);
    setStrokes(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack(prev => [...prev, strokes]);
    setStrokes(nextState);
    setRedoStack(prev => prev.slice(1));
  };

  const clearCanvas = () => {
    setUndoStack(prev => [...prev, strokes]);
    setRedoStack([]);
    setStrokes([]);
    setCurrentStroke([]);
  };

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-300 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          {/* Tool Selection */}
          <div className="flex bg-white rounded-lg p-1 border">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded ${tool === 'pen' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Pen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Pen Size */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={penSize}
              onChange={(e) => setPenSize(parseInt(e.target.value))}
              className="w-16"
            />
            <span className="text-sm text-gray-600 w-8">{penSize}px</span>
          </div>

          {/* Color Picker */}
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <div className="flex space-x-1">
              {['#000000', '#0000ff', '#ff0000'].map(color => (
                <button
                  key={color}
                  onClick={() => setPenColor(color)}
                  className={`w-6 h-6 rounded border-2 ${penColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded ${showGrid ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <button
            onClick={clearCanvas}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="border border-gray-200 rounded cursor-crosshair touch-none"
          style={{ 
            width: '100%', 
            height: 'auto',
            maxWidth: width,
            maxHeight: height,
            touchAction: 'none'
          }}
        />
      </div>
    </div>
  );
}