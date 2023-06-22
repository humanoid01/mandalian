import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

interface Point {
  x: number;
  y: number;
}

interface Path {
  points: Point[];
  mirror: boolean;
  sections: number;
  color: string;
}

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentPath, setCurrentPath] = useState<null | Path>(null);
  const [mirror, setMirror] = useState<boolean>(true);
  const [sections, setSections] = useState(16);
  const [color, setColor] = useState('#000');
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const [size, setSize] = useState({ width: 500, height: 500 });

  const matches = useMediaQuery('(min-width:800px)');

  useEffect(() => {
    matches
      ? setSize({ width: 500, height: 500 })
      : setSize({ width: 200, height: 200 });
  }, [matches]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setRedoPaths(paths);
    setCurrentPath({
      color,
      sections: Number(sections),
      mirror,
      points: [{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }],
    });
  };

  const continueDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentPath === null || !canvasRef.current) return;

    setCurrentPath({
      ...currentPath,
      points: [
        ...currentPath.points,
        { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
      ],
    });

    draw(canvasRef.current, currentPath);
  };

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const path of paths) draw(canvas, path);
  }, [paths]);

  const stopDrawing = () => {
    setCurrentPath(null);
    if (currentPath) {
      if (paths.length === 0) {
        setPaths([currentPath]);
        return setRedoPaths([currentPath]);
      }

      setPaths([...paths, currentPath]);
      setRedoPaths([...redoPaths, currentPath]);
    }
  };

  const undo = () => setPaths(paths => paths.slice(0, paths.length - 1));
  const redo = () =>
    setPaths(paths => [...redoPaths].slice(0, paths.length + 1));

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'canvas_image.png';
    link.click();
  };

  const handleColor = (newColor: ColorResult) => setColor(newColor.hex);
  const clear = () => {
    setPaths([]);
    setCurrentPath(null);
  };

  return (
    <Box display='flex'>
      <Box width={matches ? 220 : 0}>
        <Box width={'200px'}>
          <Drawer variant={matches ? 'permanent' : 'temporary'}>
            <Stack direction={'column'}>
              <Button onClick={undo}>undo</Button>
              <Button onClick={redo}>redo</Button>
              <Button onClick={clear}>clear</Button>
              <Button onClick={handleDownload}>download</Button>
            </Stack>
            <Stack
              gap={2}
              m={2}
              direction={'column'}
              alignItems={'center'}
              textAlign={'center'}>
              <Box width={'100px'}>
                <Typography>Sections: </Typography>
                <TextField
                  type='number'
                  value={sections}
                  onChange={e => setSections(Number(e.target.value))}
                />
              </Box>
              <Box width={'100px'}>
                <Typography>Size: </Typography>
                <TextField
                  type='number'
                  value={size.height}
                  onChange={e =>
                    setSize({
                      width: Number(e.target.value),
                      height: Number(e.target.value),
                    })
                  }
                />
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                <Typography>Mirror:</Typography>
                <Checkbox
                  checked={mirror}
                  onChange={() => setMirror(!mirror)}
                />
              </Box>
              <ChromePicker onChange={handleColor} color={color} />
            </Stack>
          </Drawer>
        </Box>
      </Box>
      <Box flex='1'>
        <Box
          display={'flex'}
          justifyContent={'center'}
          alignContent={'center'}
          position={'relative'}
          height={'100vh'}>
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            onMouseDown={startDrawing}
            onMouseMove={continueDrawing}
            onMouseLeave={stopDrawing}
            onMouseUp={stopDrawing}
            style={{
              border: '1px solid #000000',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DrawingCanvas;

const draw = (canvas: HTMLCanvasElement, path: Path) => {
  const context = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const midX = width / 2;
  const midY = height / 2;
  context.strokeStyle = path.color;
  const angle = 360 / Number(path.sections);

  for (let i = 0; i < path.points.length - 1; i++) {
    const currentPosX = path.points[i].x;
    const currentPosY = path.points[i].y;
    const nextPosX = path.points[i + 1].x;
    const nextPosY = path.points[i + 1].y;
    const rCurr = Math.sqrt(
      (currentPosX - midX) ** 2 + (currentPosY - midY) ** 2
    );
    const rNext = Math.sqrt((nextPosX - midX) ** 2 + (nextPosY - midY) ** 2);

    const currAngle = Math.atan2(currentPosY - midY, currentPosX - midX);
    const nextAngle = Math.atan2(nextPosY - midY, nextPosX - midX);

    for (let i = 1; i <= path.sections; i++) {
      const rad = (angle * i * Math.PI) / 180;

      const currX = midX + rCurr * Math.cos(currAngle + rad);
      const currY = midY + rCurr * Math.sin(currAngle + rad);
      const nextX = midX + rNext * Math.cos(nextAngle + rad);
      const nextY = midY + rNext * Math.sin(nextAngle + rad);

      context.beginPath();
      context.moveTo(currX, currY);
      context.lineTo(nextX, nextY);
      context.stroke();

      if (path.mirror) {
        context.beginPath();
        context.moveTo(currY, currX);
        context.lineTo(nextY, nextX);
        context.stroke();
      }
    }
  }
};
