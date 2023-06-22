import { Path } from './DrawingCanvas';

export const draw = (canvas: HTMLCanvasElement, path: Path) => {
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

export const handleDownload = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
) => {
  if (!canvasRef?.current) return;
  const canvas = canvasRef.current;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'canvas_image.png';
  link.click();
};
