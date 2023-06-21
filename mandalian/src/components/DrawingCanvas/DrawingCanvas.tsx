import React, { useRef, useEffect, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import { DragAndDrop } from './DragAndDrop/DragAndDrop';

interface Point {
  x: number;
  y: number;
}
type Points = [Point[], string];

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const btnUndoRef = useRef<HTMLButtonElement | null>(null);
  const btnRedoRef = useRef<HTMLButtonElement | null>(null);
  const btnTransformRef = useRef<HTMLButtonElement | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [sections, setSections] = useState<number>(16);
  const [mirror, setMirror] = useState<boolean>(true);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [points, setPoints] = useState<Point[]>([]);
  const [undoPaths, setUndoPaths] = useState<Points[]>([]);
  const [redoPaths, setRedoPaths] = useState<Points[]>([]);

  const [color, setColor] = useState<string>('#000');
  const [backgroundImage, setBackgroundImage] = useState<null | string>(null);

  const width = 500;
  const height = 500;
  const midX = width / 2;
  const midY = height / 2;
  const angle = 360 / sections;
  const handleColor = (newColor: ColorResult) => setColor(newColor.hex);

  useEffect(() => {
    const btnUndo = btnUndoRef.current;
    const btnRedo = btnRedoRef.current;
    const btnTransform = btnTransformRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas || !btnUndo || !btnRedo || !btnTransform) return;
    const rect = canvas.getBoundingClientRect();

    context.strokeStyle = color;

    // Function used to redraw memembered coordinates
    const reDraw = (
      path: Point[],
      context: CanvasRenderingContext2D,
      color: string
    ) => {
      context.strokeStyle = color;
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
          // Radians to calculate correct shift of a point
          const rad = (angle * i * Math.PI) / 180;
          // Caluclated new coordinates
          const currX = midX + rCurr * Math.cos(currAngle + rad);
          const currY = midY + rCurr * Math.sin(currAngle + rad);
          const nextX = midX + rNext * Math.cos(nextAngle + rad);
          const nextY = midY + rNext * Math.sin(nextAngle + rad);

          context.beginPath();
          context.moveTo(currX, currY);
          context.lineTo(nextX, nextY);
          context.stroke();

          // Mirrored coordinates
          if (mirror) {
            context.beginPath();
            context.moveTo(currY, currX);
            context.lineTo(nextY, nextX);
            context.stroke();
          }
        }
      }
    };

    //
    const transform = () => {
      if (!context || !canvas) return;

      undoPaths.forEach(path => {
        context.strokeStyle = path[1];
        context.beginPath();
        if (!path[0][0].x || !path[0][0].y) return;
        const startX = path[0][0].x;
        const startY = path[0][0].y;

        context.moveTo(startX, startY);
        for (let i = 1; i < path[0].length; i++) {
          const nextX = path[0][i].x;
          const nextY = path[0][i].y;

          context.lineTo(nextX, nextY);
          const r = Math.sqrt((nextX - midX) ** 2 + (nextY - midY) ** 2);

          const prevAngle = Math.atan2(startY - midY, startX - midX);
          const currAngle = Math.atan2(nextY - midY, nextX - midX);

          for (let i = 1; i <= sections; i++) {
            // radians
            const rad = (angle * i * Math.PI) / 180;
            // coordinates
            const prevX = midX + r * Math.cos(prevAngle + rad);
            const prevY = midY + r * Math.sin(prevAngle + rad);
            const currX = midX + r * Math.cos(currAngle + rad);
            const currY = midY + r * Math.sin(currAngle + rad);
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
        }
        context.stroke();
      });
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

        const paint = () => {
          const rPrev = Math.sqrt(
            (prevPos.x - midX) ** 2 + (prevPos.y - midY) ** 2
          );

          const rCurr = Math.sqrt(
            (currentPos.x - midX) ** 2 + (currentPos.y - midY) ** 2
          );
          // our angles in radians
          const prevAngle = Math.atan2(prevPos.y - midY, prevPos.x - midX);
          const currAngle = Math.atan2(
            currentPos.y - midY,
            currentPos.x - midX
          );

          // Additional sections
          for (let i = 1; i <= sections; i++) {
            // Radians to calculate correct shift of a point

            const rad = (angle * i * Math.PI) / 180;
            // Caluclated new coordinates

            const prevX = midX + rPrev * Math.cos(prevAngle + rad);
            const prevY = midY + rPrev * Math.sin(prevAngle + rad);
            const currX = midX + rCurr * Math.cos(currAngle + rad);
            const currY = midY + rCurr * Math.sin(currAngle + rad);
            context.beginPath();
            context.moveTo(prevX, prevY);
            context.lineTo(currX, currY);
            context.stroke();
            // Mirrored coordinates

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

    const undo = () => {
      // Directly mutate our state by removing last element from it
      undoPaths.pop();
      context.clearRect(0, 0, width, height);
      undoPaths.forEach(path => {
        const coordinates = path[0];
        const color = path[1];
        reDraw(coordinates, context, color);
      });
    };

    const redo = () => {
      // create copy of redoPaths that holds every path
      let newPaths = [...redoPaths];
      // copy redoPaths paths from 0 to one index further than actual undo paths length, so later we can undo it again if needed
      newPaths = newPaths.splice(0, undoPaths.length + 1);
      // Set undoPaths to newPaths
      setUndoPaths(newPaths);
      context.clearRect(0, 0, width, height);
      newPaths.forEach(path => {
        const coordinates = path[0];
        const color = path[1];
        reDraw(coordinates, context, color);
      });
    };

    // Enable drawing, remember starting point in case to recreate it later
    const handleMouseDown = (e: MouseEvent) => {
      setIsDrawing(true);
      setPoints(points => [
        ...points,
        { x: e.clientX - rect.left, y: e.clientY - rect.top },
      ]);
      setPrevPosition({ x: e.clientX, y: e.clientY });
    };

    const handleSave = () => {
      // If we undo to 0 elements then set memorized paths to new ones

      if (undoPaths.length === 0) {
        setUndoPaths([[points, color]]);
        setRedoPaths([[points, color]]);
        setPoints([]);
        setIsDrawing(false);
        return;
      }
      setUndoPaths(paths => [...paths, [[...points], color]]);
      setRedoPaths(paths => [...paths, [[...points], color]]);
      setPoints([]);
      setIsDrawing(false);
    };

    // stop drawing
    const handleMouseOut = () => {
      // in case we are not drawing but we move mouse out canvas, that will prevent additional saves
      if (!isDrawing) return;
      handleSave();
    };

    // stop drawing
    const handleMouseUp = () => {
      handleSave();
    };
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseout', handleMouseOut);
    canvas.addEventListener('mouseup', handleMouseUp);
    btnUndo.addEventListener('click', undo);
    btnRedo.addEventListener('click', redo);
    btnTransform.addEventListener('click', transform);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseout', handleMouseOut);
      canvas.removeEventListener('mouseup', handleMouseUp);
      btnUndo.removeEventListener('click', undo);
      btnRedo.removeEventListener('click', redo);
      btnTransform.removeEventListener('click', transform);
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
    undoPaths,
    redoPaths,
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
      <button ref={btnUndoRef}>undo</button>
      <button ref={btnRedoRef}>redo</button>
      <button ref={btnTransformRef}>Transform</button>
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
