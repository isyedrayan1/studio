// ============================================
// FIREBASE STORAGE - IMAGE UPLOAD SERVICE
// ============================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a proof image for score verification
 * @param file - The image file to upload
 * @param matchId - Match ID for organizing storage
 * @param teamId - Team ID for the score
 * @returns Download URL of the uploaded image
 */
export async function uploadProofImage(
  file: File,
  matchId: string,
  teamId: string
): Promise<string> {
  // Create a unique filename with timestamp
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `${matchId}_${teamId}_${timestamp}.${extension}`;
  
  // Store in proof-images folder
  const storageRef = ref(storage, `proof-images/${matchId}/${fileName}`);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      matchId,
      teamId,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Delete a proof image
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteProofImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Failed to delete proof image:', error);
    // Don't throw - image deletion is not critical
  }
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @returns Object with valid status and error message if invalid
 */
export function validateProofImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WebP, and GIF images are allowed' };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }
  
  return { valid: true };
}
