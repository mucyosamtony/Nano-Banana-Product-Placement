import React from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageSelect: (imageFile: ImageFile) => void;
  imagePreviewUrl: string | null;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageSelect, imagePreviewUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelect({ file, previewUrl });
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
  }
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
          const previewUrl = URL.createObjectURL(file);
          onImageSelect({ file, previewUrl });
      }
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-secondary mb-2">{label}</label>
      <label 
        htmlFor={id} 
        className="mt-1 flex justify-center items-center w-full h-64 px-6 pt-5 pb-6 border-2 border-brand-secondary border-dashed rounded-md cursor-pointer bg-brand-surface hover:border-brand-primary transition-colors duration-200"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="space-y-1 text-center">
            <UploadIcon />
            <div className="flex text-sm text-brand-text-secondary">
              <p className="pl-1">Upload a file or drag and drop</p>
            </div>
            <p className="text-xs text-brand-text-secondary">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </label>
      <input id={id} name={id} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
