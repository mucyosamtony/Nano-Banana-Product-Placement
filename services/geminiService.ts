import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageFile } from '../types';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as base64 string.'));
      }
      const base64 = reader.result.split(',')[1];
      resolve({ mimeType: file.type, data: base64 });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const generateProductPlacementImage = async (
  characterImage: ImageFile,
  productImage: ImageFile
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const characterImagePart = await fileToBase64(characterImage.file);
  const productImagePart = await fileToBase64(productImage.file);

  const textPart = {
    text: `Take the character from the first image and have them use or interact with the product from the second image. 
           It is crucial that you maintain the exact art style, proportions, and size of the original character image. 
           The final output image must have the same dimensions and aspect ratio as the first input image.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        { inlineData: characterImagePart },
        { inlineData: productImagePart },
        textPart,
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("No image was generated. The model may have refused the prompt.");
};
