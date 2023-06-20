import React, { useRef, useEffect, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import { DragAndDrop } from './DragAndDrop/DragAndDrop';

interface Point {
  x: number;
  y: number;
}
const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [sections, setSections] = useState<number>(16);
  const [mirror, setMirror] = useState<boolean>(true);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState<Point[]>([]);
  const [paths, setPaths] = useState<Point[][]>([]);

  const [color, setColor] = useState<string>('#000');
  const [backgroundImage, setBackgroundImage] = useState<null | string>(null);

  const width = 500;
  const height = 500;
  const midX = width / 2;
  const midY = height / 2;
  const angle = 360 / sections;
  const handleColor = (newColor: ColorResult) => setColor(newColor.hex);
  useEffect(() => {
    const btn = btnRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas || !btn) return;
    const rect = canvas.getBoundingClientRect();

    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      console.log(e.clientX, e.clientY);
      setPoints(points => [
        ...points,
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
      ]);
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
        setPoints(points => [...points, { x: currentPos.x, y: currentPos.y }]);
        setPrevPosition({ x: e.clientX, y: e.clientY });
      }
    };

    const reDraw = () => {
      paths.pop();
      context.clearRect(0, 0, width, height);
      paths.forEach(path => {
        for (let i = 0; i < path.length; i++) {
          if (i + 1 >= path.length) return;
          const currentPosX = path[i].x;
          const currentPosY = path[i].y;
          const nextPosX = path[i + 1].x;
          const nextPosY = path[i + 1].y;
          const rCurr = Math.sqrt(
            (currentPosX - midX) ** 2 + (currentPosY - midY) ** 2
          );
          const rNext = Math.sqrt(
            (nextPosX - midX) ** 2 + (nextPosY - midY) ** 2
          );

          const currAngle = Math.atan2(currentPosY - midY, currentPosX - midX);
          const nextAngle = Math.atan2(nextPosY - midY, nextPosX - midX);

          for (let i = 1; i <= sections; i++) {
            // radians
            const rad = (angle * i * Math.PI) / 180;
            // coordinates
            const currX = midX + rCurr * Math.cos(currAngle + rad);
            const currY = midY + rCurr * Math.sin(currAngle + rad);
            const nextX = midX + rNext * Math.cos(nextAngle + rad);
            const nextY = midY + rNext * Math.sin(nextAngle + rad);

            context.beginPath();
            context.moveTo(currX, currY);
            context.lineTo(nextX, nextY);
            context.stroke();
            // mirrored movement

            if (mirror) {
              context.beginPath();
              context.moveTo(currY, currX);
              context.lineTo(nextY, nextX);
              context.stroke();
            }
          }
        }
      });
    };

    const handleMouseOut = () => {
      if (!isDrawing) return;
      setPaths(paths => [...paths, points]);
      setPoints([]);
      setIsDrawing(false);
    };
    const handleMouseUp = () => {
      setPaths(paths => [...paths, points]);
      setPoints([]);
      setIsDrawing(false);
    };
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    canvas.addEventListener('mouseup', handleMouseUp);
    btn.addEventListener('click', reDraw);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
      canvas.removeEventListener('mouseup', handleMouseUp);
      btn.removeEventListener('click', reDraw);
    };
  }, [
    isDrawing,
    prevPosition,
    color,
    mirror,
    sections,
    height,
    width,
    points,
    paths,
    angle,
    midX,
    midY,
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <button ref={btnRef}>undo</button>
      <h1>Create Mandalas</h1>
      <DragAndDrop setBackgroundImage={setBackgroundImage} />
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
