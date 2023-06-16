import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      setPrevPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDrawing) {
        const prevPos = {
          x: prevPosition.x - rect.left,
          y: prevPosition.y - rect.top,
        };
        const currentPos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        context.beginPath();
        context.moveTo(prevPos.x, prevPos.y);
        context.lineTo(currentPos.x, currentPos.y);
        context.stroke();
        setPrevPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseOut = () => setIsDrawing(false);
    const handleMouseUp = () => setIsDrawing(false);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut);
      document.addEventListener('mouseup', handleMouseUp);
    };
  }, [isDrawing, prevPosition]);

  return (
    <div>
      <h1>Create Mandalas</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{
          border: '1px solid #000000',
        }}
      />
    </div>
  );
};

export default DrawingCanvas;
