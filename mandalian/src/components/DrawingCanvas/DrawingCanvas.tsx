import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const width = 500;
  const height = 500;
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

        const paint = (offset?: number) => {
          const subOffset = offset ? offset : 0;

          // normal movement
          context.beginPath();
          context.moveTo(prevPos.x - subOffset, prevPos.y - subOffset);
          context.lineTo(currentPos.x - subOffset, currentPos.y - subOffset);
          context.stroke();

          // mirrored movement
          context.beginPath();
          context.moveTo(prevPos.y - subOffset, prevPos.x - subOffset);
          context.lineTo(currentPos.y - subOffset, currentPos.x - subOffset);
          context.stroke();

          // normal movement right site
          context.beginPath();
          context.moveTo(500 - prevPos.x, prevPos.y);
          context.lineTo(500 - currentPos.x, currentPos.y);
          context.stroke();

          // mirrored movement
          context.beginPath();
          context.moveTo(500 - prevPos.y, prevPos.x);
          context.lineTo(500 - currentPos.y, currentPos.x);
          context.stroke();

          // normal movement opposite site
          context.beginPath();
          context.moveTo(500 - prevPos.x, 500 - prevPos.y);
          context.lineTo(500 - currentPos.x, 500 - currentPos.y);
          context.stroke();

          // mirrored movement
          context.beginPath();
          context.moveTo(500 - prevPos.y, 500 - prevPos.x);
          context.lineTo(500 - currentPos.y, 500 - currentPos.x);
          context.stroke();

          // normal movement down site
          context.beginPath();
          context.moveTo(prevPos.x, 500 - prevPos.y);
          context.lineTo(currentPos.x, 500 - currentPos.y);
          context.stroke();

          // mirrored movement
          context.beginPath();
          context.moveTo(prevPos.y, 500 - prevPos.x);
          context.lineTo(currentPos.y, 500 - currentPos.x);
          context.stroke();
        };

        paint();

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
        width={width}
        height={height}
        style={{
          border: '1px solid #000000',
        }}
      />
    </div>
  );
};

export default DrawingCanvas;
