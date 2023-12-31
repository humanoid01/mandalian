import React, { useLayoutEffect, useRef, useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';
// functions
import { draw, handleDownload } from './DrawingCanvasFuncs';
// icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
// components
import Box from '@mui/material/Box/Box';
import IconButton from '@mui/material/IconButton/IconButton';
import Drawer from '@mui/material/Drawer/Drawer';
import Stack from '@mui/material/Stack/Stack';
import Button from '@mui/material/Button/Button';
import Typography from '@mui/material/Typography/Typography';
import TextField from '@mui/material/TextField/TextField';
import Checkbox from '@mui/material/Checkbox/Checkbox';
// media query
import useMediaQuery from '@mui/material/useMediaQuery';

interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  mirror: boolean;
  sections: number;
  color: string;
}

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentPath, setCurrentPath] = useState<null | Path>(null);
  const [mirror, setMirror] = useState<boolean>(true);
  const [sections, setSections] = useState(16);
  const [color, setColor] = useState('#000');
  const [paths, setPaths] = useState<Path[]>([]);
  const [redoPaths, setRedoPaths] = useState<Path[]>([]);
  const [size, setSize] = useState({ width: 500, height: 500 });
  const [open, setOpen] = useState(false);
  const [canvasRound, setCanvasRound] = useState(false);

  const matches = useMediaQuery('(min-width:800px)');

  useLayoutEffect(() => {
    matches
      ? setSize({ width: 500, height: 500 })
      : setSize({ width: 200, height: 200 });
  }, [matches]);

  useLayoutEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'KeyZ') {
        undo();
      }
      if (e.ctrlKey && e.code === 'KeyY') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')!;

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const path of paths) draw(canvas, path);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [paths]);

  useLayoutEffect(() => {
    if (!tempCanvasRef.current) return;
    const canvas = tempCanvasRef.current;
    canvas.getContext('2d')?.clearRect(0, 0, size.width, size.height);
    if (currentPath) draw(canvas, currentPath);
  }, [currentPath, size]);

  const handleColor = (newColor: ColorResult) => setColor(newColor.hex);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const touchEvent = e as React.TouchEvent<HTMLCanvasElement>;
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;
    const eventX = touchEvent.touches
      ? touchEvent.touches[0].clientX - rect.left
      : mouseEvent.nativeEvent.offsetX;
    const eventY = touchEvent.touches
      ? touchEvent.touches[0].clientY - rect.top
      : mouseEvent.nativeEvent.offsetY;

    setRedoPaths(paths);
    setCurrentPath({
      color,
      sections: Number(sections),
      mirror,
      points: [{ x: eventX, y: eventY }],
    });
  };
  const continueDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const touchEvent = e as React.TouchEvent<HTMLCanvasElement>;
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;
    const eventX = touchEvent.touches
      ? touchEvent.touches[0].clientX - rect.left
      : mouseEvent.nativeEvent.offsetX;
    const eventY = touchEvent.touches
      ? touchEvent.touches[0].clientY - rect.top
      : mouseEvent.nativeEvent.offsetY;

    if (currentPath)
      setCurrentPath({
        ...currentPath,
        points: [...currentPath.points, { x: eventX, y: eventY }],
      });
  };

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

  const clear = () => {
    setPaths([]);
    setCurrentPath(null);
  };

  return (
    <Box display='flex'>
      <Box width={matches ? 220 : 0}>
        <Box width={'200px'}>
          <IconButton
            sx={{ position: 'absolute', left: '2%', top: '2%', zIndex: 1 }}
            onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Drawer
            variant={matches ? 'permanent' : 'temporary'}
            open={open}
            onClose={() => setOpen(false)}>
            {!matches ? (
              <Box display='flex' justifyContent='flex-end'>
                <IconButton onClick={() => setOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : null}
            <Stack direction={'column'}>
              <Button startIcon={<UndoIcon />} onClick={undo} />
              <Button startIcon={<RedoIcon />} onClick={redo} />
              <Button startIcon={<DeleteIcon />} onClick={clear} />
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(canvasRef)}
              />
            </Stack>
            <Stack
              gap={2}
              m={1}
              direction={'column'}
              alignItems={'center'}
              textAlign={'center'}>
              <Box width={'100px'}>
                <Typography>Sections:</Typography>
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
                  onChange={e => {
                    clear();
                    setRedoPaths([]);
                    setSize({
                      width: Number(e.target.value),
                      height: Number(e.target.value),
                    });
                  }}
                />
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                <Typography>Mirror:</Typography>
                <Checkbox
                  checked={mirror}
                  onChange={() => setMirror(!mirror)}
                />
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                <Typography>Round:</Typography>
                <Checkbox
                  checked={canvasRound}
                  onChange={() => setCanvasRound(!canvasRound)}
                />
              </Box>
              <ChromePicker onChange={handleColor} color={color} />
              {matches ? (
                <Typography
                  title={`Ctrl+Z to undo \nCtrl+Y to redo`}
                  sx={{ cursor: 'help' }}>
                  Shortcuts (Hover to display)
                </Typography>
              ) : null}
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
            style={{
              border: '1px solid #000000',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: canvasRound ? '50%' : '0',
            }}
          />
          <canvas
            ref={tempCanvasRef}
            width={size.width}
            height={size.height}
            onMouseDown={startDrawing}
            onTouchStart={startDrawing}
            onMouseMove={continueDrawing}
            onTouchMove={continueDrawing}
            onMouseLeave={stopDrawing}
            onTouchEnd={stopDrawing}
            onMouseUp={stopDrawing}
            style={{
              border: '1px solid #000000',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: canvasRound ? '50%' : '0',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DrawingCanvas;
