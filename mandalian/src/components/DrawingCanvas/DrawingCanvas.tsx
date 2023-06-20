import React, { useRef, useEffect, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState<string>('#000');
  const [sections, setSections] = useState<number>(16);
  const [mirror, setMirror] = useState<boolean>(true);
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
          // our angles in radians
          const prevAngle = Math.atan2(prevPos.y - midY, prevPos.x - midX);
          const currAngle = Math.atan2(
            currentPos.y - midY,
            currentPos.x - midX
          );

          // Additional sections
          const angle = 360 / sections;
          for (let i = 1; i <= sections; i++) {
            // radians
            const rad = (angle * i * Math.PI) / 180;
            // coordinates
            const prevX = midX + rPrev * Math.cos(prevAngle + rad);
            const prevY = midY + rPrev * Math.sin(prevAngle + rad);
            const currX = midX + rCurr * Math.cos(currAngle + rad);
            const currY = midY + rCurr * Math.sin(currAngle + rad);
            context.beginPath();
            context.moveTo(prevX, prevY);
            context.lineTo(currX, currY);
            context.stroke();
            // mirrored movement

            if (mirror) {
              context.beginPath();
              context.moveTo(prevY, prevX);
              context.lineTo(currY, currX);
              context.stroke();
            }
          }
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
  }, [isDrawing, prevPosition, color, mirror, sections, height, width]);
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
      Mirror:{' '}
      <input
        type='checkbox'
        checked={mirror}
        onChange={() => setMirror(!mirror)}
      />
      <div>
        Sections:{' '}
        <input
          type='number'
          value={sections}
          onChange={e => setSections(Number(e.target.value))}
        />
      </div>
      <br />
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
