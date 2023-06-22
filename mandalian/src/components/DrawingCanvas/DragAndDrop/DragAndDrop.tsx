import React from 'react';
import { Button } from '@mui/material';

interface DragAndDropProps {
  setBackgroundImage: (str: string) => void;
  canvas: HTMLCanvasElement | null;
}

export const UploadImage = ({ setBackgroundImage }: DragAndDropProps) => {
  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = event => {
        const backgroundImage = event.target?.result as string;
        setBackgroundImage(backgroundImage);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Button
      variant='contained'
      component='label'
      size='small'
      style={{ cursor: 'help', fontSize: '8px' }}
      title='For best effect upload image that is exactly the size of canvas'>
      Upload Background Image
      <input type='file' hidden onChange={handleDrop} />
    </Button>
  );
};
