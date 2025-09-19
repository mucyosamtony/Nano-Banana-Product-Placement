import React, { useState, useCallback } from 'react';
import type { ImageFile } from './types';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { generateProductPlacementImage } from './services/geminiService';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const App: React.FC = () => {
  const [characterImage, setCharacterImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCharacterImageSelect = useCallback((imageFile: ImageFile) => {
    setCharacterImage(imageFile);
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleProductImageSelect = useCallback((imageFile: ImageFile) => {
    setProductImage(imageFile);
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleGenerate = async () => {
    if (!characterImage || !productImage) {
      setError("Please upload both a character and a product image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultImageUrl = await generateProductPlacementImage(characterImage, productImage);
      setGeneratedImage(resultImageUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-product-placement.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setCharacterImage(null);
    setProductImage(null);
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
  };

  const isGenerateDisabled = !characterImage || !productImage || isLoading;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="container mx-auto max-w-4xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-primary">Nano Banana Product Placement</h1>
          <p className="text-md text-brand-text-secondary mt-2">
            Create an image of your character using a product, maintaining the original art style.
          </p>
        </header>

        {!generatedImage && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <ImageUploader 
                    id="character-image" 
                    label="Character Image" 
                    onImageSelect={handleCharacterImageSelect} 
                    imagePreviewUrl={characterImage?.previewUrl || null}
                />
                <ImageUploader 
                    id="product-image" 
                    label="Product Image" 
                    onImageSelect={handleProductImageSelect} 
                    imagePreviewUrl={productImage?.previewUrl || null}
                />
            </div>
        )}
        
        <div className="flex justify-center mb-8">
            {generatedImage ? (
                <button 
                    onClick={handleReset} 
                    className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors duration-200"
                    aria-label="Start over with new images"
                >
                    Start Over
                </button>
            ) : (
                <button 
                    onClick={handleGenerate} 
                    disabled={isGenerateDisabled}
                    className={`bg-brand-primary text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center ${isGenerateDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
                    aria-label="Generate a new image"
                    aria-disabled={isGenerateDisabled}
                >
                    {isLoading && <Spinner />}
                    {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
            )}
        </div>
        
        {error && <p className="text-center text-red-500 mb-4" role="alert">{error}</p>}
        
        {isLoading && (
             <div className="w-full bg-brand-surface rounded-lg p-8 flex flex-col items-center justify-center h-96" aria-live="polite">
                <Spinner />
                <p className="mt-4 text-brand-text-secondary">Generating your image... this may take a moment.</p>
                <p className="text-sm text-brand-text-secondary">(Nano Banana is working its magic!)</p>
            </div>
        )}

        {generatedImage && (
          <div className="w-full bg-brand-surface rounded-lg p-4 sm:p-8 flex flex-col items-center">
             <h2 className="text-2xl font-semibold mb-4 text-brand-text">Generated Image</h2>
            <img src={generatedImage} alt="Generated product placement" className="max-w-full h-auto rounded-md shadow-lg" />
            <button 
                onClick={handleDownload} 
                className="mt-6 bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-colors duration-200 flex items-center"
                aria-label="Download the generated image"
            >
                <DownloadIcon />
                Download Image
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
