import React from 'react';

interface DragAndDropProps {
  setBackgroundImage: (str: string) => void;
}

export const DragAndDrop = ({ setBackgroundImage }: DragAndDropProps) => {
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

  return (
    <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      <p>Drag and drop an image here</p>
    </div>
  );
};
