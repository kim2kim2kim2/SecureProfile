import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Max dimensions for resizing
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;
const THUMBNAIL_SIZE = 200;

/**
 * Resize an image to fit within max dimensions while maintaining aspect ratio
 * @param inputPath Path to the input image
 * @param outputPath Path where the resized image will be saved
 * @returns Path to the resized image
 */
export async function resizeImage(inputPath: string, outputPath: string): Promise<string> {
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Kunne ikke lese bildets dimensjoner');
    }
    
    // Check if resizing is needed
    if (metadata.width <= MAX_WIDTH && metadata.height <= MAX_HEIGHT) {
      // Image is already within limits, just copy it
      fs.copyFileSync(inputPath, outputPath);
      return outputPath;
    }
    
    // Calculate new dimensions to maintain aspect ratio
    let newWidth = metadata.width;
    let newHeight = metadata.height;
    
    if (newWidth > MAX_WIDTH) {
      newHeight = Math.round((newHeight * MAX_WIDTH) / newWidth);
      newWidth = MAX_WIDTH;
    }
    
    if (newHeight > MAX_HEIGHT) {
      newWidth = Math.round((newWidth * MAX_HEIGHT) / newHeight);
      newHeight = MAX_HEIGHT;
    }
    
    // Resize the image
    await sharp(inputPath)
      .resize(newWidth, newHeight, { fit: 'inside', withoutEnlargement: true })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw new Error(`Kunne ikke endre størrelse på bildet: ${error.message}`);
  }
}

/**
 * Create a square thumbnail from an image
 * @param inputPath Path to the input image
 * @param outputPath Path where the thumbnail will be saved
 * @returns Path to the created thumbnail
 */
export async function createThumbnail(inputPath: string, outputPath: string): Promise<string> {
  try {
    await sharp(inputPath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover' })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw new Error(`Kunne ikke lage miniatyrbilde: ${error.message}`);
  }
}

/**
 * Ensure a directory exists, create it if it doesn't
 * @param dirPath Directory path to check/create
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}