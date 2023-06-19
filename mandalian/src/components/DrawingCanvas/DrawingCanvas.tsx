import React, { useRef, useEffect, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState<string>('#000');

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
    context.strokeStyle = color;
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

        const midX = width / 2;
        const midY = height / 2;

        const rPrev = Math.sqrt(
          (prevPos.x - midX) ** 2 + (prevPos.y - midY) ** 2
        );

        const rCurr = Math.sqrt(
          (currentPos.x - midX) ** 2 + (currentPos.y - midY) ** 2
        );

        const paint = () => {
          // normal movement
          const rad = (180 * Math.PI) / 180;
          context.beginPath();
          context.moveTo(prevPos.x, prevPos.y);
          context.lineTo(currentPos.x, currentPos.y);
          context.stroke();

          const prevAngle = Math.atan2(prevPos.y - midY, prevPos.x - midX);
          const currAngle = Math.atan2(
            currentPos.y - midY,
            currentPos.x - midX
          );

          context.beginPath();
          context.moveTo(
            midX + rPrev * Math.cos(prevAngle + rad),
            midY + rPrev * Math.sin(prevAngle + rad)
          );
          context.lineTo(
            midX + rCurr * Math.cos(currAngle + rad),
            midY + rCurr * Math.sin(currAngle + rad)
          );
          context.stroke();
          // mirrored movement
          // context.beginPath();
          // context.moveTo(prevPos.y, prevPos.x);
          // context.lineTo(currentPos.y, currentPos.x);
          // context.stroke();
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
  }, [isDrawing, prevPosition, color]);
  const [backgroundImage, setBackgroundImage] = useState<null | string>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setBackgroundImage(reader.result as string);
      };
    }
  };

  const handleColor = (newColor: ColorResult) => setColor(newColor.hex);
  return (
    <div>
      <h1>Create Mandalas</h1>
      <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
        <p>Drag and drop an image here</p>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: '1px solid #000000',
          background: `url(${backgroundImage})`,
        }}
      />
      <ChromePicker color={color} onChange={handleColor} disableAlpha={true} />
    </div>
  );
};

export default DrawingCanvas;

/*
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
*/
